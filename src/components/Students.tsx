import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { 
  Search, Plus, Filter, MoreHorizontal, GraduationCap, Calendar, Clock, 
  Camera, Upload, X, Loader2, Check, Download, FileText, Printer, 
  ChevronUp, ChevronDown, UserCircle, UserCog, Users, BookOpen, 
  Bus, Utensils, Baby, Activity, ShieldAlert, AlertTriangle, Eye, ArrowRight,
  Hammer, AlertCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { uploadFile } from '@/src/lib/firebase';
import { StudentIdCard } from './StudentIdCard';
import { sendTelegramNotification, NOTIFICATION_TEMPLATES } from '../services/notificationService';
import { Smartphone, Send, Phone } from 'lucide-react';
import { ACTIVE_CLASSES } from '../constants';
import { studentService } from '../services/studentService';
import { Student, StudentStatus } from '../types';
import { mockStudents } from '../data/mockStudents';

interface StudentsProps {
  setActiveTab?: (tab: string, studentId?: string) => void;
  selectedStudentId?: string | null;
}

export function Students({ setActiveTab, selectedStudentId }: StudentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = studentService.subscribeToStudents((data) => {
      setStudents(data);
      setIsLoading(false);
    });
    return unsub;
  }, []);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [controlStudent, setControlStudent] = useState<Student | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    class: 'all',
    gender: 'all',
    paymentStatus: 'all',
    daycare: 'all',
    food: 'all',
    transport: 'all',
    startDate: '',
    endDate: ''
  });

  // Auto-open control student if selectedStudentId is passed
  React.useEffect(() => {
    if (selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student) setControlStudent(student);
    }
  }, [selectedStudentId, students]);
  const [activeControlTab, setActiveControlTab] = useState<'status' | 'auxiliary' | 'profile'>('status');
  const [editProfileData, setEditProfileData] = useState({ name: '', nameKh: '', parent: '', tel: '', class: '', academicYear: '', telegramChatId: '' });

  // Sync edit data when control student changes
  React.useEffect(() => {
    if (controlStudent) {
      setEditProfileData({
        name: controlStudent.name,
        nameKh: controlStudent.nameKh || '',
        parent: controlStudent.parent,
        tel: controlStudent.tel || '',
        class: controlStudent.class,
        academicYear: controlStudent.academicYear || '2026-2027',
        telegramChatId: (controlStudent as any).telegramChatId || ''
      });
    }
  }, [controlStudent]);

  const [enrollmentData, setEnrollmentData] = useState({
    name: '',
    nameKh: '',
    tel: '',
    academicYear: '2026-2027',
    class: ACTIVE_CLASSES[0],
    gender: 'Male',
    dob: '',
    parent: '',
    status: 'active',
    enrollmentDate: new Date().toISOString().split('T')[0],
    documents: [] as { name: string, url: string }[]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [printingStudent, setPrintingStudent] = useState<typeof mockStudents[0] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = (student: typeof mockStudents[0]) => {
    setSelectedStudent(student);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedStudent) return;

    setIsUploading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      let finalUrl = previewUrl;
      try {
        finalUrl = await uploadFile(`students/${selectedStudent.id}_${Date.now()}`, file);
      } catch (e) {
        console.warn("Upload to Firebase failed, using local preview for demo:", e);
      }

      setStudents(prev => prev.map(s => 
        s.id === selectedStudent.id ? { ...s, profilePic: finalUrl } : s
      ));
      
      setSelectedStudent(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        id: 'ST1001',
        name: 'John Doe',
        nameKh: 'ចន ដូ',
        class: 'G10A',
        gender: 'Male',
        dob: '2010-01-01',
        parent: '012 345 678',
        tel: '012 345 678',
        status: 'active',
        paymentStatus: 'paid',
        academicYear: '2026-2027',
        enrollmentDate: '2026-09-01'
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const csvData = students.map(s => ({
      id: s.id,
      name: s.name,
      nameKh: s.nameKh || '',
      class: s.class,
      gender: s.gender,
      dob: s.dob,
      parent: s.parent,
      tel: s.tel || '',
      status: s.status,
      paymentStatus: s.paymentStatus || 'paid',
      academicYear: s.academicYear || '',
      enrollmentDate: s.enrollmentDate || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSONTemplate = () => {
    const templateData = [
      {
        id: "ST1002",
        name: "Jane Smith",
        nameKh: "ជេន ស្មីត",
        class: "G10A",
        gender: "Female",
        dob: "2011-02-14",
        parent: "099 888 777",
        tel: "099 888 777",
        status: "active",
        paymentStatus: "paid",
        academicYear: "2026-2027",
        enrollmentDate: "2026-09-01"
      }
    ];
    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_import_template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const fileName = file.name;
    const isJson = fileName.endsWith('.json') || file.type === 'application/json';

    const processImportedData = async (rawRows: any[]) => {
      try {
        const importedStudents = rawRows.map((row: any) => ({
          id: row.id || row.ID || row.Id || `VH${Math.floor(1000 + Math.random() * 9000)}`,
          name: row.name || row.Name || 'Imported Student',
          nameKh: row.nameKh || row.NameKh || '',
          class: row.class || row.Class || 'G10A',
          gender: row.gender || row.Gender || 'Male',
          dob: row.dob || row.DOB || '2010-01-01',
          parent: row.parent || row.Parent || '',
          tel: row.tel || row.Tel || '',
          status: row.status || row.Status || 'active',
          paymentStatus: row.paymentStatus || row.PaymentStatus || 'paid',
          academicYear: row.academicYear || row.AcademicYear || '2026-2027',
          enrollmentDate: row.enrollmentDate || row.EnrollmentDate || new Date().toISOString().split('T')[0],
          violationCount: 0,
          profilePic: '',
          auxiliary: row.auxiliary || { daycare: false, food: false, transport: false }
        }));

        for (const stud of importedStudents) {
          await studentService.addStudent(stud as any);
        }

        try {
          const { logActivity } = await import('../utils/activityLogger');
          logActivity(
            'student_enrollment',
            `Bulk enrolled ${importedStudents.length} students via file: ${fileName}`,
            undefined,
            { file: fileName, count: importedStudents.length }
          );
        } catch (e) {}

        alert(`Successfully processed ${importedStudents.length} students (created/updated in database).`);
      } catch (error) {
        console.error("Bulk process error:", error);
        alert("Integrity verification mismatch. Please verify headers and try again.");
      } finally {
        setIsImporting(false);
        if (csvInputRef.current) csvInputRef.current.value = '';
      }
    };

    if (isJson) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          const dataArray = Array.isArray(parsed) ? parsed : [parsed];
          await processImportedData(dataArray);
        } catch (error) {
          console.error("JSON parse error:", error);
          alert("Selected file is not valid JSON array format.");
          setIsImporting(false);
          if (csvInputRef.current) csvInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await processImportedData(results.data);
        },
        error: (error) => {
          console.error("Papa parse error:", error);
          setIsImporting(false);
          alert("Failed to parse standard CSV rows.");
        }
      });
    }
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    try {
      // Simulate/Real upload
      const url = URL.createObjectURL(file);
      setEnrollmentData(prev => ({
        ...prev,
        documents: [...prev.documents, { name: file.name, url }]
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const removeDoc = (index: number) => {
    setEnrollmentData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const studentData = {
        ...enrollmentData,
        id: enrollmentData.id || `ST${String(students.length + 1).padStart(3, '0')}`,
        paymentStatus: 'unpaid' as const,
        violationCount: 0,
        profilePic: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        academicYear: '2026-2027',
        auxiliary: { daycare: false, food: false, transport: false }
      };
      
      await studentService.addStudent(studentData as any);
      
      setIsEnrollmentOpen(false);
      setEnrollmentData({
        name: '',
        nameKh: '',
        tel: '',
        class: 'G10-A',
        gender: 'Male',
        dob: '',
        parent: '',
        status: 'active',
        id: ''
      });
    } catch (error) {
      console.error("Enrollment error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkPromote = async () => {
    if (window.confirm(`Are you sure you want to promote ${selectedIds.length} selected students to the next grade?`)) {
      try {
        for (const id of selectedIds) {
          const student = students.find(s => s.id === id);
          if (student?.firebaseId) {
            const match = student.class.match(/G(\d+)(.*)/);
            if (match) {
              const nextGrade = parseInt(match[1]) + 1;
              const nextClass = `G${nextGrade}${match[2]}`;
              await studentService.updateStudent(student.firebaseId, { class: nextClass });
            }
          }
        }
        setSelectedIds([]);
      } catch (error) {
        console.error("Bulk promote error:", error);
      }
    }
  };

  const handleBulkSuspend = () => {
    if (window.confirm(`Are you sure you want to suspend ${selectedIds.length} selected students?`)) {
      setStudents(prev => prev.map(s => 
        selectedIds.includes(s.id) ? { ...s, status: 'suspended' } : s
      ));
      setSelectedIds([]);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    try {
      for (const id of selectedIds) {
        const student = students.find(s => s.id === id);
        if (student?.firebaseId) {
          await studentService.updateStudent(student.firebaseId, { status: status as any });
        }
      }
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk status error:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`WARNING: This will permanently delete ${selectedIds.length} selected students. Continue?`)) {
      try {
        for (const id of selectedIds) {
          const student = students.find(s => s.id === id);
          if (student?.firebaseId) {
            await studentService.deleteStudent(student.firebaseId);
          }
        }
        setSelectedIds([]);
      } catch (error) {
        console.error("Bulk delete error:", error);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredStudents = React.useMemo(() => {
    let result = [...students];

    // Search term filter
    if (searchTerm) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(s => s.status === filters.status);
    }

    // Class filter
    if (filters.class !== 'all') {
      result = result.filter(s => s.class === filters.class);
    }

    // Gender filter
    if (filters.gender !== 'all') {
      result = result.filter(s => s.gender === filters.gender);
    }

    // Payment status filter
    if (filters.paymentStatus !== 'all') {
      result = result.filter(s => s.paymentStatus === filters.paymentStatus);
    }

    // Auxiliary service filters
    if (filters.daycare !== 'all') {
      const isDaycare = filters.daycare === 'yes';
      result = result.filter(s => s.auxiliary?.daycare === isDaycare);
    }
    if (filters.food !== 'all') {
      const isFood = filters.food === 'yes';
      result = result.filter(s => s.auxiliary?.food === isFood);
    }
    if (filters.transport !== 'all') {
      const isTransport = filters.transport === 'yes';
      result = result.filter(s => s.auxiliary?.transport === isTransport);
    }

    // Date range filter
    if (filters.startDate) {
      result = result.filter(s => s.enrollmentDate >= filters.startDate);
    }
    if (filters.endDate) {
      result = result.filter(s => s.enrollmentDate <= filters.endDate);
    }

    // Sorting
    if (sortConfig !== null) {
      result.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [students, searchTerm, filters, sortConfig]);
  const handlePrint = () => {
    const printContent = document.getElementById('printable-card');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const cardHtml = printContent.innerHTML;

    // Create a new window for printing or use a hidden iframe
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print ID Card - ${printingStudent?.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${cardHtml}
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const [activeView, setActiveView] = useState<'directory' | 'registration' | 'bulk-enroll'>('directory');

  const [courses] = useState([
    { id: 'MA101', name: 'Advanced Mathematics', grade: 'G10', teacher: 'Dr. John Smith', seats: 30, filled: 22, color: 'bg-blue-600', prereqs: [] },
    { id: 'SC101', name: 'Quantum Physics Intro', grade: 'G11', teacher: 'Prof. Mary Kay', seats: 25, filled: 25, color: 'bg-purple-600', prereqs: ['General Science'] },
    { id: 'EN105', name: 'Creative Writing', grade: 'G10', teacher: 'Sarah J. Mass', seats: 20, filled: 12, color: 'bg-emerald-600', prereqs: [] },
    { id: 'HI201', name: 'World History II', grade: 'G11', teacher: 'Michael Bay', seats: 40, filled: 38, color: 'bg-amber-600', prereqs: ['World History I'] },
    { id: 'IT301', name: 'Web Development', grade: 'G12', teacher: 'Linus Torvalds', seats: 15, filled: 14, color: 'bg-slate-800', prereqs: ['Intro to CS'] },
  ]);

  const [registrations, setRegistrations] = useState<Record<string, string[]>>({});

  const toggleCourseRegistration = (studentId: string, courseId: string) => {
    setRegistrations(prev => {
      const studentRegs = prev[studentId] || [];
      if (studentRegs.includes(courseId)) {
        return { ...prev, [studentId]: studentRegs.filter(id => id !== courseId) };
      }
      return { ...prev, [studentId]: [...studentRegs, courseId] };
    });
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={csvInputRef} 
        onChange={handleCSVImport} 
        className="hidden" 
        accept=".csv, text/csv, .json, application/json"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
          <p className="text-slate-500">Manage student profiles, enrollment, and course registration.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex items-center gap-1">
             <button 
               onClick={() => setActiveView('directory')}
               className={cn(
                 "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                 activeView === 'directory' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-705"
               )}
             >
               Directory
             </button>
             <button 
               onClick={() => setActiveView('registration')}
               className={cn(
                 "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                 activeView === 'registration' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-705"
               )}
             >
               Registration
             </button>
             <button 
               onClick={() => setActiveView('bulk-enroll')}
               className={cn(
                 "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                 activeView === 'bulk-enroll' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-705"
               )}
             >
               Bulk Enroll
             </button>
          </div>
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button 
              onClick={downloadTemplate}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Download Template"
            >
              <FileText size={18} />
            </button>
            <button 
              onClick={() => csvInputRef.current?.click()}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Import CSV"
            >
              <Upload size={18} />
            </button>
            <button 
              onClick={exportToCSV}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Export to CSV"
            >
              <Download size={18} />
            </button>
          </div>
          <button 
            onClick={() => setIsEnrollmentOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all font-medium whitespace-nowrap"
          >
            <Plus size={18} />
            New Student
          </button>
        </div>
      </div>

      {activeView === 'directory' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID or class..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm font-medium transition-colors",
                  isFilterOpen || filters.status !== 'all' || filters.class !== 'all' 
                    ? "border-blue-500 text-blue-600 bg-blue-50" 
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <Filter size={16} />
                Filters
                {(filters.status !== 'all' || filters.class !== 'all' || filters.startDate || filters.endDate) && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-[60] space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Advanced Filters</h3>
                      <button 
                        onClick={() => setFilters({ status: 'all', class: 'all', gender: 'all', paymentStatus: 'all', daycare: 'all', food: 'all', transport: 'all', startDate: '', endDate: '' })}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                      >
                        Reset All
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Primary Filters */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
                          <select 
                            value={filters.status}
                            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                          >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="graduated">Graduated</option>
                            <option value="dropout">Dropout</option>
                            <option value="suspended">Suspended</option>
                            <option value="warning">Warning</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Class</label>
                          <select 
                            value={filters.class}
                            onChange={e => setFilters(prev => ({ ...prev, class: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500/20 transition-all"
                          >
                            <option value="all">All Classes</option>
                            {ACTIVE_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Gender</label>
                          <select 
                            value={filters.gender}
                            onChange={e => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          >
                            <option value="all">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Payment</label>
                          <select 
                            value={filters.paymentStatus}
                            onChange={e => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="unpaid">Unpaid</option>
                          </select>
                        </div>
                      </div>

                      {/* Auxiliary Services */}
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Services</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => setFilters(prev => ({ ...prev, daycare: prev.daycare === 'yes' ? 'all' : 'yes' }))}
                            className={cn(
                              "px-2 py-2 rounded-lg border text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1",
                              filters.daycare === 'yes' ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600"
                            )}
                          >
                            <Baby size={14} />
                            Daycare
                          </button>
                          <button 
                            onClick={() => setFilters(prev => ({ ...prev, food: prev.food === 'yes' ? 'all' : 'yes' }))}
                            className={cn(
                              "px-2 py-2 rounded-lg border text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1",
                              filters.food === 'yes' ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20" : "bg-white border-slate-200 text-slate-500 hover:border-orange-200 hover:text-orange-600"
                            )}
                          >
                            <Utensils size={14} />
                            Food
                          </button>
                          <button 
                            onClick={() => setFilters(prev => ({ ...prev, transport: prev.transport === 'yes' ? 'all' : 'yes' }))}
                            className={cn(
                              "px-2 py-2 rounded-lg border text-[10px] font-black uppercase transition-all flex flex-col items-center gap-1",
                              filters.transport === 'yes' ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20" : "bg-white border-slate-200 text-slate-500 hover:border-green-200 hover:text-green-600"
                            )}
                          >
                            <Bus size={14} />
                            Bus
                          </button>
                        </div>
                      </div>

                      {/* Date Range */}
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block leading-none">Enrollment Period</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="relative">
                            <Calendar size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="date"
                              value={filters.startDate}
                              onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                              className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div className="relative">
                            <Calendar size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="date"
                              value={filters.endDate}
                              onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                              className="w-full pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                    >
                      Apply Filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <p className="text-sm text-slate-500">Showing {filteredStudents.length} entries</p>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(filters.status !== 'all' || filters.class !== 'all' || filters.gender !== 'all' || 
          filters.paymentStatus !== 'all' || filters.daycare !== 'all' || filters.food !== 'all' || 
          filters.transport !== 'all' || filters.startDate || filters.endDate) && (
          <div className="px-4 py-3 bg-white border-b border-slate-100 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Active Filters:</span>
            
            {filters.status !== 'all' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100">
                Status: {filters.status}
                <button onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))} className="hover:text-blue-900"><X size={12} /></button>
              </div>
            )}
            
            {filters.class !== 'all' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-purple-100">
                Class: {filters.class}
                <button onClick={() => setFilters(prev => ({ ...prev, class: 'all' }))} className="hover:text-purple-900"><X size={12} /></button>
              </div>
            )}

            {filters.gender !== 'all' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-pink-50 text-pink-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-pink-100">
                Gender: {filters.gender}
                <button onClick={() => setFilters(prev => ({ ...prev, gender: 'all' }))} className="hover:text-pink-900"><X size={12} /></button>
              </div>
            )}

            {filters.paymentStatus !== 'all' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                Payment: {filters.paymentStatus}
                <button onClick={() => setFilters(prev => ({ ...prev, paymentStatus: 'all' }))} className="hover:text-emerald-900"><X size={12} /></button>
              </div>
            )}

            {filters.daycare === 'yes' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100">
                Daycare
                <button onClick={() => setFilters(prev => ({ ...prev, daycare: 'all' }))} className="hover:text-blue-900"><X size={12} /></button>
              </div>
            )}

            {filters.food === 'yes' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-orange-100">
                Food
                <button onClick={() => setFilters(prev => ({ ...prev, food: 'all' }))} className="hover:text-orange-900"><X size={12} /></button>
              </div>
            )}

            {filters.transport === 'yes' && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-green-100">
                Bus
                <button onClick={() => setFilters(prev => ({ ...prev, transport: 'all' }))} className="hover:text-green-900"><X size={12} /></button>
              </div>
            )}

            {(filters.startDate || filters.endDate) && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200">
                Date: {filters.startDate || '...'} to {filters.endDate || '...'}
                <button onClick={() => setFilters(prev => ({ ...prev, startDate: '', endDate: '' }))} className="hover:text-slate-900"><X size={12} /></button>
              </div>
            )}

            <button 
              onClick={() => setFilters({ status: 'all', class: 'all', gender: 'all', paymentStatus: 'all', daycare: 'all', food: 'all', transport: 'all', startDate: '', endDate: '' })}
              className="ml-auto text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-blue-600 px-6 py-3 flex items-center justify-between text-white"
            >
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold">{selectedIds.length} students selected</p>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-2">
                  <button onClick={handleBulkPromote} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black uppercase tracking-widest transition-all">Promote</button>
                  <button onClick={handleBulkSuspend} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black uppercase tracking-widest transition-all">Suspend</button>
                  <button onClick={handleBulkDelete} className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-xs font-black uppercase tracking-widest transition-all">Delete</button>
                  <select 
                    onChange={(e) => handleBulkStatusChange(e.target.value)}
                    className="px-3 py-1 bg-white/10 border-none outline-none rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer"
                  >
                    <option value="" className="text-slate-900">Change Status</option>
                    <option value="active" className="text-slate-900">Active</option>
                    <option value="inactive" className="text-slate-900">Inactive</option>
                    <option value="graduated" className="text-slate-900">Graduated</option>
                    <option value="dropout" className="text-slate-900">Dropout</option>
                  </select>
                </div>
              </div>
              <button onClick={() => setSelectedIds([])} className="text-xs font-bold hover:underline">Clear Selection</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 border-b border-slate-100 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Student Info
                    {sortConfig?.key === 'name' && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => requestSort('id')}
                >
                  <div className="flex items-center gap-2">
                    ID
                    {sortConfig?.key === 'id' && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => requestSort('class')}
                >
                  <div className="flex items-center gap-2">
                    Class
                    {sortConfig?.key === 'class' && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Parent/Guardian</th>
                <th 
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortConfig?.key === 'status' && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student, i) => (
                    <motion.tr 
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "hover:bg-slate-50 transition-colors group cursor-pointer",
                        selectedIds.includes(student.id) && "bg-blue-50/50 hover:bg-blue-50"
                      )}
                      onClick={() => setControlStudent(student)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(student.id)}
                          onChange={(e) => toggleSelect(student.id, e as any)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                      <div className="relative group/avatar">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 overflow-hidden">
                          {student.profilePic ? (
                            <img src={student.profilePic} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUploadClick(student);
                          }}
                          className={cn(
                            "absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity",
                            isUploading && selectedStudent?.id === student.id && "opacity-100"
                          )}
                        >
                          {isUploading && selectedStudent?.id === student.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Camera size={14} />
                          )}
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight uppercase italic">{student.name}</p>
                        {student.nameKh && <p className="text-xs font-medium text-slate-500">{student.nameKh}</p>}
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">{student.gender} • {student.dob}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit">
                        {student.id}
                      </span>
                      {student.academicYear && (
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                          {student.academicYear}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700">{student.class}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="text-sm text-slate-600 font-medium">{student.parent}</p>
                      {student.tel && student.tel !== student.parent && (
                        <p className="text-[10px] text-slate-400 font-medium">{student.tel}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "inline-flex items-center w-fit px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        student.status === 'active' ? "bg-emerald-100 text-emerald-700" : 
                        student.status === 'graduated' ? "bg-blue-100 text-blue-700" :
                        student.status === 'dropout' ? "bg-slate-100 text-slate-700" :
                        student.status === 'suspended' ? "bg-red-100 text-red-700" :
                        "bg-orange-100 text-orange-700"
                      )}>
                        {student.status}
                      </span>
                      {student.paymentStatus === 'unpaid' && (
                        <span className="text-[9px] font-bold text-red-500 uppercase">Unpaid</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           setPrintingStudent(student);
                         }}
                         className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                         title="Print ID Card"
                       >
                         <Printer size={18} />
                       </button>
                      <div className="relative group/menu">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setControlStudent(student);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest"
                        >
                          <UserCog size={14} />
                          Full Control
                        </button>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isEnrollmentOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setIsEnrollmentOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase italic">New Student Enrollment</h2>
                  <p className="text-xs text-slate-500 font-bold tracking-widest mt-1">FILL IN ALL REQUIRED INFORMATION</p>
                </div>
                <button 
                  disabled={isSaving}
                  onClick={() => setIsEnrollmentOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEnrollmentSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Full Name (EN)</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. John Doe"
                        value={enrollmentData.name}
                        onChange={e => setEnrollmentData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Full Name (KH)</label>
                      <input 
                        type="text" 
                        placeholder="ឧទាហរណ៍៖ សុខ ជា"
                        value={enrollmentData.nameKh}
                        onChange={e => setEnrollmentData(prev => ({ ...prev, nameKh: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-khmer font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Class/Grade</label>
                      <select 
                        value={enrollmentData.class}
                        onChange={e => setEnrollmentData(prev => ({ ...prev, class: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      >
                        {ACTIVE_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Gender</label>
                      <select 
                        value={enrollmentData.gender}
                        onChange={e => setEnrollmentData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Date of Birth</label>
                      <input 
                        required
                        type="date" 
                        value={enrollmentData.dob}
                        onChange={e => setEnrollmentData(prev => ({ ...prev, dob: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Enrollment Date</label>
                      <input 
                        required
                        type="date" 
                        value={enrollmentData.enrollmentDate || new Date().toISOString().split('T')[0]}
                        onChange={e => setEnrollmentData(prev => ({ ...prev, enrollmentDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Parent/Guardian Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Robert Smith"
                        value={enrollmentData.parent}
                        onChange={e => setEnrollmentData(prev => ({ ...prev, parent: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Telephone</label>
                      <input 
                        type="tel" 
                        placeholder="e.g. 012 345 678"
                        value={enrollmentData.tel}
                        onChange={e => setEnrollmentData(prev => ({ ...prev, tel: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Academic Year</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 2026-2027"
                      value={enrollmentData.academicYear}
                      onChange={e => setEnrollmentData(prev => ({ ...prev, academicYear: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Supporting Documents</label>
                    <div className="space-y-3">
                      {enrollmentData.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-blue-600" />
                            <span className="text-xs font-bold text-blue-900 truncate max-w-[200px]">{doc.name}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeDoc(idx)}
                            className="p-1 hover:bg-white rounded-lg text-rose-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      
                      <input 
                        type="file" 
                        ref={docInputRef}
                        onChange={handleDocUpload}
                        className="hidden"
                      />
                      
                      <button 
                        type="button"
                        onClick={() => docInputRef.current?.click()}
                        disabled={isUploadingDoc}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-400 hover:text-blue-600 group"
                      >
                        {isUploadingDoc ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : (
                          <>
                            <Upload size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase">Attach ID, Birth Cert, or Records</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEnrollmentOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-2 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Plus size={20} /> Confirm Enrollment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {printingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPrintingStudent(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full relative z-10 shadow-2xl flex flex-col items-center"
            >
               <button 
                 onClick={() => setPrintingStudent(null)}
                 className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
               >
                 <X size={24} />
               </button>

               <h2 className="text-2xl font-black text-slate-900 mb-8">ID Card Preview</h2>

               <div id="printable-card" className="shadow-2xl rounded-3xl overflow-hidden scale-[0.85] md:scale-100 origin-top">
                 <StudentIdCard student={printingStudent} />
               </div>

               <div className="mt-12 flex gap-4 w-full">
                  <button 
                    onClick={() => setPrintingStudent(null)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex-3 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Printer size={20} /> Print Now
                  </button>
               </div>
            </motion.div>
          </div>
        )}

        {controlStudent && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setControlStudent(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="bg-white rounded-[3rem] w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
               {/* Sidebar Info */}
               <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-slate-100 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-3xl font-black text-slate-400 border-4 border-white overflow-hidden mb-4 italic">
                    {controlStudent.profilePic ? (
                      <img src={controlStudent.profilePic} alt={controlStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      controlStudent.name.charAt(0)
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{controlStudent.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 italic">{controlStudent.id}</span>
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest italic">{controlStudent.class}</span>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-8">
                     <button 
                       onClick={async () => {
                        const newStatus = (controlStudent.status === 'active' ? 'suspended' : 'active') as StudentStatus;
                        if (controlStudent.firebaseId) {
                          await studentService.updateStudent(controlStudent.firebaseId, { status: newStatus });
                        }
                        setControlStudent(prev => prev ? { ...prev, status: newStatus } : null);
                       }}
                       className={cn(
                        "w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all",
                        controlStudent.status === 'active' ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" :
                        controlStudent.status === 'suspended' ? "bg-rose-50 text-rose-600 hover:bg-rose-100" :
                        "bg-orange-50 text-orange-600 hover:bg-orange-100"
                       )}
                     >
                       Status: {controlStudent.status}
                     </button>
                     
                     <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={async () => {
                            if (controlStudent.firebaseId) {
                               await studentService.updateStudent(controlStudent.firebaseId, { status: 'active' });
                            }
                            setControlStudent(prev => prev ? { ...prev, status: 'active' } : null);
                          }}
                          className={cn("p-3 rounded-xl flex items-center justify-center transition-all", controlStudent.status === 'active' ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 border border-emerald-100")}
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (controlStudent.firebaseId) {
                               await studentService.updateStudent(controlStudent.firebaseId, { status: 'warning' });
                            }
                            setControlStudent(prev => prev ? { ...prev, status: 'warning' } : null);
                          }}
                          className={cn("p-3 rounded-xl flex items-center justify-center transition-all", controlStudent.status === 'warning' ? "bg-orange-600 text-white" : "bg-white text-orange-600 border border-orange-100")}
                        >
                          <AlertTriangle size={16} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (controlStudent.firebaseId) {
                               await studentService.updateStudent(controlStudent.firebaseId, { status: 'suspended' });
                            }
                            setControlStudent(prev => prev ? { ...prev, status: 'suspended' } : null);
                          }}
                          className={cn("p-3 rounded-xl flex items-center justify-center transition-all", controlStudent.status === 'suspended' ? "bg-rose-600 text-white" : "bg-white text-rose-600 border border-rose-100")}
                        >
                          <ShieldAlert size={16} />
                        </button>
                     </div>
                  </div>

                  <div className="mt-auto pt-8 w-full">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Navigation</p>
                     <div className="space-y-2">
                        <button 
                          onClick={() => {
                            setActiveTab?.('family-profile', controlStudent.id);
                            setControlStudent(null);
                          }}
                          className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl transition-all group"
                        >
                           <div className="flex items-center gap-3">
                              <Users size={16} className="text-blue-500 group-hover:text-white" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Parent Profile</span>
                           </div>
                           <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <button 
                          onClick={() => {
                            setActiveTab?.('grades', controlStudent.id);
                            setControlStudent(null);
                          }}
                          className="w-full flex items-center justify-between p-3 bg-white hover:bg-blue-600 hover:text-white rounded-xl transition-all group"
                        >
                           <div className="flex items-center gap-3">
                              <BookOpen size={16} className="text-blue-500 group-hover:text-white" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Study Results</span>
                           </div>
                           <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Main Content */}
               <div className="flex-1 flex flex-col min-h-0 bg-white">
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4 p-1 bg-slate-100 rounded-2xl">
                        {(['status', 'auxiliary', 'profile'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveControlTab(tab)}
                            className={cn(
                              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              activeControlTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                            )}
                          >
                            {tab}
                          </button>
                        ))}
                     </div>
                     <button onClick={() => setControlStudent(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                        <X size={24} />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                     <AnimatePresence mode="wait">
                       {activeControlTab === 'status' && (
                         <motion.div 
                           key="status"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="space-y-8"
                         >
                            <div>
                               <h4 className="text-sm font-black text-slate-900 uppercase italic mb-4">Identity Verification</h4>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                                     <p className="font-black text-slate-900 italic uppercase">{controlStudent.gender}</p>
                                  </div>
                                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Birth Date</p>
                                     <p className="font-black text-slate-900 italic uppercase">{controlStudent.dob}</p>
                                  </div>
                               </div>
                            </div>

                            <div>
                               <h4 className="text-sm font-black text-slate-900 uppercase italic mb-1 flex items-center gap-2">
                                 <Activity size={16} className="text-blue-500" />
                                 Behavioral Record
                               </h4>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 italic">Automated alerts based on violation count</p>
                               
                               <div className="p-6 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                     <div className={cn(
                                       "w-12 h-12 rounded-2xl flex items-center justify-center font-black",
                                       controlStudent.violationCount > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                     )}>
                                        {controlStudent.violationCount}
                                     </div>
                                     <div>
                                        <p className="text-xs font-black text-slate-900 uppercase italic">Recorded Violations</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Academic Session 2026</p>
                                     </div>
                                  </div>
                                  <button 
                                    onClick={async () => {
                                      if (!(controlStudent as any).telegramChatId) {
                                        alert("Please set a Telegram Chat ID in the Profile tab first.");
                                        return;
                                      }
                                      const msg = NOTIFICATION_TEMPLATES.STUDENT_WARNING(controlStudent.name, "Unspecified behavioral violation");
                                      await sendTelegramNotification((controlStudent as any).telegramChatId, msg);
                                      alert("Telegram warning sent!");
                                    }}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:bg-blue-600 transition-all flex items-center gap-2"
                                  >
                                    <Send size={14} />
                                    Issue Warning
                                  </button>
                               </div>
                            </div>

                            <div className="p-6 bg-blue-600 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-blue-600/20">
                               <div>
                                  <h4 className="font-black italic uppercase tracking-tight text-lg">Full Profile Control</h4>
                                  <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-1">Access medical, academic, and sensitive records</p>
                               </div>
                               <button 
                                 onClick={() => setActiveControlTab('profile')}
                                 className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all"
                               >
                                  <Eye size={20} />
                               </button>
                            </div>
                         </motion.div>
                       )}

                       {activeControlTab === 'auxiliary' && (
                         <motion.div 
                           key="auxiliary"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="space-y-6"
                         >
                            <div className="flex items-center justify-between mb-8">
                               <div>
                                  <h4 className="text-xl font-black text-slate-900 italic uppercase">Auxiliary Services</h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Smart options for non-academic facilities</p>
                               </div>
                               <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                 Active Enrollment
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               {[
                                 { id: 'daycare', label: 'Daycare Service', icon: Baby, color: 'blue', desc: 'Extended hours care' },
                                 { id: 'food', label: 'Daily Nutrition', icon: Utensils, color: 'orange', desc: 'School meal program' },
                                 { id: 'transport', label: 'Bus / Transport', icon: Bus, color: 'purple', desc: 'Point-to-point pickup' },
                               ].map((service) => {
                                 const isEnabled = (controlStudent as any).auxiliary?.[service.id];
                                 return (
                                   <button
                                     key={service.id}
                                     onClick={() => {
                                       setControlStudent(prev => {
                                         if (!prev) return null;
                                         const newAux = { ...(prev as any).auxiliary, [service.id]: !isEnabled };
                                         setStudents(sPrev => sPrev.map(s => s.id === prev.id ? { ...s, auxiliary: newAux } : s));
                                         return { ...prev, auxiliary: newAux };
                                       });
                                     }}
                                     className={cn(
                                       "p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-start text-left group gap-4 relative overflow-hidden",
                                       isEnabled ? `border-${service.color}-500 bg-${service.color}-50` : "border-slate-100 bg-white hover:border-slate-200"
                                     )}
                                   >
                                      {isEnabled && (
                                        <div className={cn("absolute -right-2 -top-2 w-12 h-12 flex items-center justify-center rotate-12", `text-${service.color}-200/20`)}>
                                           <service.icon size={64} />
                                        </div>
                                      )}
                                      <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                        isEnabled ? `bg-${service.color}-600 text-white` : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                      )}>
                                         <service.icon size={24} />
                                      </div>
                                      <div>
                                         <p className={cn("text-[10px] font-black uppercase tracking-widest italic", isEnabled ? `text-${service.color}-600` : "text-slate-400")}>
                                           {service.label}
                                         </p>
                                         <p className="text-xs font-bold text-slate-900 mt-1 italic">{service.desc}</p>
                                      </div>
                                      <div className={cn(
                                        "w-full h-1 rounded-full mt-2 transition-all",
                                        isEnabled ? `bg-${service.color}-600` : "bg-slate-100"
                                      )} />
                                      {isEnabled ? (
                                        <div className={cn("mt-auto flex items-center gap-2", `text-${service.color}-600`)}>
                                           <Check size={14} className="font-bold" />
                                           <span className="text-[9px] font-black uppercase">Subscribed</span>
                                        </div>
                                      ) : (
                                        <span className="mt-auto text-[9px] font-black uppercase text-slate-400">Not Active</span>
                                      )}
                                   </button>
                                 );
                               })}
                            </div>

                            <div className="mt-8 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                               <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                     <Hammer size={20} />
                                  </div>
                                  <div className="flex-1">
                                     <p className="text-xs font-black text-slate-900 uppercase italic">Fee Modification Engine</p>
                                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Changes to services will automatically recalibrate the next invoice amount based on established service rates.</p>
                                  </div>
                                  <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all">
                                    Recalculate Fees
                                  </button>
                               </div>
                            </div>
                         </motion.div>
                       )}

                       {activeControlTab === 'profile' && (
                         <motion.div 
                           key="profile"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: -20 }}
                           className="space-y-6"
                         >
                            <div className="flex items-center justify-between mb-8">
                               <div>
                                  <h4 className="text-xl font-black text-slate-900 italic uppercase">Advanced Profile Editor</h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Authorized HR / Admin Access Only</p>
                               </div>
                            </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Display Name (EN)</label>
                                   <input 
                                     value={editProfileData.name}
                                     onChange={e => setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
                                     className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 italic text-sm"
                                     placeholder="e.g. John Doe"
                                   />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Full Name (KH)</label>
                                   <input 
                                     value={editProfileData.nameKh || ''}
                                     onChange={e => setEditProfileData(prev => ({ ...prev, nameKh: e.target.value }))}
                                     className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-khmer font-bold text-slate-700 italic text-sm"
                                     placeholder="ឧទាហរណ៍៖ សុខ ជា"
                                   />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Class Assignment</label>
                                   <select 
                                     value={editProfileData.class}
                                     onChange={e => setEditProfileData(prev => ({ ...prev, class: e.target.value }))}
                                     className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 italic text-sm"
                                   >
                                      {ACTIVE_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Telephone / Contact</label>
                                   <div className="relative">
                                     <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                     <input 
                                       placeholder="e.g. 012 345 678"
                                       value={editProfileData.tel || ''}
                                       onChange={e => setEditProfileData(prev => ({ ...prev, tel: e.target.value }))}
                                       className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 italic text-sm"
                                     />
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Telegram Chat ID</label>
                                   <div className="relative">
                                     <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                     <input 
                                       placeholder="Chat ID (e.g. 1526372)"
                                       value={editProfileData.telegramChatId}
                                       onChange={e => setEditProfileData(prev => ({ ...prev, telegramChatId: e.target.value }))}
                                       className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 italic text-sm"
                                     />
                                     <button 
                                       type="button"
                                       onClick={async () => {
                                         if (!editProfileData.telegramChatId) return;
                                         await sendTelegramNotification(editProfileData.telegramChatId, "🛠 <b>BOT TEST</b>\n\nYour school Telegram notification system is correctly configured.");
                                         alert("Test message sent!");
                                       }}
                                       className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-black uppercase italic tracking-widest"
                                     >
                                       Test
                                     </button>
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Guardian / Parent</label>
                                   <div className="relative">
                                     <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                     <input 
                                       value={editProfileData.parent}
                                       placeholder="e.g. Robert Smith"
                                       onChange={e => setEditProfileData(prev => ({ ...prev, parent: e.target.value }))}
                                       className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 italic text-sm"
                                     />
                                   </div>
                                </div>
                             </div>
                            <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-rose-50/20">
                               <div className="flex items-start gap-4">
                                  <AlertCircle size={24} className="text-rose-500 mt-1" />
                                  <div>
                                     <p className="text-xs font-black text-rose-600 uppercase italic">Danger Zone</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Removing a student profile is permanent. All historical data including grades and finance will be archived.</p>
                                     <button className="mt-4 px-6 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all">
                                       Permanently Remove Student
                                     </button>
                                  </div>
                               </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                               <button 
                                 onClick={async () => {
                                   if (controlStudent.firebaseId) {
                                      await studentService.updateStudent(controlStudent.firebaseId, {
                                        name: editProfileData.name,
                                        nameKh: editProfileData.nameKh,
                                        parent: editProfileData.parent,
                                        tel: editProfileData.tel,
                                        class: editProfileData.class,
                                        academicYear: editProfileData.academicYear,
                                        telegramChatId: editProfileData.telegramChatId
                                      } as any);
                                   }
                                   setControlStudent(prev => prev ? { ...prev, ...editProfileData } : null);
                                   alert('Profile updated successfully!');
                                 }}
                                 className="flex-1 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest italic shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
                               >
                                 Save Comprehensive Profile
                               </button>
                               <button 
                                 onClick={() => setControlStudent(null)}
                                 className="px-8 py-4 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black uppercase text-xs tracking-widest italic hover:bg-slate-200 transition-all"
                               >
                                 Discard
                               </button>
                            </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    ) : activeView === 'registration' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 italic uppercase">Available Courses</h2>
                  <p className="text-sm text-slate-500">Select and register students for the current semester.</p>
                </div>
                <BookOpen size={24} className="text-blue-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(course => {
                  const isFull = course.filled >= course.seats;
                  return (
                    <div 
                      key={course.id}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 transition-all group",
                        isFull ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white", course.color)}>
                          {course.id}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Users size={12} />
                          {course.filled} / {course.seats} Seats
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors uppercase italic">{course.name}</h3>
                      <p className="text-sm text-slate-500 mb-4">{course.teacher}</p>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <GraduationCap size={14} className="text-slate-400" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TARGET: {course.grade}</span>
                        </div>
                        {course.prereqs.length > 0 && (
                          <div className="flex items-center gap-2">
                             <ShieldAlert size={14} className="text-amber-500" />
                             <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">PREREQUISITE: {course.prereqs.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all", course.color)} 
                          style={{ width: `${(course.filled / course.seats) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6 uppercase italic">Quick Registration</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Select Student</label>
                  <select 
                    onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value) || null)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm"
                  >
                    <option value="">Choose a student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
                  </select>
                </div>

                {selectedStudent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-4 border-t border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <img src={selectedStudent.profilePic || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + selectedStudent.id} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{selectedStudent.name}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedStudent.class}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-2">Registering Courses</label>
                       <div className="grid grid-cols-1 gap-2">
                          {courses.map(course => {
                            const isRegistered = registrations[selectedStudent.id]?.includes(course.id);
                            return (
                              <button 
                                key={course.id}
                                onClick={() => toggleCourseRegistration(selectedStudent.id, course.id)}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                                  isRegistered ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                )}
                              >
                                <span className="text-xs font-bold">{course.name}</span>
                                {isRegistered ? <Check size={16} /> : <Plus size={16} />}
                              </button>
                            );
                          })}
                       </div>
                    </div>

                    <button 
                      onClick={() => {
                        alert(`Registration saved for ${selectedStudent.name}!`);
                        setSelectedStudent(null);
                      }}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all mt-4"
                    >
                      Confirm Registration
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-600/20">
               <Activity size={32} className="mb-4 text-blue-200 opacity-50" />
               <h3 className="text-lg font-black uppercase italic tracking-tighter mb-2">Registration Open</h3>
               <p className="text-sm text-blue-100 leading-relaxed mb-6">Fall Semester registration is currently 85% complete. Please ensure all G12 students are registered by end of week.</p>
               <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">View Analytics</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/50">
                <Upload size={28} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Administrative Student Bulk Enrollment Portal</h2>
              <p className="text-slate-500 dark:text-slate-450 text-sm max-w-xl mx-auto leading-relaxed">
                Upload student registration sheets in either JSON list collection format or standard Comma-Separated Values (CSV).
              </p>

              {/* Template Download row */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button 
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-705 text-xs font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <FileText size={14} className="text-blue-500" />
                  CSV Template Sheet
                </button>
                <button 
                  onClick={downloadJSONTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-705 text-xs font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <BookOpen size={14} className="text-emerald-500" />
                  JSON Template List
                </button>
              </div>

              {/* Drag and Drop zone box */}
              <div 
                onClick={() => csvInputRef.current?.click()}
                className="mt-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/5 dark:hover:bg-blue-950/15 rounded-[2rem] p-12 transition-all cursor-pointer group"
              >
                <div className="space-y-2">
                   <p className="text-sm font-bold text-slate-705 dark:text-slate-200 group-hover:text-blue-500 transition-colors">
                     Click to choose a JSON or CSV file from your computer
                   </p>
                   <p className="text-xs text-slate-400">
                     Supports raw .json array list format or standard spreadsheet .csv
                   </p>
                </div>
              </div>

              {/* Integrity guidelines specifications check list */}
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-850 text-left mt-8 max-w-2xl mx-auto">
                 <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                   <ShieldAlert size={14} className="text-blue-550 dark:text-blue-400" />
                   PSIS Database Schema Constraints:
                 </h4>
                 <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 list-inside list-disc">
                   <li><strong className="text-slate-700 dark:text-slate-300 font-bold">id</strong> (Optional; unique student ID format e.g., VH1001)</li>
                   <li><strong className="text-slate-700 dark:text-slate-300 font-bold">name</strong> (Required; student's latin script spelling)</li>
                   <li><strong className="text-slate-700 dark:text-slate-300 font-bold">class</strong> (School enrollment class code (e.g., G10A, G11, G12))</li>
                   <li><strong className="text-slate-700 dark:text-slate-300 font-bold">gender</strong> (Standard gender classifications (e.g., Male, Female))</li>
                   <li><strong className="text-slate-700 dark:text-slate-300 font-bold">parent</strong> (Parent contact name or phone number)</li>
                 </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {(isUploading || isImporting) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 bg-white border border-slate-200 shadow-2xl p-4 rounded-2xl flex items-center gap-3 z-[60]"
          >
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Loader2 size={20} className="animate-spin" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{isImporting ? 'Importing CSV...' : 'Uploading Image...'}</p>
              <p className="text-xs text-slate-500">Wait a moment please</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

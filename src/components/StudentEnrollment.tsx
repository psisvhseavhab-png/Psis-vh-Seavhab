import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Save, X, ChevronRight, ChevronLeft, Upload, Users, BookOpen, CreditCard, MapPin, CheckCircle2, Search, Printer, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { PROGRAMS, SUB_PROGRAMS, PROFICIENCY_LEVELS, ACTIVE_CLASSES } from '../constants';
import { studentService } from '../services/studentService';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';

export function StudentEnrollment() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    mainProgram: PROGRAMS[0],
    subProgram: SUB_PROGRAMS[0],
    proficiencyLevel: PROFICIENCY_LEVELS[SUB_PROGRAMS[0]]?.[0] || 'All Proficiency Level',
    class: ACTIVE_CLASSES[0],
    studyTime: 'Morning (7:30 - 11:30)',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    familyCode: ''
  });

  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Bulk enrollment states
  const [enrollMode, setEnrollMode] = useState<'single' | 'bulk'>('single');
  const [dragActive, setDragActive] = useState(false);
  const [parsedRecords, setParsedRecords] = useState<any[]>([]);
  const [validationLog, setValidationLog] = useState<{ status: 'ok' | 'warn'; msg: string }[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importCompleted, setImportCompleted] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const logs: { status: 'ok' | 'warn'; msg: string }[] = [];
      let records: any[] = [];

      try {
        if (file.name.endsWith('.json')) {
          const raw = JSON.parse(text);
          records = Array.isArray(raw) ? raw : [raw];
          logs.push({ status: 'ok', msg: `Successfully parsed JSON. Read ${records.length} items.` });
        } else {
          const result = Papa.parse(text, { header: true, skipEmptyLines: true });
          records = result.data;
          logs.push({ status: 'ok', msg: `Successfully parsed CSV using PapaParse. Read ${records.length} records.` });
        }

        const validated: any[] = [];
        records.forEach((row: any, idx: number) => {
          const name = row.name || `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.StudentName || row.Name;
          if (!name) {
            logs.push({ status: 'warn', msg: `Line ${idx + 1}: Skipped (Empty or missing student name/firstName/lastName details).` });
            return;
          }

          const validatedRow = {
            id: row.id || `VH${Math.floor(100000 + Math.random() * 900000)}`,
            name: name,
            nameKh: row.nameKh || '',
            class: row.class || row.Class || ACTIVE_CLASSES[0],
            gender: (row.gender && ['Male', 'Female'].includes(row.gender)) ? row.gender : 'Male',
            dob: row.dob || row.BirthDate || new Date().toISOString().split('T')[0],
            tel: row.tel || row.phone || row.fatherPhone || row.motherPhone || '',
            parent: row.parent || row.fatherName || row.motherName || 'Unknown',
            status: 'active',
            paymentStatus: row.paymentStatus || 'paid',
            academicYear: '2026-2027',
            enrollmentDate: new Date().toISOString().split('T')[0]
          };

          validated.push(validatedRow);
          logs.push({ status: 'ok', msg: `Line ${idx + 1} (${name}): Validated successfully (Assigned class: ${validatedRow.class}).` });
        });

        setParsedRecords(validated);
        setValidationLog(logs);
        setImportCompleted(false);

      } catch (err: any) {
        console.error(err);
        setValidationLog([{ status: 'warn', msg: `Error parsing file contents: ${err.message}` }]);
      }
    };
    reader.readAsText(file);
  };

  const executeBulkImport = async () => {
    if (parsedRecords.length === 0) return;
    setIsImporting(true);
    try {
      for (const student of parsedRecords) {
        await studentService.addStudent(student);
      }
      setImportCompleted(true);
      setParsedRecords([]);
    } catch (err) {
      console.error(err);
      alert("An error occurred imports: Failed to write to Firestore.");
    } finally {
      setIsImporting(false);
    }
  };

  // Load latest student list on load and step transitions
  useEffect(() => {
    studentService.getStudents().then((data) => {
      setStudentsData(data);
    });
  }, [step]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    // Basic validation for Step 1
    if (step === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        alert("Please enter First Name and Last Name.");
        return;
      }
    }
    if (step < totalSteps) setStep(s => s + 1);
  };
  
  const prevStep = () => step > 1 && setStep(s => s - 1);

  // Export all student data to CSV format
  const exportAllStudentsToCSV = () => {
    setExportLoading(true);
    try {
      if (studentsData.length === 0) {
        alert("No student enrollment records found to export.");
        setExportLoading(false);
        return;
      }
      const csvData = studentsData.map(s => ({
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
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `psis_student_enrollments_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export student data.");
    } finally {
      setExportLoading(false);
    }
  };

  // Generate Receipt PDF
  const generateReceiptPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("PAÑÑĀSĀSTRA INTERNATIONAL SCHOOL", 105, 25, { align: 'center' });
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text("VAN HONG CAMPUS", 105, 32, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(20, 38, 190, 38);

      // Receipt Metadata
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Receipt Date: ${new Date().toISOString().split('T')[0]}`, 20, 48);
      doc.text(`Receipt ID: REC-${Math.floor(100000 + Math.random() * 900000)}`, 140, 48);

      // Title
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235); // blue-600
      doc.text("OFFICIAL ENROLLMENT RECEIPT", 105, 62, { align: 'center' });

      // Details Box
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(20, 70, 170, 75, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(20, 70, 170, 75, 'D');

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);

      let yOffset = 80;
      const printRow = (label: string, value: string) => {
        doc.setTextColor(100);
        doc.text(label, 25, yOffset);
        doc.setTextColor(15, 23, 42);
        doc.text(value, 80, yOffset);
        yOffset += 10;
      };

      const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'Demo Student';
      printRow("Student Name:", fullName);
      printRow("Class & Shift:", `${formData.class} - ${formData.studyTime}`);
      printRow("Academic Program:", formData.mainProgram);
      printRow("Sub-program / Level:", `${formData.subProgram} (${formData.proficiencyLevel})`);
      printRow("Parent / Contact:", `${formData.fatherName || formData.motherName || 'N/A'} (${formData.fatherPhone || formData.motherPhone || 'N/A'})`);

      // Payment Info
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text("FEES SUMMARY", 25, 133);
      doc.line(25, 135, 185, 135);

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Enrollment Service Fee (Term 1)", 25, 142);
      doc.text("$1,200.00", 185, 142, { align: 'right' });

      // Total Paid
      doc.setFillColor(239, 246, 255); // blue-50
      doc.rect(20, 150, 170, 15, 'F');
      doc.rect(20, 150, 170, 15, 'D');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(29, 78, 216); // blue-700
      doc.text("TOTAL AMOUNT PAID:", 25, 160);
      doc.text("$1,200.00", 185, 160, { align: 'right' });

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text("Thank you for choosing Paññāsāstra International School.", 105, 185, { align: 'center' });
      doc.text("Please retain this print-out for your records.", 105, 191, { align: 'center' });

      // Signatures
      doc.line(30, 225, 80, 225);
      doc.text("Registrar Signature", 55, 231, { align: 'center' });

      doc.line(130, 225, 180, 225);
      doc.text("Parent/Guardian Signature", 155, 231, { align: 'center' });

      doc.save(`receipt_${fullName.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF receipt.");
    }
  };

  // Submit and Save student data helper
  const handleFinalize = async () => {
    try {
      const studentData = {
        id: `VH${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${formData.firstName} ${formData.lastName}`.trim() || 'New Student',
        nameKh: '',
        class: formData.class,
        gender: formData.gender as 'Male' | 'Female',
        dob: formData.dob || new Date().toISOString().split('T')[0],
        tel: formData.fatherPhone || formData.motherPhone || '',
        parent: formData.fatherName || formData.motherName || 'N/A',
        enrollmentDate: new Date().toISOString().split('T')[0],
        academicYear: '2026-2027',
        status: 'active' as const,
        paymentStatus: 'paid' as const,
        violationCount: 0,
        profilePic: '',
        auxiliary: { daycare: false, food: false, transport: false }
      };

      await studentService.addStudent(studentData);
      
      // Log the student enrollment activity
      try {
        const { logActivity } = await import('../utils/activityLogger');
        logActivity(
          'student_enrollment',
          `Enrolled student '${studentData.name}' into ${studentData.class} (ID: ${studentData.id})`,
          undefined,
          { studentId: studentData.id, class: studentData.class }
        );
      } catch (logErr) {
        console.error("Failed to write to activity log:", logErr);
      }

      alert("Successfully finalized student enrollment!");
      setStep(1);
      // Reset form fields
      setFormData({
        firstName: '',
        lastName: '',
        dob: '',
        gender: 'Male',
        mainProgram: PROGRAMS[0],
        subProgram: SUB_PROGRAMS[0],
        proficiencyLevel: PROFICIENCY_LEVELS[SUB_PROGRAMS[0]]?.[0] || 'All Proficiency Level',
        class: ACTIVE_CLASSES[0],
        studyTime: 'Morning (7:30 - 11:30)',
        fatherName: '',
        fatherPhone: '',
        motherName: '',
        motherPhone: '',
        familyCode: ''
      });
    } catch (error) {
      console.error(error);
      alert("Failed to save enrollment detail to database.");
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-12 relative px-4 text-slate-900">
       <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
       {[1, 2, 3, 4].map((i) => (
         <div key={i} className="relative z-10 flex flex-col items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2",
              step >= i ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" : "bg-white text-slate-400 border-slate-200"
            )}>
              {step > i ? <CheckCircle2 size={20} /> : i}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest transition-colors",
              step >= i ? "text-blue-600" : "text-slate-400"
            )}>
              {['Identity', 'Academic', 'Family', 'Review'][i-1]}
            </span>
         </div>
       ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <UserPlus size={32} className="text-blue-600" />
            Quick Registration
          </h1>
          <p className="text-slate-500 mt-1">Enroll a new student into the EduPulse system in minutes.</p>
        </div>
        <div>
          <button
            onClick={exportAllStudentsToCSV}
            disabled={exportLoading}
            className="flex items-center gap-2 px-5 py-3 border border-slate-200 hover:border-blue-500 bg-white hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-600 rounded-2xl shadow-sm transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
            title="Export registered students to CSV spreadsheet format"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            Export Enrolled (CSV)
          </button>
        </div>
      </div>

      {/* Enrollment Mode Switches */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit mb-8">
        <button
          type="button"
          onClick={() => setEnrollMode('single')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer",
            enrollMode === 'single' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          )}
        >
          Single registration
        </button>
        <button
          type="button"
          onClick={() => setEnrollMode('bulk')}
          className={cn(
            "px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
            enrollMode === 'bulk' ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-800"
          )}
        >
          <Upload size={13} />
          Bulk CSV/JSON Import
        </button>
      </div>

      {enrollMode === 'bulk' ? (
        <div className="space-y-6 text-left">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "p-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 text-center transition-all bg-white shadow-xl shadow-slate-100",
              dragActive ? "border-blue-500 bg-blue-50/20 scale-[1.01]" : "border-slate-200 hover:border-slate-350",
              validationLog.length > 0 && "py-8"
            )}
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
              <Upload size={28} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Drag & Drop Bulk Registry File</h3>
              <p className="text-xs text-slate-400 mt-1">Supports spreadsheet comma-separated rows (.csv) or database lists (.json)</p>
            </div>
            
            <label className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md cursor-pointer">
              Choose Local File
              <input
                type="file"
                className="hidden"
                accept=".csv, .json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {/* Validation Logs */}
          {validationLog.length > 0 && (
            <div className="p-6 bg-white border border-slate-200 rounded-[2rem] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">File Sanitizer Logs</span>
                <span className="text-[9px] font-extrabold text-slate-500">
                  {parsedRecords.length} Clean Records Ready
                </span>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-1.5 divide-y divide-slate-50 pr-2">
                {validationLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 py-2 text-xs leading-relaxed font-mono">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                      log.status === 'ok' ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                    )} />
                    <span className={log.status === 'ok' ? "text-slate-600" : "text-amber-700 font-bold"}>
                      {log.msg}
                    </span>
                  </div>
                ))}
              </div>

              {parsedRecords.length > 0 && (
                <button
                  type="button"
                  onClick={executeBulkImport}
                  disabled={isImporting}
                  className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Adding Enrollees to Database...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      Verify & Commit {parsedRecords.length} Students
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {importCompleted && (
            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] space-y-3 shadow-inner text-center py-8">
              <CheckCircle2 className="text-emerald-500 mx-auto" size={36} />
              <h3 className="font-extrabold text-emerald-850 text-sm">Bulk Enrollment Committed!</h3>
              <p className="text-xs text-emerald-650 max-w-sm mx-auto font-sans leading-relaxed">
                All records passed schemas, allocated auto-registration IDs, and committed safely to the live directory.
              </p>
              <button
                type="button"
                onClick={() => {
                  setImportCompleted(false);
                  setValidationLog([]);
                }}
                className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer font-sans"
              >
                Clear Screen
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <StepIndicator />

          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 md:p-10 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 min-h-[400px]"
          >
            {step === 1 && (
          <div className="space-y-6">
             <div className="flex flex-col md:flex-row items-center gap-8 border-b border-slate-100 pb-8">
                <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-all cursor-pointer">
                   <Upload size={24} />
                   <span className="text-[10px] font-bold uppercase">Upload Photo</span>
                </div>
                <div className="flex-1 w-full space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">First Name*</label>
                        <input 
                          type="text" 
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800" 
                          placeholder="e.g. Sopheak"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Last Name*</label>
                        <input 
                          type="text" 
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800" 
                          placeholder="e.g. Pat"
                        />
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Date of Birth</label>
                        <input 
                          type="date" 
                          value={formData.dob}
                          onChange={(e) => handleInputChange('dob', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Gender</label>
                        <select 
                          value={formData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800"
                        >
                           <option>Male</option>
                           <option>Female</option>
                           <option>Other</option>
                        </select>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-800">
             <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                   <BookOpen size={18} className="text-blue-500" />
                   Curriculum Placement
                </h3>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Main Program</label>
                   <select 
                    value={formData.mainProgram}
                    onChange={(e) => handleInputChange('mainProgram', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                   >
                      {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sub Program</label>
                   <select 
                    value={formData.subProgram}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        subProgram: newSub,
                        proficiencyLevel: PROFICIENCY_LEVELS[newSub]?.[0] || 'All Proficiency Level'
                      }));
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                   >
                      {SUB_PROGRAMS.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Proficiency Level</label>
                   <select 
                    value={formData.proficiencyLevel}
                    onChange={(e) => handleInputChange('proficiencyLevel', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                   >
                      {(PROFICIENCY_LEVELS[formData.subProgram] || ['All Proficiency Level']).map(pl => (
                        <option key={pl} value={pl}>{pl}</option>
                      ))}
                   </select>
                </div>
             </div>
             <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-slate-900 border-b border-slate-50 pb-2">
                   <Users size={18} className="text-emerald-500" />
                   Class Assignment
                </h3>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Select Class</label>
                   <select 
                    value={formData.class}
                    onChange={(e) => handleInputChange('class', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                   >
                      {ACTIVE_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Study Time</label>
                   <select 
                    value={formData.studyTime}
                    onChange={(e) => handleInputChange('studyTime', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                   >
                      <option>Morning (7:30 - 11:30)</option>
                      <option>Afternoon (1:00 - 5:00)</option>
                   </select>
                </div>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-slate-800">
             <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-blue-900">Link existing family?</h4>
                  <p className="text-xs text-blue-700">Search for parents already in our database to link siblings.</p>
                </div>
                <div className="relative w-full md:w-64">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                   <input 
                    type="text" 
                    value={formData.familyCode}
                    onChange={(e) => handleInputChange('familyCode', e.target.value)}
                    placeholder="Family Code or Name..." 
                    className="w-full pl-9 pr-4 py-2 bg-white border border-blue-200 rounded-lg text-xs outline-none text-slate-900" 
                   />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                   <h5 className="font-bold text-slate-900 text-sm">Father Details</h5>
                   <input 
                    type="text" 
                    placeholder="Father Name" 
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                   />
                   <input 
                    type="text" 
                    placeholder="Phone Number" 
                    value={formData.fatherPhone}
                    onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                   />
                </div>
                <div className="space-y-4">
                   <h5 className="font-bold text-slate-900 text-sm">Mother Details</h5>
                   <input 
                    type="text" 
                    placeholder="Mother Name" 
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                   />
                   <input 
                    type="text" 
                    placeholder="Phone Number" 
                    value={formData.motherPhone}
                    onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                   />
                </div>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center p-6 md:p-12 text-center space-y-6">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={48} />
             </div>
             <div>
               <h3 className="text-2xl font-black text-slate-900">Review & Submit</h3>
               <p className="text-slate-500 max-w-sm mt-1 mx-auto text-xs">Almost there! Review the details. Upon submission, an invoice will be automatically generated for the first term fees.</p>
             </div>

             {/* receipt print button in Quick Registration review & submit step */}
             <button
               onClick={generateReceiptPDF}
               className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 duration-200"
               title="Print Receipt as PDF"
             >
               <Printer size={16} />
               Print Receipt (PDF)
             </button>

             <div className="w-full max-w-md bg-slate-50 rounded-2xl p-6 text-left border border-slate-200/60 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1.5">Enrollment Summary</p>
                <div className="grid grid-cols-2 text-xs gap-y-1.5">
                   <span className="text-slate-500">Student Name:</span>
                   <span className="font-extrabold text-slate-800 text-right">{formData.firstName} {formData.lastName}</span>
                   
                   <span className="text-slate-500">Class Assigned:</span>
                   <span className="font-extrabold text-slate-800 text-right">{formData.class} ({formData.studyTime})</span>
                   
                   <span className="text-slate-500">Program:</span>
                   <span className="font-extrabold text-slate-800 text-right">{formData.mainProgram}</span>

                   <span className="text-slate-500">Level:</span>
                   <span className="font-extrabold text-slate-800 text-right">{formData.proficiencyLevel}</span>
                </div>

                <div className="flex justify-between text-xs py-2 border-t border-slate-200 mt-2">
                   <span className="text-slate-500">Initial Fee:</span>
                   <span className="font-black text-blue-600 text-sm">$1,200.00</span>
                </div>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
           <button 
             onClick={prevStep}
             disabled={step === 1}
             className="px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all cursor-pointer"
           >
             <ChevronLeft size={18} />
             Back
           </button>
           <button 
             onClick={step === totalSteps ? handleFinalize : nextStep}
             className="px-8 py-3 bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-slate-900/10 transition-all cursor-pointer"
           >
             {step === totalSteps ? 'Finalize Enrollment' : 'Continue'}
             <ChevronRight size={18} />
           </button>
        </div>
      </motion.div>
      </>
     )}
    </div>
  );
}

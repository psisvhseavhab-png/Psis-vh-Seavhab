import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { Contact, Plus, Edit2, Trash2, Save, X, Search, Phone, Briefcase, Building, Mail, Filter, ChevronDown, CheckCircle2, Camera, Upload, FileText, Smartphone, Send, Shield, Clock, Loader2, Download } from 'lucide-react';
import { sendTelegramNotification, NOTIFICATION_TEMPLATES } from '../services/notificationService';
import { browserNotificationService } from '../services/browserNotificationService';
import { cn } from '@/src/lib/utils';
import { Employee, EmployeePosition, EmployeeDepartment } from '@/src/types';
import { employeeService } from '../services/employeeService';
import { orgService } from '../services/orgService';
import { uploadFile } from '../lib/firebase';

export function EmployeeMgnt() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<EmployeePosition[]>([]);
  const [departments, setDepartments] = useState<EmployeeDepartment[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'profile' | 'position' | 'department' | 'communication'>('profile');
  const [isAdding, setIsAdding] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubEmployees = employeeService.subscribeToEmployees(setEmployees);
    const unsubPositions = orgService.subscribeToPositions(setPositions);
    const unsubDepartments = orgService.subscribeToDepartments(setDepartments);

    // Initial load check
    Promise.all([
      employeeService.getEmployees(),
      orgService.getPositions(),
      orgService.getDepartments()
    ]).then(() => setLoading(false));

    return () => {
      unsubEmployees();
      unsubPositions();
      unsubDepartments();
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        if (isEdit && editingEmployee) {
          // Store the file to upload later on save
          (editingEmployee as any)._newPhotoFile = file;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resigned' | 'on leave'>('all');
  const [posFilter, setPosFilter] = useState('all');
  const [depFilter, setDepFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Employee; direction: 'asc' | 'desc' } | null>(null);

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    gender: 'Male',
    status: 'active'
  });

  const [orgForm, setOrgForm] = useState<{ id?: string, name: string } | null>(null);

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await employeeService.deleteEmployee(id);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleSaveOrgItem = async () => {
    if (!orgForm || !orgForm.name) return;
    setIsSaving(true);
    try {
      if (activeTab === 'position') {
        if (orgForm.id) {
          await orgService.updatePosition(orgForm.id, { name: orgForm.name });
        } else {
          await orgService.addPosition({ name: orgForm.name } as any);
        }
      } else {
        if (orgForm.id) {
          await orgService.updateDepartment(orgForm.id, { name: orgForm.name });
        } else {
          await orgService.addDepartment({ name: orgForm.name } as any);
        }
      }
      setOrgForm(null);
    } catch (error) {
      console.error("Org save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrgItem = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab}?`)) {
      try {
        if (activeTab === 'position') {
          await orgService.deletePosition(id);
        } else {
          await orgService.deleteDepartment(id);
        }
      } catch (error) {
        console.error("Org delete error:", error);
      }
    }
  };

  const handleSaveRegistration = async () => {
    if (!newEmployee.name || !newEmployee.positionId) {
      alert("Name and Position are required");
      return;
    }

    setIsSaving(true);
    try {
      let photoUrl = '';
      if (previewImage && (newEmployee as any)._newPhotoFile) {
        photoUrl = await uploadFile(`employees/${generatedCode}/photo.jpg`, (newEmployee as any)._newPhotoFile);
      }

      await employeeService.addEmployee({
        ...(newEmployee as Employee),
        employeeCode: generatedCode,
        photo: photoUrl,
        createdAt: new Date().toISOString()
      } as any);

      setIsAdding(false);
      setNewEmployee({ gender: 'Male', status: 'active' });
      setPreviewImage(null);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee || !editingEmployee.id) return;

    setIsSaving(true);
    try {
      let photoUrl = editingEmployee.photo || '';
      if ((editingEmployee as any)._newPhotoFile) {
        photoUrl = await uploadFile(`employees/${editingEmployee.employeeCode}/photo.jpg`, (editingEmployee as any)._newPhotoFile);
      }

      const { id, ...updateData } = editingEmployee;
      (updateData as any).photo = photoUrl;
      // Remove temporary file ref
      delete (updateData as any)._newPhotoFile;

      await employeeService.updateEmployee(id, updateData);
      setEditingEmployee(null);
      setPreviewImage(null);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSort = (key: keyof Employee) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const generateNextCode = () => {
    const codes = employees.map(e => {
      const match = e.employeeCode.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const nextNum = Math.max(0, ...codes) + 1;
    return `VH-EMP${String(nextNum).padStart(3, '0')}`;
  };

  const handleToggleAdd = () => {
    if (!isAdding) {
      setGeneratedCode(generateNextCode());
    }
    setIsAdding(!isAdding);
    setPreviewImage(null);
  };

  const csvInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const downloadEmployeeTemplate = () => {
    const templateData = [
      {
        employeeCode: 'VH-EMP000',
        name: 'Employee Name',
        gender: 'Male',
        dob: '1990-01-01',
        position: 'Teacher',
        department: 'Academic',
        contact: '+855 12 345 678',
        status: 'active',
        telegramChatId: ''
      }
    ];

    const csv = Papa.unparse(templateData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportEmployeesToCSV = () => {
    const csvData = employees.map(emp => ({
      employeeCode: emp.employeeCode,
      name: emp.name,
      gender: emp.gender,
      dob: emp.dob,
      position: positions.find(p => p.id === emp.positionId)?.name || '',
      department: departments.find(d => d.id === emp.departmentId)?.name || '',
      contact: emp.contact,
      status: emp.status,
      telegramChatId: emp.telegramChatId || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEmployeeCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          let count = 0;
          for (const row of results.data as any[]) {
            const employeeCode = row.employeeCode || row.EmployeeCode;
            const name = row.name || row.Name;
            if (!name) continue;

            // Find position and department IDs by name
            const positionName = row.position || row.Position;
            const depName = row.department || row.Department;
            
            const positionId = positions.find(p => p.name.toLowerCase() === positionName?.toLowerCase())?.id || positions[0]?.id;
            const departmentId = departments.find(d => d.name.toLowerCase() === depName?.toLowerCase())?.id || departments[0]?.id;

            const existing = employees.find(e => e.employeeCode === employeeCode);
            
            const employeeData = {
              employeeCode: employeeCode || generateNextCode(),
              name,
              gender: (row.gender || row.Gender || 'Male') as any,
              dob: row.dob || row.DOB || '',
              positionId,
              departmentId,
              contact: row.contact || row.Contact || '',
              status: (row.status || row.Status || 'active') as any,
              telegramChatId: row.telegramChatId || row.TelegramChatId || '',
              updatedAt: new Date().toISOString()
            };

            if (existing && existing.id) {
              await employeeService.updateEmployee(existing.id, employeeData);
            } else {
              await employeeService.addEmployee({
                ...employeeData,
                createdAt: new Date().toISOString()
              } as any);
            }
            count++;
          }
          alert(`Successfully processed ${count} employees.`);
        } catch (error) {
          console.error("Import error:", error);
          alert("Error importing employees.");
        } finally {
          setIsImporting(false);
          if (csvInputRef.current) csvInputRef.current.value = '';
        }
      }
    });
  };

  const filteredEmployees = employees
    .filter(emp => {
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      const matchesPos = posFilter === 'all' || emp.positionId === posFilter;
      const matchesDep = depFilter === 'all' || emp.departmentId === depFilter;
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesPos && matchesDep && matchesSearch;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map(e => e.id));
    }
  };

  const handleBulkStatusChange = (newStatus: 'active' | 'resigned' | 'on leave') => {
    setEmployees(prev => prev.map(emp => 
      selectedIds.includes(emp.id) ? { ...emp, status: newStatus } : emp
    ));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Human Resources</h1>
          <p className="text-slate-500">Manage staff profiles, organizational structure, and roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={csvInputRef} 
            className="hidden" 
            accept=".csv" 
            onChange={handleEmployeeCSVImport}
          />
          <div className="flex items-center gap-1">
            <button 
              onClick={exportEmployeesToCSV}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              title="Export to CSV"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={() => csvInputRef.current?.click()}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              title="Import from CSV"
              disabled={isImporting}
            >
              <Upload size={18} />
            </button>
            <button 
              onClick={downloadEmployeeTemplate}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              title="Download Import Template"
            >
              <FileText size={18} />
            </button>
          </div>
          <button 
            onClick={handleToggleAdd}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
              isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
            )}
          >
            {isAdding ? <X size={18} /> : <Plus size={18} />}
            {isAdding ? "Cancel" : "Add Staff"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'profile', label: 'Employee Profiles', icon: Contact },
          { id: 'position', label: 'Positions', icon: Briefcase },
          { id: 'department', label: 'Departments', icon: Building },
          { id: 'communication', label: 'Communication Hub', icon: Send },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {isAdding && activeTab === 'profile' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-6"
        >
          <div className="flex flex-col md:flex-row gap-8">
             <div className="flex flex-col items-center gap-4">
                <div 
                  className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 overflow-hidden relative group hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer"
                  onClick={() => document.getElementById('profile-upload')?.click()}
                >
                   {previewImage ? (
                     <img src={previewImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   ) : (
                     <>
                       <Camera size={32} />
                       <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">Upload Photo</span>
                     </>
                   )}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Upload size={20} />
                   </div>
                </div>
                <input 
                  id="profile-upload"
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleImageChange}
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">JPG, PNG up to 2MB</p>
             </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Employee ID (Auto)</label>
                   <input 
                     type="text" 
                     value={generatedCode} 
                     readOnly 
                     className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none font-mono font-bold text-slate-500 cursor-not-allowed" 
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Full Name (EN)*</label>
                   <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" 
                    value={newEmployee.name || ''}
                    onChange={e => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Gender</label>
                   <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={newEmployee.gender}
                    onChange={e => setNewEmployee(prev => ({ ...prev, gender: e.target.value as any }))}
                   >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Position*</label>
                   <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={newEmployee.positionId || ''}
                    onChange={e => setNewEmployee(prev => ({ ...prev, positionId: e.target.value }))}
                   >
                      <option value="">Select Position</option>
                      {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Department</label>
                   <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={newEmployee.departmentId || ''}
                    onChange={e => setNewEmployee(prev => ({ ...prev, departmentId: e.target.value }))}
                   >
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                   </select>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Contact Number*</label>
                   <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                    value={newEmployee.contact || ''}
                    onChange={e => setNewEmployee(prev => ({ ...prev, contact: e.target.value }))}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Telegram Chat ID</label>
                   <div className="relative">
                     <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                     <input 
                      type="text" 
                      placeholder="e.g. 1234567" 
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                      value={newEmployee.telegramChatId || ''}
                      onChange={e => setNewEmployee(prev => ({ ...prev, telegramChatId: e.target.value }))}
                     />
                   </div>
                </div>
                
                <div className="md:col-span-2 pt-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Academic Documents (Degrees, Certs)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button type="button" className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all group">
                        <Upload size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase">Attach Credentials</span>
                     </button>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl opacity-50 italic">
                        <FileText size={18} className="text-slate-400" />
                        <span className="text-xs text-slate-500">Supported: PDF, JPG up to 10MB</span>
                     </div>
                  </div>
                </div>
             </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-50">
             <button 
              onClick={handleSaveRegistration}
              disabled={isSaving}
              className="px-10 py-3 bg-[#0f172a] text-white rounded-xl font-bold shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800 flex items-center gap-2"
             >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                Complete Registration
             </button>
          </div>
        </motion.div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between bg-slate-50/30 gap-6">
             <div className="flex flex-wrap items-center gap-4 flex-1">
                <div className="relative w-full md:w-72">
                   <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Search staff..." 
                     className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select 
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                     <option value="all">All Status</option>
                     <option value="active">Active</option>
                     <option value="on leave">On Leave</option>
                     <option value="resigned">Resigned</option>
                  </select>
                   <select 
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={posFilter}
                    onChange={(e) => setPosFilter(e.target.value)}
                  >
                     <option value="all">All Positions</option>
                     {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select 
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={depFilter}
                    onChange={(e) => setDepFilter(e.target.value)}
                  >
                     <option value="all">All Departments</option>
                     {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
             </div>
             <div className="flex items-center gap-2 self-end xl:self-auto">
                {selectedIds.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-xl shadow-lg mr-2"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest border-r border-slate-700 pr-3 mr-1">{selectedIds.length} Selected</span>
                    <button 
                      onClick={() => handleBulkStatusChange('active')}
                      className="text-[10px] font-black uppercase hover:text-emerald-400 transition-colors"
                    >Activate</button>
                    <span className="text-slate-700">|</span>
                    <button 
                      onClick={() => handleBulkStatusChange('on leave')}
                      className="text-[10px] font-black uppercase hover:text-amber-400 transition-colors"
                    >Leave</button>
                    <span className="text-slate-700">|</span>
                    <button 
                      onClick={() => handleBulkStatusChange('resigned')}
                      className="text-[10px] font-black uppercase hover:text-red-400 transition-colors"
                    >Resign</button>
                  </motion.div>
                )}
                <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-xl transition-all shadow-sm">
                   <Filter size={20} />
                </button>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 w-10">
                     <input 
                       type="checkbox" 
                       className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" 
                       checked={selectedIds.length > 0 && selectedIds.length === filteredEmployees.length}
                       onChange={toggleSelectAll}
                     />
                  </th>
                  <th 
                    className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('employeeCode')}
                  >ID</th>
                  <th 
                    className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('name')}
                  >Name</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Position</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Department</th>
                  <th 
                    className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleSort('status')}
                  >Status</th>
                  <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className={cn(
                    "hover:bg-slate-50 transition-all group",
                    selectedIds.includes(emp.id) && "bg-blue-50/30"
                  )}>
                    <td className="px-8 py-5">
                       <input 
                         type="checkbox" 
                         className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20" 
                         checked={selectedIds.includes(emp.id)}
                         onChange={() => toggleSelect(emp.id)}
                       />
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-mono font-bold text-slate-400 tracking-tighter">{emp.employeeCode}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs overflow-hidden">
                             {emp.photo ? (
                               <img src={emp.photo} alt={emp.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                             ) : (
                               emp.name.split(' ').map(n => n[0]).join('')
                             )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{emp.name}</p>
                            <p className="text-[10px] text-slate-400 leading-none">{emp.gender}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-bold text-slate-600">{positions.find(p => p.id === emp.positionId)?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{departments.find(d => d.id === emp.departmentId)?.name || 'General'}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className={cn(
                         "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                         emp.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                         emp.status === 'on leave' ? "bg-amber-100 text-amber-700" :
                         "bg-red-100 text-red-700"
                       )}>
                         {emp.status}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {emp.telegramChatId && (
                            <button 
                              onClick={async () => {
                                await sendTelegramNotification(emp.telegramChatId!, `🔔 <b>Staff Alert</b>\n\nHello ${emp.name}, this is a priority system notification via the EduPulse HR portal.`);
                                browserNotificationService.sendNotification('Staff Alert Sent', {
                                  body: `Priority alert sent to ${emp.name} via Telegram.`,
                                });
                                alert("Telegram notification sent to staff!");
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Send Telegram Notification"
                            >
                               <Send size={16} />
                            </button>
                          )}
                          <button 
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            onClick={() => {
                              setEditingEmployee(emp);
                              setPreviewImage(emp.photo || null);
                            }}
                          >
                             <Edit2 size={16} />
                          </button>
                          <button 
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            onClick={() => handleDeleteEmployee(emp.id)}
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'communication' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic">Notification Composer</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Send verified alerts via Telegram</p>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Bot Connected
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Individual Recipient (Optional)</label>
                    <div className="relative">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        placeholder="Search student or parent name..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 italic text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Message Type (Template)</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 italic text-sm"
                      onChange={(e) => {
                        const val = e.target.value;
                        const textarea = document.getElementById('comms-message') as HTMLTextAreaElement;
                        if (textarea) {
                          if (val === 'meeting') textarea.value = NOTIFICATION_TEMPLATES.PARENT_MEETING('[Name]', '[Date]', '[Reason]');
                          if (val === 'warning') textarea.value = NOTIFICATION_TEMPLATES.STUDENT_WARNING('[Name]', '[Reason]');
                          if (val === 'unpaid') textarea.value = NOTIFICATION_TEMPLATES.UNPAID_FEES('[Name]', '[Amount]');
                          if (val === 'violation') textarea.value = NOTIFICATION_TEMPLATES.RULE_VIOLATION('[Name]', '[Violation]');
                          if (val === 'exam') textarea.value = NOTIFICATION_TEMPLATES.EXAM_SCHEDULE('[Subject]', '[Date]', '[Room]');
                        }
                      }}
                    >
                      <option value="custom">Custom Message (Manual)</option>
                      <option value="meeting">Parent Meeting Template</option>
                      <option value="warning">Student Warning Template</option>
                      <option value="unpaid">Unpaid Fees Notice</option>
                      <option value="violation">Rule Violation Notice</option>
                      <option value="exam">Exam Schedule Notice</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2 italic">Broadcast Content (HTML Enabled)</label>
                  <textarea 
                    id="comms-message"
                    rows={8}
                    placeholder="Type your message here or select a template above..."
                    className="w-full px-6 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 italic text-sm resize-none custom-scrollbar"
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl w-fit">
                    <Shield size={12} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Bypasses mute settings for emergency alerts</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">
                      JS
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-blue-600">
                    +420
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    const message = (document.getElementById('comms-message') as HTMLTextAreaElement).value;
                    if (!message) return alert("Please enter a message content.");
                    // In a real app, we would loop through selected profiles' chat IDs
                    // For demo, we'll suggest it went well
                    alert("Preparing to broadcast to 424 profiles. Please confirm in system logs.");
                  }}
                  className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest italic shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                  <Send size={18} />
                  Initiate Broadcast
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    <Clock size={24} className="text-blue-400" />
                 </div>
                 <div>
                    <h4 className="text-lg font-black uppercase italic tracking-tight">Scheduled Alerts</h4>
                    <p className="text-xs text-slate-400 font-medium">Automatic triggers based on academic calendar</p>
                 </div>
                 <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                       <span className="text-[10px] font-bold uppercase italic">Report Card Release</span>
                       <span className="text-[9px] font-black text-blue-400 uppercase">May 20, 2026</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 opacity-50">
                       <span className="text-[10px] font-bold uppercase italic">Monthly Attendance Summary</span>
                       <span className="text-[9px] font-black text-slate-500 uppercase">Done (May 1)</span>
                    </div>
                 </div>
              </div>
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-between">
                <div>
                   <h4 className="text-lg font-black uppercase italic tracking-tight mb-2">Director's Memo</h4>
                   <p className="text-xs text-indigo-100/70 font-medium leading-relaxed italic">
                     "All emergency notifications must be approved by the Head of Academic Affair before broadcasting to the entire student body."
                   </p>
                </div>
                <div className="flex items-center gap-3 mt-8">
                   <div className="w-8 h-8 rounded-full bg-white/20" />
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">Director Sopheak</p>
                      <p className="text-[8px] text-indigo-200/50 font-bold uppercase">System Overseer</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-400">Transmission History</h3>
               <div className="space-y-6">
                  {[
                    { target: 'G10-A Parents', type: 'Warning', status: 'delivered', time: '10m ago' },
                    { target: 'Staff Council', type: 'Meeting', status: 'reading', time: '1h ago' },
                    { target: 'Financial Dept', type: 'Alert', status: 'delivered', time: '3h ago' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4">
                       <div className={cn(
                         "w-1 h-8 rounded-full",
                         log.status === 'delivered' ? "bg-emerald-500" : "bg-amber-400"
                       )} />
                       <div className="flex-1">
                          <div className="flex items-center justify-between">
                             <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight">{log.target}</p>
                             <span className="text-[8px] font-bold text-slate-400 uppercase">{log.time}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 italic uppercase tracking-widest">{log.type} Message</p>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest italic text-slate-400 hover:text-blue-600 transition-colors border-t border-slate-50 pt-6">View Full Diagnostic Logs</button>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center space-y-4">
               <div className="p-4 bg-white rounded-3xl shadow-sm text-blue-600">
                  <Smartphone size={32} />
               </div>
               <div>
                 <h4 className="text-sm font-black uppercase italic tracking-tight text-slate-800">Telegram Bot Health</h4>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Uptime: 99.9% Optimal</p>
               </div>
               <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '99%' }} className="h-full bg-emerald-500" />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEmployee && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
                    <Edit2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 italic uppercase">Edit Staff Profile</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Employee: {editingEmployee.employeeCode}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setEditingEmployee(null);
                    setPreviewImage(null);
                  }}
                  className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex flex-col items-center gap-4 shrink-0">
                    <div 
                      className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 overflow-hidden relative group hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer"
                      onClick={() => document.getElementById('edit-profile-upload')?.click()}
                    >
                       {previewImage ? (
                         <img src={previewImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       ) : (
                         <>
                           <Camera size={40} />
                           <span className="text-xs font-black uppercase tracking-widest text-center px-4">Change Photo</span>
                         </>
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Upload size={24} />
                       </div>
                    </div>
                    <input 
                      id="edit-profile-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => handleImageChange(e, true)}
                    />
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">JPEG/PNG/WEBP</p>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Max 2MB</p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Full Name (English)</label>
                       <input 
                        type="text" 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700" 
                        value={editingEmployee.name}
                        onChange={e => setEditingEmployee(prev => prev ? { ...prev, name: e.target.value } : null)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 font-khmer">Full Name (Khmer)</label>
                       <input 
                        type="text" 
                        placeholder="ឧទាហរណ៍៖ សុខ ជា"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 font-khmer" 
                        value={editingEmployee.nameKh || ''}
                        onChange={e => setEditingEmployee(prev => prev ? { ...prev, nameKh: e.target.value } : null)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Gender</label>
                       <div className="flex gap-2">
                         {['Male', 'Female'].map(g => (
                           <button
                             key={g}
                             type="button"
                             onClick={() => setEditingEmployee(prev => prev ? { ...prev, gender: g as any } : null)}
                             className={cn(
                               "flex-1 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all",
                               editingEmployee.gender === g ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                             )}
                           >
                             {g}
                           </button>
                         ))}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Date of Birth</label>
                       <input 
                        type="date" 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700" 
                        value={editingEmployee.dob}
                        onChange={e => setEditingEmployee(prev => prev ? { ...prev, dob: e.target.value } : null)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Position</label>
                       <select 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                        value={editingEmployee.positionId}
                        onChange={e => setEditingEmployee(prev => prev ? { ...prev, positionId: e.target.value } : null)}
                       >
                          {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Department</label>
                       <select 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                        value={editingEmployee.departmentId}
                        onChange={e => setEditingEmployee(prev => prev ? { ...prev, departmentId: e.target.value } : null)}
                       >
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Contact Number</label>
                       <input 
                        type="text" 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700" 
                        value={editingEmployee.contact}
                        onChange={e => setEditingEmployee(prev => prev ? { ...prev, contact: e.target.value } : null)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Telegram Chat ID</label>
                       <div className="relative">
                         <input 
                          type="text" 
                          placeholder="e.g. 1526372"
                          className="w-full pl-6 pr-20 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700" 
                          value={editingEmployee.telegramChatId || ''}
                          onChange={e => setEditingEmployee(prev => prev ? { ...prev, telegramChatId: e.target.value } : null)}
                         />
                         <button 
                           type="button"
                           onClick={async () => {
                             if (!editingEmployee?.telegramChatId) return alert("Please enter a Chat ID first.");
                             await sendTelegramNotification(editingEmployee.telegramChatId, `🛠 <b>STAFF PORTAL TEST</b>\n\nHello ${editingEmployee.name},\nyour Telegram notifications are now active!`);
                             alert("Test message sent!");
                           }}
                           className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest italic"
                         >
                            Test
                         </button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => {
                    setEditingEmployee(null);
                    setPreviewImage(null);
                  }}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:text-slate-900 transition-all"
                >
                  Discard Changes
                </button>
                <button 
                  onClick={handleUpdateEmployee}
                  disabled={isSaving}
                  className="flex items-center gap-3 px-12 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Profile Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {(activeTab === 'position' || activeTab === 'department') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-slate-900 capitalize">Manage {activeTab}s</h3>
                 <button 
                  onClick={() => setOrgForm({ name: '' })}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    orgForm && !orgForm.id ? "bg-slate-200 text-slate-600" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  )}
                 >
                    {orgForm && !orgForm.id ? <X size={16} /> : <Plus size={16} />}
                 </button>
              </div>

              <AnimatePresence>
                {orgForm && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                       <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{orgForm.id ? 'Update' : 'Add New'} {activeTab}</p>
                       <div className="flex gap-2">
                         <input 
                          type="text" 
                          placeholder={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} name`}
                          className="flex-1 px-4 py-2 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
                          value={orgForm.name}
                          onChange={e => setOrgForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                         />
                         <button 
                          onClick={handleSaveOrgItem}
                          disabled={isSaving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                         >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {orgForm.id ? 'Update' : 'Add'}
                         </button>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                 {(activeTab === 'position' ? positions : departments).map(item => (
                   <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{item.name}</span>
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-1.5 text-slate-400 hover:text-blue-600"
                          onClick={() => setOrgForm({ id: item.id, name: item.name })}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="p-1.5 text-slate-400 hover:text-red-500"
                          onClick={() => handleDeleteOrgItem(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col justify-between">
              <div>
                <CheckCircle2 size={40} className="mb-4 text-white/40" />
                <h3 className="text-2xl font-black leading-tight">Define roles for better access control</h3>
                <p className="mt-2 text-blue-100 opacity-80 text-sm">Positions and Departments help in generating automated payroll and permission mapping.</p>
              </div>
              <div className="pt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest mt-auto">
                 <span>Learn More about RBAC</span>
                 <X size={12} className="-rotate-45" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

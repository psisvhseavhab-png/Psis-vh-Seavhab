import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Camera, 
  Shield, 
  UserCircle, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  ChevronDown, 
  Loader2, 
  Check, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SystemUser, Employee } from '@/src/types';
import { userService } from '@/src/services/userService';
import { employeeService } from '@/src/services/employeeService';
import { uploadFile } from '@/src/lib/firebase';

const standardRoles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'teacher', name: 'Teacher / Employee' },
  { id: 'student', name: 'Student' },
  { id: 'parent', name: 'Parent' },
];

export function UserProfileMgnt() {
  const [users, setUsers] = useState<(SystemUser & { password?: string })[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<SystemUser & { password?: string }> | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);

  // Filters and lookup state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive' | 'Pending'>('All');

  useEffect(() => {
    // Subscribe to both users and employees from Firestore
    const unsubUsers = userService.subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });

    const unsubEmp = employeeService.subscribeToEmployees((data) => {
      setEmployees(data);
    });

    return () => {
      unsubUsers();
      unsubEmp();
    };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectEmployee = (empId: string) => {
    const emp = employees.find(e => e.id === empId || e.employeeCode === empId);
    if (!emp) return;

    const parts = (emp.name || '').trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    const generatedUsername = (emp.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    setEditingUser(prev => ({
      ...prev,
      employeeId: empId,
      firstName,
      lastName,
      username: prev?.username || generatedUsername,
      email: prev?.email || `${generatedUsername}@psisvh.edu`,
    }));
  };

  const handleStartAdd = () => {
    setEditingUser({
      employeeId: '',
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      roleId: 'teacher',
      academicYearId: '2024-2025',
      dashboardLevel: 'Full',
      branchIds: ['Van Hong Campus'],
      campusIds: ['Campus East'],
      subProgramIds: ['English Foundation'],
      status: 'Active',
      password: ''
    });
    setPhotoPreview(null);
    setSelectedPhotoFile(null);
    setIsAdding(true);
  };

  const handleEdit = (user: SystemUser & { password?: string }) => {
    setEditingUser(user);
    setPhotoPreview(user.photo || null);
    setSelectedPhotoFile(null);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user profile?")) {
      try {
        await userService.deleteUser(id);
      } catch (err) {
        console.error("Delete user error:", err);
      }
    }
  };

  const handleSave = async () => {
    if (!editingUser) return;

    if (!editingUser.username || !editingUser.password) {
      alert("Please provide a valid Login Username and Password.");
      return;
    }

    setIsSaving(true);
    try {
      let photoUrl = editingUser.photo || '';
      
      if (selectedPhotoFile) {
        photoUrl = await uploadFile(`users/${editingUser.username}/avatar.jpg`, selectedPhotoFile);
      }

      const userData = {
        employeeId: editingUser.employeeId || '',
        firstName: editingUser.firstName || '',
        lastName: editingUser.lastName || '',
        username: editingUser.username,
        email: editingUser.email || `${editingUser.username}@psisvh.edu`,
        roleId: editingUser.roleId || 'teacher',
        academicYearId: editingUser.academicYearId || '2024-2025',
        dashboardLevel: editingUser.dashboardLevel || 'Full',
        branchIds: editingUser.branchIds || [],
        campusIds: editingUser.campusIds || [],
        subProgramIds: editingUser.subProgramIds || [],
        status: editingUser.status || 'Active',
        photo: photoUrl,
        password: editingUser.password
      };

      if (editingUser.id) {
        // Update user
        await userService.updateUser(editingUser.id, userData);
      } else {
        // Create new user manually
        await userService.addUser(userData);
      }

      setIsAdding(false);
      setEditingUser(null);
      setPhotoPreview(null);
      setSelectedPhotoFile(null);
    } catch (err) {
      console.error("Save user error:", err);
      alert("Error saving user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleArrayItem = (field: 'branchIds' | 'campusIds' | 'subProgramIds', item: string) => {
    if (!editingUser) return;
    const current = editingUser[field] || [];
    const updated = current.includes(item) 
      ? current.filter(x => x !== item)
      : [...current, item];
    
    setEditingUser(prev => prev ? { ...prev, [field]: updated } : null);
  };

  // Filtered list of users for display
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesKeyword = 
      fullName.includes(query) || 
      (user.username || '').toLowerCase().includes(query) ||
      (user.email || '').toLowerCase().includes(query);

    if (filterStatus === 'All') return matchesKeyword;
    return matchesKeyword && (user.status || 'Active').toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">User Catalog & Waitlist</h2>
          <p className="text-slate-500 font-medium">Configure roles, custom logins, and passwords for newly enrolled employees.</p>
        </div>
        <button 
          onClick={handleStartAdd}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/10 hover:bg-blue-700 transition-all font-black uppercase tracking-widest text-xs"
        >
          <UserPlus size={16} /> Register New User
        </button>
      </div>

      {/* Edit/Create overlay card */}
      <AnimatePresence>
        {isAdding && editingUser && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900">
                      {editingUser.id ? 'Configure Custom Login Credential' : 'New User Setup'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      {editingUser.status === 'Pending' ? '🔑 Active waitlisted profile with logins & password' : 'Enter profile data for the system user account'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setIsAdding(false); setEditingUser(null); }}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {editingUser.status === 'Pending' && (
                <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl flex items-start gap-3">
                  <Clock className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider mb-0.5">Pending Waitlisted User Profile</p>
                    <p className="text-xs text-amber-700">This user is draft pending. Please define their **Access Role (Designation)**, **Username Login**, **Password**, and switch their status to **Active** to authorize login access.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col xl:flex-row gap-12">
                {/* Main Form Fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Select Employee */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Employee Reference <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                        <User size={18} />
                      </div>
                      <select 
                        value={editingUser.employeeId || ''}
                        onChange={(e) => handleSelectEmployee(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold appearance-none text-slate-700"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeCode})</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                    <input 
                      type="text" 
                      value={editingUser.firstName || ''}
                      onChange={e => setEditingUser(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                      placeholder="e.g. Chan" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" 
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                    <input 
                      type="text" 
                      value={editingUser.lastName || ''}
                      onChange={e => setEditingUser(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                      placeholder="e.g. Dara" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" 
                    />
                  </div>

                  {/* Login Username */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                      Login Username <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={editingUser.username || ''}
                        onChange={e => setEditingUser(prev => prev ? { ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '') } : null)}
                        placeholder="e.g. chandara" 
                        className="w-full pl-12 pr-5 py-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-black text-blue-950" 
                      />
                    </div>
                  </div>

                  {/* Login Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                      Login Password <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input 
                        type="text" 
                        value={editingUser.password || ''}
                        onChange={e => setEditingUser(prev => prev ? { ...prev, password: e.target.value } : null)}
                        placeholder="Provide portal password" 
                        className="w-full pl-12 pr-5 py-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-black text-blue-950" 
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                        <Mail size={18} />
                      </div>
                      <input 
                        type="email" 
                        value={editingUser.email || ''}
                        onChange={e => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                        placeholder="e.g. chandara@psisvh.edu" 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" 
                      />
                    </div>
                  </div>

                  {/* Assign Role */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Active Role</label>
                    <div className="relative">
                      <select 
                        value={editingUser.roleId || 'teacher'}
                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, roleId: e.target.value } : null)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold appearance-none text-slate-700"
                      >
                        {standardRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* User Status */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Status</label>
                    <div className="relative">
                      <select 
                        value={editingUser.status || 'Active'}
                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold appearance-none text-slate-700"
                      >
                        <option value="Active">Active Profile (Authorized)</option>
                        <option value="Pending">Pending Setup (Waitlist)</option>
                        <option value="Inactive">Inactive Account (Locked)</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Academic Year */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year</label>
                    <div className="relative">
                      <select 
                        value={editingUser.academicYearId || '2024-2025'}
                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, academicYearId: e.target.value } : null)}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold appearance-none text-slate-700"
                      >
                        <option value="2023-2024">2023 - 2024</option>
                        <option value="2024-2025">2024 - 2025</option>
                        <option value="2025-2026">2025 - 2026</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Branch Access Checklist */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Access</label>
                    <div className="h-28 bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-y-auto space-y-2 custom-scrollbar">
                      {['Van Hong Campus', 'Sen Sok Campus', 'Campus West'].map(branch => (
                        <label key={branch} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={(editingUser.branchIds || []).includes(branch)}
                            onChange={() => handleToggleArrayItem('branchIds', branch)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" 
                          />
                          <span className="text-xs font-bold text-slate-600 group-hover:text-blue-500 transition-colors">{branch}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* School Campus Access */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Campus</label>
                    <div className="h-28 bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-y-auto space-y-2 custom-scrollbar">
                      {['Campus East', 'Campus West', 'Campus Central'].map(campus => (
                        <label key={campus} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={(editingUser.campusIds || []).includes(campus)}
                            onChange={() => handleToggleArrayItem('campusIds', campus)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" 
                          />
                          <span className="text-xs font-bold text-slate-600 group-hover:text-blue-500 transition-colors">{campus}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sub Program Access */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub Program Access</label>
                    <div className="h-28 bg-slate-50 border border-slate-200 rounded-2xl p-4 overflow-y-auto space-y-2 custom-scrollbar">
                      {['English Foundation', 'Chinese Program', 'ICT Foundation'].map(prog => (
                        <label key={prog} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={(editingUser.subProgramIds || []).includes(prog)}
                            onChange={() => handleToggleArrayItem('subProgramIds', prog)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" 
                          />
                          <span className="text-xs font-bold text-slate-600 group-hover:text-blue-500 transition-colors">{prog}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Profile Picture Column */}
                <div className="w-full xl:w-72 flex flex-col items-center gap-5 py-6 px-8 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 group hover:border-blue-400 transition-all">
                  <div className="relative">
                    <div className="w-44 h-44 rounded-[2rem] bg-white shadow-2xl shadow-slate-200 overflow-hidden flex items-center justify-center border-4 border-white">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
                            <Camera size={28} />
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-normal">Upload Avatar</p>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => document.getElementById('user-profile-photo-input')?.click()}
                      className="absolute -right-2 -bottom-2 w-11 h-11 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/25 flex items-center justify-center hover:bg-blue-700 transition-all border-4 border-white"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                  <input id="user-profile-photo-input" type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => document.getElementById('user-profile-photo-input')?.click()}
                      className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all w-full block"
                    >
                      Pick Snapshot
                    </button>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-2">JPG, PNG up to 2MB allowed</p>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingUser(null); }}
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                  Discard
                </button>
                <button 
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingUser.id ? 'Save Configuration' : 'Register Account'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Catalog View & Table Filters */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/50 p-4 rounded-3xl border border-slate-100">
          
          {/* Quick Tab Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Active', 'Pending', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all uppercase",
                  (filterStatus === status) 
                    ? "bg-slate-900 text-white shadow-md" 
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60"
                )}
              >
                {status === 'Pending' ? '⏱️ Waitlist (Pending)' : status}
              </button>
            ))}
          </div>

          {/* Keyword Search field */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search user profile..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 text-xs font-bold w-full lg:w-64 transition-all" 
            />
          </div>
        </div>

        {/* System User Records Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/10 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={36} />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Profiles...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>
              <div>
                <p className="text-base font-bold text-slate-700">No User Profiles Found</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">If you have newly added employees, check the **Waitlist** tab to assign their portal passwords.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-r border-slate-100 w-16">No</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">User Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Portal Credentials</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Authorization Level</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user, i) => {
                    const matchedEmp = employees.find(e => e.id === user.employeeId || e.employeeCode === user.employeeId);
                    const userRole = standardRoles.find(r => r.id === user.roleId)?.name || user.roleId;

                    return (
                      <tr key={user.id} className="group hover:bg-slate-50/40 transition-all">
                        
                        {/* Row Index */}
                        <td className="px-8 py-6 text-center text-xs font-black text-slate-400 border-r border-slate-100">
                          {i + 1}
                        </td>

                        {/* User Identity Details */}
                        <td className="px-8 py-6 border-r border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-slate-50 shadow-sm overflow-hidden flex items-center justify-center border-2 border-white shrink-0">
                              {user.photo ? (
                                <img src={user.photo} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="font-extrabold text-sm text-slate-400 uppercase">{user.firstName?.[0] || 'U'}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">
                                {user.firstName || 'User'} {user.lastName || ''}
                              </p>
                              {matchedEmp ? (
                                <p className="text-[9px] text-blue-600 bg-blue-50/60 font-black px-1.5 py-0.5 rounded border border-blue-100/50 uppercase tracking-wide inline-block">
                                  💼 Staff: {matchedEmp.name} ({matchedEmp.employeeCode})
                                </p>
                              ) : (
                                <p className="text-[9px] text-slate-400 font-mono tracking-wide">
                                  Non-Employee Account
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Username & Password Credentials */}
                        <td className="px-8 py-6 border-r border-slate-100">
                          <div className="space-y-1.5 font-mono text-[11px]">
                            <div className="flex items-center gap-1 text-slate-700">
                              <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wide w-12 block">Login:</span>
                              <span className="font-bold text-slate-900 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/50">{user.username}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-700">
                              <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wide w-12 block">PASS:</span>
                              <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100/50">{user.password || '••••••••'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Assign Role Permission Level */}
                        <td className="px-8 py-6 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide">
                            <Shield size={12} />
                            {userRole}
                          </div>
                        </td>

                        {/* User Access Authorization Status */}
                        <td className="px-8 py-6 text-center">
                          {user.status === 'Pending' ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wide">
                              ⏱️ Waitlist
                            </span>
                          ) : user.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wide">
                              🟢 Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wide">
                              🔴 Locked
                            </span>
                          )}
                        </td>

                        {/* Controls */}
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => handleEdit(user)}
                              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="Edit Credentials"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Delete Profile"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

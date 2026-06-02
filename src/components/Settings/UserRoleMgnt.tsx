import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, ShieldCheck, Search, Filter, Trash2, Edit2, Save, X, Plus, ChevronRight, Check, CheckCircle2, Layout, School, Users, GraduationCap, Contact, Bell, CreditCard, Tag, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AppRole } from '@/src/types';

const modules = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'school', label: 'School', icon: School },
  { id: 'student', label: 'Student', icon: Users },
  { id: 'employee', label: 'Employee', icon: Contact },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'attendance', label: 'Student Attendance', icon: GraduationCap },
  { id: 'finance', label: 'Finance Reports', icon: Bell },
  { id: 'profile', label: 'Profile Setting', icon: Users },
  { id: 'academic', label: 'Academic Reports', icon: Layout },
  { id: 'discount', label: 'Discounts Setup', icon: Tag },
  { id: 'scholarship', label: 'Students Scholarship', icon: GraduationCap },
];

const mockRoles: AppRole[] = [
  { id: '1', name: 'Accountant', modulePermissions: { 'student': true, 'payment': true, 'finance': true, 'profile': true, 'discount': true, 'scholarship': true }, createdBy: 'PSIS Admin' },
  { id: '2', name: 'Academic', modulePermissions: { 'student': true, 'attendance': true, 'academic': true }, createdBy: 'PSIS Admin' },
  { id: '3', name: 'Cashier', modulePermissions: { 'student': true, 'payment': true, 'finance': true, 'profile': true }, createdBy: 'PSIS Admin' },
  { id: '4', name: 'Management Reports', modulePermissions: { 'finance': true, 'profile': true, 'academic': true }, createdBy: 'PSIS Admin' },
];

export function UserRoleMgnt() {
  const [roleName, setRoleName] = useState('');
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({});
  const [roles, setRoles] = useState<AppRole[]>(mockRoles);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const toggleModule = (id: string) => {
    setSelectedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    if (!roleName) return;
    
    if (isEditing) {
      setRoles(roles.map(r => r.id === isEditing ? { ...r, name: roleName, modulePermissions: selectedModules } : r));
      setIsEditing(null);
    } else {
      const newRole: AppRole = {
        id: Math.random().toString(36).substr(2, 9),
        name: roleName,
        modulePermissions: selectedModules,
        createdBy: 'Heng Kunthea',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setRoles([newRole, ...roles]);
    }
    setRoleName('');
    setSelectedModules({});
  };

  const handleEdit = (role: AppRole) => {
      setRoleName(role.name);
      setSelectedModules(role.modulePermissions);
      setIsEditing(role.id);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Roles</h2>
          <p className="text-slate-500 font-medium">Define security roles and assign module-level access permissions.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[3rem] border border-blue-50 shadow-2xl shadow-blue-500/5"
      >
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Role Setup Form */}
          <div className="flex-1 space-y-10">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">Role Identity</h3>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Configuration for the system permission group</p>
               </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Role Designation Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500">
                    <Shield size={20} />
                  </div>
                  <input 
                    type="text" 
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Finance Administrator" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700" 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSave}
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Save size={18} /> {isEditing ? 'Update Permission' : 'Register Role'}
                </button>
                <button 
                  onClick={() => {
                      setIsEditing(null);
                      setRoleName('');
                      setSelectedModules({});
                  }}
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                >
                    Reset Form
                </button>
              </div>
            </div>
          </div>

          {/* Module Selection */}
          <div className="w-full lg:w-[450px] space-y-6">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Access Modules</h3>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                   {Object.values(selectedModules).filter(Boolean).length} Selected
                </span>
             </div>
             <div className="bg-slate-50/50 border border-slate-200 rounded-[2.5rem] p-6 space-y-1 custom-scrollbar max-h-[400px] overflow-y-auto">
                {modules.map((mod) => (
                  <label key={mod.id} className="flex items-center justify-between p-3.5 hover:bg-white rounded-xl cursor-pointer group transition-all border border-transparent hover:border-slate-100 hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                        selectedModules[mod.id] ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                      )}>
                        <mod.icon size={18} />
                      </div>
                      <span className={cn(
                        "text-sm font-bold transition-colors",
                        selectedModules[mod.id] ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                      )}>{mod.label}</span>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                      selectedModules[mod.id] ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-slate-400"
                    )}>
                      {selectedModules[mod.id] && <Check size={12} className="text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={!!selectedModules[mod.id]} onChange={() => toggleModule(mod.id)} />
                  </label>
                ))}
             </div>
          </div>
        </div>
      </motion.div>

      {/* Role List Table */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Role Catalog</h3>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" placeholder="Lookup permissions..." className="pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 text-xs font-bold w-64 transition-all" />
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-r border-slate-100 w-16">No</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Role Designation</th>
                        {modules.map(mod => (
                          <th key={mod.id} className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center whitespace-nowrap min-w-[80px]">
                            {mod.label}
                          </th>
                        ))}
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-100">Registrar</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Controls</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {roles.map((role, i) => (
                       <tr key={role.id} className="group hover:bg-blue-50/30 transition-all">
                          <td className="px-8 py-6 text-center text-xs font-black text-slate-400 border-r border-slate-100">{i + 1}</td>
                          <td className="px-8 py-6 border-r border-slate-100">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                   {role.name[0]}
                                </div>
                                <span className="text-sm font-black text-slate-700 tracking-tight">{role.name}</span>
                             </div>
                          </td>
                          {modules.map(mod => (
                            <td key={mod.id} className="px-4 py-6 text-center">
                               <div className={cn(
                                 "w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-all",
                                 role.modulePermissions[mod.id] ? "bg-emerald-100 text-emerald-600 scale-110 shadow-sm" : "bg-rose-50 text-rose-300 grayscale opacity-40 group-hover:opacity-100"
                               )}>
                                  {role.modulePermissions[mod.id] ? <CheckCircle2 size={14} /> : <X size={14} />}
                               </div>
                            </td>
                          ))}
                          <td className="px-8 py-6 border-l border-slate-100">
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-600">{role.createdBy}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{role.createdAt || '2024-05-07'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleEdit(role)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                   <Edit2 size={16} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
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
      </div>
    </div>
  );
}

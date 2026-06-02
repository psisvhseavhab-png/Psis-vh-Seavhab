import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Shield, Search, Filter, Trash2, Edit2, Save, X, Plus, ChevronRight, CheckCircle2, Layout, Settings, FileText, Download, Share2, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AppRole } from '@/src/types';

const mockRoles: AppRole[] = [
  { id: '1', name: 'Administrators', modulePermissions: {} },
  { id: '2', name: 'Super Admin', modulePermissions: {} },
  { id: '3', name: 'Accountant', modulePermissions: {} },
  { id: '4', name: 'Academic', modulePermissions: {} },
  { id: '5', name: 'Cashier', modulePermissions: {} },
];

const modulePages = [
  { 
    module: 'Settings', 
    pages: ['User Profile', 'User Role', 'Role Access', 'Page Management'] 
  },
  { 
    module: 'School Structure', 
    pages: ['Academic Year', 'Main Program', 'Sub Program', 'Room Setup', 'Grade Level'] 
  },
  { 
    module: 'Student Management', 
    pages: ['Family Profile', 'Student Profile', 'Student Enrollment', 'Attendance Tracking'] 
  },
  { 
    module: 'Finance', 
    pages: ['Tuition Payment', 'Invoicing', 'Expense Tracking', 'Financial Reports'] 
  }
];

export function RoleAccessMgnt() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [permissions, setPermissions] = useState<Record<string, { view: boolean, create: boolean, edit: boolean, delete: boolean }>>({});

  const togglePermission = (page: string, action: 'view' | 'create' | 'edit' | 'delete') => {
    setPermissions(prev => ({
      ...prev,
      [page]: {
        ...(prev[page] || { view: false, create: false, edit: false, delete: false }),
        [action]: !prev[page]?.[action]
      }
    }));
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Access Control</h2>
          <p className="text-slate-500 font-medium">Fine-tune granular permissions for each module and system page.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all">
              <Download size={16} /> Export All
           </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/10 space-y-10"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-8 pb-10 border-b border-slate-50">
           <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Target System Role</label>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500">
                    <Shield size={20} />
                 </div>
                 <select 
                   value={selectedRoleId}
                   onChange={(e) => setSelectedRoleId(e.target.value)}
                   className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
                 >
                    <option value="">Select Role to Configure Permissions</option>
                    {mockRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                 </select>
              </div>
           </div>
           {selectedRoleId && (
              <div className="flex gap-3">
                 <button className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Save size={18} /> Sync Permissions
                 </button>
                 <button className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">
                    Reset
                 </button>
              </div>
           )}
        </div>

        {selectedRoleId ? (
           <div className="space-y-12">
              {modulePages.map((group) => (
                 <div key={group.module} className="space-y-6">
                    <div className="flex items-center gap-4">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest whitespace-nowrap">{group.module}</h3>
                       <div className="h-px w-full bg-slate-100" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       {group.pages.map(page => (
                          <div key={page} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6 group hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                             <div className="flex items-start justify-between">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-blue-500 group-hover:shadow-blue-100 transition-all">
                                   <FileText size={20} />
                                </div>
                                <span className={cn(
                                   "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                                   (permissions[page]?.view || permissions[page]?.edit) ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                                )}>
                                   {(permissions[page]?.view || permissions[page]?.edit) ? 'Active' : 'Locked'}
                                </span>
                             </div>
                             
                             <div className="space-y-1">
                                <h4 className="text-sm font-black text-slate-700 tracking-tight">{page}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Modify individual capabilities</p>
                             </div>

                             <div className="grid grid-cols-2 gap-2 pt-2">
                                {(['view', 'create', 'edit', 'delete'] as const).map(action => (
                                   <button 
                                     key={action}
                                     onClick={() => togglePermission(page, action)}
                                     className={cn(
                                       "flex items-center justify-between px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all",
                                       permissions[page]?.[action] 
                                         ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                                         : "bg-white border border-slate-100 text-slate-400 hover:border-slate-300"
                                     )}
                                   >
                                      {action}
                                      {permissions[page]?.[action] ? <Unlock size={10} /> : <Lock size={10} />}
                                   </button>
                                ))}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <div className="py-20 text-center space-y-6 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                 <Key size={48} className="text-slate-300" />
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                 <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Select a Role Profile</h4>
                 <p className="text-xs text-slate-500 font-medium font-bold leading-relaxed">Choose one of the defined system roles from the dropdown above to initialize the permission matrix configuration.</p>
              </div>
           </div>
        )}
      </motion.div>
    </div>
  );
}

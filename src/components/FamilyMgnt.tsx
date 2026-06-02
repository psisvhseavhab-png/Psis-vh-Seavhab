import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Edit2, Trash2, Save, X, Search, Phone, Home, Mail, FileText, ChevronRight, Filter, Smartphone, Send } from 'lucide-react';
import { sendTelegramNotification, NOTIFICATION_TEMPLATES } from '../services/notificationService';
import { cn } from '@/src/lib/utils';
import { Family } from '@/src/types';

const mockFamilies: Family[] = [
  { id: '1', familyCode: 'VH-F001215', fatherName: 'Sovanna', motherName: 'Sokha', contact: '+855 12 345 678' },
  { id: '2', familyCode: 'VH-F001214', fatherName: 'Chan Dara', motherName: 'Lim Leakhena', contact: '+855 98 765 432' },
];

interface FamilyMgntProps {
  studentId?: string | null;
}

export function FamilyMgnt({ studentId }: FamilyMgntProps) {
  const [families, setFamilies] = useState<Family[]>(() => {
    const stored = localStorage.getItem('edu_local_families');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('edu_local_families', JSON.stringify(mockFamilies));
    return mockFamilies;
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);

  const [newFamilyForm, setNewFamilyForm] = useState({
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    contact: '',
    telegramChatId: ''
  });

  const handleUpdateFamily = (updatedFamily: Family) => {
    const updated = families.map(f => f.id === updatedFamily.id ? updatedFamily : f);
    setFamilies(updated);
    localStorage.setItem('edu_local_families', JSON.stringify(updated));
    setEditingFamily(null);
  };

  const handleAddFamilyEx = () => {
    const family: Family = {
      id: Math.random().toString(36).substr(2, 9),
      familyCode: `VH-F${Math.floor(100000 + Math.random() * 900000)}`,
      fatherName: newFamilyForm.fatherName,
      fatherOccupation: newFamilyForm.fatherOccupation,
      motherName: newFamilyForm.motherName,
      motherOccupation: newFamilyForm.motherOccupation,
      contact: newFamilyForm.contact,
      telegramChatId: newFamilyForm.telegramChatId,
    };
    const updated = [family, ...families];
    setFamilies(updated);
    localStorage.setItem('edu_local_families', JSON.stringify(updated));
    setNewFamilyForm({
      fatherName: '',
      fatherOccupation: '',
      motherName: '',
      motherOccupation: '',
      contact: '',
      telegramChatId: ''
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Family Profiles</h1>
          <p className="text-slate-500">Consolidated records for parents and guardians linked to students.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Add Family"}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                 Father's Information
               </h3>
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Full Name (EN)*</label>
                    <input 
                      type="text" 
                      value={newFamilyForm.fatherName}
                      onChange={e => setNewFamilyForm(prev => ({ ...prev, fatherName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Occupation</label>
                    <input 
                      type="text" 
                      value={newFamilyForm.fatherOccupation}
                      onChange={e => setNewFamilyForm(prev => ({ ...prev, fatherOccupation: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                 Mother's Information
               </h3>
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Full Name (EN)*</label>
                    <input 
                      type="text" 
                      value={newFamilyForm.motherName}
                      onChange={e => setNewFamilyForm(prev => ({ ...prev, motherName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Occupation</label>
                    <input 
                      type="text" 
                      value={newFamilyForm.motherOccupation}
                      onChange={e => setNewFamilyForm(prev => ({ ...prev, motherOccupation: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Contact Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="+855..." 
                      value={newFamilyForm.contact}
                      onChange={e => setNewFamilyForm(prev => ({ ...prev, contact: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Telegram Chat ID (Parents)</label>
                  <div className="relative">
                    <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. 98765432" 
                      value={newFamilyForm.telegramChatId}
                      onChange={e => setNewFamilyForm(prev => ({ ...prev, telegramChatId: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                    />
                  </div>
                </div>
             </div>
             <button 
               onClick={handleAddFamilyEx}
               className="px-10 py-3 bg-[#0f172a] text-white rounded-xl font-bold shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2"
             >
               Save Family Record
               <ChevronRight size={18} />
             </button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
           <div className="relative w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by name or family code..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
           </div>
           <button className="p-2.5 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 text-slate-500">
             <Filter size={20} />
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Family Code</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Father Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Mother Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Students</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {families.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-5">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                      {f.familyCode}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">F</div>
                       <span className="text-sm font-semibold text-slate-700">{f.fatherName || '-'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">M</div>
                       <span className="text-sm font-semibold text-slate-700">{f.motherName || '-'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <button className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                        <Users size={14} />
                        View 2 Students
                     </button>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       {(f as any).telegramChatId && (
                         <button 
                            onClick={async () => {
                              const msg = NOTIFICATION_TEMPLATES.PARENT_MEETING(`${f.fatherName} & ${f.motherName}`, "2026-06-15 at 10:00 AM", "Student Academic Progress Review");
                              await sendTelegramNotification((f as any).telegramChatId, msg);
                              alert("Meeting invitation sent to parents!");
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Send Telegram Notification"
                          >
                           <Send size={16} />
                         </button>
                       )}
                       <button 
                         onClick={() => setEditingFamily(f)}
                         className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                       >
                           <Edit2 size={16} />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                          <FileText size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {editingFamily && (
          <EditFamilyModal 
            family={editingFamily} 
            onClose={() => setEditingFamily(null)} 
            onSave={handleUpdateFamily} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EditFamilyModal({ family, onClose, onSave }: { family: Family, onClose: () => void, onSave: (f: Family) => void }) {
  const [formData, setFormData] = useState<Family>({ ...family });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
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
              <h2 className="text-2xl font-black text-slate-900 italic uppercase">Edit Family Record</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Code: {family.familyCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                 Father's Information
               </h3>
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.fatherName || ''}
                      onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Occupation</label>
                    <input 
                      type="text" 
                      value={formData.fatherOccupation || ''}
                      onChange={e => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-bold text-purple-600 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
                 Mother's Information
               </h3>
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.motherName || ''}
                      onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Occupation</label>
                    <input 
                      type="text" 
                      value={formData.motherOccupation || ''}
                      onChange={e => setFormData({ ...formData, motherOccupation: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Contact Number</label>
            <div className="relative">
              <Phone size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={formData.contact || ''}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" 
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all">Cancel</button>
          <button 
            onClick={() => onSave(formData)}
            className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

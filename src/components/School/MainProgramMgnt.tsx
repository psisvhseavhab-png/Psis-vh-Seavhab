import React, { useState } from 'react';
import { motion } from 'motion/react';
import { List, Plus, Edit2, Trash2, Save, X, Search, Code, Layout } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { MainProgram } from '@/src/types';

export function MainProgramMgnt() {
  const [programs, setPrograms] = useState<MainProgram[]>([
    { id: '1', name: 'Full-Day Program (EN)', code: 'FD-EN', description: 'English medium full day program' },
    { id: '2', name: 'Part-Time Program', code: 'PT', description: 'Selective afternoon sessions' },
    { id: '3', name: 'Chinese Program', code: 'CH', description: 'Mandarin language focus' },
    { id: '4', name: 'Full-Day Program (KH)', code: 'FD-KH', description: 'Khmer national curriculum' },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Main Programs</h1>
          <p className="text-slate-500">Define primary curricula and educational pathways.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Create Program"}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm shadow-blue-500/5"
        >
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Layout size={18} className="text-blue-500" />
            Create Mian Program
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Program Code*</label>
                <div className="relative">
                  <Code size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="e.g. FD-EN" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Program Name*</label>
                <input type="text" placeholder="e.g. Full-Day Program (EN)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
              <textarea rows={3} placeholder="Enter program overview..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="flex justify-end">
               <button className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Save Program</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h3 className="font-bold text-slate-900">List Main Program</h3>
           <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Filter programs..." className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">No.</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Main Program</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Code</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Description</th>
                <th className="px-8 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programs.map((program, i) => (
                <tr key={program.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 text-xs font-bold text-slate-400">{i + 1}</td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold text-slate-800">{program.name}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{program.code}</span>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-xs text-slate-500 line-clamp-1">{program.description || '-'}</p>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-center gap-2">
                       <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit2 size={16} />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
  );
}

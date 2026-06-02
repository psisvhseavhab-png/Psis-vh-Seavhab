import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Plus, Edit2, Trash2, Save, X, Search, Globe, ChevronRight, Filter } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SubProgram } from '@/src/types';

export function SubProgramMgnt() {
  const [subPrograms, setSubPrograms] = useState<SubProgram[]>([
    { id: '1', mainProgramId: '1', name: 'Nursery', code: 'NUR', language: 'Khmer' },
    { id: '2', mainProgramId: '1', name: 'Kindergarten', code: 'KG', language: 'English' },
    { id: '3', mainProgramId: '4', name: 'Primary School', code: 'PS', language: 'Khmer' },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sub Programs</h1>
          <p className="text-slate-500">Manage levels and specializations within main educational programs.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Create Sub-Program"}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm shadow-blue-500/5 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-blue-500" />
              Program Hierarchy
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Program*</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  <option>Full-Day Program (EN)</option>
                  <option>Part-Time Program</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sub Program Name*</label>
                <input type="text" placeholder="e.g. Nursery" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sub Program Code*</label>
                <input type="text" placeholder="e.g. NUR" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Globe size={18} className="text-blue-500" />
              Settings & Language
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Program Language</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                  <option>English</option>
                  <option>Khmer</option>
                  <option>Mandarin</option>
                </select>
              </div>
              <div className="space-y-3 pt-2">
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300" />
                   <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Include Weekend (Sat)</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300" />
                   <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Short Course Program</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300" />
                   <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Input By Subject</span>
                 </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
             <button className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Save Sub-Program</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
             <h3 className="font-bold text-slate-900 text-sm">Sub-Program Directory</h3>
             <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200">
                  <Filter size={14} className="text-slate-500" />
                </button>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Name</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Code</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Language</th>
                  <th className="px-6 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subPrograms.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium capitalize">
                        <Globe size={12} className="text-slate-400" />
                        {p.language}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                         <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit2 size={14} />
                         </button>
                         <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={14} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0f172a] text-white p-6 rounded-2xl shadow-xl shadow-slate-900/10">
             <h4 className="font-bold mb-4 flex items-center gap-2">
               <Layers size={18} className="text-blue-400" />
               Hierarchy View
             </h4>
             <div className="space-y-4">
                {['Full-Day Program (EN)', 'Part-Time Program'].map((main, i) => (
                  <div key={main} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest italic mb-2">
                       <ChevronRight size={14} />
                       {main}
                    </div>
                    <div className="pl-6 space-y-2">
                       {subPrograms.filter(sub => i === 0).map(sub => (
                         <div key={sub.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 flex items-center justify-between">
                            {sub.name}
                            <span className="text-[10px] text-slate-500 uppercase">{sub.code}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

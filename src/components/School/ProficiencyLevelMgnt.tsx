import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Plus, Edit2, Trash2, Save, X, Search, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function ProficiencyLevelMgnt() {
  const [levels, setLevels] = useState([
    { id: '1', mainProgram: 'Full-Day Program (EN)', subProgram: 'Nursery', name: 'Beginner', code: 'BEG' },
    { id: '2', mainProgram: 'Full-Day Program (EN)', subProgram: 'KG', name: 'Intermediate', code: 'INT' },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proficiency Levels</h1>
          <p className="text-slate-500">Define academic milestones and skill tiers for programs.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Add Level"}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm shadow-blue-500/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Program*</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option>Full-Day Program (EN)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sub Program*</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option>Nursery</option>
                <option>Kindergarten</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Proficiency Level*</label>
              <input type="text" placeholder="e.g. Level 1" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>
          <div className="flex justify-end mt-6">
             <button className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Save Level</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                 <Activity size={20} />
              </div>
              <h3 className="font-bold text-slate-900">Program Proficiency Tiers</h3>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Program</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Sub Program</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Proficiency Level</th>
                <th className="px-8 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {levels.map((lvl) => (
                <tr key={lvl.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{lvl.mainProgram}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-semibold text-slate-700">{lvl.subProgram}</span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-bold text-blue-600">{lvl.name}</span>
                       <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">{lvl.code}</span>
                    </div>
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

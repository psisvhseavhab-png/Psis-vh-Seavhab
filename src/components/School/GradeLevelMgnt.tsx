import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Plus, Edit2, Trash2, Save, X, Search, ChevronRight, Type } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GradeLevel } from '@/src/types';

export function GradeLevelMgnt() {
  const [levels, setLevels] = useState<GradeLevel[]>([
    { id: '248', subProgramId: '1', name: 'Nursery 1-2 Years', nameKh: 'ថ្នាក់បំបៅ កុមារអាយុ ១-២ ឆ្នាំ', code: 'NUR-1' },
    { id: '252', subProgramId: '2', name: 'Kindergarten K1', nameKh: 'ថ្នាក់មត្តេយ្យ កម្រិត ១', code: 'KG-K1' },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Grade / Levels</h1>
          <p className="text-slate-500">Manage specific grade denominations and labels.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Add Grade Level"}
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sub Program*</label>
              <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                <option>Nursery</option>
                <option>Kindergarten</option>
              </select>
            </div>
            <div className="space-y-1 text-right">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Level Code</label>
               <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-2 rounded-lg inline-block border border-slate-200">AUTO-GEN-2026-VAL</span>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1">Grade Name (EN)*</label>
              <input type="text" placeholder="e.g. Grade 10" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1">Grade Name (KH)</label>
              <input type="text" placeholder="ថ្នាក់ទី ១០" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>
          <div className="flex justify-end mt-8 pt-6 border-t border-slate-50">
             <button className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Save Grade Level</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Configured Grades</h3>
            <div className="relative w-72">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Search grades..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level Code</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Grade (EN)</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Grade (KH)</th>
                <th className="px-8 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {levels.map((lvl) => (
                <tr key={lvl.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4 font-mono text-xs text-slate-400">{lvl.code}</td>
                  <td className="px-8 py-4">
                    <span className="text-sm font-bold text-slate-800">{lvl.name}</span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-sm text-slate-600 font-medium">{lvl.nameKh || '-'}</span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

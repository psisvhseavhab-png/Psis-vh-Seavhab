import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Award, Plus, Edit2, Trash2, Save, X, Search, User, Percent, Calendar } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function ScholarshipMgnt() {
  const [scholarships, setScholarships] = useState([
    { id: '1', studentId: 'VH000138', name: 'Choeng Vongtharith', percent: 25, type: 'Academic Excellence', duration: 'Full Year' },
    { id: '2', studentId: 'VH000983', name: 'Pheng Puthikpunleu', percent: 50, type: 'Merit Based', duration: 'Term' },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Scholarships</h1>
          <p className="text-slate-500">Manage tuition fee reductions and special academic incentives.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Assign Scholarship"}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
           <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Student</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by name or ID..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Fee Discount (%)</label>
            <div className="relative">
              <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="number" placeholder="50" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Duration</label>
            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
              <option>Full Year</option>
              <option>One Term</option>
              <option>Custom Date</option>
            </select>
          </div>
          <div className="lg:col-span-4 flex justify-end gap-3 pt-4 border-t border-slate-50">
             <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Assign Now</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-yellow-500" />
              Active Scholarships
           </h3>
           <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by student..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32">Discount</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Valid Until</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scholarships.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">{s.name.charAt(0)}</div>
                       <div>
                          <p className="text-sm font-bold text-slate-700">{s.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{s.studentId}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black ring-1 ring-emerald-100">
                      -{s.percent}%
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded italic">"{s.type}"</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                       <Calendar size={12} className="text-slate-400" />
                       {s.duration}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-1">
                       <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                          <Edit2 size={16} />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-red-600 transition-all">
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

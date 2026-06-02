import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AcademicYear } from '@/src/types';

export function AcademicYearMgnt() {
  const [years, setYears] = useState<AcademicYear[]>([
    { 
      id: '26', 
      year: '2026-2027', 
      startDate: '2026-09-01', 
      endDate: '2027-08-31',
      terms: [
        { id: 't1', name: 'Semester 1', startDate: '2026-09-01', endDate: '2027-01-31' },
        { id: 't2', name: 'Semester 2', startDate: '2027-02-01', endDate: '2027-08-31' }
      ]
    },
    { id: '25', year: '2025-2026', startDate: '2025-09-01', endDate: '2026-09-01' },
    { id: '24', year: '2024-2025', startDate: '2024-09-02', endDate: '2025-06-30' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [expandedYear, setExpandedYear] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Years</h1>
          <p className="text-slate-500">Configure and manage school terms and academic cycles.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Create New"}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm shadow-blue-500/5"
        >
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            Setup New School Year
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">School Year Label</label>
              <input type="text" placeholder="e.g. 2027-2028" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">From Date</label>
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">To Date</label>
              <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>
          
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Academic Semesters / Terms</h4>
              <button className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 tracking-wider hover:bg-blue-50 px-2 py-1 rounded-lg transition-all">
                <Plus size={12} /> Add Term
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Term 1</span>
                    <button className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                 </div>
                 <input type="text" placeholder="Semester Name" defaultValue="Semester 1" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/10" />
                 <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] outline-none" />
                    <input type="date" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] outline-none" />
                 </div>
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center text-slate-400 text-xs italic">
                 Define additional semesters for this year
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-50">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
               <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
               Copy existing data structure
            </label>
            <div className="flex-1"></div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Save Year</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h3 className="font-bold text-slate-900">Current Academic Years</h3>
           <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search years..." className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">No.</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">School Year</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Start Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">End Date</th>
                <th className="px-8 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {years.map((year, i) => (
                <React.Fragment key={year.id}>
                  <tr className={cn(
                    "hover:bg-slate-50 transition-all group",
                    expandedYear === year.id && "bg-blue-50/30"
                  )}>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{i + 1}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-700">{year.year}</span>
                        {year.terms && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase">
                            {year.terms.length} Terms
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-slate-600 font-medium">{year.startDate}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-slate-600 font-medium">{year.endDate}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setExpandedYear(expandedYear === year.id ? null : year.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            expandedYear === year.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          )}
                        >
                          Terms
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                           <Edit2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                           <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedYear === year.id && (
                    <tr className="bg-blue-50/20 border-b border-blue-50">
                      <td colSpan={5} className="px-20 py-8">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-6"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em] flex items-center gap-2">
                              System Semesters Configuration
                              <div className="h-px w-24 bg-blue-100" />
                            </h4>
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                              <Plus size={12} /> New Term
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {year.terms ? year.terms.map((term) => (
                              <div key={term.id} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm relative group/term overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/term:opacity-100 transition-opacity">
                                  <button className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                                </div>
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <Calendar size={18} />
                                  </div>
                                  <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Term Name</p>
                                      <span className="text-sm font-bold text-slate-700">{term.name}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commences</p>
                                        <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                          {term.startDate}
                                        </p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terminates</p>
                                        <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                          {term.endDate}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )) : (
                              <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                <Calendar size={32} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-slate-400 text-sm font-medium">No terms defined for this academic year.</p>
                                <button className="mt-4 text-blue-600 text-xs font-bold hover:underline">Setup Semesters Now</button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

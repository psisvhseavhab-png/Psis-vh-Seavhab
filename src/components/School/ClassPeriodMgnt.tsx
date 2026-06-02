import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Plus, Edit2, Trash2, Save, X, Search, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ClassPeriod } from '@/src/types';

export function ClassPeriodMgnt() {
  const [periods, setPeriods] = useState<ClassPeriod[]>([
    { id: '1', name: 'Period 1', startTime: '07:30', endTime: '08:30', schoolLevelId: 'Primary' },
    { id: '2', name: 'Period 2', startTime: '08:30', endTime: '09:30', schoolLevelId: 'Primary' },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Periods</h1>
          <p className="text-slate-500">Define the daily timetable structure and time slots.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Add Period"}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Period Label*</label>
            <input type="text" placeholder="e.g. Period 1" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Start Time*</label>
            <input type="time" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">End Time*</label>
            <input type="time" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <div className="flex items-end">
             <button className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all w-full">Save Period</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-500" />
              Tmetable Configuration
           </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Name</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Start Time</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">End Time</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periods.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-8 py-4 font-bold text-slate-700">{p.name}</td>
                  <td className="px-8 py-4 text-sm font-medium text-slate-600">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">{p.startTime}</span>
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg">{p.endTime}</span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-center gap-2">
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

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserX, TrendingUp, Bell, Search, Filter, ShieldAlert, CheckCircle2, ChevronRight, UserMinus } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type StatusType = 'promotion' | 'dropout' | 'suspended';

export function StudentStatusMgnt({ type }: { type: StatusType }) {
  const [students, setStudents] = useState([
    { id: 'VH001420', name: 'Sovann Pich', class: 'G10-A', status: 'active' },
    { id: 'VH001419', name: 'Arya Stark', class: 'G10-A', status: 'active' },
  ]);

  const config = {
    promotion: {
      title: 'Student Promotion',
      desc: 'Upgrade students to the next academic level or grade.',
      icon: TrendingUp,
      color: 'blue',
      btn: 'Promote Selected'
    },
    dropout: {
      title: 'Student Dropouts',
      desc: 'Manage students who are leaving the institution permanently.',
      icon: UserMinus,
      color: 'red',
      btn: 'Mark as Dropout'
    },
    suspended: {
      title: 'Disciplinary Suspension',
      desc: 'Temporarily restrict access for students due to disciplinary reasons.',
      icon: Bell,
      color: 'orange',
      btn: 'Suspend Student'
    }
  }[type];

  const Icon = config.icon;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
          <p className="text-slate-500">{config.desc}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
           <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                 <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" placeholder="Search by name or ID..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none">
                 <option>All Classes</option>
                 <option>G10-A</option>
                 <option>G12-B</option>
              </select>
           </div>
           <button className={cn(
             "px-8 py-2.5 text-white rounded-xl font-bold shadow-lg transition-all",
             type === 'promotion' ? "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700" :
             type === 'dropout' ? "bg-red-600 shadow-red-600/20 hover:bg-red-700" :
             "bg-orange-600 shadow-orange-600/20 hover:bg-orange-700"
           )}>
             {config.btn}
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 w-10">
                   <input type="checkbox" className="rounded-md border-slate-300" />
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Info</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Current Class</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Effective Date</th>
                {type === 'promotion' && <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Target Grade</th>}
                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {students.map((s) => (
                 <tr key={s.id} className="hover:bg-slate-50 transition-all">
                    <td className="px-8 py-5">
                       <input type="checkbox" className="rounded-md border-slate-300" />
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-bold text-slate-700">{s.name}</p>
                       <p className="text-[10px] font-mono text-slate-400">{s.id}</p>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{s.class}</span>
                    </td>
                    <td className="px-8 py-5">
                       <input type="date" className="text-xs border-none bg-transparent font-medium text-slate-500" defaultValue="2026-05-01" />
                    </td>
                    {type === 'promotion' && (
                      <td className="px-8 py-5">
                         <select className="text-xs font-bold text-blue-600 bg-blue-50 border-none rounded-lg px-2 py-1">
                            <option>Grade 11</option>
                            <option>Grade 12</option>
                         </select>
                      </td>
                    )}
                    <td className="px-8 py-5 text-center">
                       <button className="text-xs font-bold text-slate-400 hover:text-blue-600">History</button>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>

        <div className="p-12 text-center border-t border-slate-50 bg-slate-50/20">
           <div className={cn(
             "w-20 h-20 rounded-[32px] mx-auto flex items-center justify-center mb-6",
             type === 'promotion' ? "bg-blue-50 text-blue-600" :
             type === 'dropout' ? "bg-red-50 text-red-600" :
             "bg-orange-50 text-orange-600"
           )}>
              <Icon size={40} />
           </div>
           <h3 className="text-xl font-bold text-slate-900">Batch Processing</h3>
           <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">EduPulse allows you to apply status changes to multiple students simultaneously. Ensure all documentation is uploaded to the student file before finalization.</p>
        </div>
      </div>
    </div>
  );
}

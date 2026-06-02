import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Award, TrendingUp, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

const TOP_ATTENDANCE = [
  { rank: 1, name: 'Penh Sreynak', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', color: 'bg-yellow-400' },
  { rank: 2, name: 'Neth Dalin', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', color: 'bg-slate-300' },
  { rank: 3, name: 'Dy Narem', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', color: 'bg-orange-400' },
];

const LIST_USERS = [
  { id: '1', name: 'Mean Choeurn Sreyroth', role: 'Daycare', rating: 5, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', date: '4' },
  { id: '2', name: 'Azenith Penaredondo', role: 'Coordinator of the Kindergarten', rating: 5, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', date: '5' },
  { id: '3', name: 'Khorn Sina', role: 'Nanny', rating: 5, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', date: '6' },
];

export function Attendance() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="px-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-black text-slate-900">Top Attendance</h2>
        </div>

        <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-100 w-fit">
          <button 
            onClick={() => setPeriod('week')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              period === 'week' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Last Week
          </button>
          <button 
            onClick={() => setPeriod('month')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              period === 'month' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:text-slate-900"
            )}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Podium Section */}
      <div className="mt-8 px-6 pb-12 relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 rounded-[2.5rem] shadow-xl shadow-blue-200 mx-6">
        <div className="flex items-end justify-center gap-4 sm:gap-8 mt-24 relative z-10 max-w-lg mx-auto">
          {/* 2nd place */}
          <div className="flex flex-col items-center gap-3 w-full max-w-[120px]">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-300 shadow-lg p-0.5 bg-white">
                <img src={TOP_ATTENDANCE[1].photo} className="w-full h-full rounded-full object-cover" alt="" />
              </div>
              <div className="absolute -bottom-2 -right-1">
                <AwardBadge rank={2} color="bg-slate-300" />
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white truncate w-full text-center">{TOP_ATTENDANCE[1].name}</span>
            <div className="w-full h-24 bg-slate-100/20 backdrop-blur-md rounded-t-2xl flex items-center justify-center border-t border-x border-white/30">
              <span className="text-2xl font-black text-white/50">2nd</span>
            </div>
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center gap-3 -mt-12 w-full max-w-[140px]">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 shadow-xl p-0.5 bg-white scale-110">
                <img src={TOP_ATTENDANCE[0].photo} className="w-full h-full rounded-full object-cover" alt="" />
              </div>
              <div className="absolute -bottom-3 -right-2">
                <AwardBadge rank={1} color="bg-yellow-400" />
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white truncate w-full text-center">{TOP_ATTENDANCE[0].name}</span>
            <div className="w-full h-36 bg-yellow-400 rounded-t-2xl flex items-center justify-center border-t border-x border-yellow-300 shadow-2xl">
              <span className="text-4xl font-black text-white">1st</span>
            </div>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center gap-3 w-full max-w-[120px]">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-400 shadow-lg p-0.5 bg-white">
                <img src={TOP_ATTENDANCE[2].photo} className="w-full h-full rounded-full object-cover" alt="" />
              </div>
              <div className="absolute -bottom-2 -right-1">
                <AwardBadge rank={3} color="bg-orange-400" />
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white truncate w-full text-center">{TOP_ATTENDANCE[2].name}</span>
            <div className="w-full h-20 bg-orange-100/20 backdrop-blur-md rounded-t-2xl flex items-center justify-center border-t border-x border-white/30">
              <span className="text-2xl font-black text-white/50">3rd</span>
            </div>
          </div>
        </div>

        {/* Decorative rays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:48px_48px] opacity-10" />
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full space-y-4">
        <div className="flex justify-between items-center px-1">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">History Activity</p>
          <div className="flex items-center gap-1 text-green-500 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">
            <TrendingUp className="w-3 h-3" />
            +12% growth
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {LIST_USERS.map((user) => (
            <div 
              key={user.id}
              className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-8 text-center font-black text-lg text-slate-900 border-r border-slate-100 pr-2">{user.date}</div>
              <div className="relative">
                <img 
                  src={user.photo} 
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-50 transition-transform group-hover:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate">{user.name}</h4>
                <p className="text-xs text-slate-500 truncate">{user.role}</p>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-3 h-3", i < 4 ? "fill-yellow-400 text-yellow-400" : "text-slate-200")} />
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-slate-900">100%</div>
                <div className="text-[10px] text-slate-400">Attendance</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AwardBadge({ rank, color }: { rank: number, color: string }) {
  return (
    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-md border-2 border-white", color)}>
      {rank}
    </div>
  );
}

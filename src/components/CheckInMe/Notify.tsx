import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cake, PartyPopper, ChevronRight, X, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';

type NotificationType = 'ALL' | 'LEAVE' | 'OVERTIME' | 'BIRTHDAY' | 'ANNIVERSARY';

const NOTIFICATIONS = [
  {
    id: '1',
    date: '06 May 2026',
    items: [
      { id: '1-1', type: 'ANNIVERSARY', title: "Phath Thol's Work Anniversary Today", subtitle: "Let's say congratulation to them", time: '08:43 AM' },
      { id: '1-2', type: 'BIRTHDAY', title: "Nay Nary: birthday today", subtitle: "🎂🎂🎂 Let's say happy birthday now", time: '08:23 AM' },
      { id: '1-3', type: 'BIRTHDAY', title: "So Leakhena: birthday today", subtitle: "🎂🎂🎂 Let's say happy birthday now", time: '08:23 AM' },
      { id: '1-4', type: 'BIRTHDAY', title: "Lorn Phun: birthday today", subtitle: "🎂🎂🎂 Let's say happy birthday now", time: '08:23 AM' },
    ]
  },
  {
    id: '2',
    date: '05 May 2026',
    items: [
      { id: '2-1', type: 'ANNIVERSARY', title: "Chea Phany's Work Anniversary Today", subtitle: "Let's say congratulation to them", time: '08:43 AM' },
    ]
  }
];

export function Notify() {
  const [activeFilter, setActiveFilter] = useState<NotificationType>('ALL');
  const [showWishModal, setShowWishModal] = useState<{ open: boolean, name: string, type: 'BIRTHDAY' | 'ANNIVERSARY' }>({ open: false, name: '', type: 'BIRTHDAY' });

  const filters: NotificationType[] = ['ALL', 'LEAVE', 'OVERTIME', 'BIRTHDAY', 'ANNIVERSARY'];

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
      {/* Horizontal Filters */}
      <div className="flex gap-2 overflow-x-auto px-6 py-4 no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all border",
              activeFilter === filter 
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="px-6 pb-24 space-y-8">
        {NOTIFICATIONS.map((group) => {
          const filteredItems = group.items.filter(item => activeFilter === 'ALL' || item.type === activeFilter);
          if (filteredItems.length === 0) return null;

          return (
            <div key={group.id} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-sm font-black text-slate-900">{group.date}</span>
                <button className="text-[10px] font-bold text-blue-600 hover:underline">Read all</button>
              </div>

              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    onClick={() => setShowWishModal({ open: true, name: item.title.split(':')[0], type: item.type as any })}
                    className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className={cn(
                      "p-3 rounded-2xl flex-shrink-0 group-hover:scale-110 transition-transform",
                      item.type === 'BIRTHDAY' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                    )}>
                      {item.type === 'BIRTHDAY' ? <Cake className="w-6 h-6" /> : <PartyPopper className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-black text-slate-900 leading-tight">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.subtitle}</p>
                      <span className="text-[10px] font-bold text-slate-400 mt-2 block">{group.date} | {item.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Wish Modal */}
      <AnimatePresence>
        {showWishModal.open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowWishModal(prev => ({ ...prev, open: false }))}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              <div className="mt-4 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  {showWishModal.type === 'BIRTHDAY' ? <Cake className="w-10 h-10" /> : <PartyPopper className="w-10 h-10" />}
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Send a Wish to {showWishModal.name}
                  </h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium">
                    {showWishModal.type === 'BIRTHDAY' 
                      ? "Make their birthday special with a kind message!" 
                      : "Celebrate their journey with the company!"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                    <Heart className="w-5 h-5 fill-current" />
                    Send {showWishModal.type === 'BIRTHDAY' ? 'Happy Birthday' : 'Congratulations'}
                  </button>
                  <button className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-colors">
                    Custom Message
                  </button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

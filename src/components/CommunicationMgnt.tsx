import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Plus, Edit2, Trash2, X, Search, Bell, Clock, User, Globe, Send } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Announcement } from '@/src/types';
import { browserNotificationService } from '../services/browserNotificationService';

export function CommunicationMgnt() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: '1', title: 'School Reopening Date', content: 'School will reopen on June 1st for the next academic year.', authorId: 'Admin', createdAt: '2026-05-01' },
    { id: '2', title: 'Parent-Teacher Meeting', content: 'Meeting scheduled for all Primary parents this Saturday.', authorId: 'Principal', createdAt: '2026-05-05' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', target: 'All Users', content: '' });

  const handleBroadcast = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert("Please fill in both title and content!");
      return;
    }

    const ad: Announcement = {
      id: String(Date.now()),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      authorId: 'Admin',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAnnouncements([ad, ...announcements]);
    setIsAdding(false);

    // Trigger browser notification
    browserNotificationService.sendNotification(ad.title, {
      body: ad.content,
      tag: 'school-announcement'
    });

    alert("Announcement broadcasted and browser notification sent!");
    setNewAnnouncement({ title: '', target: 'All Users', content: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Communication Center</h1>
          <p className="text-slate-500">Broadcast announcements and messages to the school community.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Megaphone size={18} />}
          {isAdding ? "Cancel" : "Post Announcement"}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Subject Line*</label>
                <input 
                  type="text" 
                  placeholder="Announcement Title" 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" 
                  value={newAnnouncement.title}
                  onChange={e => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Target Audience</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={newAnnouncement.target}
                  onChange={e => setNewAnnouncement(prev => ({ ...prev, target: e.target.value }))}
                >
                   <option>All Users</option>
                   <option>Teachers Only</option>
                   <option>Parents Only</option>
                   <option>Students Only</option>
                </select>
             </div>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Content*</label>
             <textarea 
               rows={4} 
               placeholder="Write your message here..." 
               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
               value={newAnnouncement.content}
               onChange={e => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
             ></textarea>
          </div>
          <div className="flex justify-end gap-3">
             <button 
               onClick={handleBroadcast}
               className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
             >
               <Send size={18} /> Broadcast Now
             </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
         {announcements.map((a) => (
           <motion.div 
             key={a.id}
             whileHover={{ y: -2 }}
             className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-6 group"
           >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                 <Bell size={24} />
              </div>
              <div className="flex-1 space-y-2">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">{a.title}</h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                       <span className="flex items-center gap-1"><Clock size={14} /> {a.createdAt}</span>
                       <span className="flex items-center gap-1"><User size={14} /> {a.authorId}</span>
                    </div>
                 </div>
                 <p className="text-slate-600 leading-relaxed text-sm">{a.content}</p>
                 <div className="pt-4 flex items-center gap-6">
                    <button className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline flex items-center gap-1">
                       <Globe size={12} /> View Public Link
                    </button>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                       <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                       <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                 </div>
              </div>
           </motion.div>
         ))}
      </div>
    </div>
  );
}

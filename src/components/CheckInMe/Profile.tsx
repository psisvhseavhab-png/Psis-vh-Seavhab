import React from 'react';
import { motion } from 'motion/react';
import { Settings, Camera, CreditCard, Sparkles, ChevronRight, Languages, Video, UserCog, AlarmClock, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Profile() {
  const profileData = {
    name: 'Heng Seavhab',
    role: 'Academic Affair',
    company: 'Paññāsāstra Internation...',
    birthday: '28 April',
    joinDate: '02 February 2026',
    workingPeriod: '3 months 5 days',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200'
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="px-6 space-y-6">
        {/* Header with Settings Icon */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">ProfileMe</h2>
          <button className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
            <Settings className="w-6 h-6 text-slate-900" />
          </button>
        </div>

        {/* Profile Card */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative group overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-purple-400">
                <img 
                  src={profileData.photo} 
                  alt={profileData.name}
                  className="w-full h-full rounded-full object-cover ring-4 ring-white"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 transition-all">
                <Camera className="w-4 h-4 text-blue-600" />
              </button>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-slate-900">{profileData.name}</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5 truncate uppercase tracking-widest">{profileData.role} | {profileData.company}</p>
              
              <div className="flex gap-0.5 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Sparkles key={i} className="w-3 h-3 text-slate-200" />
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-blue-100 flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
                  <Sparkles className="w-3 h-3 fill-white" />
                  AI Profile Studio
                </button>
                <button className="flex-1 py-2 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors">
                  <CreditCard className="w-3 h-3" />
                  ID CARD
                </button>
              </div>
            </div>
          </div>

          <ChevronRight className="absolute top-1/2 -translate-y-1/2 right-6 w-6 h-6 text-slate-300 pointer-events-none" />
        </section>

        {/* Employment Info */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h4 className="font-black text-sm text-slate-900 border-b border-slate-50 pb-3">Employment Info</h4>
          <div className="space-y-3">
            <InfoItem label="Birthday" value={profileData.birthday} />
            <InfoItem label="Join Date" value={profileData.joinDate} />
            <InfoItem label="Working Period" value={profileData.workingPeriod} />
          </div>
        </section>

        {/* Menu Items */}
        <section className="space-y-3">
          <h4 className="px-1 text-slate-400 text-[11px] font-black uppercase tracking-widest">Invite friends</h4>
          <MenuLink label="Referral Program ($)" showCrown />
          
          <h4 className="px-1 pt-4 text-slate-400 text-[11px] font-black uppercase tracking-widest">General</h4>
          <MenuLink label="Feedback to My Company" />
          <MenuLink label="Update App?" />
          <MenuLink label="Pricing" />
        </section>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-4 gap-4 pb-12">
          <ActionButton icon={Languages} label="English" color="text-red-500" />
          <ActionButton icon={Video} label="VDO" color="text-blue-500" />
          <ActionButton icon={UserCog} label="Go Admin" color="text-blue-600" />
          <ActionButton icon={AlarmClock} label="Check-in Alarm" color="text-blue-500" />
        </section>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-32 text-slate-400 text-xs font-bold">{label}</span>
      <span className="text-slate-400 text-xs font-bold">:</span>
      <span className="text-slate-900 text-xs font-black">{value}</span>
    </div>
  );
}

function MenuLink({ label, showCrown }: { label: string, showCrown?: boolean }) {
  return (
    <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all group">
      <span className="font-black text-sm text-slate-900">{label}</span>
      <div className="flex items-center gap-2">
        {showCrown && <Sparkles className="w-4 h-4 text-slate-200" />}
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
      </div>
    </button>
  );
}

function ActionButton({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <button className="flex flex-col items-center gap-2">
      <div className={cn("p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:scale-110 transition-transform", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[9px] font-black text-slate-900 text-center leading-tight whitespace-nowrap">{label}</span>
    </button>
  );
}

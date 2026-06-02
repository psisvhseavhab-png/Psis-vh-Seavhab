import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Tag, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Calendar,
  DollarSign,
  UserPlus
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AuxiliaryServiceAssignment } from '@/src/types';
import { TransportTrackingDriverMap } from './TransportTrackingDriverMap';

const mockStudents = [
  { id: 'ST001', name: 'John Smith', class: 'Grade 10-A' },
  { id: 'ST002', name: 'Emily Davis', class: 'Grade 8-B' },
  { id: 'ST003', name: 'Michael Chen', class: 'Grade 12-C' },
];

const mockServices = [
  { id: '1', name: 'Full-Day Daycare', category: 'Daycare', price: 400 },
  { id: '2', name: 'Standard Meal Plan', category: 'Food', price: 150 },
  { id: '3', name: 'Premium Car Delivery', category: 'Transport', price: 600 },
];

export function AuxiliaryMgnt({ type }: { type: 'daycare' | 'food' | 'transport' }) {
  const [activeTab, setActiveTab ] = useState<'roster' | 'tracking'>('tracking'); // default to tracking for visual prominence on click
  const [assignments, setAssignments] = useState<AuxiliaryServiceAssignment[]>([
    { id: '1', studentId: 'ST001', serviceId: '1', startDate: '2026-05-01', status: 'active' },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const config = {
    daycare: { title: 'Daycare Management', icon: Home, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    food: { title: 'Food & Nutrition', icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    transport: { title: 'Car Delivery & transport', icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  }[type];

  const filteredAssignments = assignments.filter(a => {
    const student = mockStudents.find(s => s.id === a.studentId);
    return student?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn("p-4 rounded-[2rem] shadow-sm", config.bg, config.color)}>
            <config.icon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">{config.title}</h1>
            <p className="text-slate-500 font-bold text-sm tracking-tight">{type === 'transport' ? 'Manage driver route schedules, live tracking, and school delivery logistics.' : 'Manage enrollments and logistics for auxiliary services.'}</p>
          </div>
        </div>
        
        {(type !== 'transport' || activeTab === 'roster') && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
          >
            <UserPlus size={18} />
            Assign Service
          </button>
        )}
      </div>

      {/* Sub tabs for Transport Management Mode */}
      {type === 'transport' && (
        <div className="flex bg-slate-100 p-1 rounded-2xl max-w-md border border-slate-200">
          <button 
            onClick={() => setActiveTab('tracking')}
            className={cn(
              "flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
              activeTab === 'tracking' ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            🚍 Live Driver Tracking Map
          </button>
          <button 
            onClick={() => setActiveTab('roster')}
            className={cn(
              "flex-1 py-3 text-center rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
              activeTab === 'roster' ? "bg-white text-slate-750 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            📋 Service Enrollments
          </button>
        </div>
      )}

      {type === 'transport' && activeTab === 'tracking' ? (
        <TransportTrackingDriverMap />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
              <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..." 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" 
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
              <table className="w-full text-left border-collapse font-bold">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Student</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Service Details</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-center">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssignments.map((a) => {
                    const student = mockStudents.find(s => s.id === a.studentId);
                    const service = mockServices.find(s => s.id === a.serviceId);
                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-300 shadow-sm uppercase">
                              {student?.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 tracking-tight">{student?.name}</h4>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student?.class}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-black text-slate-700">{service?.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar size={12} className="text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Since {a.startDate}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm",
                              a.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                            )}>
                              {a.status === 'active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                              {a.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                                <Trash2 size={18} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 mt-12 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <DollarSign size={120} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-2">Revenue Impact</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">Total recurring monthly revenue from {config.title.toLowerCase()}.</p>
              <div className="text-4xl font-black text-white mb-8 tracking-tighter italic">
                $4,250.00
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500">Active Enrollments</span>
                  <span className="text-white">128</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[65%] h-full bg-blue-500 rounded-full" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group">
              <h4 className="font-black text-slate-900 uppercase italic mb-4 flex items-center justify-between">
                Popular Plans
                <Tag size={16} className="text-blue-500" />
              </h4>
              <div className="space-y-3">
                {mockServices.map(service => (
                  <div key={service.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-white group-hover:border-blue-100 transition-all">
                    <p className="text-xs font-black text-slate-900 truncate">{service.name}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">${service.price} / month</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-2xl font-black uppercase italic text-slate-900">Assign New Service</h2>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Student*</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600 appearance-none">
                    <option value="">Choose a student...</option>
                    {mockStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Plan*</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600 appearance-none">
                    <option value="">Choose a service plan...</option>
                    {mockServices.map(s => <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date*</label>
                      <input type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Period</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600 appearance-none">
                        <option>Monthly</option>
                        <option>Quarterly</option>
                        <option>Semi-Annual</option>
                        <option>Annual</option>
                      </select>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                  Create Assignment
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

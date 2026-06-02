import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Home, Plus, Edit2, Trash2, Save, X, Search, Users, MapPin, Layout } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Room } from '@/src/types';

export function RoomMgnt() {
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'R101', floor: '1st Floor', capacity: 30, type: 'Classroom' },
    { id: '2', name: 'L201', floor: '2nd Floor', capacity: 25, type: 'Lab' },
    { id: '3', name: 'R102', floor: '1st Floor', capacity: 30, type: 'Classroom' },
    { id: '4', name: 'AUD-A', floor: 'Ground Floor', capacity: 150, type: 'Auditorium' },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Room Management</h1>
          <p className="text-slate-500">Inventory and capacity planning for physical school facilities.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? "Cancel" : "Add Room"}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl border border-blue-100 shadow-xl shadow-blue-500/5"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
             <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Home size={24} />
             </div>
             <div>
                <h3 className="font-bold text-slate-900 text-lg">Create New Room</h3>
                <p className="text-slate-400 text-sm">Fill in details to add a new space to the inventory.</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Room Name / Number*</label>
              <input type="text" placeholder="e.g. R305" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Floor*</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                 <option>Ground Floor</option>
                 <option>1st Floor</option>
                 <option>2nd Floor</option>
                 <option>3rd Floor</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Room Type</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                 <option>Classroom</option>
                 <option>Laboratory</option>
                 <option>Auditorium</option>
                 <option>Office</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Capacity (Students)</label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="number" placeholder="e.g. 30" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>
            <div className="lg:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Room Size / Dimensions</label>
              <input type="text" placeholder="e.g. 8m x 6m" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>

          <div className="mt-8 space-y-4">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Room Assets</h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Student Desk', 'Student Chair', 'Whiteboard', 'Projector'].map(asset => (
                   <label key={asset} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300" />
                      <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900">{asset}</span>
                   </label>
                ))}
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100">
             <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Save Facility</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <motion.div 
            key={room.id}
            layout
            className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[100px] -mr-12 -mt-12 group-hover:bg-blue-50 transition-colors"></div>
            
            <div className="flex items-start justify-between mb-4 relative z-10">
               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Layout size={20} />
               </div>
               <div className="flex items-center gap-1">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
               </div>
            </div>

            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900">{room.name}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase tracking-tighter">{room.type}</span>
               </div>
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin size={14} className="text-slate-400" />
                    {room.floor}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Users size={14} className="text-slate-400" />
                    Capacity: <span className="font-bold text-slate-700">{room.capacity}</span>
                  </div>
               </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
               <span>Active Inventory</span>
               <div className="flex -space-x-1">
                  {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200"></div>)}
                  <div className="w-5 h-5 rounded-full border-2 border-white bg-blue-500 text-white flex items-center justify-center text-[8px]">+4</div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

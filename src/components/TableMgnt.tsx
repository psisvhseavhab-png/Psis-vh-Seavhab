import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, X, Search, List, Layers, Users } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function TableMgnt({ type }: { type: 'floor' | 'group' }) {
  const [items, setItems] = useState(
    type === 'floor' 
      ? [ { id: '1', name: 'Floor 1', code: 'F1' }, { id: '2', name: 'Floor 2', code: 'F2' } ]
      : [ { id: '1', name: 'Morning Group', code: 'GRP-M' }, { id: '2', name: 'Afternoon Group', code: 'GRP-A' } ]
  );

  const [isAdding, setIsAdding] = useState(false);
  const config = {
    floor: { title: 'Building Floors', icon: Layers, label: 'Floor' },
    group: { title: 'Academic Groups', icon: Users, label: 'Group' }
  }[type];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
          <p className="text-slate-500">Manage {type} definitions for school organization.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          Add {config.label}
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-end gap-4"
        >
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{config.label} Name</label>
            <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <div className="w-40 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Code</label>
            <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Save</button>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Name</th>
              <th className="px-8 py-4">Code</th>
              <th className="px-8 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-all">
                <td className="px-8 py-4 font-bold text-slate-700">{item.name}</td>
                <td className="px-8 py-4 font-mono text-sm text-slate-500">{item.code}</td>
                <td className="px-8 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Edit2 size={16} /></button>
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

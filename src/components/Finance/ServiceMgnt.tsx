import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, Plus, Edit2, Trash2, X, Tag, Settings, CreditCard, AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ServiceCategory } from '@/src/types';

interface CatalogService {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  currency: string;
  utilizationRate: number;
  totalSlots: number;
  reservedSlots: number;
}

export function ServiceMgnt() {
  const [categories] = useState<ServiceCategory[]>([
    { id: '1', name: 'Tuition Fees' },
    { id: '2', name: 'Transport' },
    { id: '3', name: 'Uniforms & Assets' },
    { id: '4', name: 'Daycare' },
    { id: '5', name: 'Meal Plans' },
    { id: '6', name: 'Car Delivery (VIP)' },
  ]);

  const [services, setServices] = useState<CatalogService[]>([
    { id: '1', categoryId: '1', name: 'Annual Tuition G10', price: 2500, currency: 'USD', utilizationRate: 85, totalSlots: 150, reservedSlots: 128 },
    { id: '2', categoryId: '2', name: 'School Bus (Zone 1)', price: 450, currency: 'USD', utilizationRate: 92, totalSlots: 50, reservedSlots: 46 }, // Over 90%!
    { id: '3', categoryId: '4', name: 'Half-Day Daycare Admission', price: 200, currency: 'USD', utilizationRate: 95, totalSlots: 40, reservedSlots: 38 }, // Over 90%!
    { id: '4', categoryId: '5', name: 'Healthy Lunch (Monthly)', price: 150, currency: 'USD', utilizationRate: 70, totalSlots: 200, reservedSlots: 140 },
    { id: '5', categoryId: '6', name: 'Private Car Delivery Program', price: 600, currency: 'USD', utilizationRate: 40, totalSlots: 15, reservedSlots: 6 },
    { id: '6', categoryId: '3', name: 'Premium Uniforms & Athletics Kit', price: 80, currency: 'USD', utilizationRate: 98, totalSlots: 100, reservedSlots: 98 } // Over 90%!
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState('1');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newUtil, setNewUtil] = useState('50');

  const handleCreate = () => {
    if (!newName || !newPrice) return;
    const priceNum = parseFloat(newPrice);
    const utilNum = Math.min(100, Math.max(0, parseInt(newUtil) || 0));
    const totalSlots = 100;
    const reservedSlots = Math.round((totalSlots * utilNum) / 100);

    const newEntry: CatalogService = {
      id: String(services.length + 1),
      categoryId: newCat,
      name: newName,
      price: priceNum,
      currency: 'USD',
      utilizationRate: utilNum,
      totalSlots,
      reservedSlots
    };

    setServices(prev => [...prev, newEntry]);
    setNewName('');
    setNewPrice('');
    setIsAdding(false);
  };

  const highUtilizationAlerts = services.filter(s => s.utilizationRate >= 90);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service & Fee Catalog</h1>
          <p className="text-slate-500 text-xs">Define billable items, tuition rates, and campus inventory resources.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg transition-all font-medium text-xs uppercase tracking-wider",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
          )}
        >
          {isAdding ? <X size={14} /> : <Plus size={14} />}
          Add Item
        </button>
      </div>

      {/* Inventory Notification System - utilization critical alert panel */}
      {highUtilizationAlerts.length > 0 && (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-500 text-white p-1 rounded-lg">
              <ShieldAlert size={16} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-red-800 tracking-wider">Critical Resource & Inventory Alerts (&gt;90% Capacity)</h3>
              <p className="text-[10.5px] text-red-600 mt-0.5">The following premium programs or campus products have reached high-utilization stages. Immediate attention suggested.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {highUtilizationAlerts.map(item => (
              <div key={item.id} className="bg-white border border-red-100 p-3 rounded-xl flex flex-col justify-between shadow-xs relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-full w-1 bg-red-500" />
                <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">{categories.find(c => c.id === item.categoryId)?.name || 'General Inventory'}</span>
                <span className="text-xs font-black text-slate-800 mt-1 truncate">{item.name}</span>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-500">Utilization: <span className="text-red-600 font-black">{item.utilizationRate}%</span></span>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{item.reservedSlots}/{item.totalSlots} slots</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4"
        >
           <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Category*</label>
              <select 
                value={newCat} 
                onChange={e => setNewCat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
           <div className="space-y-1 md:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Service/Uniform Name*</label>
              <input 
                type="text" 
                placeholder="e.g. Monthly Tuition G12" 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
           </div>
           <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Amount (USD)*</label>
              <div className="relative">
                 <DollarSign size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="number" 
                   value={newPrice}
                   onChange={e => setNewPrice(e.target.value)}
                   className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20" 
                 />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Allocation/Utilization Rate (%)</label>
              <input 
                type="number" 
                value={newUtil}
                onChange={e => setNewUtil(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
           </div>
           <div className="md:col-start-4 flex items-end">
              <button 
                onClick={handleCreate}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider w-full shadow-xs cursor-pointer"
              >
                Create Entry
              </button>
           </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[9.5px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/60">
                     <tr>
                        <th className="px-6 py-3.5">Service / Product Item</th>
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5">Utilization Bar</th>
                        <th className="px-6 py-3.5">Rate</th>
                        <th className="px-6 py-3.5 text-center">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {services.map((s) => {
                       const isHighUtil = s.utilizationRate >= 90;
                       return (
                         <tr 
                           key={s.id} 
                           className={cn(
                             "transition-all",
                             isHighUtil ? "bg-red-50/10 hover:bg-red-50/20" : "hover:bg-slate-50"
                           )}
                         >
                            <td className="px-6 py-4 font-bold text-slate-700 text-xs">
                              <div className="flex flex-col gap-0.5">
                                <span className="flex items-center gap-1.5">
                                  {s.name}
                                  {isHighUtil && (
                                    <span className="px-1.5 py-0.5 bg-red-100 border border-red-200 text-red-700 font-black text-[7.5px] uppercase rounded-full animate-pulse tracking-tight">
                                      High Util
                                    </span>
                                  )}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{categories.find(c => c.id === s.categoryId)?.name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 max-w-[120px]">
                                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full rounded-full", isHighUtil ? "bg-red-500" : s.utilizationRate >= 70 ? "bg-amber-400" : "bg-emerald-500")}
                                    style={{ width: `${s.utilizationRate}%` }}
                                  />
                                </div>
                                <span className={cn("text-[9px] font-mono font-bold", isHighUtil ? "text-red-600 font-black" : "text-slate-400")}>{s.utilizationRate}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-rose-600">${s.price.toLocaleString()}</td>
                            <td className="px-6 py-4 text-center">
                               <div className="flex items-center justify-center gap-2">
                                  <button className="p-1 text-slate-400 hover:text-blue-600"><Edit2 size={13} /></button>
                                  <button className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={13} /></button>
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
            <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-xl shadow-slate-900/10">
               <CreditCard size={28} className="mb-4 text-emerald-400 animate-pulse" />
               <h3 className="text-sm font-black uppercase tracking-wider">Dynamic Invoicing</h3>
               <p className="mt-2 text-slate-400 text-[11px] leading-relaxed">PSIS-VH operating core calculates students billable logs matching their enrollment metrics, catalog items, and active programs automatically.</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Active Inventory Stats</h4>
                  <Tag size={13} className="text-blue-500" />
               </div>
               <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-[11px]">
                     <span className="text-slate-500">Active Services</span>
                     <span className="font-bold">{services.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] border-t border-slate-100 pt-3">
                     <span className="text-slate-500">Critical Alarms Active</span>
                     <span className="font-extrabold text-red-600">{highUtilizationAlerts.length} Alerts</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

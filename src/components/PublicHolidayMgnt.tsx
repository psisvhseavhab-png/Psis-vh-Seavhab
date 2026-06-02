import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Plus, Edit2, Trash2, Save, X, Search, Info, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { PublicHoliday } from '@/src/types';

export function PublicHolidayMgnt() {
  const [holidays, setHolidays] = useState<PublicHoliday[]>([
    { id: '1', name: 'Pchum Ben Day', fromDate: '2026-10-10', toDate: '2026-10-12', description: 'Traditional Khmer festival' },
    { id: '2', name: 'Water Festival', fromDate: '2026-11-20', toDate: '2026-11-22', description: 'Bonn Om Touk' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const newHolidays: PublicHoliday[] = [];
        
        // Skip header if it exists
        const startIdx = lines[0].toLowerCase().includes('name') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const [name, fromDate, toDate, description] = line.split(',').map(s => s.trim());
          
          if (name && fromDate && toDate) {
            newHolidays.push({
              id: Math.random().toString(36).substr(2, 9),
              name,
              fromDate,
              toDate,
              description: description || ''
            });
          }
        }

        if (newHolidays.length > 0) {
          setHolidays(prev => [...prev, ...newHolidays]);
          alert(`Successfully uploaded ${newHolidays.length} holidays!`);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Failed to parse CSV. Please check the format (Name, From Date, To Date, Description).');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Public Holidays</h1>
          <p className="text-slate-500">Scheduled school closures and observance days.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleCsvUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {isUploading ? "Uploading..." : "Upload CSV"}
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium",
              isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
            )}
          >
            {isAdding ? <X size={18} /> : <Plus size={18} />}
            {isAdding ? "Cancel" : "Add Holiday"}
          </button>
        </div>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Holiday Name*</label>
              <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Start Date*</label>
              <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">End Date*</label>
              <input type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
           </div>
           <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Description</label>
              <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
           </div>
           <div className="flex items-end">
              <button className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold w-full">Save Holiday</button>
           </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Event Name</th>
                <th className="px-8 py-4">Duration</th>
                <th className="px-8 py-4">Description</th>
                <th className="px-8 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holidays.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-8 py-4 font-bold text-slate-700">{h.name}</td>
                  <td className="px-8 py-4 text-sm font-medium">
                     <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg">{h.fromDate}</span>
                        <span className="text-slate-300">→</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg">{h.toDate}</span>
                     </div>
                  </td>
                  <td className="px-8 py-4 text-xs text-slate-500 italic max-w-xs truncate">{h.description}</td>
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
    </div>
  );
}

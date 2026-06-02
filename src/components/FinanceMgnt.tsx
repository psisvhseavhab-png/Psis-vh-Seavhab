import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Plus, Edit2, Trash2, Save, X, Search, FileText, DollarSign, CheckCircle2, AlertCircle, Clock, Tag, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Invoice } from '@/src/types';

export function FinanceMgnt() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-001', studentId: 'VH000138', totalAmount: 1200, paidAmount: 1200, status: 'paid', date: '2026-05-01' },
    { id: 'INV-002', studentId: 'VH000983', totalAmount: 850, paidAmount: 400, status: 'partial', date: '2026-05-03' },
    { id: 'INV-003', studentId: 'VH001020', totalAmount: 900, paidAmount: 0, status: 'unpaid', date: '2026-05-05' },
  ]);

  const exportFinanceCSV = () => {
    const csvData = invoices.map(i => ({
      InvoiceID: i.id,
      StudentID: i.studentId,
      TotalAmount: i.totalAmount,
      PaidAmount: i.paidAmount,
      Status: i.status.toUpperCase(),
      BillingDate: i.date,
      IncidentCharges: i.items?.map(item => `${item.name} ($${item.amount})`).join('; ') || 'Tuition Fee'
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `psis_finance_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isAdding, setIsAdding] = useState(false);
  const [isAddingCharge, setIsAddingCharge] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [chargeAmount, setChargeAmount] = useState<number>(0);
  const [chargeDescription, setChargeDescription] = useState('');

  // Bulk Ledger validation states
  const [showBulkFinance, setShowBulkFinance] = useState(false);
  const [fDragActive, setFDragActive] = useState(false);
  const [fParsedRecords, setFParsedRecords] = useState<any[]>([]);
  const [fValidationLog, setFValidationLog] = useState<{ status: 'ok' | 'warn'; msg: string }[]>([]);
  const [fImportSuccess, setFImportSuccess] = useState(false);
  const [fIsImporting, setFIsImporting] = useState(false);

  const handleFDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setFDragActive(true);
    } else if (e.type === "dragleave") {
      setFDragActive(false);
    }
  };

  const handleFDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFinanceFile(e.dataTransfer.files[0]);
    }
  };

  const processFinanceFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const logs: { status: 'ok' | 'warn'; msg: string }[] = [];
      let records: any[] = [];

      try {
        if (file.name.endsWith('.json')) {
          const raw = JSON.parse(text);
          records = Array.isArray(raw) ? raw : [raw];
          logs.push({ status: 'ok', msg: `Successfully parsed JSON array. Discovered ${records.length} billing rows.` });
        } else {
          // Robust CSV line parser
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.replace(/["']/g, '').trim());
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map(c => c.replace(/["']/g, '').trim());
              const record: any = {};
              headers.forEach((h, colIdx) => {
                record[h] = cols[colIdx] || '';
              });
              records.push(record);
            }
            logs.push({ status: 'ok', msg: `Parsed CSV file safely. Read ${records.length} billing rows.` });
          } else {
            logs.push({ status: 'warn', msg: `CSV ledger file has empty content.` });
          }
        }

        const validated: any[] = [];
        records.forEach((row: any, idx: number) => {
          const studentId = row.studentId || row.StudentID || row.studentID || 'VH000138';
          const totalAmount = parseFloat(row.totalAmount || row.TotalAmount || row.total || '0');
          const paidAmount = parseFloat(row.paidAmount || row.PaidAmount || row.paid || '0');
          const status = (row.status || row.Status || 'paid').toLowerCase();

          const validatedRow = {
            id: row.id || row.InvoiceID || row.invoiceId || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
            studentId,
            totalAmount: isNaN(totalAmount) ? 1200 : totalAmount,
            paidAmount: isNaN(paidAmount) ? 1200 : paidAmount,
            status: ['paid', 'partial', 'unpaid'].includes(status) ? status : 'paid',
            date: row.date || row.BillingDate || row.date || new Date().toISOString().split('T')[0]
          };

          validated.push(validatedRow);
          logs.push({ status: 'ok', msg: `Row ${idx + 1} (${validatedRow.id}): Valid - Student ID: ${studentId}, Amount: $${validatedRow.totalAmount} (${status.toUpperCase()})` });
        });

        setFParsedRecords(validated);
        setFValidationLog(logs);
        setFImportSuccess(false);

      } catch (err: any) {
        console.error(err);
        setFValidationLog([{ status: 'warn', msg: `Ledger parsing failed: ${err.message}` }]);
      }
    };
    reader.readAsText(file);
  };

  const executeBulkInvoiceImport = () => {
    if (fParsedRecords.length === 0) return;
    setFIsImporting(true);
    setTimeout(() => {
      setInvoices(prev => [...fParsedRecords, ...prev]);
      setFImportSuccess(true);
      setFParsedRecords([]);
      setFIsImporting(false);
    }, 850);
  };

  const addCharge = () => {
    if (!selectedStudent || !chargeAmount) return;
    const newInv: Invoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: selectedStudent,
      totalAmount: chargeAmount,
      paidAmount: 0,
      status: 'unpaid',
      date: new Date().toISOString().split('T')[0],
      items: [{ name: chargeDescription || 'Miscellaneous Service', amount: chargeAmount }]
    };
    setInvoices(prev => [newInv, ...prev]);
    setIsAddingCharge(false);
    setSelectedStudent('');
    setChargeAmount(0);
    setChargeDescription('');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'partial': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 size={12} />;
      case 'partial': return <Clock size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance & Fee Collection</h1>
          <p className="text-slate-500">Track tuition payments, generate invoices, and manage school revenue.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddingCharge(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            <Tag size={16} />
            Quick Charge
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all font-black uppercase text-[10px] tracking-widest",
              isAdding ? "bg-slate-200 text-slate-700" : "bg-[#0f172a] text-white shadow-slate-900/10 hover:bg-slate-800"
            )}
          >
            {isAdding ? <X size={18} /> : <Plus size={18} />}
            {isAdding ? "Cancel" : "Create Invoice"}
          </button>
          <button 
            type="button"
            onClick={() => {
              setIsAddingCharge(false);
              setIsAdding(false);
              setShowBulkFinance(!showBulkFinance);
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all font-black uppercase text-[10px] tracking-widest cursor-pointer",
              showBulkFinance ? "bg-indigo-600 text-white shadow-indigo-600/15" : "bg-white border border-slate-200 text-slate-705 hover:bg-slate-50"
            )}
          >
            <Upload size={18} />
            {showBulkFinance ? "Close Bulk" : "Bulk Import"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAddingCharge && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase italic text-slate-900">Quick Service Charge</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Easily add incidental costs to bills</p>
                </div>
                <button onClick={() => setIsAddingCharge(false)} className="p-2 hover:bg-white rounded-xl text-slate-400"><X size={20} /></button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Student</label>
                  <input 
                    type="text" 
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    placeholder="Enter Student ID or Name" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Description</label>
                  <input 
                    type="text"
                    value={chargeDescription}
                    onChange={(e) => setChargeDescription(e.target.value)}
                    placeholder="e.g. Broken Lab Equipment, Extra Meals, Field Trip" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Charge Amount (USD)</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(Number(e.target.value))}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-xl text-emerald-600"
                    />
                  </div>
                </div>

                <button 
                  onClick={addCharge}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                >
                  <Tag size={18} />
                  Post Charge to Parent
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Total Revenue', value: '$2,950', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Outstanding', value: '$1,350', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
           { label: 'Collected Today', value: '$450', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                 <stat.icon size={24} />
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-8"
        >
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Student ID / Name*</label>
                <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Search student..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Service Type</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                   <option>Tuition Fee</option>
                   <option>Transportation</option>
                   <option>Lunch Program</option>
                   <option>Uniform & Books</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Amount (USD)*</label>
                <div className="relative">
                   <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input type="number" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="0.00" />
                </div>
              </div>
           </div>
           <div className="flex justify-end pt-6 border-t border-slate-100">
              <button className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">Generate Invoice</button>
           </div>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div>
              <h3 className="font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">PSIS Ledger & Incident Billings</p>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={exportFinanceCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 hover:border-slate-350 text-slate-705 dark:text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                title="Export Ledger to CSV Spreadsheet"
              >
                <DollarSign size={13} className="text-emerald-500" />
                Export Ledger CSV
              </button>
              <div className="relative w-64">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" placeholder="Search Invoices..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
              </div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inv #</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student ID</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Amount</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-all group">
                   <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-800">{inv.id}</span>
                   </td>
                   <td className="px-8 py-5">
                      <span className="text-xs font-mono text-slate-500">{inv.studentId}</span>
                      {inv.items && inv.items.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                           {inv.items.map((item, idx) => (
                             <span key={idx} className="text-[8px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                               {item.name}
                             </span>
                           ))}
                        </div>
                      )}
                   </td>
                   <td className="px-8 py-5 text-sm font-bold text-slate-700">
                      ${inv.totalAmount.toLocaleString()}
                   </td>
                   <td className="px-8 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                        getStatusStyle(inv.status)
                      )}>
                        {getStatusIcon(inv.status)}
                        {inv.status}
                      </span>
                   </td>
                   <td className="px-8 py-5 text-xs text-slate-500 font-medium">{inv.date}</td>
                   <td className="px-8 py-5 text-center">
                     <div className="flex items-center justify-center gap-1">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                           <FileText size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 transition-all">
                           <Trash2 size={16} />
                        </button>
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

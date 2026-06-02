import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, XCircle, AlertCircle, Save, ChevronLeft, ChevronRight, FileSpreadsheet, Clock, Lock, ShieldCheck, UserCircle, Loader2, Sparkles, TrendingUp, FileText } from 'lucide-react';
import { cn, formatDate } from '@/src/lib/utils';
import { studentService } from '../services/studentService';
import { attendanceService } from '../services/attendanceService';
import { Student } from '../types';
import { jsPDF } from 'jspdf';
import { 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

type StaffRole = 'Class Teacher' | 'Subject Teacher' | 'Admin' | 'Student';

interface AttendanceProps {
  studentId?: string | null;
}

export function Attendance({ studentId }: AttendanceProps) {
  const [selectedClass, setSelectedClass] = useState('G10A');
  const [date, setDate] = useState(new Date());
  const [currentUserRole, setCurrentUserRole] = useState<StaffRole>('Class Teacher');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Offline and visual summary states
  const [isOffline, setIsOffline] = useState<boolean>(typeof window !== 'undefined' ? !window.navigator.onLine : false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSavedStats, setLastSavedStats] = useState<{ present: number; absent: number; late: number; dateStr: string; classId: string; total: number } | null>(null);

  // Background sync controller
  const handleBackgroundSync = async () => {
    try {
      const queueStr = localStorage.getItem('offline_attendance_queue');
      if (!queueStr) return;
      const queue = JSON.parse(queueStr);
      if (!Array.isArray(queue) || queue.length === 0) return;

      setIsSyncing(true);
      for (const item of queue) {
        await attendanceService.saveAttendance({
          date: item.date,
          classId: item.classId,
          records: item.records,
          recordedBy: item.recordedBy || 'Offline Cache Sync',
          recordedAt: item.recordedAt || new Date().toISOString()
        });
      }
      localStorage.removeItem('offline_attendance_queue');
      setIsSyncing(false);
    } catch (e) {
      console.error("Failed background synchronization of attendance cache:", e);
      setIsSyncing(false);
    }
  };

  // Monitor connection states
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      handleBackgroundSync();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof window !== 'undefined' && window.navigator.onLine) {
      handleBackgroundSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch students
  useEffect(() => {
    const unsub = studentService.subscribeToStudents((data) => {
      setStudents(data);
    });
    return unsub;
  }, []);

  // Fetch/Load attendance for current class and date
  useEffect(() => {
    const dateStr = date.toISOString().split('T')[0];
    attendanceService.getAttendance(dateStr, selectedClass).then(record => {
      if (record) {
        setAttendance(record.records);
      } else {
        // Initialize empty attendance for all students in class
        setAttendance({});
      }
      setIsLoading(false);
    });
  }, [selectedClass, date]);

  const classStudents = useMemo(() => {
    const filtered = students.filter(s => s.class === selectedClass);
    if (!studentId) return filtered;
    const focused = filtered.filter(s => s.id === studentId);
    const others = filtered.filter(s => s.id !== studentId);
    return [...focused, ...others];
  }, [students, selectedClass, studentId]);

  const handlePrevDay = () => {
    setDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNextDay = () => {
    setDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  // Generate last 30 days of daily attendance trends based on the selected class
  const trendData = useMemo(() => {
    const data = [];
    const dateCopy = new Date(date);
    
    // Distinct baseline attendance percentages depending on the class level
    let baseRate = 0.94;
    if (selectedClass === 'G10A') baseRate = 0.95;
    else if (selectedClass === 'G11') baseRate = 0.88;
    else if (selectedClass === 'G12') baseRate = 0.97;
    else if (selectedClass === 'G7A') baseRate = 0.91;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(dateCopy);
      d.setDate(d.getDate() - i);
      
      const dayOfWeek = d.getDay();
      let percent = baseRate;
      
      // Reduce rate on Mondays/Fridays for realistic simulation
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        percent += 0.01; // Weekends
      } else if (dayOfWeek === 1) { 
        percent -= 0.03; // Monday blues
      } else if (dayOfWeek === 5) { 
        percent -= 0.02; // Friday distraction
      } else { 
        percent += 0.01; // Solid midweek
      }
      
      // Introduce class-specific deterministic fluctuations to create rich visual curves
      const wave = Math.sin(d.getDate() * 1.8 + baseRate * 45) * 0.035;
      percent += wave;
      
      // Clamp between 80% and 100%
      const finalPercent = Math.min(100, Math.max(80, Math.round(percent * 1000) / 10));
      
      data.push({
        dateStr: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attendance: finalPercent,
      });
    }
    return data;
  }, [selectedClass, date]);

  // Compute key stats for the trend
  const trendStats = useMemo(() => {
    const rates = trendData.map(item => item.attendance);
    const avg = rates.reduce((sum, val) => sum + val, 0) / rates.length;
    const max = Math.max(...rates);
    const min = Math.min(...rates);
    return {
      average: avg.toFixed(1),
      max: max.toFixed(1),
      min: min.toFixed(1)
    };
  }, [trendData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-white shadow-xl">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold text-slate-300">Attendance:</span>
            <span className="text-xs font-black italic">{payload[0].value}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleSave = async () => {
    setIsSaving(true);
    const dateStr = date.toISOString().split('T')[0];
    const totalStudents = classStudents.length;

    const statsSnapshot = {
      present: Object.values(attendance).filter(v => v === 'present').length,
      absent: Object.values(attendance).filter(v => v === 'absent').length,
      late: Object.values(attendance).filter(v => v === 'late').length,
      dateStr,
      classId: selectedClass,
      total: totalStudents
    };

    try {
      if (isOffline) {
        // Enforce offline queue persistence
        let currentQueue = [];
        try {
          const queueStr = localStorage.getItem('offline_attendance_queue');
          if (queueStr) currentQueue = JSON.parse(queueStr);
        } catch (e) {
          currentQueue = [];
        }

        // Clean out duplicates
        const updatedQueue = currentQueue.filter(
          (item: any) => !(item.date === dateStr && item.classId === selectedClass)
        );

        updatedQueue.push({
          date: dateStr,
          classId: selectedClass,
          records: attendance,
          recordedBy: 'Local Server Offline Cache',
          recordedAt: new Date().toISOString()
        });

        localStorage.setItem('offline_attendance_queue', JSON.stringify(updatedQueue));
        
        setLastSavedStats(statsSnapshot);
        setShowSummaryModal(true);
      } else {
        // Standard high-reliability cloud sync
        await attendanceService.saveAttendance({
          date: dateStr,
          classId: selectedClass,
          records: attendance as any,
          recordedBy: 'School Supervisor',
          recordedAt: new Date().toISOString()
        });

        setLastSavedStats(statsSnapshot);
        setShowSummaryModal(true);
      }
    } catch (error) {
      console.error("Save attendance error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvRows = [
      ['Student ID', 'Student Name', 'Class ID', 'Date', 'Status']
    ];
    
    classStudents.forEach(student => {
      const status = attendance[student.id] || 'unmarked';
      csvRows.push([
        student.id,
        student.name,
        selectedClass,
        date.toISOString().split('T')[0],
        status.toUpperCase()
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${selectedClass}_${date.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      const dateStr = date.toISOString().split('T')[0];
      
      // Header branding
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("PAÑÑĀSĀSTRA INTERNATIONAL SCHOOL", 105, 20, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text("OFFICIAL ATTENDANCE REPORT • VAN HONG CAMPUS", 105, 27, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(15, 33, 195, 33);

      doc.setFontSize(9);
      doc.setTextColor(110);
      doc.text(`Generated At: 2026-06-02 12:41:00 UTC`, 15, 41);
      doc.text(`Class Group: ${selectedClass} | Status Date: ${dateStr}`, 115, 41);

      // Draw standard table headers
      let y = 52;
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(15, y, 180, 8, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      
      doc.text("Student ID", 20, y + 5.5);
      doc.text("Student Name", 50, y + 5.5);
      doc.text("Status Checked", 115, y + 5.5);
      doc.text("Parent Contact Info", 145, y + 5.5);
      y += 8;

      classStudents.forEach((student, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 180, 8, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(student.id, 20, y + 5.5);
        doc.text(student.name, 50, y + 5.5);
        
        const status = attendance[student.id] || 'unmarked';
        let statusLabel = status.toUpperCase();
        if (status === 'present') {
          doc.setTextColor(16, 124, 65); // green
        } else if (status === 'absent') {
          doc.setTextColor(219, 39, 119); // red
        } else if (status === 'late') {
          doc.setTextColor(217, 119, 6); // amber
        } else {
          doc.setTextColor(100);
        }

        doc.text(statusLabel, 115, y + 5.5);
        doc.setTextColor(15, 23, 42); // reset slate
        doc.text(student.tel || student.parent || 'No Tel on Record', 145, y + 5.5);
        
        y += 8;
      });

      // Border bounds
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 52, 180, y - 52, 'D');

      // Signature & Stamp Placeholder
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.line(130, y + 25, 180, y + 25);
      doc.text("Director of Student Affairs PSIS", 155, y + 30, { align: 'center' });

      // Save PDF
      doc.save(`psis_attendance_${selectedClass.toLowerCase()}_${dateStr}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Failed to export attendance report PDF.");
    }
  };

  const canRecord = currentUserRole === 'Class Teacher' || currentUserRole === 'Subject Teacher';

  const stats = {
    present: Object.values(attendance).filter(v => v === 'present').length,
    absent: Object.values(attendance).filter(v => v === 'absent').length,
    late: Object.values(attendance).filter(v => v === 'late').length,
  };

  const setStatus = (id: string, status: string) => {
    if (!canRecord) return;
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  return (
    <div className="space-y-6">
      {/* Network Connectivity Notification Banner */}
      {isSyncing && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-blue-600 text-white rounded-2xl flex items-center gap-3 font-semibold text-xs shadow-md shadow-blue-600/10"
        >
          <Loader2 size={16} className="animate-spin shrink-0" />
          <span>Synchronizing offline cached records with Paññāsāstra international servers...</span>
        </motion.div>
      )}

      {isOffline && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-orange-600 text-white rounded-2xl flex items-center gap-2.5 font-bold text-xs shadow-md shadow-orange-600/10 animate-pulse"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span>OFFLINE OPERATION MODE: Scans and status selections are saved to local cache. They will automatically sync on recovery.</span>
        </motion.div>
      )}

      {/* Daily Attendance Summary overlay popup */}
      {showSummaryModal && lastSavedStats && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl border border-slate-100 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Daily Attendance Summary
              </h3>
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-650 rounded-lg text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1.5 border border-slate-100">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase">
                  <span>Target Class</span>
                  <span className="text-slate-800 font-extrabold">{lastSavedStats.classId}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase">
                  <span>Record Date</span>
                  <span className="text-slate-800 font-extrabold">{lastSavedStats.dateStr}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase">
                  <span>Status Mode</span>
                  <span className={`font-extrabold uppercase ${isOffline ? "text-orange-500" : "text-emerald-500"}`}>
                    {isOffline ? "Local Cache Stacked" : "Cloud Synchronized"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-emerald-50/50 border border-emerald-100/60 p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-emerald-800 block">PRESENT</span>
                  <span className="text-xl font-black text-emerald-600 mt-1 block">{lastSavedStats.present}</span>
                </div>
                <div className="bg-orange-50/50 border border-orange-100/60 p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-orange-850 block">LATE</span>
                  <span className="text-xl font-black text-orange-600 mt-1 block">{lastSavedStats.late}</span>
                </div>
                <div className="bg-red-50/50 border border-red-100/60 p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-red-800 block">ABSENT</span>
                  <span className="text-xl font-black text-red-600 mt-1 block">{lastSavedStats.absent}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/45 border border-blue-100/50 rounded-xl text-center">
                <p className="text-[10px] text-slate-500 font-medium">
                  Total Class Capacity Tracker: <b>{lastSavedStats.total} Students Evaluated</b>
                </p>
                <p className="text-[9.5px] font-bold text-emerald-600 mt-1">
                  Compliance rate calculated at {((lastSavedStats.present / (lastSavedStats.total || 1)) * 100).toFixed(0)}% attendance response!
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowSummaryModal(false)}
              className="mt-5 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition duration-150 shadow cursor-pointer text-center"
            >
              Confirm and Return
            </button>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Tracker</h1>
          <p className="text-slate-500">Record daily attendance for your assigned classes.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl mr-4 border border-slate-200">
             <button 
               onClick={() => setCurrentUserRole('Class Teacher')}
               className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5", currentUserRole === 'Class Teacher' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}
             >
               <ShieldCheck size={12} />
               Class Teacher
             </button>
             <button 
               onClick={() => setCurrentUserRole('Subject Teacher')}
               className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5", currentUserRole === 'Subject Teacher' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}
             >
               <ShieldCheck size={12} />
               Subject Teacher
             </button>
             <button 
               onClick={() => setCurrentUserRole('Admin')}
               className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5", currentUserRole === 'Admin' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}
             >
               <UserCircle size={12} />
               Admin
             </button>
          </div>

          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm cursor-pointer"
          >
            <FileSpreadsheet size={18} />
            Download CSV
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-450 text-white rounded-xl shadow-lg transition-all font-black uppercase text-[10px] tracking-widest cursor-pointer"
          >
            <FileText size={16} />
            PDF Export
          </button>
          <button 
            disabled={!canRecord || isSaving}
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-medium cursor-pointer",
              canRecord ? "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {!canRecord && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700"
        >
          <Lock size={18} />
          <p className="text-sm font-medium">Recording is restricted. Only <span className="font-bold">Class Teachers</span> and <span className="font-bold">Subject Teachers</span> can record attendance.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Present</p>
            <h3 className="text-2xl font-bold text-emerald-600">{stats.present}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Absent</p>
            <h3 className="text-2xl font-bold text-red-600">{stats.absent}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-xl">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Late</p>
            <h3 className="text-2xl font-bold text-orange-600">{stats.late}</h3>
          </div>
        </div>
      </div>

      {/* 30-Day Attendance Trend Line Chart Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Sparkles size={16} />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-1.5">
                30-Day Attendance Analytics
              </h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Daily attendance percentage fluctuation for {selectedClass === 'G10A' ? 'Grade 10 - Section A' : selectedClass === 'G11' ? 'Grade 11 - General' : selectedClass === 'G12' ? 'Grade 12 - Science' : selectedClass === 'G7A' ? 'Grade 7 - Section A' : selectedClass}
            </p>
          </div>

          {/* Aggregated indicators */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-1">
                <TrendingUp size={12} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">30D Avg Rate</span>
              </div>
              <p className="text-lg font-black text-slate-900 italic leading-none mt-0.5">{trendStats.average}%</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center sm:text-left">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Peak Rate</p>
              <p className="text-lg font-black text-emerald-600 italic leading-none mt-0.5">{trendStats.max}%</p>
            </div>
          </div>
        </div>

        {/* Line Chart Container */}
        <div className="w-full h-[260px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="label" 
                stroke="#a1a1aa" 
                fontSize={9} 
                fontWeight="black" 
                tickLine={false} 
                axisLine={false} 
                dy={8}
                interval={2}
              />
              <YAxis 
                stroke="#a1a1aa" 
                fontSize={9} 
                fontWeight="black" 
                tickLine={false} 
                axisLine={false}
                dx={-8}
                domain={[70, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={28} 
                iconType="circle"
                formatter={() => (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-sans">
                    Daily Presence Percentage (%)
                  </span>
                )}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#3730a3"
                strokeWidth={3.5}
                dot={{ r: 4, strokeWidth: 1, stroke: '#3730a3', fill: '#ffffff' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#3730a3' }}
              />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Class Level</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="G10A">Grade 10 - Section A</option>
                <option value="G11">Grade 11 - General</option>
                <option value="G12">Grade 12 - Science</option>
                <option value="G7A">Grade 7 - Section A</option>
              </select>
            </div>
            <div className="w-px h-10 bg-slate-100"></div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrevDay}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Calendar size={18} className="text-blue-500" />
                {formatDate(date)}
              </div>
              <button 
                onClick={handleNextDay}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button 
               disabled={!canRecord}
               onClick={() => {
                 if (!canRecord) return;
                 const updated: Record<string, string> = {};
                 classStudents.forEach(s => {
                   updated[s.id] = 'present';
                 });
                 setAttendance(prev => ({ ...prev, ...updated }));
               }}
               className={cn(
                 "text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer",
                 canRecord ? "text-blue-600 hover:underline" : "text-slate-300 cursor-not-allowed"
               )}
             >
               Select All Present
             </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-2/3"></div>
                    <div className="h-3 bg-slate-150 dark:bg-slate-850 rounded-full w-1/3"></div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classStudents.map((student, i) => {
                const isFocused = student.id === studentId;
                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, scale: 0.95, y: 7 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25, delay: i * 0.03 }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex items-center justify-between shadow-xs",
                      isFocused ? "ring-2 ring-blue-500 border-blue-500 shadow-md shadow-blue-500/10" : "",
                      attendance[student.id] === 'present' ? "bg-emerald-50/20 border-emerald-200" :
                      attendance[student.id] === 'absent' ? "bg-red-50/20 border-red-200" :
                      attendance[student.id] === 'late' ? "bg-orange-50/20 border-orange-200" :
                      "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                    )}
                  >
                  <div>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{student.name}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{student.id}</p>
                  </div>
                  
                  <div className={cn(
                    "flex items-center border rounded-xl p-1 gap-1 transition-all shrink-0 bg-slate-50/55",
                    canRecord ? "border-slate-200/50" : "opacity-60"
                  )}>
                    <motion.button 
                      disabled={!canRecord}
                      onClick={() => setStatus(student.id, 'present')}
                      whileHover={canRecord ? { scale: 1.1 } : {}}
                      whileTap={canRecord ? { scale: 0.92 } : {}}
                      className={cn(
                        "p-1.5 rounded-lg transition-all duration-200 cursor-pointer", 
                        attendance[student.id] === 'present' ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : 
                        canRecord ? "text-slate-400 hover:text-slate-650 hover:bg-white" : "text-slate-300"
                      )}
                      title="Present"
                    >
                      <CheckCircle2 size={16} />
                    </motion.button>
                    <motion.button 
                      disabled={!canRecord}
                      onClick={() => setStatus(student.id, 'late')}
                      whileHover={canRecord ? { scale: 1.1 } : {}}
                      whileTap={canRecord ? { scale: 0.92 } : {}}
                      className={cn(
                        "p-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                        attendance[student.id] === 'late' ? "bg-orange-500 text-white shadow-md shadow-orange-500/30" : 
                        canRecord ? "text-slate-400 hover:text-slate-650 hover:bg-white" : "text-slate-300"
                      )}
                      title="Late"
                    >
                      <Clock size={16} />
                    </motion.button>
                    <motion.button 
                      disabled={!canRecord}
                      onClick={() => setStatus(student.id, 'absent')}
                      whileHover={canRecord ? { scale: 1.1 } : {}}
                      whileTap={canRecord ? { scale: 0.92 } : {}}
                      className={cn(
                        "p-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                        attendance[student.id] === 'absent' ? "bg-red-600 text-white shadow-md shadow-red-600/30" : 
                        canRecord ? "text-slate-400 hover:text-slate-650 hover:bg-white" : "text-slate-300"
                      )}
                      title="Absent"
                    >
                      <XCircle size={16} />
                    </motion.button>
                  </div>
                </motion.div>
                );
              })}
            {classStudents.length === 0 && !isLoading && (
              <div className="col-span-full py-20 text-center">
                 <p className="text-slate-400 font-medium italic">No students found in {selectedClass} class.</p>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

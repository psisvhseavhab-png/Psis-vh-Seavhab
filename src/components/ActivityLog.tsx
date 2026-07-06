import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Search, Filter, Trash2, RotateCcw, 
  GraduationCap, Settings, Edit3, ShieldAlert,
  ChevronDown, ChevronUp, User, Clock, FileDown, Briefcase,
  UserCheck, UserX, ShieldCheck, AlertCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getLogs, clearActivityLogs, logActivity, ActivityLogItem } from '../utils/activityLogger';

export function ActivityLog() {
  const [activeSection, setActiveSection] = useState<'admin' | 'scans'>('admin');
  
  // Administrative audit states
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Scan history states
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [scanSearch, setScanSearch] = useState('');
  const [scanStatusFilter, setScanStatusFilter] = useState('all');
  const [scanCategoryFilter, setScanCategoryFilter] = useState('all');
  const [expandedScanId, setExpandedScanId] = useState<number | null>(null);

  const fetchLogs = () => {
    setLogs(getLogs());
  };

  const fetchScans = () => {
    try {
      const stored = localStorage.getItem("edu_attendance_scans_recorded");
      if (stored) {
        setScanHistory(JSON.parse(stored));
      } else {
        setScanHistory([]);
      }
    } catch (err) {
      console.warn("Failed fetching stored scans:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchScans();

    // Listen to custom events for live updates
    const handleLogUpdate = () => {
      fetchLogs();
    };

    const handleScanUpdate = () => {
      fetchScans();
    };

    window.addEventListener('activity_logged', handleLogUpdate);
    window.addEventListener('activity_scans_updated', handleScanUpdate);
    
    return () => {
      window.removeEventListener('activity_logged', handleLogUpdate);
      window.removeEventListener('activity_scans_updated', handleScanUpdate);
    };
  }, []);

  useEffect(() => {
    if (activeSection === 'scans') {
      fetchScans();
    }
  }, [activeSection]);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all administrative activity logs? This cannot be undone.")) {
      clearActivityLogs();
      fetchLogs();
    }
  };

  const handleClearScans = () => {
    if (confirm("Are you sure you want to wipe all ID card scan audit records? This cannot be undone.")) {
      localStorage.removeItem("edu_attendance_scans_recorded");
      setScanHistory([]);
    }
  };

  const handleResetDefaults = () => {
    localStorage.removeItem('psis_activity_logs');
    fetchLogs();
    logActivity('system', 'Reinitialized administrative activity logs to factory default settings.');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || log.actionType === selectedType;

    return matchesSearch && matchesType;
  });

  const filteredScans = scanHistory.filter(scan => {
    const searchLower = scanSearch.toLowerCase();
    const matchesSearch = 
      (scan.name || '').toLowerCase().includes(searchLower) ||
      (scan.id || '').toLowerCase().includes(searchLower) ||
      (scan.type || '').toLowerCase().includes(searchLower) ||
      (scan.class || '').toLowerCase().includes(searchLower);

    const matchesStatus = 
      scanStatusFilter === 'all' || 
      (scanStatusFilter === 'verified' && (scan.status === 'on-time' || scan.status === 'late')) ||
      (scanStatusFilter === 'failed' && scan.status === 'failed');

    const matchesCategory =
      scanCategoryFilter === 'all' ||
      (scanCategoryFilter === 'Student' && scan.category === 'Student') ||
      (scanCategoryFilter === 'Employee' && scan.category === 'Employee') ||
      (scanCategoryFilter === 'Guest' && scan.category === 'Guest');

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate Scan Metrics
  const totalScans = scanHistory.length;
  const verifiedScansCount = scanHistory.filter(s => s.status === 'on-time' || s.status === 'late').length;
  const failedScansCount = scanHistory.filter(s => s.status === 'failed').length;
  const guestScansCount = scanHistory.filter(s => s.category === 'Guest').length;

  const getActionBadge = (type: ActivityLogItem['actionType']) => {
    switch (type) {
      case 'student_enrollment':
        return {
          label: 'Enrollment',
          icon: GraduationCap,
          color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50'
        };
      case 'grade_update':
        return {
          label: 'Grade / Points',
          icon: Edit3,
          color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
        };
      case 'config_change':
        return {
          label: 'Config Change',
          icon: Settings,
          color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
        };
      default:
        return {
          label: 'System Code',
          icon: Briefcase,
          color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-3">
            <Activity className="text-blue-600 animate-pulse" size={28} />
            System Audit & Scan Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight">
            Comprehensive audit trailing of school enrollment, grading edits, and camera ID card scans history.
          </p>
        </div>
        
        <div className="flex gap-2">
          {activeSection === 'admin' ? (
            <>
              <button 
                onClick={handleResetDefaults}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-black uppercase text-[10px] tracking-widest cursor-pointer"
              >
                <RotateCcw size={14} />
                Reset Defaults
              </button>
              <button 
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100/55 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 cursor-pointer"
              >
                <Trash2 size={14} />
                Wipe Admin Logs
              </button>
            </>
          ) : (
            <button 
              onClick={handleClearScans}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100/55 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 cursor-pointer"
            >
              <Trash2 size={14} />
              Clear Scan Trail
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 pb-px">
        <button
          onClick={() => setActiveSection('admin')}
          className={cn(
            "px-6 py-3 font-black uppercase text-[10.5px] tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer",
            activeSection === 'admin'
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <Activity size={14} />
          Administrative Audit Logs
        </button>
        <button
          onClick={() => setActiveSection('scans')}
          className={cn(
            "px-6 py-3 font-black uppercase text-[10.5px] tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer",
            activeSection === 'scans'
              ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <UserCheck size={14} />
          ID Card Scan History
        </button>
      </div>

      {activeSection === 'admin' ? (
        <>
          {/* Filter and Filters Console Card for Admin Logs */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Text Search Box */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search by action, id, administrator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:text-white"
                />
              </div>

              {/* Action Type Selector filter */}
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400 shrink-0" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">📁 All Audit Action Categories</option>
                  <option value="student_enrollment">👤 Registrations & Enrollments</option>
                  <option value="grade_update">📝 Grading & Modifier Tweaks</option>
                  <option value="config_change">⚙️ Configuration Deployments</option>
                  <option value="system">🛡️ Automated System Diagnostics</option>
                </select>
              </div>

              {/* Quick summary read */}
              <div className="flex items-center justify-end px-4 text-xs font-black text-slate-450 uppercase tracking-widest gap-2">
                <ShieldAlert size={14} className="text-blue-500" />
                <span>Audit Records Listed: <span className="text-blue-600 font-mono text-sm">{filteredLogs.length}</span></span>
              </div>
            </div>
          </div>

          {/* Main Audit Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            {filteredLogs.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800/80">
                  <Activity size={24} />
                </div>
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 tracking-widest">No matching activities found</h3>
                <p className="text-xs text-slate-400 mt-1">Try relaxing filters or generate school behaviors to see changes captured live.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.actionType);
                  const BadgeIcon = badge.icon;
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <div key={log.id} className="transition-all hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                      <div 
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        {/* Left Column Description */}
                        <div className="flex items-start gap-4">
                          <div className={cn("p-3 rounded-xl border shrink-0 mt-0.5", badge.color)}>
                            <BadgeIcon size={18} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center flex-wrap gap-2.5">
                              <span className="text-xs font-mono font-black text-slate-400 bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded">
                                {log.id}
                              </span>
                              <span className={cn("text-[9px] font-black uppercase tracking-wider border rounded-full px-2 py-0.5", badge.color)}>
                                {badge.label}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} />
                                {log.timestamp}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white text-left">
                              {log.description}
                            </h4>
                          </div>
                        </div>

                        {/* Right column operator and expand status */}
                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 pt-3 md:pt-0">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-slate-100 dark:bg-slate-950 rounded-full flex items-center justify-center border border-slate-250 dark:border-slate-800">
                              <User size={13} className="text-slate-500" />
                            </div>
                            <div className="text-left">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Operator</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.user}</span>
                            </div>
                          </div>
                          
                          {isExpanded ? (
                            <ChevronUp className="text-slate-400" size={18} />
                          ) : (
                            <ChevronDown className="text-slate-400" size={18} />
                          )}
                        </div>
                      </div>

                      {/* Expandable JSON Metadata Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850"
                          >
                            <div className="p-6 font-mono text-xs text-slate-650 dark:text-slate-450 block text-left space-y-3">
                              <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Captured Audit Context Matrix:</p>
                              <pre className="bg-slate-900 text-cyan-400 p-4 rounded-xl overflow-x-auto shadow-inner text-[11px] leading-relaxed select-text">
                                {JSON.stringify({
                                  id: log.id,
                                  timestamp: log.timestamp,
                                  actionType: log.actionType,
                                  userEmail: log.user,
                                  description: log.description,
                                  payload: log.metadata || {}
                                }, null, 2)}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* ID Scans Analytics/Counters Dashboard Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-left shadow-2xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Scan Events</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalScans}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-left shadow-2xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">Verified Matches</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{verifiedScansCount}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-left shadow-2xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">Failed Attempts</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{failedScansCount}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-left shadow-2xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">Guest Profiles</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{guestScansCount}</span>
            </div>
          </div>

          {/* ID Badge Search & Filter Row */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Scan Text Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search scans by name, ID code, method..."
                  value={scanSearch}
                  onChange={(e) => setScanSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:text-white"
                />
              </div>

              {/* Scan Status Filter */}
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400 shrink-0" />
                <select
                  value={scanStatusFilter}
                  onChange={(e) => setScanStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">🛡️ All Scanner Statuses</option>
                  <option value="verified">✅ Verified (On-Time & Late)</option>
                  <option value="failed">❌ Failed / Access Denied</option>
                </select>
              </div>

              {/* Scan Category Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={scanCategoryFilter}
                  onChange={(e) => setScanCategoryFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">👥 All Categories</option>
                  <option value="Student">🎓 Students</option>
                  <option value="Employee">💼 Employees & Teachers</option>
                  <option value="Guest">👤 Guests & Visitors</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main ID Scans Audit Feed */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            {filteredScans.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800/80">
                  <UserX size={24} />
                </div>
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 tracking-widest">No matching badge scans found</h3>
                <p className="text-xs text-slate-400 mt-1">Try scanning student or employee credentials using the camera scanning tab.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredScans.map((scan, idx) => {
                  const isExpanded = expandedScanId === idx;
                  const isFailed = scan.status === 'failed';

                  return (
                    <div key={idx} className="transition-all hover:bg-slate-50/40 dark:hover:bg-slate-950/20 text-slate-850 dark:text-slate-200">
                      <div 
                        onClick={() => setExpandedScanId(isExpanded ? null : idx)}
                        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        {/* Left column: Scan metadata details */}
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "p-3 rounded-xl border shrink-0 mt-0.5",
                            isFailed 
                              ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50"
                              : scan.category === "Employee"
                              ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50"
                              : scan.category === "Guest"
                              ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50"
                          )}>
                            {isFailed ? <UserX size={18} /> : <UserCheck size={18} />}
                          </div>

                          <div className="space-y-1 text-left">
                            <div className="flex items-center flex-wrap gap-2.5">
                              <span className="text-xs font-mono font-black text-slate-450 bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded">
                                {scan.id}
                              </span>
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-wider border rounded-full px-2 py-0.5",
                                isFailed 
                                  ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                                  : scan.category === "Employee"
                                  ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400"
                                  : scan.category === "Guest"
                                  ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                                  : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                              )}>
                                {scan.category || 'Student'}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} />
                                {scan.timestamp}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                {scan.name}
                              </h4>
                              {scan.class && (
                                <span className="text-xs text-slate-400">
                                  ({scan.class})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right column: Status Indicators */}
                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 pt-3 md:pt-0">
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Verification</span>
                            <div className="flex items-center gap-1.5">
                              <span className={cn(
                                "px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-full border",
                                isFailed 
                                  ? "bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900"
                                  : "bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900"
                              )}>
                                {isFailed ? "Access Denied" : "Status Verified"}
                              </span>
                              <span className="text-[9.5px] font-mono text-slate-500 font-bold">
                                {scan.type}
                              </span>
                            </div>
                          </div>

                          {isExpanded ? (
                            <ChevronUp className="text-slate-400" size={18} />
                          ) : (
                            <ChevronDown className="text-slate-400" size={18} />
                          )}
                        </div>
                      </div>

                      {/* Expandable JSON Metadata Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850"
                          >
                            <div className="p-6 font-mono text-xs text-slate-650 dark:text-slate-450 block text-left space-y-3">
                              <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Captured Scanner Audit Context:</p>
                              <pre className="bg-slate-900 text-cyan-400 p-4 rounded-xl overflow-x-auto shadow-inner text-[11px] leading-relaxed select-text">
                                {JSON.stringify({
                                  badgeId: scan.id,
                                  scannedName: scan.name,
                                  associatedClass: scan.class,
                                  category: scan.category || "Student",
                                  timestamp: scan.timestamp,
                                  scanMethod: scan.type,
                                  verdict: isFailed ? "REJECTED (Access Denied)" : "APPROVED (Access Granted)",
                                  attendanceRecorded: !isFailed && scan.category !== 'Guest' ? "Yes ('Present' Attendance collection trigger)" : "No",
                                  aiSmartFeedback: scan.aiFeedback || "None"
                                }, null, 2)}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Diagnostic System Info */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-950 text-white rounded-[2rem] border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/10 text-cyan-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
            <Activity size={22} className="animate-spin-slow" />
          </div>
          <div className="text-left">
            <h4 className="font-black uppercase text-xs tracking-wider text-cyan-400">Diagnostic Integrity Mode Secure</h4>
            <span className="text-[10px] text-slate-400 block font-semibold leading-none mt-1">
              Active Session Operator signature appended on every remote action call
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-500 border border-slate-800 px-3 py-1 bg-slate-950 rounded-lg">
          ENV: CLOUD-CONTAINER-RTSP-BRIDGE
        </span>
      </div>
    </div>
  );
}

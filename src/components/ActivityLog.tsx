import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Search, Filter, Trash2, RotateCcw, 
  GraduationCap, Settings, Edit3, ShieldAlert,
  ChevronDown, ChevronUp, User, Clock, FileDown, Briefcase
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getLogs, clearActivityLogs, logActivity, ActivityLogItem } from '../utils/activityLogger';

export function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = () => {
    setLogs(getLogs());
  };

  useEffect(() => {
    fetchLogs();

    // Listen to custom event for live updates
    const handleLogUpdate = () => {
      fetchLogs();
    };

    window.addEventListener('activity_logged', handleLogUpdate);
    return () => {
      window.removeEventListener('activity_logged', handleLogUpdate);
    };
  }, []);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all administrative activity logs? This cannot be undone.")) {
      clearActivityLogs();
      fetchLogs();
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
            System Audit & Activity Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight">
            Comprehensive audit trailing of school enrollment, grades editing, and global settings.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-black uppercase text-[10px] tracking-widest"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100/55 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
          >
            <Trash2 size={14} />
            Wipe Logs
          </button>
        </div>
      </div>

      {/* Filter and Filters Console Card */}
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

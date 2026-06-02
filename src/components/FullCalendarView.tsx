import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Filter, 
  Sparkles, 
  RefreshCw,
  Sliders,
  CheckCircle2,
  Trash2,
  Lock,
  UserCheck,
  Printer
} from 'lucide-react';
import { WebsiteEvent } from '../types';
import { cn } from '../lib/utils';

interface FullCalendarViewProps {
  events: WebsiteEvent[];
  onClose: () => void;
  onReschedule: (eventId: string, newDateString: string) => Promise<void>;
  isSyncing: boolean;
  syncMessage: string;
  handleGoogleCalendarSync: () => Promise<void>;
}

export function FullCalendarView({
  events,
  onClose,
  onReschedule,
  isSyncing,
  syncMessage,
  handleGoogleCalendarSync
}: FullCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 4, 21)); // May 21, 2026
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [isReschedulingLocal, setIsReschedulingLocal] = useState(false);

  // Helper to format ISO date strings safely
  const formatDayString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-indexed

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date(2026, 4, 21)); // standard May 21, 2026 today
  };

  // Generate calendar grid dates
  const getCalendarDays = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // day of week (0-6)
    const totalDays = new Date(year, month + 1, 0).getDate(); // last day of month
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const daysArray = [];

    // Prior month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const mVal = month === 0 ? 11 : month - 1;
      const yVal = month === 0 ? year - 1 : year;
      daysArray.push({
        day: dayNum,
        isCurrentMonth: false,
        dateString: formatDayString(yVal, mVal, dayNum)
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      daysArray.push({
        day: i,
        isCurrentMonth: true,
        dateString: formatDayString(year, month, i)
      });
    }

    // Next month padding to fill multiple of 7 (to support robust 6-row layout grid)
    const totalCells = 42;
    const remainingCells = totalCells - daysArray.length;
    for (let i = 1; i <= remainingCells; i++) {
      const mVal = month === 11 ? 0 : month + 1;
      const yVal = month === 11 ? year + 1 : year;
      daysArray.push({
        day: i,
        isCurrentMonth: false,
        dateString: formatDayString(yVal, mVal, i)
      });
    }

    return daysArray;
  };

  const calendarDays = getCalendarDays();

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    setDraggedEventId(eventId);
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dateString: string) => {
    e.preventDefault();
    if (dragOverDate !== dateString) {
      setDragOverDate(dateString);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    setDraggedEventId(null);
    
    const eventId = e.dataTransfer.getData('text/plain');
    if (!eventId) return;

    setIsReschedulingLocal(true);
    await onReschedule(eventId, targetDateStr);
    setIsReschedulingLocal(false);
  };

  // Filter events based on selected category
  const filteredEvents = events.filter(ev => {
    if (selectedCategory === 'All') return true;
    return ev.category === selectedCategory;
  });

  // Organize event list by date
  const eventsByDate = filteredEvents.reduce<Record<string, WebsiteEvent[]>>((acc, ev) => {
    if (!acc[ev.date]) {
      acc[ev.date] = [];
    }
    acc[ev.date].push(ev);
    return acc;
  }, {});

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Sports':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50 hover:bg-emerald-500/15';
      case 'Culture':
        return 'bg-purple-500/10 text-purple-700 border-purple-200/50 hover:bg-purple-500/15';
      case 'Holiday':
        return 'bg-rose-500/10 text-rose-700 border-rose-200/50 hover:bg-rose-500/15';
      default:
        return 'bg-blue-500/10 text-blue-700 border-blue-200/50 hover:bg-blue-500/15';
    }
  };

  const getCategoryBulletColor = (category: string) => {
    switch (category) {
      case 'Sports': return 'bg-emerald-500';
      case 'Culture': return 'bg-purple-500';
      case 'Holiday': return 'bg-rose-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl flex flex-col min-h-[85vh] relative overflow-hidden print:hidden"
      >
      {/* Background radial soft light decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header Block */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-slate-100 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl hover:text-slate-900 border border-slate-200/60 transition-all flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Teacher Schedulers View</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarIcon className="text-slate-700" size={24} />
              Google Calendar Event Planner
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Interactive timeline. Drag-and-drop synced activities below to instantly reschedule dates with permission.
            </p>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="flex flex-wrap items-center gap-4">
          {syncMessage && (
            <div className="px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-slate-600 tracking-wide">{syncMessage}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-purple-600 border border-purple-700 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Print Monthly Schedule as PDF"
            >
              <Printer size={12} />
              Export PDF
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Today
            </button>
            <button
              id="full-calendar-sync-btn"
              disabled={isSyncing}
              onClick={handleGoogleCalendarSync}
              className={cn(
                "px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2 border",
                isSyncing 
                  ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-blue-600 border-blue-700 hover:bg-blue-700 text-white shadow-sm"
              )}
            >
              <RefreshCw size={12} className={cn(isSyncing && "animate-spin")} />
              {isSyncing ? 'Syncing...' : 'Sync Calendar'}
            </button>
          </div>
        </div>
      </div>

      {/* Control Filters & Month Switchers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 z-10">
        {/* Month Selector Controls */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50/50 p-1">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="text-lg font-black text-slate-800 tracking-tighter uppercase italic min-w-[150px]">
            {currentMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Categories filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Sliders size={14} className="text-slate-400 mr-2" />
          {['All', 'Academic', 'Sports', 'Culture', 'Holiday'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                selectedCategory === cat 
                  ? "bg-slate-900 border-slate-950 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Calendar Grid */}
      <div className="flex-1 min-h-[480px] border border-slate-200 bg-slate-50/20 rounded-[2rem] overflow-hidden flex flex-col shadow-inner z-10">
        
        {/* Week Days Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-white py-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Days Box Cell Blocks */}
        <div className="grid grid-cols-7 flex-1 bg-slate-200/50 gap-px">
          {calendarDays.map((cell, idx) => {
            const dayEvents = eventsByDate[cell.dateString] || [];
            const isTodayCell = cell.dateString === '2026-05-21'; // matching academic baseline date May 21, 2026
            const isHighlightDragOver = dragOverDate === cell.dateString;

            return (
              <div
                key={idx}
                onDragOver={(e) => handleDragOver(e, cell.dateString)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, cell.dateString)}
                className={cn(
                  "min-h-[100px] bg-white p-2.5 transition-all flex flex-col gap-1 relative border border-transparent select-none",
                  !cell.isCurrentMonth && "bg-slate-50/50 text-slate-300",
                  isTodayCell && "bg-blue-50/30",
                  isHighlightDragOver && "bg-purple-100/40 border-purple-400 border-2 z-20 scale-[0.98] shadow-md shadow-purple-500/5"
                )}
              >
                {/* Header of date cell */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs font-black tracking-tight",
                    cell.isCurrentMonth ? "text-slate-800" : "text-slate-400",
                    isTodayCell && "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md shadow-blue-600/30 font-black-important"
                  )}>
                    {cell.day}
                  </span>
                  
                  {isTodayCell && (
                    <span className="text-[7.5px] font-black text-blue-600 uppercase tracking-widest">Baseline</span>
                  )}
                </div>

                {/* Event list inside that day */}
                <div className="flex-1 overflow-y-auto space-y-1.5 mt-1 pr-1 max-h-[110px] custom-scrollbar">
                  {dayEvents.map(event => {
                    const isSynced = (event as any).syncedFromGoogle;
                    return (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event.id)}
                        className={cn(
                          "p-2 rounded-xl border text-[10px] font-bold cursor-grab active:cursor-grabbing transition-all duration-150 flex flex-col gap-1",
                          getCategoryStyles(event.category),
                          draggedEventId === event.id && "opacity-35 scale-95"
                        )}
                        title={`Drag to reschedule: ${event.title}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold truncate pr-1 max-w-[85px] uppercase tracking-wide text-slate-800">
                            {event.title}
                          </span>
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", getCategoryBulletColor(event.category))} />
                        </div>
                        
                        <div className="flex items-center gap-1 text-[8.5px] text-slate-500 font-medium">
                          <Clock size={9} />
                          <span>{event.startTime === 'All Day' ? 'All Day' : event.startTime}</span>
                        </div>

                        {isSynced && (
                          <div className="flex items-center gap-0.5 text-[7px] text-blue-500 font-black uppercase tracking-widest mt-0.5">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
                            G-API
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Instruction Banners */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-bold text-slate-500 bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <UserCheck size={16} />
          </div>
          <div>
            <p className="text-slate-800 text-xs font-black uppercase tracking-wide">Operational Integrity Guarded</p>
            <p className="text-[10px] text-slate-400 mt-0.5">All local modifications sync with central school records instantly. Mutating a Google Calendar event invokes the official G-Suite pipeline.</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Academic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Sports</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Culture</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Holiday</span>
          </div>
        </div>
      </div>
      </motion.div>

      {/* Printable Schedule Area - Visible ONLY when printing */}
      <div className="hidden print:block print:bg-white print:text-slate-900 p-8 font-sans w-full leading-normal">
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
              Academic Master Calendar Report
            </h1>
            <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mt-1">
              Active Period: {currentMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-slate-400">School Master Schedule</span>
          </div>
        </div>
        
        {/* Monthly Count Summary inside print view too! */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {['Academic', 'Sports', 'Culture', 'Holiday'].map(category => {
            const catEvents = events.filter(ev => {
              if (!ev.date) return false;
              const evDate = new Date(ev.date);
              return evDate.getFullYear() === year && evDate.getMonth() === month && (ev.category || 'Academic') === category;
            });
            return (
              <div key={category} className="border border-slate-200 p-3 rounded-lg text-center bg-slate-50/50">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{category}</span>
                <p className="text-lg font-black mt-1 text-slate-800">{catEvents.length}</p>
              </div>
            );
          })}
        </div>

        {/* Events List Table */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-400 text-[9.5px] font-black uppercase tracking-wider text-slate-500">
              <th className="py-2 pr-4 w-[120px]">Date</th>
              <th className="py-2 pr-4 w-[100px]">Category</th>
              <th className="py-2 pr-4 w-[160px]">Title</th>
              <th className="py-2 pr-4 w-[100px]">Time</th>
              <th className="py-2">Location & Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events
              .filter(ev => {
                if (!ev.date) return false;
                const evDate = new Date(ev.date);
                return evDate.getFullYear() === year && evDate.getMonth() === month;
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(event => (
                <tr key={`print-${event.id}`} className="text-xs align-top">
                  <td className="py-3.5 pr-4 font-bold text-slate-900">{event.date}</td>
                  <td className="py-3.5 pr-4 font-black uppercase tracking-wider text-slate-400 text-[8.5px]">{event.category || 'Academic'}</td>
                  <td className="py-3.5 pr-4 font-bold text-slate-800">{event.title}</td>
                  <td className="py-3.5 pr-4 text-slate-600 uppercase font-bold text-[9px]">{event.startTime === 'All Day' ? 'All Day' : event.startTime}</td>
                  <td className="py-3.5 text-slate-600">
                    {event.location && (
                      <p className="font-bold text-slate-700 text-[9px] uppercase tracking-wide mb-1">{event.location}</p>
                    )}
                    <p className="leading-relaxed text-slate-500">{event.description || 'No additional details provided.'}</p>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">
          Generated Automatically via Google Workspace Integration Portal • Teacher Planner Printout
        </div>
      </div>
    </>
  );
}

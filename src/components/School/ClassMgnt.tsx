import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  School, 
  User, 
  Home, 
  Filter, 
  UserPlus, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ClassRoom } from '@/src/types';

interface ExtendedClassRoom extends ClassRoom {
  enrolledCount: number;
  capacity: number;
}

export function ClassMgnt() {
  const [gradeLevels] = useState([
    { id: 'G10', name: 'Grade 10' },
    { id: 'G11', name: 'Grade 11' },
    { id: 'G12', name: 'Grade 12' }
  ]);

  const [teachers, setTeachers] = useState([
    { id: 'T001', name: 'Mr. Chantha' },
    { id: 'T002', name: 'Ms. Sophea' },
    { id: 'T003', name: 'Dr. John Doe' },
    { id: 'T004', name: 'Mrs. Emily Smith' },
    { id: 'T005', name: 'Ms. Kunthea' }
  ]);

  const [classes, setClasses] = useState<ExtendedClassRoom[]>([
    { id: '1', name: 'G10-A (Mathematics)', gradeLevelId: 'G10', roomId: 'R101', teacherId: 'T001', academicYear: '2026-2027', status: 'active', enrolledCount: 28, capacity: 30 },
    { id: '2', name: 'G12-B (Physics)', gradeLevelId: 'G12', roomId: 'R201', teacherId: 'T005', academicYear: '2026-2027', status: 'active', enrolledCount: 15, capacity: 25 },
    { id: '3', name: 'G11-A (Chemistry)', gradeLevelId: 'G11', roomId: 'R102', teacherId: 'T002', academicYear: '2026-2027', status: 'active', enrolledCount: 24, capacity: 25 },
    { id: '4', name: 'G10-B (History)', gradeLevelId: 'G10', roomId: 'R103', teacherId: 'T004', academicYear: '2026-2027', status: 'active', enrolledCount: 18, capacity: 20 },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [activeQuickAssignClassId, setActiveQuickAssignClassId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for creating classes
  const [newClassName, setNewClassName] = useState('');
  const [newYear, setNewYear] = useState('2026-2027');
  const [newGradeLevel, setNewGradeLevel] = useState('G10');
  const [newRoomId, setNewRoomId] = useState('R101');
  const [newTeacherId, setNewTeacherId] = useState('T001');
  const [newCapacity, setNewCapacity] = useState(25);
  const [newEnrolled, setNewEnrolled] = useState(0);

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      alert("Please specify a class name.");
      return;
    }

    const created: ExtendedClassRoom = {
      id: String(Date.now()),
      name: newClassName,
      gradeLevelId: newGradeLevel,
      roomId: newRoomId,
      teacherId: newTeacherId,
      academicYear: newYear,
      status: 'active',
      enrolledCount: Math.min(newEnrolled, newCapacity),
      capacity: newCapacity
    };

    setClasses(prev => [created, ...prev]);
    setIsAdding(false);
    
    // Reset form
    setNewClassName('');
    setNewCapacity(25);
    setNewEnrolled(0);

    setNotification(`Successfully registered "${created.name}" class!`);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove the class room ${name}?`)) {
      setClasses(prev => prev.filter(c => c.id !== id));
      setNotification(`Class "${name}" has been removed.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredClasses = classes.filter(cls => {
    if (selectedGradeFilter === 'all') return true;
    return cls.gradeLevelId === selectedGradeFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Management</h1>
          <p className="text-slate-500 text-sm">Create classes, assign teachers, and allocate rooms.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg transition-all font-semibold uppercase text-xs tracking-wider cursor-pointer",
            isAdding ? "bg-slate-200 text-slate-700" : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700 active:scale-95"
          )}
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? "Cancel" : "New Class"}
        </button>
      </div>

      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold shadow-sm"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </motion.div>
      )}

      {/* FILTER PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Filter By Grade:</span>
          <div className="relative">
            <Filter size={13} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="pl-8 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:border-slate-300 transition-all appearance-none"
            >
              <option value="all">All School Grade Levels</option>
              {gradeLevels.map(gl => (
                <option key={gl.id} value={gl.id}>{gl.name}</option>
              ))}
            </select>
            <div className="w-1.5 h-1.5 border-r border-b border-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 rotate-45 pointer-events-none" />
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-500">
          Showing <span className="text-blue-600 font-extrabold">{filteredClasses.length}</span> out of <span className="font-extrabold">{classes.length}</span> registered classes
        </div>
      </div>

      {isAdding && (
        <motion.form 
          onSubmit={handleCreateClass}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-bold"
        >
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Class Label / Name*</label>
            <input 
              type="text" 
              required
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              placeholder="e.g. G10-C Mathematics" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Academic Year</label>
            <select 
              value={newYear}
              onChange={e => setNewYear(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold"
            >
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grade Level*</label>
            <select 
              value={newGradeLevel}
              onChange={e => setNewGradeLevel(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold"
            >
              {gradeLevels.map(gl => (
                <option key={gl.id} value={gl.id}>{gl.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assign Teacher</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={newTeacherId}
                onChange={e => setNewTeacherId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Allot Room</label>
            <div className="relative">
              <Home size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={newRoomId}
                onChange={e => setNewRoomId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold"
              >
                <option value="R101">Room 101 (Floor 1)</option>
                <option value="R102">Room 102 (Floor 1)</option>
                <option value="R103">Room 103 (Floor 1)</option>
                <option value="R201">Lab 201 (Floor 2)</option>
                <option value="R202">Lab 202 (Floor 2)</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student Capacity</label>
            <input 
              type="number" 
              min={1}
              value={newCapacity}
              onChange={e => setNewCapacity(Math.max(1, Number(e.target.value)))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolled Students</label>
            <input 
              type="number" 
              min={0}
              value={newEnrolled}
              onChange={e => setNewEnrolled(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold" 
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4 flex items-end justify-end pt-4">
             <button 
               type="submit"
               className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all w-full md:w-auto uppercase text-xs tracking-wider cursor-pointer"
             >
               Save Class Registration
             </button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredClasses.map((cls) => {
            const isNearCapacity = cls.enrolledCount >= 0.9 * cls.capacity;
            const currentTeacher = teachers.find(t => t.id === cls.teacherId);

            return (
              <motion.div 
                key={cls.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between min-h-[300px]",
                  isNearCapacity 
                    ? "border-2 border-amber-500 shadow-xl shadow-amber-500/5 bg-amber-50/5" 
                    : "border border-slate-200"
                )}
              >
                {/* Visual warning dot or accent banner for 90%+ capacity */}
                {isNearCapacity && (
                  <div className="absolute top-0 inset-x-0 bg-amber-500 text-slate-950 px-4 py-1 text-[9px] font-black text-center uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse z-10">
                    <AlertTriangle size={11} />
                    90%+ Enrollment Capacity Limit Reached
                  </div>
                )}

                <div className="relative pt-3">
                  <div className="flex items-center justify-between mb-4">
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center border",
                       isNearCapacity 
                         ? "bg-amber-100/80 border-amber-200 text-amber-700" 
                         : "bg-blue-50 border-blue-105 text-blue-600"
                     )}>
                        <School size={22} className={isNearCapacity ? "animate-bounce" : ""} />
                     </div>
                     <div className="flex items-center gap-1.5 z-20">
                        {/* QUICK ASSIGN TEACHER BUTTON */}
                        <button 
                          onClick={() => setActiveQuickAssignClassId(activeQuickAssignClassId === cls.id ? null : cls.id)}
                          className={cn(
                            "p-2.5 rounded-xl transition-all cursor-pointer hover:scale-105",
                            activeQuickAssignClassId === cls.id 
                              ? "bg-blue-600 text-white" 
                              : "bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-150"
                          )}
                          title="Quick assign native teacher"
                        >
                          <UserPlus size={14} />
                        </button>
                        <button className="p-2 bg-slate-50 border border-slate-150 text-slate-400 hover:text-blue-600 rounded-xl transition-colors cursor-pointer hover:border-blue-100">
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClass(cls.id, cls.name)}
                          className="p-2 bg-slate-50 border border-slate-150 text-slate-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer hover:border-red-100"
                        >
                          <Trash2 size={13} />
                        </button>
                     </div>
                  </div>

                  <div className="space-y-2 text-left">
                     <h3 className="text-base font-black text-slate-900 line-clamp-1 uppercase tracking-tight">{cls.name}</h3>
                     <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400 font-black uppercase tracking-widest font-mono">CODE: {cls.gradeLevelId}</span>
                        <span className={cn(
                          "px-2.5 py-1 rounded-full font-black uppercase tracking-wider text-[9px] border",
                          cls.status === 'active' 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        )}>{cls.status}</span>
                     </div>
                  </div>

                  <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-50 text-left font-bold text-xs text-slate-600">
                     <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Teacher: <span className="text-slate-900 font-extrabold">{currentTeacher?.name || 'Unassigned'}</span></span>
                     </div>
                     <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Allotted Room: <span className="text-slate-900 font-extrabold">{cls.roomId}</span></span>
                     </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-50/80">
                   <div>
                     <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">Enrollment</p>
                     <p className={cn(
                       "text-xs font-mono font-black mt-1",
                       isNearCapacity ? "text-amber-600" : "text-slate-800"
                     )}>
                       {cls.enrolledCount} / {cls.capacity} Students 
                       <span className="text-[10px] font-medium font-sans text-slate-400 ml-1">
                         ({Math.round((cls.enrolledCount / cls.capacity) * 100)}%)
                       </span>
                     </p>
                   </div>
                   <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-wide cursor-pointer">View Roster</button>
                </div>

                {/* SLIDE-OVER QUICK REASSIGN TEACHER PANEL */}
                <AnimatePresence>
                  {activeQuickAssignClassId === cls.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[2rem] p-5 flex flex-col justify-between z-10 border border-blue-200 shadow-2xl text-left font-bold"
                    >
                      <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest">Instant Assignment</span>
                            <button 
                              onClick={() => setActiveQuickAssignClassId(null)} 
                              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
                            >
                               <X size={14} />
                            </button>
                         </div>
                         <p className="text-[10.5px] font-bold text-slate-500 leading-tight">
                           Select teacher for <span className="text-slate-900 font-extrabold">{cls.name}</span>
                         </p>
                         
                         <div className="space-y-1 mt-2 max-h-[170px] overflow-y-auto custom-scrollbar">
                           {teachers.map(teacher => (
                             <button
                               key={teacher.id}
                               onClick={() => {
                                 setClasses(classes.map(c => c.id === cls.id ? { ...c, teacherId: teacher.id } : c));
                                 setActiveQuickAssignClassId(null);
                                 setNotification(`Assigned ${teacher.name} to class: ${cls.name}`);
                                 setTimeout(() => setNotification(null), 4000);
                               }}
                               className={cn(
                                 "w-full text-left px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer",
                                 cls.teacherId === teacher.id 
                                   ? "bg-blue-50 text-blue-700 border border-blue-150" 
                                   : "hover:bg-slate-50 text-slate-700 border border-transparent"
                               )}
                             >
                               <span>{teacher.name}</span>
                               {cls.teacherId === teacher.id && (
                                 <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                               )}
                             </button>
                           ))}
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  User, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  Trophy, 
  History,
  Mic,
  MicOff
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Lesson {
  id: string;
  title: string;
  subject: string;
  classId: string;
  teacherId: string;
  date: string;
  status: 'planned' | 'submitted' | 'approved' | 'revision';
  evidence: {
    type: 'lesson_plan' | 'exercise' | 'test' | 'homework';
    name: string;
    url: string;
    submittedAt: string;
  }[];
  notes?: string;
}

const initialLessons: Lesson[] = [
  {
    id: 'L001',
    title: 'Algebra: Quadratic Equations',
    subject: 'Mathematics',
    classId: 'G10-A',
    teacherId: 'T001',
    date: '2026-05-12',
    status: 'approved',
    evidence: [
      { type: 'lesson_plan', name: 'quadratic_intro.pdf', url: '#', submittedAt: '2026-05-10' },
      { type: 'exercise', name: 'quad_worksheet_1.docx', url: '#', submittedAt: '2026-05-10' }
    ]
  },
  {
    id: 'L002',
    title: 'Newtonian Physics: Laws of Motion',
    subject: 'Physics',
    classId: 'G11-B',
    teacherId: 'T002',
    date: '2026-05-13',
    status: 'submitted',
    evidence: [
      { type: 'lesson_plan', name: 'lows_of_motion.pdf', url: '#', submittedAt: '2026-05-11' },
      { type: 'test', name: 'motion_quiz_midterm.pdf', url: '#', submittedAt: '2026-05-11' }
    ]
  }
];

export function TeacherCurriculumMgnt() {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [activeTab, setActiveTab ] = useState<'timeline' | 'submission' | 'audit'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Form input states
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Speech Recognition states
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<any>(null);

  const startSpeechRecognition = () => {
    setSpeechError('');
    setIsRecording(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Web Speech API is not supported in this browser. Please use Google Chrome or Apple Safari.');
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission has been denied. Allow camera/microphone in browser permissions to speak notes.');
        } else {
          setSpeechError(`Speech recognition error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setNewNotes(prev => {
          const space = prev ? ' ' : '';
          return prev + space + transcript;
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error(e);
      setSpeechError('Failed to initialize voice notes microphone listener loop.');
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAddLesson = () => {
    if (!newTitle || !newSubject || !newDate) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    const item: Lesson = {
      id: 'L00' + (lessons.length + 1),
      title: newTitle,
      subject: newSubject,
      classId: 'G10-A',
      teacherId: 'T001',
      date: newDate,
      status: 'planned',
      evidence: [],
      notes: newNotes
    };

    setLessons(prev => [item, ...prev]);
    setIsAddingLesson(false);
    // Reset fields
    setNewTitle('');
    setNewSubject('');
    setNewDate('');
    setNewNotes('');
  };

  // Simulate real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        setLastSync(new Date().toLocaleTimeString());
      }, 1500);
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    planned: 'bg-slate-100 text-slate-500',
    submitted: 'bg-blue-100 text-blue-600',
    approved: 'bg-emerald-100 text-emerald-600',
    revision: 'bg-rose-100 text-rose-600'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
            <BookOpen size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Curriculum & Evidence</h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
                <div className={cn("w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]", isSyncing && "animate-pulse")} />
                <span className="text-[8px] font-bold uppercase tracking-widest leading-none pt-0.5">{isSyncing ? "Syncing..." : "Live"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 font-bold text-sm tracking-tight italic">Lesson timelines, exercise submissions, and expert audit.</p>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <History size={10} />
                Last Sync: {lastSync}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              {[
                { id: 'timeline', icon: Calendar, label: 'Timeline' },
                { id: 'submission', icon: Upload, label: 'Submission' },
                { id: 'audit', icon: ShieldCheck, label: 'Audit' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === t.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
           </div>
           <button 
             onClick={() => setIsAddingLesson(true)}
             className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
           >
             <Plus size={16} />
             Add Lesson
           </button>
        </div>
      </div>

      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-6">
             <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <div className="flex items-center gap-4">
                      <div className="relative">
                         <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input 
                           type="text" 
                           placeholder="Search lessons..."
                           value={searchQuery}
                           onChange={e => setSearchQuery(e.target.value)}
                           className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                         />
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
                      <select className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-slate-600 cursor-pointer">
                         <option>All Subjects</option>
                         <option>Mathematics</option>
                         <option>Physics</option>
                      </select>
                   </div>
                </div>

                <div className="p-0">
                   <div className="divide-y divide-slate-100">
                      {filteredLessons.map(lesson => (
                        <div key={lesson.id} className="p-8 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                           <div className="flex items-center gap-8">
                              <div className="text-center shrink-0 w-16">
                                 <p className="text-[10px] font-black text-slate-400 uppercase">{lesson.date.split('-')[1]}</p>
                                 <p className="text-3xl font-black text-slate-900 italic leading-none">{lesson.date.split('-')[2]}</p>
                              </div>
                              <div className="h-12 w-px bg-slate-100" />
                              <div>
                                 <div className="flex items-center gap-3 mb-1">
                                    <span className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest", statusColors[lesson.status])}>
                                       {lesson.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lesson.subject} • {lesson.classId}</span>
                                 </div>
                                 <h3 className="text-lg font-black text-slate-900 uppercase italic leading-tight group-hover:text-indigo-600 transition-colors">{lesson.title}</h3>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-4">
                              <div className="flex items-center -space-x-2">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600">
                                    <User size={14} />
                                 </div>
                              </div>
                              <button 
                                onClick={() => setSelectedLesson(lesson)}
                                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-sm"
                              >
                                 <Eye size={18} />
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Trophy size={120} />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-2">Teaching Mastery</h3>
                <p className="text-indigo-300 text-xs font-bold leading-relaxed mb-6">Track your lesson completion rates and student feedback.</p>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Lessons</span>
                      <span className="text-xl font-black italic">42</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Completion Rate</span>
                      <span className="text-xl font-black italic text-emerald-400">92%</span>
                   </div>
                   <div className="w-full h-2 bg-indigo-800 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-indigo-400 w-[92%] rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                   <AlertCircle size={20} className="text-amber-500" />
                   <h4 className="font-black text-slate-900 uppercase italic">Awaiting Action</h4>
                </div>
                <div className="space-y-3">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase">Revise Evidence</p>
                         <p className="text-xs font-bold text-slate-900 italic">Grade 9 Physics Quiz</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'submission' && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-10">
           <div className="max-w-2xl mx-auto space-y-10 py-10">
              <div className="text-center space-y-2">
                 <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                    <Upload size={40} />
                 </div>
                 <h2 className="text-3xl font-black uppercase italic text-slate-900">Evidence Submission</h2>
                 <p className="text-slate-500 font-bold text-sm tracking-tight italic uppercase">Upload your teaching portfolio for review and archiving.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Lesson*</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 italic">
                       <option>Select a planned lesson...</option>
                       {lessons.filter(l => l.status === 'planned').map(l => (
                         <option key={l.id}>{l.title}</option>
                       ))}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Evidence Type*</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 italic">
                       <option value="lesson_plan">Lesson Plan</option>
                       <option value="exercise">Exercise/Worksheet</option>
                       <option value="test">Test/Exam Paper</option>
                       <option value="homework">Student Homework Sample</option>
                    </select>
                 </div>
              </div>

              <div className="border-4 border-dashed border-slate-100 rounded-[3rem] p-16 flex flex-col items-center justify-center gap-6 group hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer">
                 <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                    <Plus size={48} />
                 </div>
                 <div className="text-center">
                    <p className="text-sm font-black text-slate-900 uppercase italic">Drag & Drop Evidence Files</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, DOCX, JPEG or Sheets accepted (Max 50MB)</p>
                 </div>
              </div>

              <button className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                 <CheckCircle2 size={24} />
                 Submit Evidence for Review
              </button>
           </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
           <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-black uppercase italic text-slate-900 leading-none mb-1">Academic Audit Queue</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verify teaching evidence & quality standards</p>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Pending Audits</p>
                    <p className="text-2xl font-black text-slate-900 italic">08</p>
                 </div>
                 <div className="h-10 w-px bg-slate-200" />
                 <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                    <History size={20} />
                 </button>
              </div>
           </div>

           <div className="p-0 divide-y divide-slate-100">
              {lessons.filter(l => l.status === 'submitted').map(lesson => (
                <div key={lesson.id} className="p-10 hover:bg-slate-50/50 transition-all group">
                   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex items-start gap-6">
                         <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 shrink-0">
                            <FileText size={32} />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-2">
                               <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-black uppercase rounded-lg">Awaiting Audit</span>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lesson.subject} • {lesson.classId}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-tight">{lesson.title}</h3>
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase italic">
                                  <User size={14} className="text-indigo-500" />
                                  Teacher: Sopheak Pat
                               </div>
                               <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase italic">
                                  <Clock size={14} className="text-indigo-500" />
                                  Submitted: {lesson.date}
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-wrap gap-3 shrink-0">
                         {lesson.evidence.map((ev, i) => (
                           <div key={i} className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl group/ev cursor-pointer hover:border-indigo-400 transition-all">
                              <Paperclip size={14} className="text-slate-400 group-hover/ev:text-indigo-500" />
                              <span className="text-[10px] font-black uppercase text-slate-600 truncate max-w-[80px]">{ev.name}</span>
                           </div>
                         ))}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                         <button className="px-6 py-3 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 transition-all">Reject</button>
                         <button className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all">Approve</button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Lesson Detail / Add Modal */}
      <AnimatePresence>
         {(isAddingLesson || selectedLesson) && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
              >
                 <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-2xl font-black uppercase italic text-slate-900">
                       {isAddingLesson ? "Plan New Lesson" : "Lesson Overview"}
                    </h2>
                    <button 
                      onClick={() => { setIsAddingLesson(false); setSelectedLesson(null); }}
                      className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
                    >
                       <MoreVertical size={20} />
                    </button>
                 </div>
                 
                 <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {selectedLesson ? (
                      <div className="space-y-8 animate-in fade-in duration-300">
                         <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Lesson Goals & Objectives</label>
                            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 leading-relaxed text-left">
                               {selectedLesson.notes || "Establish fundamental concepts, complete whiteboard calculations, review weekly goals, and assign classroom problems."}
                            </div>
                         </div>
                         <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted Evidence</label>
                            <div className="grid grid-cols-1 gap-3">
                               {selectedLesson.evidence.map((ev, i) => (
                                 <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-500">
                                          <FileText size={20} />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black uppercase text-indigo-600">{ev.type}</p>
                                          <p className="text-sm font-bold text-slate-900">{ev.name}</p>
                                       </div>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Eye size={18} /></button>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                            <ShieldCheck size={24} className="text-emerald-600" />
                            <div>
                               <p className="text-sm font-black text-emerald-900 uppercase italic">Peer Review Passed</p>
                               <p className="text-[10px] font-bold text-emerald-700 opacity-80 mt-0.5 uppercase tracking-widest">Audited by Senior Academic Lead on 2026-05-11</p>
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in duration-300">
                         <div className="space-y-2 text-left">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Lesson Title*</label>
                           <input 
                             type="text" 
                             value={newTitle}
                             onChange={(e) => setNewTitle(e.target.value)}
                             className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-705 text-xs text-slate-700" 
                             placeholder="e.g. Introduction to Quantum Mechanics" 
                           />
                         </div>
                         <div className="grid grid-cols-2 gap-6 text-left">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Subject*</label>
                               <input 
                                 type="text" 
                                 value={newSubject}
                                 onChange={(e) => setNewSubject(e.target.value)}
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-705 text-xs text-slate-700" 
                                 placeholder="Mathematics" 
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Date*</label>
                               <input 
                                 type="date" 
                                 value={newDate}
                                 onChange={(e) => setNewDate(e.target.value)}
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-705 text-xs text-slate-700" 
                                />
                            </div>
                         </div>

                         <div className="space-y-2 text-left">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Notes & Objectives</label>
                              <div className="flex items-center gap-1.5">
                                {isRecording ? (
                                  <button 
                                    type="button"
                                    onClick={stopSpeechRecognition}
                                    className="px-2.5 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse transition-all shadow-sm"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block animate-ping"></span>
                                    Stop Voice
                                  </button>
                                ) : (
                                  <button 
                                    type="button"
                                    onClick={startSpeechRecognition}
                                    className="px-2.5 py-1 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-650 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                                  >
                                    <Mic size={10} className="text-indigo-650" />
                                    Record voice notes
                                  </button>
                                )}
                              </div>
                            </div>

                            <textarea 
                              rows={4}
                              value={newNotes}
                              onChange={(e) => setNewNotes(e.target.value)}
                              placeholder="Record live curriculum notes by clicking the mic, or type lesson details manually here..." 
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-slate-700 text-xs leading-relaxed"
                            />

                            {speechError && (
                              <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1.5 mt-1 leading-relaxed">
                                <AlertCircle size={12} className="shrink-0" />
                                <span>{speechError}</span>
                              </p>
                            )}

                            {isRecording && (
                              <p className="text-[9px] font-bold text-emerald-600 flex items-center gap-1.5 mt-1 leading-relaxed uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-bounce"></span>
                                Broadcasting Voice transcript live... Speak clearly.
                              </p>
                            )}
                         </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4">
                       <button onClick={() => { setIsAddingLesson(false); setSelectedLesson(null); }} className="flex-1 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">Close</button>
                       {isAddingLesson && (
                         <button onClick={handleAddLesson} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all">Schedule Lesson</button>
                       )}
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function Paperclip(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

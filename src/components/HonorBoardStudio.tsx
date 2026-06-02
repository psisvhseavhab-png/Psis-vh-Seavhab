import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, GraduationCap, Calendar, Printer, Search, Download, 
  Sparkles, Check, RefreshCw, Eye, EyeOff, User, Settings,
  MapPin, CheckCircle, ChevronDown, Image as ImageIcon, Trash2, Edit2
} from 'lucide-react';
import { mockStudents } from '../data/mockStudents';
import { studentService } from '../services/studentService';
import { cn } from '@/src/lib/utils';

// High-quality school student avatars (Unsplash) to represent Cambodian outstanding students elegantly
const COMPLIANT_AVATARS: Record<string, string> = {
  // G11 Matching
  'VH000053': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&q=80', // Mao Lyhong - school boy
  'VH000048': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&q=80', // Ouk Rothvisal - boy portrait
  'VH000648': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&q=80', // Sea Sodavann Nearyrathanak - female portrait
  'VH000050': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&q=80', // Ros Puthpisey - female school portrait
  'VH000799': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80', // Sreng Mouylorng - female profile
  
  // G10A Matching
  'VH001079': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop&q=80',
  'VH000835': 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=500&fit=crop&q=80',
  'VH000083': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&q=80',
  'VH001117': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80', // male
  'VH000067': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
  
  // Default Boys and Girls Portals
  'boy_1': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=500&fit=crop&q=80',
  'boy_2': 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&h=500&fit=crop&q=80',
  'girl_1': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop&q=80',
  'girl_2': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&q=80',
};

const DEFAULT_BG_WATERMARK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' stroke='%233b82f6' stroke-width='0.5' fill='none' opacity='0.08'/></svg>";

export const HonorBoardStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'students' | 'seal'>('settings');
  const [selectedClass, setSelectedClass] = useState<string>('G11');
  const [monthKh, setMonthKh] = useState<string>('មេសា');
  const [monthEn, setMonthEn] = useState<string>('April');
  const [academicYear, setAcademicYear] = useState<string>('២០២៥-២០២៦');
  const [academicYearEn, setAcademicYearEn] = useState<string>('2025-2026');
  const [gradeLevelDisplay, setGradeLevelDisplay] = useState<string>('ថ្នាក់ទី ១១');
  const [layoutStyle, setLayoutStyleStyle] = useState<'3-ranks' | '5-ranks'>('5-ranks');
  
  // Custom wording states based on the images uploads
  const [schoolHeaderKh, setSchoolHeaderKh] = useState<string>('សាលាបញ្ញាសាស្ត្រអន្តរជាតិ - វណ្ណហុង');
  const [schoolHeaderEn, setSchoolHeaderEn] = useState<string>('Paññāsāstra International School - Van Hong');
  const [motto1, setMotto1] = useState<{kh: string, en: string}>({ kh: 'វិន័យ', en: 'Discipline' });
  const [motto2, setMotto2] = useState<{kh: string, en: string}>({ kh: 'គុណធម៌', en: 'Virtue' });
  const [motto3, setMotto3] = useState<{kh: string, en: string}>({ kh: 'សុភមង្គល', en: 'Happiness' });
  const [boardTitleKh, setBoardTitleKh] = useState<string>('តារាងកិត្តិយស');

  // Signature configurations
  const [directorSealEnabled, setDirectorSealEnabled] = useState<boolean>(true);
  const [teacherSignatureEnabled, setTeacherSignatureEnabled] = useState<boolean>(true);
  const [principalName, setPrincipalName] = useState<string>('ឌី វណ្ណហុង');
  const [teacherName, setTeacherName] = useState<string>('ពេជ្រ សុវណ្ណ');
  const [issueDateKh, setIssueDateKh] = useState<string>('ថ្ងៃពុធ ៥រោច ខែពិសាខ ឆ្នាំខាល អដ្ឋស័ក ព.ស.២៥៧០');
  const [issueDateLocationKh, setIssueDateLocationKh] = useState<string>('រាជធានីភ្នំពេញ ថ្ងៃទី៦ ខែឧសភា ឆ្នាំ២០២៦');

  // Local student assignments for slots 1-5
  const [rankings, setRankings] = useState<Array<{
    rank: number;
    studentId: string;
    name: string;
    nameKh: string;
    gender: string;
    profilePic: string;
  }>>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number>(0.65);
  const printRef = useRef<HTMLDivElement>(null);

  // Auto assign outstanding students from selected class
  const autoAssignStudents = (className: string) => {
    const selectedList = studentService.getTopStudentsForClass(className);
    
    const updatedRankings = Array.from({ length: 5 }, (_, i) => {
      const student = selectedList[i];
      if (student) {
        let avatar = student.profilePic || COMPLIANT_AVATARS[student.id];
        if (!avatar) {
          avatar = student.gender === 'Female' 
            ? COMPLIANT_AVATARS[`girl_${(i % 2) + 1}`] 
            : COMPLIANT_AVATARS[`boy_${(i % 2) + 1}`];
        }
        return {
          rank: i + 1,
          studentId: student.id,
          name: student.name,
          nameKh: student.nameKh || student.name,
          gender: student.gender,
          profilePic: avatar,
          gpa: student.gpa,
          avgScore: student.avgScore,
        };
      } else {
        // Mock fallback placeholders
        const isFemale = i % 2 === 0;
        return {
          rank: i + 1,
          studentId: `VH-MOCK-0${i}`,
          name: isFemale ? 'Sok Sorida' : 'Chea Champa',
          nameKh: isFemale ? 'សុខ សូរីដា' : 'ជា ចម្បា',
          gender: isFemale ? 'Female' : 'Male',
          profilePic: isFemale ? COMPLIANT_AVATARS['girl_1'] : COMPLIANT_AVATARS['boy_1'],
          gpa: 3.84,
          avgScore: 92.2,
        };
      }
    });

    setRankings(updatedRankings as any);
  };

  // Run auto assignment when class changes
  useEffect(() => {
    autoAssignStudents(selectedClass);
    // Auto update grade level Khmer text as helper
    if (selectedClass === 'G10A') setGradeLevelDisplay('ថ្នាក់ទី ១០ "ក"');
    else if (selectedClass === 'G11') setGradeLevelDisplay('ថ្នាក់ទី ១១');
    else if (selectedClass === 'G12') setGradeLevelDisplay('ថ្នាក់ទី ១២ "វិទ្យាសាស្ត្រ"');
    else if (selectedClass === 'G7A') setGradeLevelDisplay('ថ្នាក់ទី ៧ "ក"');
  }, [selectedClass]);

  // Handle manual replacement of a student slot
  const selectStudentForSlot = (student: any, slotIndex: number) => {
    setRankings(prev => {
      const updated = [...prev];
      let avatar = student.profilePic || COMPLIANT_AVATARS[student.id];
      if (!avatar) {
        avatar = student.gender === 'Female' 
          ? COMPLIANT_AVATARS['girl_1'] 
          : COMPLIANT_AVATARS['boy_1'];
      }
      updated[slotIndex] = {
        rank: slotIndex + 1,
        studentId: student.id,
        name: student.name,
        nameKh: student.nameKh || student.name,
        gender: student.gender,
        profilePic: avatar,
      };
      return updated;
    });
    setActiveSlotIndex(null);
  };

  // Print function
  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    if (printContent) {
      window.print();
    }
  };

  // Helper dictionary of classes in mock data
  const uniqueClasses = ['G10A', 'G11', 'G12', 'G7A'];

  // Traditional Khmer/English Month pairs options
  const monthOptions = [
    { kh: 'មេសា', en: 'April' },
    { kh: 'ឧសភា', en: 'May' },
    { kh: 'មិថុនា', en: 'June' },
    { kh: 'កក្កដា', en: 'July' },
    { kh: 'សីហា', en: 'August' },
    { kh: 'កញ្ញា', en: 'September' },
    { kh: 'តុលា', en: 'October' },
    { kh: 'វិច្ឆិកា', en: 'November' },
    { kh: 'ធ្នូ', en: 'December' },
    { kh: 'មករា', en: 'January' },
    { kh: 'កុម្ភៈ', en: 'February' },
    { kh: 'មីនា', en: 'March' },
  ];

  return (
    <div id="honor-board-studio" className="flex h-[calc(100vh-140px)] bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl relative text-white">
      {/* 1. Left Action Toolbar */}
      <div className="w-20 bg-slate-950 flex flex-col items-center py-8 gap-6 border-r border-slate-800">
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all group",
            activeTab === 'settings' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
          )}
        >
          <Settings size={22} />
          <div className="absolute left-16 bg-slate-950 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
            Certificate Settings
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('students')}
          className={cn(
            "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all group",
            activeTab === 'students' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
          )}
        >
          <GraduationCap size={22} />
          <div className="absolute left-16 bg-slate-950 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
            Select Top Students
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('seal')}
          className={cn(
            "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all group",
            activeTab === 'seal' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
          )}
        >
          <Award size={22} />
          <div className="absolute left-16 bg-slate-950 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
            Signatures & Seals
          </div>
        </button>

        <div className="mt-auto flex flex-col gap-4 mb-4">
          <button 
            onClick={() => setZoom(prev => Math.min(prev + 0.05, 1.2))}
            className="p-3 text-slate-400 hover:text-white transition-colors"
            title="Zoom In"
          >
            <Sparkles size={18} />
          </button>
          <button 
            onClick={() => setZoom(prev => Math.max(prev - 0.05, 0.45))}
            className="p-3 text-slate-400 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* 2. Side Panel Properties Sheet */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden text-left">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="text-yellow-400 animate-pulse" size={18} />
                Honor Studio
              </h2>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Paññāsāstra Certificate Automation</p>
            </div>
            <div className="px-2 py-0.5 bg-yellow-400/10 rounded border border-yellow-400/20 text-[8px] font-black text-yellow-400 uppercase tracking-widest">
              Live
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
          {/* TAB 1: Certificate & School Customization */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Academic Core Class</label>
                <div className="grid grid-cols-4 gap-2">
                  {uniqueClasses.map(cls => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={cn(
                        "py-2 rounded-xl text-[11px] font-black tracking-wider transition-all border",
                        selectedClass === cls 
                          ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/50" 
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
                      )}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Layout Configuration</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl">
                  <button 
                    onClick={() => setLayoutStyleStyle('5-ranks')}
                    className={cn(
                      "py-2 rounded-lg text-[10px] font-black uppercase transition-all tracking-wider",
                      layoutStyle === '5-ranks' ? "bg-slate-800 text-yellow-400 shadow" : "text-slate-400 hover:text-white"
                    )}
                  >
                    5 Students Rank
                  </button>
                  <button 
                    onClick={() => setLayoutStyleStyle('3-ranks')}
                    className={cn(
                      "py-2 rounded-lg text-[10px] font-black uppercase transition-all tracking-wider",
                      layoutStyle === '3-ranks' ? "bg-slate-800 text-yellow-400 shadow" : "text-slate-400 hover:text-white"
                    )}
                  >
                    3 Students Rank
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Display Grade Label (Khmer)</label>
                <input 
                  type="text" 
                  value={gradeLevelDisplay} 
                  onChange={e => setGradeLevelDisplay(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="ថ្នាក់ទី ១១"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Select Evaluation Month</label>
                <div className="relative">
                  <select
                    value={monthKh}
                    onChange={e => {
                      const selected = monthOptions.find(o => o.kh === e.target.value);
                      if (selected) {
                        setMonthKh(selected.kh);
                        setMonthEn(selected.en);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none text-white appearance-none"
                  >
                    {monthOptions.map(opt => (
                      <option key={opt.kh} value={opt.kh}>{opt.kh} / {opt.en}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Year Display (Khmer)</label>
                  <input 
                    type="text" 
                    value={academicYear} 
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Year Display (English)</label>
                  <input 
                    type="text" 
                    value={academicYearEn} 
                    onChange={e => setAcademicYearEn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">School Branding & Titles</h3>
                
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">School Name (Khmer)</label>
                  <input 
                    type="text" 
                    value={schoolHeaderKh} 
                    onChange={e => setSchoolHeaderKh(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-khmer font-black text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">School Name (English)</label>
                  <input 
                    type="text" 
                    value={schoolHeaderEn} 
                    onChange={e => setSchoolHeaderEn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Main Certificate Title</label>
                  <input 
                    type="text" 
                    value={boardTitleKh} 
                    onChange={e => setBoardTitleKh(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-khmer font-black text-[11px] text-red-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Students Slots Manual Selectors */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/40 rounded-2xl border border-blue-900/30 text-[11px]">
                <p className="text-slate-300 leading-relaxed font-medium">
                  Below are the top 3-5 students nominated for the <strong>{monthKh} / {monthEn} ({selectedClass})</strong> monthly honor roll board. Click on any slot to search & swap student assignments.
                </p>
                <button 
                  onClick={() => autoAssignStudents(selectedClass)}
                  className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 font-sans font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-md focus:ring"
                >
                  <RefreshCw size={12} className="animate-spin-once" />
                  Auto Recalculate Top 5
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <SectionHeader label="Student Slot Lineups" />
                
                {rankings.slice(0, layoutStyle === '3-ranks' ? 3 : 5).map((rank, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setActiveSlotIndex(activeSlotIndex === idx ? null : idx);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3",
                      activeSlotIndex === idx 
                        ? "bg-slate-800 border-yellow-500/50 shadow-md" 
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-750 hover:bg-slate-900"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-yellow-400/30 overflow-hidden flex items-center justify-center">
                      <img src={rank.profilePic} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded font-black font-sans">
                          Rank {rank.rank}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">ID: {rank.studentId}</span>
                      </div>
                      <h4 className="font-bold text-white truncate mt-1">{rank.nameKh}</h4>
                      <p className="text-[9px] text-slate-400 truncate font-mono">{rank.name}</p>
                    </div>
                    <Edit2 size={13} className="text-slate-400 group-hover:text-white shrink-0" />
                  </div>
                ))}
              </div>

              {/* Expandable Dialog search/select panel when a slot is active */}
              <AnimatePresence>
                {activeSlotIndex !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-3xl space-y-3 mt-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-black uppercase text-yellow-400 tracking-wider">
                        Swap Student for Rank {activeSlotIndex + 1}
                      </span>
                      <button 
                        onClick={() => setActiveSlotIndex(null)}
                        className="text-slate-401 hover:text-white font-black"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="relative">
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search student by name or ID..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-9 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    </div>

                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-850 custom-scrollbar pr-1">
                      {mockStudents
                        .filter(student => {
                          const query = searchQuery.toLowerCase();
                          return (
                            student.name.toLowerCase().includes(query) ||
                            (student.nameKh && student.nameKh.includes(query)) ||
                            student.id.toLowerCase().includes(query)
                          );
                        })
                        .slice(0, 15) // Limit view count for speed
                        .map(student => (
                          <div
                            key={student.id}
                            onClick={() => selectStudentForSlot(student, activeSlotIndex)}
                            className="py-2.5 px-2 hover:bg-slate-900 rounded-lg cursor-pointer transition-colors text-left flex items-center justify-between"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate text-[11px]">{student.nameKh || student.name}</div>
                              <div className="text-[9px] text-slate-400 font-mono mt-0.5">{student.class} • ID: {student.id}</div>
                            </div>
                            <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-310 select-none">
                              Select
                            </span>
                          </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* TAB 3: Principal & Teacher Signatures Configuration */}
          {activeTab === 'seal' && (
            <div className="space-y-5">
              <div>
                <SectionHeader label="Royal Date Wording" />
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Traditional Date Display (Khmer)</label>
                    <textarea 
                      rows={2}
                      value={issueDateKh} 
                      onChange={e => setIssueDateKh(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-khmer text-[10px] focus:ring-1 focus:ring-blue-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Location & Calendar Date (Khmer)</label>
                    <input 
                      type="text" 
                      value={issueDateLocationKh} 
                      onChange={e => setIssueDateLocationKh(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-khmer text-[10px] focus:ring-1 focus:ring-blue-500 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <SectionHeader label="Director/Principal Section" />
                  <button
                    onClick={() => setDirectorSealEnabled(!directorSealEnabled)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all tracking-wider border",
                      directorSealEnabled 
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    )}
                  >
                    {directorSealEnabled ? 'seal active' : 'no seal'}
                  </button>
                </div>
                
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Authorized Seal Director Name</label>
                  <input 
                    type="text" 
                    value={principalName} 
                    onChange={e => setPrincipalName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-khmer font-bold text-[11px] text-white"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">This prints custom administrative red stamp with authorization watermark signature overlay.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <SectionHeader label="Class Teacher Section" />
                  <button
                    onClick={() => setTeacherSignatureEnabled(!teacherSignatureEnabled)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all tracking-wider border",
                      teacherSignatureEnabled 
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    )}
                  >
                    {teacherSignatureEnabled ? 'signature active' : 'no signature'}
                  </button>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Class Teacher Name (Khmer)</label>
                  <input 
                    type="text" 
                    value={teacherName} 
                    onChange={e => setTeacherName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-khmer font-bold text-[11px] text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Studio bottom print control panel */}
        <div className="p-5 border-t border-slate-800 bg-slate-950 grid grid-cols-1 gap-3">
          <button 
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl text-[10.5px] font-black uppercase tracking-widest bg-yellow-500 text-slate-950 hover:bg-yellow-400 hover:scale-[1.01] active:scale-[0.99] font-sans flex items-center justify-center gap-2 transition-all shadow-xl shadow-yellow-995/10"
          >
            <Printer size={15} />
            Print Board / Save PDF
          </button>
        </div>
      </div>

      {/* 3. Certificate Live Canvas Viewer Area */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col justify-between">
        {/* Sub-header canvas controller */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 z-10 shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 font-sans">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Monthly Billboard Simulator</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1.5 font-sans">
              <button 
                onClick={() => setZoom(prev => Math.max(0.45, prev - 0.05))}
                className="p-1 hover:bg-slate-800 rounded"
              >
                ✕
              </button>
              <span className="px-3 text-[10px] font-black text-slate-300">{Math.round(zoom * 100)}% scale</span>
              <button 
                onClick={() => setZoom(prev => Math.min(1.2, prev + 0.05))}
                className="p-1 hover:bg-slate-800 rounded"
              >
                ＋
              </button>
            </div>
          </div>
        </div>

        {/* Big scrollable sandbox and scale render wrapper */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-12 scrollbar-hide bg-slate-950 relative">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #honor-print-canvas, #honor-print-canvas * {
                visibility: visible;
              }
              #honor-print-canvas {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                height: 100% !important;
                transform: none !important;
                box-shadow: none !important;
              }
            }
          `}</style>
          
          <motion.div 
            id="honor-print-canvas"
            ref={printRef}
            animate={{ scale: zoom }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="w-[840px] h-[1188px] bg-white text-slate-900 relative flex flex-col justify-between p-14 select-none shadow-2xl z-10 shrink-0"
            style={{
              transformOrigin: 'center center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              background: '#fefdfa',
              fontFamily: 'Inter, "Khmer Moul", "Preah Vihear", sans-serif'
            }}
          >
            {/* Elegant double-colored certificate borders (Outer RED, Inner BLUE) */}
            <div className="absolute inset-[4px] border-[5px] border-[#cb1e22]" />
            <div className="absolute inset-[15px] border-[2px] border-[#cb1e22]" />
            <div className="absolute inset-[24px] border-[12px] border-[#1d3c8c] flex flex-col justify-between" />
            <div className="absolute inset-[46px] border-[1.5px] border-[#e2ba5e]" />

            {/* Gorgeous Khmer traditional decorative corners */}
            <div className="absolute top-[32px] left-[32px] w-24 h-24 text-[#cb1e22] opacity-95">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full transform scale-x-100 scale-y-100">
                <path d="M10,10 L35,10 C20,15 15,20 10,35 Z C12,24 18,18 28,15 L10,10" />
                <path d="M10,10 L50,10 C25,20 20,25 10,50 C15,30 30,15 50,10" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="8" x2="60" y2="8" stroke="currentColor" strokeWidth="3" />
                <line x1="8" y1="8" x2="8" y2="60" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
            <div className="absolute top-[32px] right-[32px] w-24 h-24 text-[#cb1e22] opacity-95">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full transform -scale-x-100 scale-y-100">
                <path d="M10,10 L35,10 C20,15 15,20 10,35 Z C12,24 18,18 28,15 L10,10" />
                <path d="M10,10 L50,10 C25,20 20,25 10,50 C15,30 30,15 50,10" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="8" x2="60" y2="8" stroke="currentColor" strokeWidth="3" />
                <line x1="8" y1="8" x2="8" y2="60" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
            <div className="absolute bottom-[32px] left-[32px] w-24 h-24 text-[#cb1e22] opacity-95">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full transform scale-x-100 -scale-y-100">
                <path d="M10,10 L35,10 C20,15 15,20 10,35 Z C12,24 18,18 28,15 L10,10" />
                <path d="M10,10 L50,10 C25,20 20,25 10,50 C15,30 30,15 50,10" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="8" x2="60" y2="8" stroke="currentColor" strokeWidth="3" />
                <line x1="8" y1="8" x2="8" y2="60" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>
            <div className="absolute bottom-[32px] right-[32px] w-24 h-24 text-[#cb1e22] opacity-95">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full transform -scale-x-100 -scale-y-100">
                <path d="M10,10 L35,10 C20,15 15,20 10,35 Z C12,24 18,18 28,15 L10,10" />
                <path d="M10,10 L50,10 C25,20 20,25 10,50 C15,30 30,15 50,10" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="8" x2="60" y2="8" stroke="currentColor" strokeWidth="3" />
                <line x1="8" y1="8" x2="8" y2="60" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>

            {/* Circular Watermark Shield Logo Background in Center of certificate */}
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.035] w-[500px] h-[500px] pointer-events-none z-0">
              <img src="https://psisvh.vercel.app/logo.png" className="w-full h-full object-contain" />
            </div>

            {/* Inner Content Area */}
            <div className="relative z-10 flex flex-col justify-between h-full py-2 px-4">
              
              {/* STAGE A: TOP CROWN HEADLINE (Cambodian Kingdom Banner) */}
              <div className="text-center space-y-1.5 mt-2">
                <h3 className="text-[17px] font-black tracking-widest text-[#1d3c8c] font-khmer uppercase" style={{ fontFamily: '"Moul", "Khmer Moul", sans-serif' }}>
                  ព្រះរាជាណាចក្រកម្ពុជា
                </h3>
                <h4 className="text-[14px] font-bold tracking-wider text-[#cb1e22] font-khmer">
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </h4>
                {/* Traditional Blue and Gold royal anchor symbol */}
                <div className="flex items-center justify-center gap-2 py-0.5">
                  <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#e2ba5e]" />
                  <div className="text-[#1d3c8c] text-[15px] animate-pulse">✦ ⚓ ✦</div>
                  <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#e2ba5e]" />
                </div>
              </div>

              {/* STAGE B: SCHOOL INFORMATION (Logo and Banner names) */}
              <div className="flex items-center justify-between px-10 mt-1">
                {/* School Logo */}
                <div className="w-[85px] h-[85px] bg-[#fdfaf2] rounded-full p-1.5 border-4 border-[#1d3c8c] shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                  <img src="https://psisvh.vercel.app/logo.png" alt="School Logo" className="w-full h-full object-contain" />
                </div>

                {/* Schoold Header, Mottoes Align Right */}
                <div className="text-right flex-1 pl-6">
                  <h2 className="text-[19px] font-black tracking-normal text-[#1d3c8c] font-khmer uppercase" style={{ fontFamily: '"Moul", "Khmer Moul", sans-serif' }}>
                    {schoolHeaderKh}
                  </h2>
                  <h3 className="text-[13px] font-black text-[#cb1e22] tracking-wider uppercase font-sans mt-0.5 font-bold">
                    {schoolHeaderEn}
                  </h3>
                  
                  {/* Motto Row */}
                  <div className="flex justify-end gap-5 mt-2 text-[10px] font-bold text-slate-700">
                    <div className="text-center">
                      <span className="font-khmer text-[11px] block font-black text-[#1d3c8c] leading-none">{motto1.kh}</span>
                      <span className="text-[8.5px] text-[#cb1e22] font-mono leading-none">{motto1.en}</span>
                    </div>
                    <div className="text-center border-l border-slate-300 pl-4">
                      <span className="font-khmer text-[11px] block font-black text-[#1d3c8c] leading-none">{motto2.kh}</span>
                      <span className="text-[8.5px] text-[#cb1e22] font-mono leading-none">{motto2.en}</span>
                    </div>
                    <div className="text-center border-l border-slate-300 pl-4">
                      <span className="font-khmer text-[11px] block font-black text-[#1d3c8c] leading-none">{motto3.kh}</span>
                      <span className="text-[8.5px] text-[#cb1e22] font-mono leading-none">{motto3.en}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STAGE C: MAIN RED EXQUISITE HONOR ROLL HEADER */}
              <div className="text-center space-y-1">
                {/* Big decorative Title តារាងកិត្តិយស */}
                <div className="relative inline-block px-12 py-2">
                  <h1 className="text-[44px] font-black text-[#cb1e22] tracking-widest leading-none font-khmer text-shadow-gold" style={{ fontFamily: '"Moul", "Khmer Moul", sans-serif' }}>
                    {boardTitleKh}
                  </h1>
                </div>

                {/* Grade and Class Section displaying the active class in elegant circular banner */}
                <div className="inline-flex items-center justify-center px-8 py-1.5 bg-[#1d3c8c] rounded-full border-2 border-[#e2ba5e] text-white shadow-md">
                  <span className="text-[15px] font-black font-khmer tracking-wider uppercase">
                     {gradeLevelDisplay}
                  </span>
                </div>

                {/* Subtitle displays Month and Academic Year in Traditional Cambodia typography */}
                <p className="text-[13px] font-black text-[#1d3c8c] tracking-wide pt-1.5 font-khmer">
                  ប្រចាំ{monthKh === 'មេសា' ? 'ខែមេសា' : `ខែ${monthKh}`} ឆ្នាំសិក្សា {academicYear}
                </p>
                <p className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                  FOR THE MONTH OF {monthEn.toUpperCase()} • ACADEMIC YEAR {academicYearEn}
                </p>
              </div>

              {/* STAGE D: THE OUTSTANDING PYRAMID STUDENTS LAYOUT */}
              <div className="w-full flex-1 flex flex-col justify-center space-y-7 z-20 my-2">
                
                {/* 1. RANK 1: THE ELITE KING ROW */}
                <div className="flex justify-center">
                  {rankings[0] && (
                    <div 
                      onClick={() => setActiveTab('students')}
                      className="flex flex-col items-center group/p-card cursor-pointer relative"
                    >
                      {/* Decorative Gold crown / rank design above head */}
                      <div className="absolute -top-7 text-[#e2ba5e] animate-bounce z-25">
                        <svg viewBox="0 0 100 100" fill="currentColor" className="w-9 h-9">
                          <path d="M50,10 L65,35 L95,30 L80,60 L20,60 L5,30 L35,35 Z M20,70 L80,70 L80,80 L20,80 Z" />
                        </svg>
                      </div>

                      {/* Prominent Circular Double-Gold Profile Frame */}
                      <div className="w-[160px] h-[160px] bg-white rounded-full p-1 border-[6px] border-[#e2ba5e] shadow-2xl relative flex items-center justify-center overflow-hidden transition-all group-hover/p-card:scale-105 group-hover/p-card:border-[#1d3c8c]">
                        <img 
                          src={rankings[0].profilePic} 
                          alt={rankings[0].name} 
                          className="w-full h-full object-cover rounded-full" 
                        />
                      </div>

                      {/* Rank Label Badge "លេខ ១" - Golden Ribbon banner wrapping student's profile */}
                      <div className="relative -mt-6 z-30 w-[180px] text-center">
                        <div className="bg-[#cb1e22] text-white py-1.5 px-4 rounded border-2 border-[#e2ba5e] shadow-lg flex flex-col items-center justify-center gap-0.5">
                          <span className="text-[11px] font-black font-khmer text-yellow-300 leading-none">លេខ ១</span>
                          {rankings[0].gpa && (
                            <span className="text-[9px] font-sans font-black uppercase text-white mt-0.5">GPA: {rankings[0].gpa.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      {/* Student full Name below profile */}
                      <div className="text-center mt-2.5">
                        <h4 className="text-[14px] font-black text-[#1d3c8c] font-khmer tracking-tight line-clamp-1">{rankings[0].nameKh}</h4>
                        <p className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wide truncate">{rankings[0].name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. RANK 2 & RANK 3: THE ROYAL COURT FLANKS */}
                <div className="flex justify-center gap-24">
                  {/* Rank 2 (Left middle row) */}
                  {rankings[1] && (
                    <div 
                      onClick={() => setActiveTab('students')}
                      className="flex flex-col items-center group/p-card cursor-pointer relative"
                    >
                      <div className="w-[115px] h-[115px] bg-white rounded-full p-1 border-[4.5px] border-[#e2ba5e]/80 shadow-xl relative flex items-center justify-center overflow-hidden transition-all group-hover/p-card:scale-105 group-hover/p-card:border-[#1d3c8c]">
                        <img 
                          src={rankings[1].profilePic} 
                          className="w-full h-full object-cover rounded-full" 
                        />
                      </div>

                      <div className="relative -mt-5 z-30 w-[130px] text-center">
                        <div className="bg-[#1d3c8c] text-white py-1 px-3 rounded border border-[#e2ba5e] shadow-lg flex flex-col items-center justify-center gap-0.5">
                          <span className="text-[9.5px] font-black font-khmer text-yellow-300 leading-none">លេខ ២</span>
                          {rankings[1].gpa && (
                            <span className="text-[8px] font-sans font-black uppercase text-[#fcd34d]">GPA: {rankings[1].gpa.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-center mt-2">
                        <h4 className="text-[12px] font-bold text-[#1d3c8c] font-khmer tracking-tight line-clamp-1">{rankings[1].nameKh}</h4>
                        <p className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wide truncate">{rankings[1].name}</p>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 (Right middle row) */}
                  {rankings[2] && (
                    <div 
                      onClick={() => setActiveTab('students')}
                      className="flex flex-col items-center group/p-card cursor-pointer relative"
                    >
                      <div className="w-[115px] h-[115px] bg-white rounded-full p-1 border-[4.5px] border-[#e2ba5e]/80 shadow-xl relative flex items-center justify-center overflow-hidden transition-all group-hover/p-card:scale-105 group-hover/p-card:border-[#1d3c8c]">
                        <img 
                          src={rankings[2].profilePic} 
                          className="w-full h-full object-cover rounded-full" 
                        />
                      </div>

                      <div className="relative -mt-5 z-30 w-[130px] text-center">
                        <div className="bg-[#1d3c8c] text-white py-1 px-3 rounded border border-[#e2ba5e] shadow-lg flex flex-col items-center justify-center gap-0.5">
                          <span className="text-[9.5px] font-black font-khmer text-yellow-300 leading-none">លេខ ៣</span>
                          {rankings[2].gpa && (
                            <span className="text-[8px] font-sans font-black uppercase text-[#fcd34d]">GPA: {rankings[2].gpa.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-center mt-2">
                        <h4 className="text-[12px] font-bold text-[#1d3c8c] font-khmer tracking-tight line-clamp-1">{rankings[2].nameKh}</h4>
                        <p className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wide truncate">{rankings[2].name}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. RANK 4 & RANK 5: BASE FOUNDATIONS (Visible only in 5-rank layout) */}
                {layoutStyle === '5-ranks' && (
                  <div className="flex justify-center gap-24">
                    {/* Rank 4 (Bottom Left) */}
                    {rankings[3] && (
                      <div 
                        onClick={() => setActiveTab('students')}
                        className="flex flex-col items-center group/p-card cursor-pointer relative"
                      >
                        <div className="w-[100px] h-[100px] bg-white rounded-full p-1 border-[4px] border-[#e2ba5e]/70 shadow-lg relative flex items-center justify-center overflow-hidden transition-all group-hover/p-card:scale-105 group-hover/p-card:border-[#1d3c8c]">
                          <img 
                            src={rankings[3].profilePic} 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        </div>

                        <div className="relative -mt-4.5 z-30 w-[115px] text-center">
                          <div className="bg-[#1d3c8c] text-white py-1 px-2.5 rounded border border-[#e2ba5e] shadow-lg flex flex-col items-center justify-center gap-0.5">
                            <span className="text-[8.5px] font-black font-khmer text-yellow-300 leading-none">លេខ ៤</span>
                            {rankings[3].gpa && (
                              <span className="text-[7.5px] font-sans font-black uppercase text-[#fcd34d]">GPA: {rankings[3].gpa.toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-center mt-2">
                          <h4 className="text-[11px] font-bold text-[#1d3c8c] font-khmer tracking-tight line-clamp-1">{rankings[3].nameKh}</h4>
                          <p className="text-[7.5px] font-mono text-slate-500 font-bold uppercase tracking-wide truncate">{rankings[3].name}</p>
                        </div>
                      </div>
                    )}

                    {/* Rank 5 (Bottom Right) */}
                    {rankings[4] && (
                      <div 
                        onClick={() => setActiveTab('students')}
                        className="flex flex-col items-center group/p-card cursor-pointer relative"
                      >
                        <div className="w-[100px] h-[100px] bg-white rounded-full p-1 border-[4px] border-[#e2ba5e]/70 shadow-lg relative flex items-center justify-center overflow-hidden transition-all group-hover/p-card:scale-105 group-hover/p-card:border-[#1d3c8c]">
                          <img 
                            src={rankings[4].profilePic} 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        </div>

                        <div className="relative -mt-4.5 z-30 w-[115px] text-center">
                          <div className="bg-[#1d3c8c] text-white py-1 px-2.5 rounded border border-[#e2ba5e] shadow-lg flex flex-col items-center justify-center gap-0.5">
                            <span className="text-[8.5px] font-black font-khmer text-yellow-300 leading-none">លេខ ៥</span>
                            {rankings[4].gpa && (
                              <span className="text-[7.5px] font-sans font-black uppercase text-[#fcd34d]">GPA: {rankings[4].gpa.toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-center mt-2">
                          <h4 className="text-[11px] font-bold text-[#1d3c8c] font-khmer tracking-tight line-clamp-1">{rankings[4].nameKh}</h4>
                          <p className="text-[7.5px] font-mono text-slate-500 font-bold uppercase tracking-wide truncate">{rankings[4].name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STAGE E: EXCLUSIVELY DESIGNED SIGNATURES & STAMPS FOOTER */}
              <div className="w-full grid grid-cols-2 mt-2 px-10 text-[10px] text-slate-800 z-30 relative pt-4 border-t border-slate-100 pb-2">
                {/* Director Side with red stamping */}
                <div className="text-left flex flex-col justify-between h-[125px] relative">
                  <div>
                    <h5 className="font-khmer font-black text-[10.5px] text-[#1d3c8c]">បានឃើញ និងឯកភាព</h5>
                    <h6 className="font-khmer font-medium text-[9.5px] text-slate-500 mt-0.5">នាយកសាលា</h6>
                  </div>

                  {/* Red stamp & Signature overlay */}
                  {directorSealEnabled && (
                    <div className="absolute top-5 left-2 w-32 h-32 pointer-events-none select-none z-10 flex items-center justify-center">
                      {/* Classic red circular stamp circle */}
                      <div className="w-24 h-24 rounded-full border-4 border-red-600/85 absolute flex items-center justify-center text-center p-1 font-bold select-none opacity-80"
                        style={{
                          transform: 'rotate(-5deg)',
                          borderColor: '#dc2626',
                          color: '#dc2626'
                        }}
                      >
                        <div className="w-[82px] h-[82px] rounded-full border border-dashed border-red-600/85 flex flex-col items-center justify-center relative">
                          {/* Top arch curved text */}
                          <svg className="absolute w-full h-full -top-1" viewBox="0 0 100 100">
                            <path id="curve" d="M 12,50 A 38,38 0 1,1 88,50" fill="transparent" />
                            <text className="font-sans font-black text-[5.5px] fill-red-600 uppercase tracking-widest leading-none">
                              <textPath href="#curve" startOffset="50%" textAnchor="middle">
                                PSIS VAN HONG
                              </textPath>
                            </text>
                          </svg>

                          {/* Center stamp symbol (Star or Emblem) */}
                          <div className="text-red-600 text-xs font-black z-10">★ ⚓ ★</div>
                          <div className="text-red-600 text-[6px] font-black tracking-wider uppercase mt-1 z-10">APPROVED</div>

                          {/* Bottom arch curved text */}
                          <svg className="absolute w-full h-full top-1" viewBox="0 0 100 100">
                            <path id="curve-bottom" d="M 88,50 A 38,38 0 1,1 12,50" fill="transparent" />
                            <text className="font-sans font-black text-[5.2px] fill-red-600 tracking-wider">
                              <textPath href="#curve-bottom" startOffset="50%" textAnchor="middle">
                                DIRECTORS OFFICE
                              </textPath>
                            </text>
                          </svg>
                        </div>
                      </div>

                      {/* Transparent realistic signature pen gesture overlaying stamp */}
                      <div className="absolute top-9 left-4 z-20 text-blue-600 opacity-90 select-none transform rotate-[-8deg]" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))' }}>
                        <svg className="w-20 h-12" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M10,25 C25,12 40,38 55,18 C70,-2 80,45 92,12" />
                          <path d="M35,28 L65,28" strokeLinecap="round" strokeWidth="1.5" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Director identity Name */}
                  <div className="mt-auto">
                    <span className="font-khmer font-black text-[#1d3c8c] text-[10.5px]" style={{ fontFamily: '"Moul", "Khmer Moul", sans-serif' }}>
                      {principalName}
                    </span>
                  </div>
                </div>

                {/* Class Teacher Side */}
                <div className="text-right flex flex-col justify-between h-[125px] relative items-end">
                  <div className="text-right">
                    <h5 className="font-khmer text-slate-500 text-[8.5px] font-medium italic">{issueDateKh}</h5>
                    <h6 className="font-khmer text-[#1d3c8c] text-[9.5px] font-bold mt-1">{issueDateLocationKh}</h6>
                    <h6 className="font-khmer text-slate-501 text-[10px] font-black mt-2">គ្រូប្រចាំថ្នាក់</h6>
                  </div>

                  {/* Teacher signature overlay */}
                  {teacherSignatureEnabled && (
                    <div className="absolute bottom-6 right-8 text-blue-700 opacity-80 z-20 select-none transform rotate-3 scale-95" style={{ filter: 'drop-shadow(1px 1.5px 1px rgba(0,0,0,0.08))' }}>
                      <svg className="w-20 h-10" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M5,40 C20,38 35,5 38,10 C42,20 22,48 50,42 C70,38 85,25 95,30" />
                        <path d="M10,42 Q30,22 80,42" strokeWidth="1.2" strokeDasharray="3 3" />
                      </svg>
                    </div>
                  )}

                  {/* Teacher's Name */}
                  <div className="mt-auto">
                    <span className="font-khmer font-black text-[#1d3c8c] text-[11px]" style={{ fontFamily: '"Moul", "Khmer Moul", sans-serif' }}>
                      {teacherName}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>

        {/* Board building instructions */}
        <div className="h-10 bg-slate-900 border-t border-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-sans tracking-wide">
          <span>💡 PRO TIP: Swap high-quality student portraits by browsing the student lineups. Print scale can be set via properties.</span>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ label }: { label: string }) => (
  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mb-2">{label}</h3>
);

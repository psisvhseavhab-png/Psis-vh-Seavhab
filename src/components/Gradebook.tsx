import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, ArrowUpDown, Filter, Save, FileText, ChevronDown, Trophy, Upload, X, Paperclip, ExternalLink, Trash2, Loader2, Plus, Award, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { jsPDF } from 'jspdf';

const subjects = ['Mathematics', 'Physics', 'History', 'English', 'Biology', 'Computer Science'];
const terms = ['Term 1', 'Term 2', 'Term 3'];

const initialStudents = [
  { id: 'ST001', name: 'John Smith', points: 150, grades: { 
    'Term 1': { Mathematics: 85, Physics: 92, History: 78, English: 88, Biology: 90, 'Computer Science': 85 },
    'Term 2': { Mathematics: 88, Physics: 90, History: 82, English: 85, Biology: 92, 'Computer Science': 88 },
    'Term 3': { Mathematics: 90, Physics: 94, History: 80, English: 90, Biology: 95, 'Computer Science': 92 },
  }},
  { id: 'ST003', name: 'Michael Brown', points: 120, grades: { 
    'Term 1': { Mathematics: 72, Physics: 68, History: 85, English: 70, Biology: 75, 'Computer Science': 80 },
    'Term 2': { Mathematics: 50, Physics: 45, History: 62, English: 52, Biology: 55, 'Computer Science': 58 }, // Significant >10% drop (75% to 54%)
    'Term 3': { Mathematics: 78, Physics: 72, History: 82, English: 75, Biology: 80, 'Computer Science': 85 },
  }},
  { id: 'ST006', name: 'Alice Parker', points: 280, grades: { 
    'Term 1': { Mathematics: 95, Physics: 98, History: 92, English: 96, Biology: 94, 'Computer Science': 100 },
    'Term 2': { Mathematics: 97, Physics: 99, History: 95, English: 98, Biology: 96, 'Computer Science': 98 },
    'Term 3': { Mathematics: 98, Physics: 100, History: 96, English: 99, Biology: 98, 'Computer Science': 100 },
  }},
  { id: 'ST009', name: 'David Lee', points: 85, grades: { 
    'Term 1': { Mathematics: 60, Physics: 55, History: 62, English: 58, Biology: 65, 'Computer Science': 60 },
    'Term 2': { Mathematics: 45, Physics: 40, History: 48, English: 42, Biology: 50, 'Computer Science': 52 }, // >10% drop (60% to 46%)
    'Term 3': { Mathematics: 65, Physics: 60, History: 65, English: 62, Biology: 68, 'Computer Science': 70 },
  }},
  { id: 'ST012', name: 'Kevin White', points: 140, grades: { 
    'Term 1': { Mathematics: 88, Physics: 84, History: 90, English: 82, Biology: 85, 'Computer Science': 80 },
    'Term 2': { Mathematics: 90, Physics: 86, History: 92, English: 85, Biology: 88, 'Computer Science': 82 },
    'Term 3': { Mathematics: 92, Physics: 88, History: 94, English: 88, Biology: 90, 'Computer Science': 85 },
  }},
];

// Calculate percentage decrease between consecutive terms to identify drop alert triggers (>10%)
const checkPerformanceDrop = (stObj: typeof initialStudents[0], currentTerm: string) => {
  if (currentTerm === 'Term 1') return { hasDrop: false, percent: 0 };
  const prevTermKey = currentTerm === 'Term 3' ? 'Term 2' : 'Term 1';
  
  const prevGrades = stObj.grades[prevTermKey as keyof typeof stObj.grades] as Record<string, number>;
  const currGrades = stObj.grades[currentTerm as keyof typeof stObj.grades] as Record<string, number>;
  
  if (!prevGrades || !currGrades) return { hasDrop: false, percent: 0 };
  
  const prevScores = Object.values(prevGrades);
  const currScores = Object.values(currGrades);
  
  if (prevScores.length === 0 || currScores.length === 0) return { hasDrop: false, percent: 0 };
  
  const prevAvg = prevScores.reduce((a, b) => a + b, 0) / prevScores.length;
  const currAvg = currScores.reduce((a, b) => a + b, 0) / currScores.length;
  
  const decreasePercent = prevAvg > 0 ? ((prevAvg - currAvg) / prevAvg) * 100 : 0;
  
  return {
    hasDrop: decreasePercent >= 10,
    percent: Math.round(decreasePercent * 10) / 10,
    prevAvg: Math.round(prevAvg * 10) / 10,
    currAvg: Math.round(currAvg * 10) / 10
  };
};

const calculateGPA = (scores: number[]) => {
  if (scores.length === 0) return "0.00";
  const points = scores.map(s => s >= 90 ? 4 : s >= 80 ? 3 : s >= 70 ? 2 : s >= 60 ? 1 : 0);
  return (points.reduce((a, b) => a + b, 0) / points.length).toFixed(2);
};

const calculateAverage = (scores: number[]) => {
  if (scores.length === 0) return 0;
  return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
};

interface GradebookProps {
  studentId?: string | null;
}

export function Gradebook({ studentId }: GradebookProps) {
  const [students, setStudents] = useState(initialStudents);
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [view, setView] = useState<'subject' | 'overall'>('subject');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Focus on student if ID is passed
  const displayStudents = React.useMemo(() => {
    if (!studentId) return students;
    // For smarter UX, we might want to move the selected student to the top
    const focused = students.filter(s => s.id === studentId);
    const others = students.filter(s => s.id !== studentId);
    return [...focused, ...others];
  }, [students, studentId]);

  // Dynamically calculate Top performing student by overall GPA
  const topStudent = React.useMemo(() => {
    if (students.length === 0) return null;
    const computed = students.map(s => {
      const allScores: number[] = [];
      Object.keys(s.grades).forEach(termKey => {
        const termData = s.grades[termKey as keyof typeof s.grades] as Record<string, number>;
        Object.values(termData).forEach(score => {
          allScores.push(score);
        });
      });
      const avg = calculateAverage(allScores);
      const gpa = parseFloat(calculateGPA(allScores));
      return { ...s, gpa, avg };
    });
    return computed.sort((a, b) => b.gpa - a.gpa || b.avg - a.avg)[0];
  }, [students]);

  const [resources, setResources] = useState<{ [key: string]: { name: string, type: 'exam' | 'homework' | 'test', url: string }[] }>({});
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const resourceInputRef = useRef<HTMLInputElement>(null);

  const handleResourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResource(true);
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      const type = file.name.toLowerCase().includes('exam') ? 'exam' : file.name.toLowerCase().includes('hw') ? 'homework' : 'test';
      setResources(prev => ({
        ...prev,
        [selectedSubject]: [...(prev[selectedSubject] || []), { name: file.name, type, url }]
      }));
      setIsUploadingResource(false);
    }, 1000);
  };

  const adjustPoints = (studentId: string, amount: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const newPoints = Math.max(0, (s.points || 0) + amount);
        try {
          import('../utils/activityLogger').then(({ logActivity }) => {
            logActivity(
              'grade_update',
              `Modified honor points for ${s.name} (${s.id}) by ${amount > 0 ? '+' : ''}${amount} (New: ${newPoints} pts)`,
              undefined,
              { studentId: s.id, change: amount, total: newPoints }
            );
          });
        } catch (e) {}
        return { ...s, points: newPoints };
      }
      return s;
    }));
  };

  const removeResource = (subject: string, index: number) => {
    setResources(prev => ({
      ...prev,
      [subject]: prev[subject].filter((_, i) => i !== index)
    }));
  };

  const updateGrade = (studentId: string, value: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        try {
          import('../utils/activityLogger').then(({ logActivity }) => {
            logActivity(
              'grade_update',
              `Updated ${selectedSubject} (${selectedTerm}) grade for ${s.name} to ${value}%`,
              undefined,
              { studentId: s.id, subject: selectedSubject, term: selectedTerm, score: value }
            );
          });
        } catch (e) {}
        return {
          ...s,
          grades: {
            ...s.grades,
            [selectedTerm]: {
              ...s.grades[selectedTerm as keyof typeof s.grades] as Record<string, number>,
              [selectedSubject]: value
            }
          }
        };
      }
      return s;
    }));
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header branding
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("PAÑÑĀSĀSTRA INTERNATIONAL SCHOOL", 105, 20, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text("ACADEMIC GRADEBOOK REPORT • VAN HONG CAMPUS", 105, 27, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(15, 33, 195, 33);

      doc.setFontSize(9);
      doc.setTextColor(110);
      doc.text(`Generated At: 2026-06-02 12:41:00 UTC`, 15, 41);
      doc.text(`Report: ${view === 'subject' ? `${selectedSubject} - ${selectedTerm}` : `Overall Summary - ${selectedTerm}`}`, 112, 41);

      // Draw standard table headers
      let y = 52;
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(15, y, 180, 8, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      
      if (view === 'subject') {
        doc.text("Student ID", 20, y + 5.5);
        doc.text("Student Name", 50, y + 5.5);
        doc.text("Subject Score", 120, y + 5.5);
        doc.text("Honor Points", 155, y + 5.5);
        y += 8;

        students.forEach((student, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(15, y, 180, 8, 'F');
          }
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(15, 23, 42);
          doc.text(student.id, 20, y + 5.5);
          doc.text(student.name, 50, y + 5.5);
          
          const termGrades = student.grades[selectedTerm as keyof typeof student.grades] as Record<string, number>;
          const score = termGrades[selectedSubject] ?? 0;
          
          doc.text(`${score}%`, 120, y + 5.5);
          doc.text(`${student.points || 0} pts`, 155, y + 5.5);
          
          y += 8;
        });
      } else {
        doc.text("Student ID", 17, y + 5.5);
        doc.text("Student Name", 42, y + 5.5);
        doc.text("Avg Score", 112, y + 5.5);
        doc.text("GPA", 142, y + 5.5);
        doc.text("Honor Points", 167, y + 5.5);
        y += 8;

        students.forEach((student, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(15, y, 180, 8, 'F');
          }
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(15, 23, 42);
          
          const termObj = student.grades[selectedTerm as keyof typeof student.grades] as Record<string, number>;
          const scores = Object.values(termObj || {});
          const avg = calculateAverage(scores);
          const gpa = calculateGPA(scores);

          doc.text(student.id, 17, y + 5.5);
          doc.text(student.name, 42, y + 5.5);
          doc.text(`${avg}%`, 112, y + 5.5);
          doc.text(gpa, 142, y + 5.5);
          doc.text(`${student.points || 0} pts`, 167, y + 5.5);
          y += 8;
        });
      }

      // Border bounds
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 52, 180, y - 52, 'D');

      // Signature & Stamp Placeholder
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.line(130, y + 25, 180, y + 25);
      doc.text("Director of Academics PSIS", 155, y + 30, { align: 'center' });

      // Save PDF
      doc.save(`psis_gradebook_report_${selectedTerm.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Failed to export gradebook report PDF.");
    }
  };

  const getTermScores = (student: typeof students[0], term: string): number[] => {
    const termGrades = student.grades[term as keyof typeof student.grades] as Record<string, number>;
    return Object.values(termGrades);
  };

  const currentTermGrades = students.map(s => {
    const termData = s.grades[selectedTerm as keyof typeof s.grades] as Record<string, number>;
    return termData[selectedSubject] || 0;
  });

  const classAvg = calculateAverage(currentTermGrades);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
          <div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-48"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-855 rounded-full w-96 mt-2"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-24"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32"></div>
            <div className="h-10 bg-slate-250 dark:bg-slate-750 rounded-xl w-28"></div>
          </div>
        </div>

        {/* 3 top statistical cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4 h-24">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
                <div className="h-5 bg-slate-250 dark:bg-slate-755 rounded-full w-14"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Grade grid table skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm animate-pulse space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-32"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-20"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-24"></div>
            </div>
          </div>

          <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-850 h-12 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
              <div className="h-4 bg-slate-250 dark:bg-slate-750 rounded-full w-20 mr-12"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-32 mr-12"></div>
              <div className="h-4 bg-slate-250 dark:bg-slate-750 rounded-full w-12 mr-12"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-12"></div>
            </div>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-16 flex items-center px-6 border-b border-slate-50 dark:border-slate-850 gap-12">
                <div className="h-4 bg-slate-150 dark:bg-slate-800 rounded-full w-16"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-750 rounded-full w-40"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-16"></div>
                <div className="h-4 bg-slate-150 dark:bg-slate-800 rounded-full w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic">Academic Gradebook</h1>
          <p className="text-slate-500 font-bold tracking-tight">Manage student performance and calculate real-time GPA.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setView('subject')}
            className={cn(
              "px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all",
              view === 'subject' ? "bg-slate-900 text-white shadow-xl" : "bg-white text-slate-400 border border-slate-200"
            )}
          >
            Subject View
          </button>
          <button 
            onClick={() => setView('overall')}
            className={cn(
              "px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all",
              view === 'overall' ? "bg-slate-900 text-white shadow-xl" : "bg-white text-slate-400 border border-slate-200"
            )}
          >
            Overall Results
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-700 hover:border-slate-400 text-white rounded-xl shadow-lg transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <FileText size={16} />
            PDF Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all font-black uppercase text-[10px] tracking-widest">
            <Save size={16} />
            Publish
          </button>
        </div>
      </div>

      {view === 'subject' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-6">
              <div className="flex flex-wrap gap-8">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 shadow-sm">
                       <GraduationCap size={24} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Term Period</label>
                       <select 
                         value={selectedTerm}
                         onChange={(e) => setSelectedTerm(e.target.value)}
                         className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer text-lg leading-none"
                       >
                         {terms.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 shadow-sm">
                       <FileText size={24} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Subject</label>
                       <select 
                         value={selectedSubject}
                         onChange={(e) => setSelectedSubject(e.target.value)}
                         className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer text-lg leading-none"
                       >
                         {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-6 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Average</span>
                   <span className="text-2xl font-black text-blue-600">{classAvg}%</span>
                </div>
                <div className="h-10 w-px bg-slate-100"></div>
                <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse font-bold">
                <thead>
                  <tr className="bg-slate-50/30 font-black">
                    <th className="px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Info</th>
                    <th className="px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100 w-40 text-center">Score (100)</th>
                    <th className="px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100 w-40 text-center">Points</th>
                    <th className="px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100 w-40 text-center">Grade</th>
                    <th className="px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">Submission</th>
                    <th className="px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayStudents.map((s, i) => {
                    const termData = s.grades[selectedTerm as keyof typeof s.grades] as Record<string, number>;
                    const score = termData[selectedSubject] || 0;
                    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
                    const gradeColor = grade === 'A' ? 'text-emerald-600' : grade === 'B' ? 'text-blue-600' : grade === 'C' ? 'text-amber-600' : 'text-rose-500';
                    const isFocused = s.id === studentId;

                    return (
                      <motion.tr 
                        key={s.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "hover:bg-slate-50/50 transition-colors group",
                          isFocused && "bg-blue-50 border-l-4 border-blue-600"
                        )}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-300 text-sm shadow-sm">
                              {s.id.replace('ST', '')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-slate-900">{s.name}</h4>
                                {(() => {
                                  const dropInfo = checkPerformanceDrop(s, selectedTerm);
                                  return dropInfo.hasDrop ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                                      <AlertCircle size={10} /> -{dropInfo.percent}% Alert
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <input 
                            type="number"
                            value={score}
                            onChange={(e) => updateGrade(s.id, parseInt(e.target.value) || 0)}
                            className="w-20 h-12 text-center bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          />
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <button 
                               onClick={() => adjustPoints(s.id, -10)}
                               className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-all"
                             >
                               -
                             </button>
                             <span className="text-sm font-black text-slate-900 w-12">{s.points || 0}</span>
                             <button 
                               onClick={() => adjustPoints(s.id, 10)}
                               className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-100 transition-all"
                             >
                               +
                             </button>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={cn("text-2xl font-black italic", gradeColor)}>{grade}</span>
                        </td>
                        <td className="px-8 py-6">
                          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl text-xs transition-all border border-transparent hover:border-blue-100">
                             <Paperclip size={14} />
                             <span>Upload HW</span>
                          </button>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                             <Save size={20} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
 
          <div className="space-y-6">
            {/* Top Student Honor Roll Card Board */}
            {topStudent && (
              <div className="bg-gradient-to-tr from-slate-900 to-slate-950 border border-amber-500/25 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                {/* Glowing gold backdrops */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-yellow-450/5 blur-[50px] rounded-full pointer-events-none" />
                
                {/* Title and top label */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-2">
                     <Trophy size={16} className="text-yellow-400 animate-pulse" />
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Monthly Honor Roll</span>
                  </div>
                  <div className="bg-amber-500 text-slate-950 text-[8px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow border border-yellow-200">
                     <Sparkles size={8} className="fill-slate-950 text-slate-950 animate-spin-once" />
                     <span>NO. 1 STAR</span>
                  </div>
                </div>

                {/* Main award presentation */}
                <div className="my-6 flex flex-col items-center text-center z-10 relative">
                  {/* Floating badge */}
                  <div className="absolute -top-6 text-yellow-400">
                    <Award size={24} className="stroke-[2.5] drop-shadow-[0_4px_12px_rgba(251,191,36,0.35)]" />
                  </div>
                  
                  {/* Beautiful big framed photo */}
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-[3.5px] border-amber-400 shadow-2xl overflow-hidden flex items-center justify-center my-2 scale-105">
                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-2xl font-black text-amber-400 uppercase italic">
                      {topStudent.name.charAt(0)}
                    </div>
                  </div>

                  <h4 className="text-base font-black text-yellow-300 mt-2 font-sans tracking-tight">{topStudent.name}</h4>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Honor Student • ID: {topStudent.id}</p>
                  
                  {/* Mini visual stats rows */}
                  <div className="mt-4 flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-2 backdrop-blur">
                    <div className="text-center">
                       <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest block">Combined GPA</span>
                       <span className="text-lg font-black text-yellow-400 font-mono">{topStudent.gpa}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="text-center">
                       <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest block">Class Avg</span>
                       <span className="text-lg font-black text-white font-mono">{topStudent.avg}%</span>
                    </div>
                  </div>
                </div>

                <div className="z-10 text-center text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-4">
                  Calculated automatically based on current term grades. Excellent student behavior.
                </div>
              </div>
            )}

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <FileText size={120} />
              </div>
              <h3 className="text-xl font-black uppercase italic mb-2">Subject Resources</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">Distribute exam papers, homework templates, and test rubrics.</p>
              
              <div className="space-y-3 mb-8">
                {(resources[selectedSubject] || []).length > 0 ? (
                  resources[selectedSubject].map((res, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md group/item"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          res.type === 'exam' ? "bg-rose-500/20 text-rose-400" : res.type === 'homework' ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                        )}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{res.type}</p>
                          <p className="text-sm font-bold text-white truncate max-w-[120px]">{res.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                         <button onClick={() => window.open(res.url, '_blank')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"><ExternalLink size={16} /></button>
                         <button onClick={() => removeResource(selectedSubject, idx)} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Upload size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest mt-2">No files uploaded yet</p>
                  </div>
                )}
              </div>

              <input 
                type="file" 
                className="hidden" 
                ref={resourceInputRef}
                onChange={handleResourceUpload}
              />
              <button 
                onClick={() => resourceInputRef.current?.click()}
                disabled={isUploadingResource}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                {isUploadingResource ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Upload New Material
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><Trophy size={20} /></div>
                  <h4 className="font-black text-slate-900 uppercase italic">Key Insights</h4>
               </div>
               <p className="text-slate-500 text-sm font-bold leading-relaxed">The average score for <span className="text-blue-600">{selectedSubject}</span> in <span className="text-slate-900">{selectedTerm}</span> is <span className="text-slate-900">{classAvg}%</span>. Consider peer-review sessions for underperforming students.</p>
            </div>
          </div>
        </div>
      )}

      {view === 'overall' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 gap-6">
            <div className="flex flex-wrap gap-8">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 shadow-sm">
                     <GraduationCap size={24} />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Term Period</label>
                     <select 
                       value={selectedTerm}
                       onChange={(e) => setSelectedTerm(e.target.value)}
                       className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer text-lg leading-none"
                     >
                       {terms.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                  </div>
               </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Info</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Avg. Score</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">GPA (4.0)</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Progress</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayStudents.map((s, i) => {
                  const scores = getTermScores(s, selectedTerm);
                  const average = calculateAverage(scores);
                  const gpa = calculateGPA(scores);
                  const isFocused = s.id === studentId;

                  return (
                    <motion.tr 
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors group",
                        isFocused && "bg-blue-50 border-l-4 border-blue-600"
                      )}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-300 text-sm shadow-sm">
                            {s.id.replace('ST', '')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-slate-900">{s.name}</h4>
                              {(() => {
                                  const dropInfo = checkPerformanceDrop(s, selectedTerm);
                                  return dropInfo.hasDrop ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                                      <AlertCircle size={10} /> -{dropInfo.percent}% Alert
                                    </span>
                                  ) : null;
                              })()}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-xl font-black text-slate-900">{average}%</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-2xl font-black text-blue-600">{gpa}</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Perfect 4.0</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${average}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              average >= 90 ? "bg-emerald-500" : average >= 80 ? "bg-blue-500" : average >= 70 ? "bg-amber-500" : "bg-rose-500"
                            )}
                          />
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                           <Save size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

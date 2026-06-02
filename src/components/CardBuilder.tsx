import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Draggable from 'react-draggable';
import { StudentIdCard } from './StudentIdCard';
import { CardConfig, ElementConfig, Student } from '../types';
import { 
  Palette, Type, Settings, Download, Save, RefreshCw, 
  Layers, Maximize2, Minimize2, MousePointer2, Layout, 
  Grid3X3, Type as FontIcon, Shield, ShieldCheck, Sparkles, Sliders,
  Image as ImageIcon, Eye, EyeOff, Move, Trash2, Plus, Loader2, Check,
  Award, Camera, Play, Square, Video, AlertCircle, CheckCircle2,
  Printer
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { HonorBoardStudio } from './HonorBoardStudio';
import { studentService } from '../services/studentService';

const DEFAULT_LAYOUT: CardConfig['layout'] = {
  schoolHeader: { x: 35, y: 20, visible: true },
  photo: { x: 95, y: 180, visible: true, fontSize: 160, statusBadge: { visible: true } },
  name: { x: 75, y: 350, visible: true, fontSize: 24 },
  class: { x: 75, y: 450, visible: false, fontSize: 30 },
  qr: { x: 45, y: 440, visible: true, fontSize: 80 },
  barcode: { x: 175, y: 440, visible: true, fontSize: 120 },
};

const DEFAULT_CONFIG: CardConfig = {
  headerColor: '#fcd34d',
  footerColor: '#fcd34d',
  waveColor: '#1e3a8a',
  schoolNameKh: 'សាលាបញ្ញាសាស្ត្រអន្តរជាតិ - វណ្ណហុង',
  schoolNameEn: 'Pannasastra International School - Van Hong',
  tagline1Kh: 'វិន័យ',
  tagline1En: 'Discipline',
  tagline2Kh: 'គុណធម៌',
  tagline2En: 'Virtue',
  tagline3Kh: 'សុភមង្គល',
  tagline3En: 'Happiness',
  primaryTextColor: '#1e3a8a',
  secondaryTextColor: '#e11d48',
  profileBorderColor: '#fbbf24',
  borderRadius: 32,
  bgType: 'solid',
  bgSecondary: '#ffffff',
  patternOpacity: 5,
  fontFamily: 'sans',
  showQrCode: true,
  cardPadding: 0,
  logoUrl: 'https://psisvh.vercel.app/logo.png',
};

const SAMPLE_STUDENT = {
  id: 'ST001',
  name: 'John Smith',
  class: 'G10-A',
  gender: 'Male',
  profilePic: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
  guardian1: {
    name: 'Robert Smith',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    contact: '089 695 703'
  },
  guardian2: {
    name: 'Mary Smith',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    contact: '089 695 703'
  }
};

const DEFAULT_BACK_LAYOUT: CardConfig['backLayout'] = {
  schoolHeader: { x: 35, y: 20, visible: true },
  guardian1Photo: { x: 40, y: 180, visible: true, fontSize: 130 },
  guardian1Name: { x: 40, y: 320, visible: true, fontSize: 18 },
  guardian2Photo: { x: 180, y: 180, visible: true, fontSize: 130 },
  guardian2Name: { x: 180, y: 320, visible: true, fontSize: 18 },
  contactInfo: { x: 75, y: 480, visible: true, fontSize: 24 },
};

interface DraggableItemProps {
  itemKey: string;
  element: ElementConfig;
  zoom: number;
  onStop: (x: number, y: number) => void;
}

/**
 * DraggableItem component to handle individual element dragging properly with nodeRef
 * to avoid findDOMNode errors in React 18+.
 */
const DraggableItem: React.FC<DraggableItemProps> = ({ 
  itemKey, 
  element, 
  zoom, 
  onStop 
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  
  return (
    <Draggable 
      nodeRef={nodeRef}
      scale={zoom}
      position={{ x: element.x, y: element.y }}
      onStop={(_, data) => onStop(data.x, data.y)}
      bounds="parent"
    >
      <div ref={nodeRef} className="absolute pointer-events-auto cursor-move group">
         <div className="absolute -inset-2 border-2 border-dashed border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
         <div className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded absolute -top-4 left-0 whitespace-nowrap opacity-0 group-hover:opacity-100 uppercase tracking-widest shadow-lg">
           {itemKey}
         </div>
         {/* Invisible hitbox for dragging */}
         <div 
           style={{ 
             width: itemKey === 'photo' ? (element.fontSize || 160) : itemKey === 'qr' ? (element.fontSize || 80) : 200,
             height: itemKey === 'photo' ? (element.fontSize || 160) : itemKey === 'qr' ? (element.fontSize || 80) : 40 
           }} 
         />
      </div>
    </Draggable>
  );
};

export const CardBuilder: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'basics' | 'capture' | 'styles' | 'advanced' | 'layers' | 'printer'>('capture');
  const [config, setConfig] = useState<CardConfig>(DEFAULT_CONFIG);
  const [zoom, setZoom] = useState(0.8);
  const [isCustomLayout, setIsCustomLayout] = useState(false);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'loaded'>('idle');
  const [studioMode, setStudioMode] = useState<'id-card' | 'honor-board'>('id-card');

  // Print Queue States
  const [printQueue, setPrintQueue] = useState<any[]>([]);
  const [printHistory, setPrintHistory] = useState<any[]>([]);
  const [isSimulatingPrint, setIsSimulatingPrint] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [currentlyPrintingCard, setCurrentlyPrintingCard] = useState<string | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

  const startSimulatedPrintCycle = async () => {
    if (printQueue.length === 0 || isSimulatingPrint) return;
    setIsSimulatingPrint(true);
    setPrintProgress(0);

    const fullQueue = [...printQueue];
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    for (let idx = 0; idx < fullQueue.length; idx++) {
      const student = fullQueue[idx];
      setCurrentlyPrintingCard(student.name || 'Student');

      // Increment progress for this card
      for (let sG = 1; sG <= 10; sG++) {
        setPrintProgress(Math.min(100, Math.round(((idx + sG / 10) / fullQueue.length) * 100)));
        await delay(120);
      }

      // Add to print history
      setPrintHistory(prev => [
        {
          name: student.name,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev
      ]);
      // Remove from active queue
      setPrintQueue(prev => prev.filter(pq => pq.id !== student.id));
    }

    setPrintProgress(100);
    setCurrentlyPrintingCard(null);
    setIsSimulatingPrint(false);
  };

  // Student list and selected student states
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [currentStudent, setCurrentStudent] = useState<any>(SAMPLE_STUDENT);

  // Camera settings
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [snapSuccess, setSnapSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const unsubscribe = studentService.subscribeToStudents((list) => {
      setStudentsList(list);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      const found = studentsList.find(s => s.firebaseId === selectedStudentId || s.id === selectedStudentId);
      if (found) {
        setCurrentStudent({
          id: found.id,
          name: found.name,
          nameKh: found.nameKh || found.name,
          class: found.class || 'Unknown',
          gender: found.gender || 'Male',
          profilePic: found.profilePic || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
          guardian1: found.guardianName1 ? { name: found.guardianName1, contact: found.guardianContact1, photo: found.guardianPhoto1 || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' } : undefined,
          guardian2: found.guardianName2 ? { name: found.guardianName2, contact: found.guardianContact2, photo: found.guardianPhoto2 || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' } : undefined,
          academicYear: found.academicYear || '2025-2026',
          status: found.status || 'active',
          paymentStatus: found.paymentStatus,
          violationCount: found.violationCount,
          firebaseId: found.firebaseId
        });
      }
    } else {
      setCurrentStudent(SAMPLE_STUDENT);
    }
  }, [selectedStudentId, studentsList]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setIsCameraActive(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 480 }, height: { ideal: 480 }, facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera access has been denied or is unavailable. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        setCurrentStudent((prev: any) => ({
          ...prev,
          profilePic: dataUrl
        }));
        setSnapSuccess(true);
        setTimeout(() => setSnapSuccess(false), 2000);
      }
    }
  };

  const syncSnapshotToDatabase = async () => {
    if (currentStudent && currentStudent.firebaseId) {
      try {
        await studentService.updateStudent(currentStudent.firebaseId, {
          profilePic: currentStudent.profilePic
        });
        alert("🎉 Student ID photo successfully captured and updated in cloud database records!");
      } catch (err) {
        console.error("Sync error:", err);
        alert("Error syncing to student database.");
      }
    } else {
      alert("Active card is currently designing the generic Sample Card. Please select a real student from the Student database selection dropdown first!");
    }
  };

  const updateConfig = (key: keyof CardConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveTemplate = () => {
    setSaveStatus('saving');
    localStorage.setItem('student_id_card_template', JSON.stringify(config));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const loadTemplate = () => {
    setLoadStatus('loading');
    const saved = localStorage.getItem('student_id_card_template');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
        if (parsed.layout) setIsCustomLayout(true);
        setTimeout(() => {
          setLoadStatus('loaded');
          setTimeout(() => setLoadStatus('idle'), 2000);
        }, 800);
      } catch (e) {
        console.error("Failed to load template", e);
        setLoadStatus('idle');
      }
    } else {
      setLoadStatus('idle');
    }
  };

  const updateLayout = (element: string, field: keyof ElementConfig, value: any) => {
    if (!config.layout) return;
    const elKey = element as keyof NonNullable<CardConfig['layout']>;
    setConfig(prev => ({
      ...prev,
      layout: {
        ...prev.layout!,
        [elKey]: { ...prev.layout![elKey], [field]: value }
      }
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'backgroundImage' | 'overlayImage' | 'backBackgroundImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateConfig(field, event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCustomLayout = () => {
    if (!isCustomLayout) {
      updateConfig('layout', DEFAULT_LAYOUT);
      setIsCustomLayout(true);
    } else {
      updateConfig('layout', undefined);
      setIsCustomLayout(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
      {/* Studio mode toggle header */}
      <div className="bg-slate-900 text-white rounded-3xl p-3 flex items-center justify-between shadow-xl border border-slate-800 no-print shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
            <Sparkles size={20} className="animate-spin-once text-yellow-300" />
          </div>
          <div className="text-left">
            <h1 className="text-xs font-black uppercase tracking-wider text-white leading-none">Paññāsāstra ID Studio</h1>
            <p className="text-[9px] text-slate-450 font-medium mt-1">Multi-format academic credentials & honor system</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button 
            onClick={() => setStudioMode('id-card')}
            className={cn(
              "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
              studioMode === 'id-card' 
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/40" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <Layout size={13} />
            Student ID Card
          </button>
          <button 
            onClick={() => setStudioMode('honor-board')}
            className={cn(
              "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
              studioMode === 'honor-board' 
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/40" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <Award size={13} />
            តារាងកិត្តិយស (Honor Board)
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {studioMode === 'honor-board' ? (
          <HonorBoardStudio />
        ) : (
          <div className="flex h-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200">
      {/* Tool Sidebar */}
      <div className="w-20 bg-slate-900 flex flex-col items-center py-8 gap-6 border-r border-slate-800">
        <ToolIcon icon={<Camera size={24} />} active={activePanel === 'capture'} onClick={() => setActivePanel('capture')} label="Student & Camera" />
        <ToolIcon icon={<Layout size={24} />} active={activePanel === 'basics'} onClick={() => setActivePanel('basics')} label="Basics" />
        <ToolIcon icon={<Palette size={24} />} active={activePanel === 'styles'} onClick={() => setActivePanel('styles')} label="Styles" />
        <ToolIcon icon={<Layers size={24} />} active={activePanel === 'layers'} onClick={() => setActivePanel('layers')} label="Layout & Canvas" />
        <ToolIcon icon={<Sliders size={24} />} active={activePanel === 'advanced'} onClick={() => setActivePanel('advanced')} label="Settings" />
        <ToolIcon icon={<Printer size={24} />} active={activePanel === 'printer'} onClick={() => setActivePanel('printer')} label="ID Print Queue" />
        
        <div className="mt-auto flex flex-col gap-4 mb-4">
           <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 1.5))} className="p-3 text-slate-400 hover:text-white transition-colors"><Maximize2 size={20} /></button>
           <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))} className="p-3 text-slate-400 hover:text-white transition-colors"><Minimize2 size={20} /></button>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="text-blue-600" size={20} />
              ID Studio
            </h2>
            <div className="px-2 py-1 bg-blue-50 rounded text-[9px] font-black text-blue-600 uppercase">Pro</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activePanel === 'capture' && (
              <motion.div key="capture" className="space-y-6" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <SectionTitle title="Student Selection" />
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Select Active Student</label>
                  <select 
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">-- Generic Sample Student (John Smith) --</option>
                    {studentsList.map((stud) => (
                      <option key={stud.firebaseId || stud.id} value={stud.firebaseId || stud.id}>
                        {stud.id} - {stud.name} ({stud.class || 'No Class'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-450 mt-1">
                    Select a student from the active database to capture their snapshot and instantly synchronize it to their record.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-left">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Selected Student Info</span>
                  <div className="space-y-2">
                    <TextInput 
                      label="Full Student Name" 
                      value={currentStudent.name} 
                      onChange={(val) => setCurrentStudent((prev: any) => ({ ...prev, name: val }))} 
                    />
                    <TextInput 
                      label="Student ID Number" 
                      value={currentStudent.id} 
                      onChange={(val) => setCurrentStudent((prev: any) => ({ ...prev, id: val }))} 
                    />
                    <TextInput 
                      label="Classroom Name" 
                      value={currentStudent.class} 
                      onChange={(val) => setCurrentStudent((prev: any) => ({ ...prev, class: val }))} 
                    />
                  </div>
                </div>

                <SectionTitle title="Webcam Snapshot Creator" />
                <div className="space-y-4">
                  {isCameraActive ? (
                    <div className="space-y-3">
                      <div className="relative aspect-square w-full rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover transform scale-x-[-1]" 
                        />
                        <div className="absolute top-3 left-3 bg-red-600 text-white font-bold text-[8px] uppercase tracking-wider px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5 shadow-lg">
                          <span className="w-1.5 h-1.5 bg-white rounded-full inline-block"></span>
                          Webcam Live Feed
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={captureSnapshot}
                          className="py-3 px-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                        >
                          <Camera size={13} />
                          Capture Photo
                        </button>
                        <button
                          onClick={stopCamera}
                          className="py-3 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                          <Square size={13} />
                          Turn Off
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-100/60 rounded-2xl border border-slate-200 border-dashed text-center flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                        <Camera size={22} className="text-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Webcam is Inactive</p>
                        <p className="text-[9px] text-slate-450 max-w-[190px] mx-auto">Activate your device camera to snap and replace student photos instantly.</p>
                      </div>
                      <button
                        onClick={startCamera}
                        className="mt-1 py-1.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <Play size={10} className="fill-blue-600 text-blue-600" />
                        Start Camera
                      </button>
                    </div>
                  )}

                  {cameraError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[10px] font-medium leading-relaxed text-left flex items-start gap-2.5">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  {snapSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-[10px] font-medium text-left flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                      <span>Snapshot captured and embedded on preview card successfully!</span>
                    </div>
                  )}

                  <button
                    onClick={syncSnapshotToDatabase}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} />
                    Save & Sync to DB
                  </button>
                </div>
              </motion.div>
            )}

            {activePanel === 'basics' && (
              <motion.div key="basics" className="space-y-6" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <SectionTitle title="Academic Theme Presets" />
                <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        isHonorGold: false,
                        headerColor: '#fcd34d',
                        footerColor: '#fcd34d',
                        profileBorderColor: '#fbbf24',
                        primaryTextColor: '#1e3a8a',
                        secondaryTextColor: '#e11d48',
                        waveColor: '#1e3a8a'
                      }));
                    }}
                    className={cn(
                      "py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-center flex flex-col items-center justify-center gap-1",
                      !config.isHonorGold ? "bg-slate-900 text-white shadow-md" : "text-slate-450 hover:bg-slate-50"
                    )}
                  >
                    <Layout size={14} />
                    <span>Standard Card</span>
                  </button>
                  <button
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        isHonorGold: true,
                        headerColor: '#111827',
                        footerColor: '#111827',
                        profileBorderColor: '#fbbf24',
                        primaryTextColor: '#b45309',
                        secondaryTextColor: '#b45353',
                        waveColor: '#78350f'
                      }));
                    }}
                    className={cn(
                      "py-2.5 rounded-xl text-[9px] font-black uppercase transition-all tracking-wider text-center flex flex-col items-center justify-center gap-1",
                      config.isHonorGold ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black shadow-md border border-amber-250" : "text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <Award size={14} className={cn(config.isHonorGold ? "text-slate-950" : "text-slate-400")} />
                    <span>Gold Honor Roll</span>
                  </button>
                </div>

                <SectionTitle title="School Branding" />
                <TextInput label="Name (KH)" value={config.schoolNameKh} onChange={v => updateConfig('schoolNameKh', v)} />
                <TextInput label="Name (EN)" value={config.schoolNameEn} onChange={v => updateConfig('schoolNameEn', v)} />
                <ImageUpload label="School Logo" onUpload={(url: string) => updateConfig('logoUrl', url)} value={config.logoUrl} />
              </motion.div>
            )}

            {activePanel === 'styles' && (
              <motion.div key="styles" className="space-y-6" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <SectionTitle title="Identity Colors" />
                <ColorRow label="Header & Footer" value={config.headerColor} secondary={config.waveColor} 
                  onPrimary={(v: string) => updateConfig('headerColor', v)} 
                  onSecondary={(v: string) => updateConfig('waveColor', v)} 
                />
                
                <SectionTitle title="Artwork & Assets" />
                <div className="space-y-4">
                   <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3 text-left">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-slate-500">Front Background</span>
                         {config.backgroundImage && <button onClick={() => updateConfig('backgroundImage', undefined)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={12} /></button>}
                      </div>
                      <label className="cursor-pointer group">
                        <div className={cn(
                          "h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                          config.backgroundImage ? "border-blue-500" : "border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50"
                        )}>
                          {config.backgroundImage ? (
                            <img src={config.backgroundImage} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <ImageIcon className="text-slate-300 group-hover:text-blue-400 mb-1" size={24} />
                              <span className="text-[9px] font-bold text-slate-400">Upload Image</span>
                            </>
                          )}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'backgroundImage')} />
                      </label>
                   </div>

                   <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3 text-left">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-slate-500">Back Background</span>
                         {config.backBackgroundImage && <button onClick={() => updateConfig('backBackgroundImage', undefined)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={12} /></button>}
                      </div>
                      <label className="cursor-pointer group">
                        <div className={cn(
                          "h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                          config.backBackgroundImage ? "border-blue-500" : "border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50"
                        )}>
                          {config.backBackgroundImage ? (
                            <img src={config.backBackgroundImage} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <ImageIcon className="text-slate-300 group-hover:text-blue-400 mb-1" size={24} />
                              <span className="text-[9px] font-bold text-slate-400">Upload Image</span>
                            </>
                          )}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'backBackgroundImage')} />
                      </label>
                   </div>

                   <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col gap-3 text-left">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-slate-500">Overlay PNG</span>
                         {config.overlayImage && <button onClick={() => updateConfig('overlayImage', undefined)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={12} /></button>}
                      </div>
                      <label className="cursor-pointer group">
                        <div className={cn(
                          "h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                          config.overlayImage ? "border-blue-500" : "border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50"
                        )}>
                          {config.overlayImage ? (
                            <img src={config.overlayImage} className="w-full h-full object-contain" />
                          ) : (
                            <>
                              <Plus className="text-slate-300 group-hover:text-blue-400 mb-1" size={24} />
                              <span className="text-[9px] font-bold text-slate-400">Upload Overlay</span>
                            </>
                          )}
                        </div>
                        <input type="file" className="hidden" accept="image/png" onChange={(e) => handleFileUpload(e, 'overlayImage')} />
                      </label>
                   </div>
                </div>
              </motion.div>
            )}

            {activePanel === 'layers' && (
              <motion.div key="layers" className="space-y-6" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200 text-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest">Custom Canvas</h3>
                    <button 
                      onClick={toggleCustomLayout}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-all",
                        isCustomLayout ? "bg-white" : "bg-blue-400"
                      )}
                    >
                      <div className={cn("absolute top-1 w-3 h-3 rounded-full transition-all", isCustomLayout ? "bg-blue-600 left-6" : "bg-white left-1")} />
                    </button>
                  </div>
                  <p className="text-[9px] leading-relaxed opacity-80">Enable custom canvas to drag and drop elements freely. Disable to use standard school template.</p>
                </div>

                {isCustomLayout && (
                  <div className="space-y-4">
                    <SectionTitle title={side === 'front' ? "Front Elements" : "Back Elements"} />
                    {side === 'front' ? config.layout && (Object.keys(config.layout) as Array<string>).map((key) => {
                      const typedKey = key as keyof NonNullable<CardConfig['layout']>;
                      const element = config.layout![typedKey];
                      if (!element) return null;
                      
                      return (
                        <div key={key} className="p-4 bg-white rounded-2xl border border-slate-200 group text-left">
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    {key === 'name' ? <Type size={16} /> : key === 'photo' ? <ImageIcon size={16} /> : key === 'qr' ? <Shield size={16} /> : <Layout size={16} />}
                                 </div>
                                 <span className="text-[10px] font-black uppercase text-slate-900 capitalize">{key}</span>
                              </div>
                              <button 
                                onClick={() => updateLayout(key, 'visible', !element.visible)}
                                className={cn("p-1.5 rounded-lg transition-all", element.visible ? "text-blue-500 bg-blue-50" : "text-slate-300 hover:bg-slate-50")}
                              >
                                {element.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                           </div>
                           {element.visible && (
                             <div className="space-y-3 pt-3 border-t border-slate-50">
                                <SliderInput 
                                  label={key === 'photo' || key === 'qr' ? "Scale" : "Font Size"} 
                                  value={element.fontSize || 24} 
                                  min={key === 'photo' ? 100 : 12} 
                                  max={key === 'photo' ? 250 : 60} 
                                  onChange={(v: number) => updateLayout(key, 'fontSize', v)} 
                                />
                                {key === 'photo' && (
                                  <div className="space-y-3 pt-3 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-black uppercase text-slate-500">Status Badge</span>
                                      <button 
                                        onClick={() => updateLayout(key, 'statusBadge', { ...element.statusBadge, visible: !element.statusBadge?.visible })}
                                        className={cn("p-1.5 rounded-lg transition-all", element.statusBadge?.visible ? "text-emerald-500 bg-emerald-50" : "text-slate-300 hover:bg-slate-50")}
                                      >
                                        {element.statusBadge?.visible ? <ShieldCheck size={14} /> : <Shield size={14} />}
                                      </button>
                                    </div>
                                    {element.statusBadge?.visible && (
                                      <div className="flex gap-2 items-center p-2 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="w-6 h-6 rounded-lg border border-slate-200 relative overflow-hidden">
                                           <input 
                                              type="color" 
                                              value={element.statusBadge?.color || '#22c55e'} 
                                              onChange={e => updateLayout(key, 'statusBadge', { ...element.statusBadge, color: e.target.value })} 
                                              className="absolute inset-[-8px] scale-150 cursor-pointer" 
                                           />
                                        </div>
                                        <span className="text-[8px] font-mono text-slate-400 capitalize">Badge Color</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                             </div>
                           )}
                        </div>
                      );
                    }) : config.backLayout && (Object.keys(config.backLayout) as Array<string>).map((key) => {
                      const typedKey = key as keyof NonNullable<CardConfig['backLayout']>;
                      const element = config.backLayout![typedKey];
                      if (!element) return null;
                      
                      return (
                        <div key={key} className="p-4 bg-white rounded-2xl border border-slate-200 group text-left">
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                    {key.includes('Photo') ? <ImageIcon size={16} /> : key.includes('Name') ? <Type size={16} /> : <Layout size={16} />}
                                 </div>
                                 <span className="text-[10px] font-black uppercase text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              </div>
                              <button 
                                onClick={() => {
                                   setConfig(prev => ({
                                     ...prev,
                                     backLayout: {
                                       ...prev.backLayout!,
                                       [typedKey]: { ...prev.backLayout![typedKey], visible: !element.visible }
                                     }
                                   }));
                                }}
                                className={cn("p-1.5 rounded-lg transition-all", element.visible ? "text-blue-500 bg-blue-50" : "text-slate-300 hover:bg-slate-50")}
                              >
                                {element.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
            
            {activePanel === 'advanced' && (
              <motion.div key="advanced" className="space-y-6" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <SectionTitle title="Interactive Settings" />
                <SliderInput label="Corner Radius" value={config.borderRadius || 32} min={0} max={64} onChange={(v: number) => updateConfig('borderRadius', v)} />
                <SliderInput label="Card Padding" value={config.cardPadding || 0} min={0} max={40} onChange={(v: number) => updateConfig('cardPadding', v)} />
                <SelectInput 
                  label="Font Family" 
                  value={config.fontFamily || 'sans'} 
                  options={['sans', 'mono', 'serif', 'display', 'khmer']} 
                  onChange={(v: any) => updateConfig('fontFamily', v)} 
                />
              </motion.div>
            )}

            {activePanel === 'printer' && (
              <motion.div key="printer" className="space-y-6 text-left" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <SectionTitle title="ID Printer Hub" />
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  Batch select students from enrollment directories, queue them, and trigger high-resolution printer card mocks.
                </p>

                {/* Batch Selector Block */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Select Students</span>
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = studentsList.map(s => s.id);
                        setSelectedBatchIds(prev => prev.length === studentsList.length ? [] : allIds);
                      }}
                      className="text-[9px] font-black uppercase tracking-wider text-[#2563eb] cursor-pointer"
                    >
                      Toggle All
                    </button>
                  </div>

                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 pr-1.5 space-y-1">
                    {studentsList.map((st) => {
                      const isSelected = selectedBatchIds.includes(st.id);
                      return (
                        <div key={st.id} className="flex items-center justify-between py-2">
                          <label className="flex items-center gap-3 cursor-pointer select-none truncate">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBatchIds(prev => [...prev, st.id]);
                                } else {
                                  setSelectedBatchIds(prev => prev.filter(id => id !== st.id));
                                }
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="text-xs font-black text-slate-700 truncate">{st.name}</span>
                          </label>
                          <span className="text-[9.5px] font-bold text-slate-400 pr-2">{st.class || 'No Class'}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedBatchIds.length === 0) return;
                      const itemsToQueue = selectedBatchIds
                        .map(id => studentsList.find(s => s.id === id))
                        .filter(Boolean)
                        .filter(s => !printQueue.some(pq => pq.id === s!.id));
                      setPrintQueue(prev => [...prev, ...itemsToQueue]);
                      setSelectedBatchIds([]);
                    }}
                    disabled={selectedBatchIds.length === 0}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Queue Selected ({selectedBatchIds.length})
                  </button>
                </div>

                {/* Simulation Status or Control */}
                {printQueue.length > 0 && (
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Simulate Print Queue ({printQueue.length})</span>
                      <button
                        type="button"
                        onClick={() => setPrintQueue([])}
                        disabled={isSimulatingPrint}
                        className="text-[9px] font-black uppercase tracking-wider text-rose-500 disabled:text-slate-350 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    {isSimulatingPrint ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-600">
                          <span className="text-blue-600">Printing badges...</span>
                          <span>{printProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${printProgress}%` }} />
                        </div>
                        <div className="text-[9px] text-slate-500 flex items-center gap-1.5 py-1">
                          <Loader2 size={12} className="animate-spin text-blue-600" />
                          <span>Active Card: <strong>{currentlyPrintingCard}</strong></span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startSimulatedPrintCycle}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Play size={10} />
                        Start Batch Print Sim
                      </button>
                    )}
                  </div>
                )}

                {/* Print queue listing with individual delete */}
                <div className="space-y-3 font-sans">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current Queue</h4>
                  {printQueue.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-6 text-center bg-white border border-dashed border-slate-200 rounded-2xl shadow-sm">
                      Queue is empty. Select students above to fill queue.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {printQueue.map((item) => (
                        <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                          <div className="min-w-0 text-left">
                            <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                            <div className="flex gap-2 text-[9px] text-slate-400 uppercase font-black tracking-wider mt-0.5">
                              <span>{item.class}</span>
                              <span>•</span>
                              <span className="text-indigo-600">Pending</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPrintQueue(prev => prev.filter(pq => pq.id !== item.id))}
                            disabled={isSimulatingPrint}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Print History Registry */}
                {printHistory.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-100 font-sans">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Printed Logs ({printHistory.length})</h4>
                      <button 
                        type="button"
                        onClick={() => setPrintHistory([])} 
                        className="text-[8.5px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        Clear Logs
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {printHistory.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between">
                          <div className="min-w-0 text-left">
                            <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                            <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase block">{item.timestamp}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[8px] font-black uppercase tracking-widest">
                            Success
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 border-t border-slate-200 bg-white grid grid-cols-2 gap-3">
          <button 
            onClick={loadTemplate} 
            disabled={loadStatus !== 'idle'}
            className={cn(
              "py-3 px-4 border rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2",
              loadStatus === 'loaded' ? "bg-green-50 border-green-200 text-green-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            {loadStatus === 'loading' ? <Loader2 size={14} className="animate-spin" /> : loadStatus === 'loaded' ? <Check size={14} /> : <RefreshCw size={14} />}
            {loadStatus === 'loading' ? 'Loading' : loadStatus === 'loaded' ? 'Loaded!' : 'Load Saved'}
          </button>
          <button 
            onClick={saveTemplate}
            disabled={saveStatus !== 'idle'}
            className={cn(
              "py-3 px-4 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all flex items-center justify-center gap-2",
              saveStatus === 'saved' ? "bg-green-500 text-white" : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 font-sans"
            )}
          >
            {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : saveStatus === 'saved' ? <Check size={14} /> : <Save size={14} />}
            {saveStatus === 'saved' ? 'Saved!' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-slate-100 relative overflow-hidden flex flex-col">
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", isCustomLayout ? "bg-green-500" : "bg-blue-500")} />
                <span className="text-[10px] font-black uppercase text-slate-500">{isCustomLayout ? 'Canvas Freeform' : 'Template Locked'}</span>
             </div>
             <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setSide('front')}
                  className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", side === 'front' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}
                >
                  Front
                </button>
                <button 
                  onClick={() => {
                    setSide('back');
                    if (!config.backLayout) updateConfig('backLayout', DEFAULT_BACK_LAYOUT);
                  }}
                  className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", side === 'back' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}
                >
                  Pickup (Back)
                </button>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="p-1.5 hover:bg-slate-50 rounded"><Minimize2 size={14} /></button>
              <span className="px-3 text-[10px] font-bold text-slate-900">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))} className="p-1.5 hover:bg-slate-50 rounded"><Maximize2 size={14} /></button>
            </div>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-20 overflow-auto scrollbar-hide">
           <motion.div 
            animate={{ scale: zoom }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative"
           >
             <div className="relative pointer-events-auto">
               <StudentIdCard student={currentStudent} config={config} side={side} />
               
               {/* Clickable Overlay for Interactive Dragging */}
               {isCustomLayout && (
                  <div className="absolute inset-0 pointer-events-none z-[100]">
                    {side === 'front' ? config.layout && (Object.keys(config.layout) as Array<string>).map((key) => {
                       const typedKey = key as keyof NonNullable<CardConfig['layout']>;
                       const element = config.layout![typedKey];
                       if (!element?.visible) return null;
                       
                       return (
                         <DraggableItem 
                           key={key}
                           itemKey={key}
                           element={element as ElementConfig}
                           zoom={zoom}
                           onStop={(x: number, y: number) => {
                             updateLayout(key, 'x', x);
                             updateLayout(key, 'y', y);
                           }}
                         />
                       );
                    }) : config.backLayout && (Object.keys(config.backLayout) as Array<string>).map((key) => {
                       const typedKey = key as keyof NonNullable<CardConfig['backLayout']>;
                       const element = config.backLayout![typedKey];
                       if (!element?.visible) return null;
                       
                       return (
                         <DraggableItem 
                           key={key}
                           itemKey={key}
                           element={element as ElementConfig}
                           zoom={zoom}
                           onStop={(x, y) => {
                              if (!config.backLayout) return;
                              setConfig(prev => ({
                                ...prev,
                                backLayout: {
                                  ...prev.backLayout!,
                                  [typedKey]: { ...prev.backLayout![typedKey], x, y }
                                }
                              }));
                           }}
                         />
                       );
                    })}
                  </div>
               )}
             </div>
           </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-4 border border-white flex items-center gap-8">
           <div className="flex gap-4">
              <Hint icon={<Move size={14} />} text="Drag elements to reposition" />
              <Hint icon={<Maximize2 size={14} />} text="Use sliders for size/scale" />
           </div>
        </div>
      </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 text-left">{title}</h3>
);

const Hint = ({ icon, text }: any) => (
  <div className="flex items-center gap-2">
    <div className="text-blue-500">{icon}</div>
    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-sans whitespace-nowrap">{text}</span>
  </div>
);

const ImageUpload = ({ label, onUpload, value }: any) => {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2 text-left">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="flex gap-3">
         <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
            {value ? <img src={value} className="w-full h-full object-contain" /> : <ImageIcon className="text-slate-200" size={24} />}
         </div>
         <button 
          onClick={() => fileRef.current?.click()}
          className="flex-1 px-4 border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all border-dashed"
         >
          Change Image
         </button>
         <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => onUpload(event.target?.result as string);
              reader.readAsDataURL(file);
            }
         }} />
      </div>
    </div>
  );
};

const ToolIcon = ({ icon, active, onClick, label }: { icon: any, active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "relative w-12 h-12 rounded-xl flex items-center justify-center transition-all group",
      active ? "bg-white text-blue-600 shadow-xl" : "text-slate-500 hover:text-white"
    )}
  >
    {icon}
    <div className="absolute left-16 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-90 group-hover:scale-100 whitespace-nowrap shadow-2xl z-50">
      {label}
    </div>
  </button>
);

const TextInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="space-y-2 text-left">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
    />
  </div>
);

const ColorRow = ({ label, value, secondary, onPrimary, onSecondary }: any) => (
  <div className="space-y-3 text-left">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-2 gap-3">
      <div className="flex gap-2 items-center p-2 bg-white rounded-xl border border-slate-200">
        <div className="w-8 h-8 rounded-lg border border-slate-100 relative overflow-hidden">
           <input type="color" value={value} onChange={e => onPrimary(e.target.value)} className="absolute inset-[-8px] scale-150 cursor-pointer" />
        </div>
        <span className="text-[9px] font-mono text-slate-400">{value}</span>
      </div>
      <div className="flex gap-2 items-center p-2 bg-white rounded-xl border border-slate-200">
        <div className="w-8 h-8 rounded-lg border border-slate-100 relative overflow-hidden">
           <input type="color" value={secondary} onChange={e => onSecondary(e.target.value)} className="absolute inset-[-8px] scale-150 cursor-pointer" />
        </div>
        <span className="text-[9px] font-mono text-slate-400">{secondary}</span>
      </div>
    </div>
  </div>
);

const SelectInput = ({ label, value, options, onChange }: any) => (
  <div className="space-y-2 text-left">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-slate-200 font-sans">
      {options.map((opt: string) => (
        <button 
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "py-2 rounded-lg text-[9px] font-black uppercase transition-all tracking-wider",
            value === opt ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const SliderInput = ({ label, value, min, max, onChange }: any) => (
  <div className="space-y-3 text-left">
     <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{label}</label>
        <span className="text-[10px] font-black text-blue-600 leading-none">{value}</span>
     </div>
     <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={e => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
     />
  </div>
);

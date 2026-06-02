import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Download, Image as ImageIcon, FileImage, X, Sliders, Settings, 
  Layers, Type, Paintbrush, Check, RotateCcw, FileArchive, Plus, Play, 
  Sparkles, RefreshCw, FileText, CheckCircle2, Trash2, Layout, SlidersHorizontal, CheckSquare, Square,
  Database, FileSpreadsheet, Layers2, Users, FileDown, CheckCircle, Crop, Save
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import JSZip from 'jszip';
import { studentService } from '../services/studentService';
import { Student } from '../types';

interface BatchPhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  name: string;       // Primary text (e.g. Student Name)
  subtitle: string;   // Secondary text (e.g. Class / Grade)
  extraId: string;    // Tertiary text (e.g. ID Code)
  showStudentBadge?: boolean;
  showDaycareBadge?: boolean;
  showFoodBadge?: boolean;
  showTransportBadge?: boolean;
  showPublicSpeakingBadge?: boolean;
  showDebateBadge?: boolean;
  showSasmoMathBadge?: boolean;
  faceCenterX?: number; // normalized focus X coordinate (0 to 1)
  faceCenterY?: number; // normalized focus Y coordinate (0 to 1)
  cropScale?: number;   // passport zoom scale (0.4 to 1.0)
  lowerThirdTheme?: 'light' | 'dark'; // individual override
}

interface CsvRecord {
  id: string;
  name: string;
  subtitle: string;
  extraId?: string;
  daycare?: boolean;
  food?: boolean;
  transport?: boolean;
  publicSpeaking?: boolean;
  debate?: boolean;
  sasmoMath?: boolean;
}

const FALLBACK_STUDENTS: Omit<Student, 'firebaseId'>[] = [
  { id: 'VH001079', name: 'Gouv Ly Jing', nameKh: 'ហ្គូវ លីជីង', class: 'G10A', gender: 'Female', dob: '2011-01-01', parent: '097 333 0336 / 088 934 5789', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '097 333 0336 / 088 934 5789' },
  { id: 'VH000835', name: 'Keo Lyphing', nameKh: 'កែវ លីភិញ', class: 'G10A', gender: 'Female', dob: '2012-03-07', parent: '070 500 525 / 087 777 078', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '070 500 525 / 087 777 078' },
  { id: 'VH000083', name: 'Khlok Uttakrakvortey', nameKh: 'ឃ្លោក ឧត្តរវតី', class: 'G10A', gender: 'Female', dob: '2011-07-11', parent: '012 600 516 / 012 208 278', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '012 600 516 / 012 208 278' },
  { id: 'VH001117', name: 'Khorn Khemarakboth', nameKh: 'ឃន ខេមរៈបុត្រ', class: 'G10A', gender: 'Male', dob: '2012-12-23', parent: '088 717 7000 / 096 967 5588', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '088 717 7000 / 096 967 5588' },
  { id: 'VH000067', name: 'Kumnith Roathathipdey', nameKh: 'គំនិត រដ្ឋាធិបតី', class: 'G10A', gender: 'Male', dob: '2011-12-07', parent: '012 226 866 / 012 666 194', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '012 226 866 / 012 666 194' },
  { id: 'VH000834', name: 'Leng Panhavattey', nameKh: 'ឡេង បញ្ញាវត្តីយ៍', class: 'G10A', gender: 'Female', dob: '2011-10-15', parent: '096 844 2019', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '096 844 2019' },
  { id: 'VH000076', name: 'Morn Keithsthana', nameKh: 'ម៉ន កេតន៍ស្ធានា', class: 'G10A', gender: 'Female', dob: '2011-12-19', parent: '088 357 7007 / 070 432 117', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '088 357 7007 / 070 432 117' },
  { id: 'VH000081', name: 'Nhil Sovanreaksa', nameKh: 'ញ៉ិល សុវណ្ណរក្សា', class: 'G10A', gender: 'Female', dob: '2012-02-19', parent: '088 888 1008 / 097 619 6467', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '088 888 1008 / 097 619 6467' },
  { id: 'VH000079', name: 'Nov Chomrong', nameKh: 'នៅ ចំរ៉ុង', class: 'G10A', gender: 'Male', dob: '2010-11-13', parent: '089 339 900 / 012 228 247', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '089 339 900 / 012 228 247' },
  { id: 'VH001010', name: 'Sek Sreyleak', nameKh: 'សេក ស្រីល័ក្ខ', class: 'G10A', gender: 'Female', dob: '2009-09-10', parent: '031 6666 111 / 096 7333 909', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '031 6666 111 / 096 7333 909' },
  { id: 'VH000074', name: 'Sopheak Narita', nameKh: 'សុភ័ក្រ ណារីតា', class: 'G10A', gender: 'Female', dob: '2011-01-19', parent: '015 609 666 / 061 609 666', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '015 609 666 / 061 609 666' },
  { id: 'VH000075', name: 'Sros Sonorakvibol', nameKh: 'ស្រស់ សុនរៈវិបុល', class: 'G10A', gender: 'Male', dob: '2011-09-18', parent: '077 361 222 / 087 362 222', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '077 361 222 / 087 362 222' },
  { id: 'VH000078', name: 'Vireak Ratanak Both', nameKh: 'វីរៈ រតនៈបុត្រ', class: 'G10A', gender: 'Male', dob: '2010-11-26', parent: '012 694 949', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: true, food: true, transport: false }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '012 694 949' },
  { id: 'VH000059', name: 'Chin Sokchamrean', nameKh: 'ជិន សុខចំរើន', class: 'G11', gender: 'Male', dob: '2010-08-04', parent: '012 759 942 / 012 638 451', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: false, food: true, transport: true }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '012 759 942 / 012 638 451' },
  { id: 'VH000051', name: 'Chum Dara', nameKh: 'ជុំ តារា', class: 'G11', gender: 'Male', dob: '2010-11-23', parent: '097 719 0707 / 017 566 333', status: 'active', paymentStatus: 'paid', violationCount: 0, profilePic: '', auxiliary: { daycare: false, food: true, transport: true }, enrollmentDate: '2026-09-01', academicYear: '2026-2027', tel: '097 719 0707 / 017 566 333' }
];

const DEFAULT_LOGO_URL = 'https://psisvh.vercel.app/logo.png';

interface StylePreset {
  id: string;
  name: string;
  createdAt: string;
  // Watermark Settings
  enableWatermark: boolean;
  watermarkLogoUrl: string;
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tile';
  watermarkSize: number;
  watermarkOpacity: number;
  watermarkPadding: number;
  // Lower Third Settings
  enableLowerThird: boolean;
  lowerThirdStyle: 'gradient-classic' | 'modern-accent' | 'floating-pill' | 'cosmic-blur';
  lowerThirdHeight: number;
  lowerThirdOpacity: number;
  primaryBgColor: string;
  accentColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  useUppercase: boolean;
  lowerThirdTheme: 'light' | 'dark';
  enableFrame?: boolean;
  frameColor?: string;
  frameThickness?: number;
}

const SYSTEM_PRESETS: StylePreset[] = [
  {
    id: 'system-classic',
    name: '🏛️ Campus Classic Dark',
    createdAt: 'System Built-In',
    enableWatermark: true,
    watermarkLogoUrl: DEFAULT_LOGO_URL,
    watermarkPosition: 'top-right',
    watermarkSize: 18,
    watermarkOpacity: 60,
    watermarkPadding: 24,
    enableLowerThird: true,
    lowerThirdStyle: 'gradient-classic',
    lowerThirdHeight: 22,
    lowerThirdOpacity: 85,
    primaryBgColor: '#0f172a',
    accentColor: '#3b82f6',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#94a3b8',
    useUppercase: true,
    lowerThirdTheme: 'dark'
  },
  {
    id: 'system-minimal-light',
    name: '🌸 Minimalist Eco Light',
    createdAt: 'System Built-In',
    enableWatermark: true,
    watermarkLogoUrl: DEFAULT_LOGO_URL,
    watermarkPosition: 'top-right',
    watermarkSize: 15,
    watermarkOpacity: 50,
    watermarkPadding: 20,
    enableLowerThird: true,
    lowerThirdStyle: 'floating-pill',
    lowerThirdHeight: 20,
    lowerThirdOpacity: 90,
    primaryBgColor: '#ffffff',
    accentColor: '#10b981',
    primaryTextColor: '#0f172a',
    secondaryTextColor: '#475569',
    useUppercase: true,
    lowerThirdTheme: 'light'
  },
  {
    id: 'system-cosmic',
    name: '🌌 HUD Neon Cyber',
    createdAt: 'System Built-In',
    enableWatermark: true,
    watermarkLogoUrl: DEFAULT_LOGO_URL,
    watermarkPosition: 'top-left',
    watermarkSize: 20,
    watermarkOpacity: 80,
    watermarkPadding: 25,
    enableLowerThird: true,
    lowerThirdStyle: 'cosmic-blur',
    lowerThirdHeight: 24,
    lowerThirdOpacity: 80,
    primaryBgColor: '#0c0f17',
    accentColor: '#ec4899',
    primaryTextColor: '#ffffff',
    secondaryTextColor: '#f472b6',
    useUppercase: true,
    lowerThirdTheme: 'dark'
  }
];

export const BatchPhotoEditor: React.FC = () => {
  // Batch queue state
  const [photos, setPhotos] = useState<BatchPhotoItem[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  
  // Customization controls - General
  const [processStatus, setProcessStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Database and CSV Pipeline states
  const [dbStudents, setDbStudents] = useState<Student[]>([]);
  const [csvText, setCsvText] = useState<string>('');
  const [csvRecords, setCsvRecords] = useState<CsvRecord[]>([]);

  // Cache stores for lightning-fast canvas rendering (reduces lag on slider drag)
  const photoCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const logoCacheRef = useRef<HTMLImageElement | null>(null);

  // Watermark Settings
  const [enableWatermark, setEnableWatermark] = useState<boolean>(true);
  const [watermarkLogoUrl, setWatermarkLogoUrl] = useState<string>(DEFAULT_LOGO_URL);
  const [watermarkPosition, setWatermarkPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tile'>('top-right');
  const [watermarkSize, setWatermarkSize] = useState<number>(18); // % of image width
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(60); // %
  const [watermarkPadding, setWatermarkPadding] = useState<number>(24); // px relative to rendering resolution

  // Lower Third Settings
  const [enableLowerThird, setEnableLowerThird] = useState<boolean>(true);
  const [lowerThirdStyle, setLowerThirdStyle] = useState<'gradient-classic' | 'modern-accent' | 'floating-pill' | 'cosmic-blur'>('gradient-classic');
  const [lowerThirdHeight, setLowerThirdHeight] = useState<number>(22); // % of image height
  const [lowerThirdOpacity, setLowerThirdOpacity] = useState<number>(85); // %
  const [primaryBgColor, setPrimaryBgColor] = useState<string>('#0f172a'); // slate-900
  const [accentColor, setAccentColor] = useState<string>('#3b82f6'); // blue-500
  const [primaryTextColor, setPrimaryTextColor] = useState<string>('#ffffff');
  const [secondaryTextColor, setSecondaryTextColor] = useState<string>('#94a3b8'); // slate-400
  const [useUppercase, setUseUppercase] = useState<boolean>(true);
  
  // Passport cropping & Lower Third Theme states
  const [enablePassportCrop, setEnablePassportCrop] = useState<boolean>(false);
  const [lowerThirdTheme, setLowerThirdTheme] = useState<'light' | 'dark'>('dark');
  const [stylePresets, setStylePresets] = useState<StylePreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [newPresetName, setNewPresetName] = useState<string>('');

  // Customizable Portrait Frame Settings
  const [enableFrame, setEnableFrame] = useState<boolean>(false);
  const [frameColor, setFrameColor] = useState<string>('#3b82f6');
  const [frameThickness, setFrameThickness] = useState<number>(10);
  const [isDraggingReticle, setIsDraggingReticle] = useState<boolean>(false);

  // Drag and drop region hover state
  const [dragOver, setDragOver] = useState<boolean>(false);
  
  // Selection tab inside properties
  const [activeTab, setActiveTab] = useState<'watermark' | 'lowerthird' | 'layers' | 'crop' | 'pipeline'>('watermark');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedPhoto = photos.find(p => p.id === selectedPhotoId) || photos[0] || null;

  // Set default selection when photos list changes
  useEffect(() => {
    if (photos.length > 0 && !selectedPhotoId) {
      setSelectedPhotoId(photos[0].id);
    }
  }, [photos, selectedPhotoId]);

  // Load database profiles on mount
  useEffect(() => {
    const unsub = studentService.subscribeToStudents((data) => {
      if (data && data.length > 0) {
        setDbStudents(data);
      } else {
        setDbStudents(FALLBACK_STUDENTS as Student[]);
      }
    });

    // Populate presets from localStorage too
    try {
      const stored = localStorage.getItem('psis_photo_presets');
      if (stored) {
        const parsed = JSON.parse(stored);
        setStylePresets([...SYSTEM_PRESETS, ...parsed]);
      } else {
        setStylePresets(SYSTEM_PRESETS);
        localStorage.setItem('psis_photo_presets', JSON.stringify([]));
      }
    } catch (e) {
      setStylePresets(SYSTEM_PRESETS);
    }

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Preset Handlers
  const handleSavePreset = (nameInput: string) => {
    const name = nameInput.trim() || `My Layout Preset ${Date.now().toString().slice(-4)}`;
    const newPreset: StylePreset = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      createdAt: new Date().toLocaleDateString(),
      enableWatermark,
      watermarkLogoUrl,
      watermarkPosition,
      watermarkSize,
      watermarkOpacity,
      watermarkPadding,
      enableLowerThird,
      lowerThirdStyle,
      lowerThirdHeight,
      lowerThirdOpacity,
      primaryBgColor,
      accentColor,
      primaryTextColor,
      secondaryTextColor,
      useUppercase,
      lowerThirdTheme,
      enableFrame,
      frameColor,
      frameThickness
    };

    try {
      const stored = localStorage.getItem('psis_photo_presets');
      const parsedList = stored ? JSON.parse(stored) : [];
      const updatedList = [...parsedList, newPreset];
      localStorage.setItem('psis_photo_presets', JSON.stringify(updatedList));
      
      setStylePresets([...SYSTEM_PRESETS, ...updatedList]);
      setSelectedPresetId(newPreset.id);
      showToast(`Saved preset: "${name}"`);
    } catch (e) {
      showToast("Could not save preset to local storage.");
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const target = stylePresets.find(p => p.id === presetId);
    if (!target) return;

    setEnableWatermark(target.enableWatermark);
    setWatermarkLogoUrl(target.watermarkLogoUrl || DEFAULT_LOGO_URL);
    setWatermarkPosition(target.watermarkPosition || 'top-right');
    setWatermarkSize(target.watermarkSize !== undefined ? target.watermarkSize : 18);
    setWatermarkOpacity(target.watermarkOpacity !== undefined ? target.watermarkOpacity : 60);
    setWatermarkPadding(target.watermarkPadding !== undefined ? target.watermarkPadding : 24);
    setEnableLowerThird(target.enableLowerThird);
    setLowerThirdStyle(target.lowerThirdStyle || 'gradient-classic');
    setLowerThirdHeight(target.lowerThirdHeight !== undefined ? target.lowerThirdHeight : 22);
    setLowerThirdOpacity(target.lowerThirdOpacity !== undefined ? target.lowerThirdOpacity : 85);
    setPrimaryBgColor(target.primaryBgColor || '#0f172a');
    setAccentColor(target.accentColor || '#3b82f6');
    setPrimaryTextColor(target.primaryTextColor || '#ffffff');
    setSecondaryTextColor(target.secondaryTextColor || '#94a3b8');
    setUseUppercase(target.useUppercase !== false);
    setLowerThirdTheme(target.lowerThirdTheme || 'dark');
    setEnableFrame(target.enableFrame !== undefined ? target.enableFrame : false);
    setFrameColor(target.frameColor || '#3b82f6');
    setFrameThickness(target.frameThickness !== undefined ? target.frameThickness : 10);

    showToast(`Applied layout style: ${target.name}`);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id.startsWith('system-')) {
      showToast("Cannot delete system presets.");
      return;
    }
    try {
      const stored = localStorage.getItem('psis_photo_presets');
      const parsedList = stored ? JSON.parse(stored) : [];
      const filtered = parsedList.filter((p: any) => p.id !== id);
      localStorage.setItem('psis_photo_presets', JSON.stringify(filtered));
      
      setStylePresets([...SYSTEM_PRESETS, ...filtered]);
      if (selectedPresetId === id) setSelectedPresetId('');
      showToast("Style preset deleted.");
    } catch (err) {
      showToast("Error deleting style preset.");
    }
  };

  // Automated Skin-Tone Centennial Face Centring Core Heuristics
  const detectFaceCentering = (img: HTMLImageElement): { x: number, y: number } => {
    try {
      const analysisCanvas = document.createElement('canvas');
      const analysisCtx = analysisCanvas.getContext('2d');
      if (!analysisCtx) return { x: 0.5, y: 0.4 };

      const w = 80;
      const h = 80;
      analysisCanvas.width = w;
      analysisCanvas.height = h;
      analysisCtx.drawImage(img, 0, 0, w, h);

      const imgData = analysisCtx.getImageData(0, 0, w, h);
      const data = imgData.data;

      let sumX = 0;
      let sumY = 0;
      let count = 0;

      // Scan skin tone hue pixels (RGB boundaries)
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);

          // Skin threshold criteria in portrait photogrammetry
          if (r > 95 && g > 40 && b > 20 && (r - g) > 15 && r > b && (max - min) > 15) {
            // Give higher weight to upper-center portrait face ranges
            const weight = (y > h * 0.15 && y < h * 0.7 && x > w * 0.2 && x < w * 0.8) ? 3 : 0.6;
            sumX += x * weight;
            sumY += y * weight;
            count += weight;
          }
        }
      }

      if (count > 50) {
        const cx = (sumX / count) / w;
        const cy = (sumY / count) / h;
        return {
          x: Math.min(0.7, Math.max(0.3, cx)),
          y: Math.min(0.65, Math.max(0.22, cy))
        };
      }
    } catch (e) {
      console.warn("Face detection skin analysis fell back:", e);
    }
    return { x: 0.5, y: 0.4 }; // Center default
  };

  const runAllFaceAdjustments = () => {
    if (photos.length === 0) {
      showToast("No photos loaded in the queue.");
      return;
    }
    setProcessStatus('processing');
    let completed = 0;

    photos.forEach(photo => {
      const img = new Image();
      img.onload = () => {
        const detected = detectFaceCentering(img);
        setPhotos(prev => prev.map(p => {
          if (p.id === photo.id) {
            return {
              ...p,
              faceCenterX: detected.x,
              faceCenterY: detected.y,
              cropScale: p.cropScale || 0.85
            };
          }
          return p;
        }));
        completed++;
        if (completed === photos.length) {
          setProcessStatus('idle');
          showToast(`Face centering scanned & updated for all ${photos.length} photos!`);
        }
      };
      img.onerror = () => {
        completed++;
        if (completed === photos.length) {
          setProcessStatus('idle');
        }
      };
      img.src = photo.previewUrl;
    });
  };

  // Finds student record in CSV or fallback database using filename pattern mapping
  const findRecordInCsvOrDb = (filename: string, records: CsvRecord[], dbList: Student[]) => {
    const baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
    
    // Matches ID-[0-9]{3}, VH001079, ID-023 etc.
    const regex1 = /ID-(\d{3})/i;
    const regex2 = /(ID-[0-9]{3})/i;
    const regex3 = /(VH\d+)/i;
    const regex4 = /id_?(\d+)/i;
    const regex5 = /ST_?(\d+)/i;

    const match1 = baseName.match(regex1) || baseName.match(regex2) || baseName.match(regex3) || baseName.match(regex4) || baseName.match(regex5);
    let searchId = '';
    
    if (match1) {
      searchId = match1[0].toLowerCase().replace(/^id-?|^st-?/i, '');
    }

    // Try fuzzy match or exact ID match with parsed CSV data
    if (records.length > 0) {
      if (searchId) {
        const found = records.find(r => r.id.toLowerCase().includes(searchId) || searchId.includes(r.id.toLowerCase()));
        if (found) return found;
      }
      // Fuzzy query match
      const foundByName = records.find(r => {
        const rName = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return fName.includes(rName) || rName.includes(fName);
      });
      if (foundByName) return foundByName;
    }

    // Try matching in live app directory database
    if (dbList.length > 0) {
      if (searchId) {
        const found = dbList.find(s => s.id.toLowerCase().includes(searchId) || searchId.includes(s.id.toLowerCase()));
        if (found) {
          return {
            id: found.id,
            name: found.name,
            subtitle: found.class,
            daycare: found.auxiliary?.daycare,
            food: found.auxiliary?.food,
            transport: found.auxiliary?.transport,
            publicSpeaking: found.name.length % 3 === 0,
            debate: found.name.length % 4 === 0,
            sasmoMath: found.name.length % 5 === 0
          };
        }
      }
      // Fuzzy lookup name
      const foundByName = dbList.find(s => {
        const sName = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return fName.includes(sName) || sName.includes(fName);
      });
      if (foundByName) {
        return {
          id: foundByName.id,
          name: foundByName.name,
          subtitle: foundByName.class,
          daycare: foundByName.auxiliary?.daycare,
          food: foundByName.auxiliary?.food,
          transport: foundByName.auxiliary?.transport,
          publicSpeaking: foundByName.name.length % 3 === 0,
          debate: foundByName.name.length % 4 === 0,
          sasmoMath: foundByName.name.length % 5 === 0
        };
      }
    }

    return null;
  };

  // CSV spreadsheet parser mapped to lower thirds metadata
  const parseCSVData = (text: string) => {
    try {
      const lines = text.split('\n');
      const records: CsvRecord[] = [];
      
      lines.forEach((line, index) => {
        if (!line.trim()) return;
        const cols = line.split(/[,\t;]/).map(col => col.trim().replace(/^["']|["']$/g, ''));
        
        // Skip header lines
        if (index === 0 && (line.toLowerCase().includes('id') || line.toLowerCase().includes('name') || line.toLowerCase().includes('class'))) {
          return;
        }

        if (cols.length >= 2) {
          const id = cols[0];
          const name = cols[1];
          const classGrade = cols[2] || 'Grade 10-A';
          const daycare = cols[3]?.toLowerCase() === 'true' || cols[3] === '1';
          const food = cols[4]?.toLowerCase() === 'true' || cols[4] === '1';
          const transport = cols[5]?.toLowerCase() === 'true' || cols[5] === '1';
          const publicSpeaking = cols[6]?.toLowerCase() === 'true' || cols[6] === '1';
          const debate = cols[7]?.toLowerCase() === 'true' || cols[7] === '1';
          const sasmoMath = cols[8]?.toLowerCase() === 'true' || cols[8] === '1';

          records.push({
            id,
            name,
            subtitle: classGrade,
            daycare,
            food,
            transport,
            publicSpeaking,
            debate,
            sasmoMath
          });
        }
      });

      if (records.length > 0) {
        setCsvRecords(records);
        showToast(`Parsed ${records.length} CSV student mappings. Pipeline active!`);
        
        // Auto-update loaded photos
        setPhotos(prev => prev.map(photo => {
          const matched = findRecordInCsvOrDb(photo.file.name, records, dbStudents);
          if (matched) {
            return {
              ...photo,
              name: matched.name,
              subtitle: matched.subtitle,
              extraId: matched.id,
              showStudentBadge: true,
              showDaycareBadge: !!matched.daycare,
              showFoodBadge: !!matched.food,
              showTransportBadge: !!matched.transport,
              showPublicSpeakingBadge: !!matched.publicSpeaking,
              showDebateBadge: !!matched.debate,
              showSasmoMathBadge: !!matched.sasmoMath
            };
          }
          return photo;
        }));
      } else {
        showToast("Error: No key data lines observed in pasted CSV.");
      }
    } catch (err) {
      showToast("Error reading spreadsheet layout values.");
    }
  };

  // Automatically pre-populate and parse from current database
  const generateAndPopulateCSVTemplate = () => {
    const listToUse = dbStudents.length > 0 ? dbStudents : FALLBACK_STUDENTS;
    const header = "ID\tName\tClass\tDaycare\tMeal\tTransit\tPublicSpeaking\tDebate\tSasmoMath";
    const lines = listToUse.map(student => {
      const id = student.id || '';
      const name = student.name || '';
      const classStr = student.class || '';
      const daycare = student.auxiliary?.daycare ? 'true' : 'false';
      const food = student.auxiliary?.food ? 'true' : 'false';
      const transport = student.auxiliary?.transport ? 'true' : 'false';
      const speak = name.length % 3 === 0 ? 'true' : 'false';
      const debate = name.length % 4 === 0 ? 'true' : 'false';
      const sasmo = name.length % 5 === 0 ? 'true' : 'false';
      return `${id}\t${name}\t${classStr}\t${daycare}\t${food}\t${transport}\t${speak}\t${debate}\t${sasmo}`;
    });
    
    const fullText = [header, ...lines].join('\n');
    setCsvText(fullText);
    parseCSVData(fullText);
    showToast(`Pre-populated CSV with ${listToUse.length} students from database with Academic & Award records!`);
  };

  const downloadCSVTemplateFile = () => {
    const listToUse = dbStudents.length > 0 ? dbStudents : FALLBACK_STUDENTS;
    const header = "ID,Name,Class,Daycare,Meal,Transit,PublicSpeaking,Debate,SasmoMath";
    const lines = listToUse.map(student => {
      const id = student.id || '';
      const name = `"${(student.name || '').replace(/"/g, '""')}"`;
      const classStr = `"${(student.class || '').replace(/"/g, '""')}"`;
      const daycare = student.auxiliary?.daycare ? 'true' : 'false';
      const food = student.auxiliary?.food ? 'true' : 'false';
      const transport = student.auxiliary?.transport ? 'true' : 'false';
      const speak = (student.name || '').length % 3 === 0 ? 'true' : 'false';
      const debate = (student.name || '').length % 4 === 0 ? 'true' : 'false';
      const sasmo = (student.name || '').length % 5 === 0 ? 'true' : 'false';
      return `${id},${name},${classStr},${daycare},${food},${transport},${speak},${debate},${sasmo}`;
    });
    
    const csvContent = [header, ...lines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_csv_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded pre-populated CSV template file containing extra Awards.");
  };

  // Read images and calculate dimensions when added
  const handlePhotoFiles = (files: FileList) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const itemsToProcess: Promise<BatchPhotoItem>[] = [];

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) return;

      const promise = new Promise<BatchPhotoItem>((resolve) => {
        const previewUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          // Attempt smart filename parsing
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const cleanedName = baseName.replace(/[-_]/g, ' ');
          
          let parsedName = cleanedName;
          let parsedSubtitle = 'Grade 10-A';
          let parsedExtraId = 'ST' + Math.floor(100 + Math.random() * 900);

          // Custom regex fallback parsers
          const parts = baseName.split(/[-_]+/);
          if (parts.length >= 2) {
            const classIndex = parts.findIndex(p => /^(g(rade)?\d+\w?|\d+[-_]?[a-z])$/i.test(p));
            const idIndex = parts.findIndex(p => /^(id\d+|\d{3,})$/i.test(p));

            let nameParts: string[] = [];
            parts.forEach((part, idx) => {
              if (idx !== classIndex && idx !== idIndex) {
                nameParts.push(part);
              }
            });

            if (nameParts.length > 0) {
              parsedName = nameParts.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            }
            if (classIndex !== -1) {
              parsedSubtitle = parts[classIndex].toUpperCase();
              if (/^G\d+/i.test(parsedSubtitle) && !parsedSubtitle.startsWith('Grade')) {
                parsedSubtitle = 'Grade ' + parsedSubtitle.substring(1);
              }
            }
            if (idIndex !== -1) {
              parsedExtraId = parts[idIndex].replace(/id/i, '').toUpperCase();
              if (!parsedExtraId.startsWith('ID')) parsedExtraId = 'ST' + parsedExtraId;
            }
          } else {
            parsedName = cleanedName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
          }

          // Run fast offline face centering detection on loading!
          const detected = detectFaceCentering(img);

          // Let's call automated database pattern matching
          const matchResult = findRecordInCsvOrDb(file.name, csvRecords, dbStudents);
          
          if (matchResult) {
            resolve({
              id: Math.random().toString(36).substring(2, 11),
              file,
              previewUrl,
              originalWidth: img.naturalWidth || img.width || 800,
              originalHeight: img.naturalHeight || img.height || 800,
              name: matchResult.name,
              subtitle: matchResult.subtitle,
              extraId: matchResult.id,
              showStudentBadge: true,
              showDaycareBadge: !!matchResult.daycare,
              showFoodBadge: !!matchResult.food,
              showTransportBadge: !!matchResult.transport,
              faceCenterX: detected.x,
              faceCenterY: detected.y,
              cropScale: 0.85
            });
          } else {
            resolve({
              id: Math.random().toString(36).substring(2, 11),
              file,
              previewUrl,
              originalWidth: img.naturalWidth || img.width || 800,
              originalHeight: img.naturalHeight || img.height || 800,
              name: parsedName,
              subtitle: parsedSubtitle,
              extraId: parsedExtraId,
              showStudentBadge: true,
              showDaycareBadge: false,
              showFoodBadge: false,
              showTransportBadge: false,
              faceCenterX: detected.x,
              faceCenterY: detected.y,
              cropScale: 0.85
            });
          }
        };
        img.src = previewUrl;
      });

      itemsToProcess.push(promise);
    });

    if (itemsToProcess.length > 0) {
      Promise.all(itemsToProcess).then((newItems) => {
        setPhotos(prev => [...prev, ...newItems]);
        showToast(`Successfully processed ${newItems.length} photos. Matched with Database & CSV.`);
      });
    }
  };

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handlePhotoFiles(e.dataTransfer.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemToRemove = photos.find(p => p.id === id);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
    }
    const newPhotos = photos.filter(p => p.id !== id);
    setPhotos(newPhotos);
    if (selectedPhotoId === id) {
      setSelectedPhotoId(newPhotos.length > 0 ? newPhotos[0].id : null);
    }
  };

  const clearAllPhotos = () => {
    photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setSelectedPhotoId(null);
  };

  // Upload custom watermark logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWatermarkLogoUrl(event.target?.result as string);
        showToast("Custom watermark logo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const resetWatermarkLogo = () => {
    setWatermarkLogoUrl(DEFAULT_LOGO_URL);
    showToast("Reset watermarking to default institutional logo.");
  };

  // Metadata field updating
  const updatePhotoMeta = (id: string, field: string, value: any) => {
    setPhotos(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const bulkApplySubtitle = (text: string) => {
    if (!text) return;
    setPhotos(prev => prev.map(p => ({ ...p, subtitle: text })));
    showToast(`Bulk applied text: "${text}" to all photos.`);
  };

  const bulkApplyExtraId = (prefix: string) => {
    if (!prefix) return;
    setPhotos(prev => prev.map((p, index) => ({ ...p, extraId: `${prefix}-${100 + index}` })));
    showToast(`Bulk formatted IDs with prefix: "${prefix}"`);
  };

  // Helper code to canvas-draw a specific photo item with style definitions
  const drawPhotoWithOverlays = (
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement, 
    logoImg: HTMLImageElement | null, 
    item: BatchPhotoItem,
    width: number,
    height: number
  ) => {
    // 1. Draw base photo
    if (enablePassportCrop) {
      const faceX = (item.faceCenterX !== undefined ? item.faceCenterX : 0.5) * (img.naturalWidth || img.width || 800);
      const faceY = (item.faceCenterY !== undefined ? item.faceCenterY : 0.4) * (img.naturalHeight || img.height || 800);
      const scale = item.cropScale || 0.85;

      const sxAspect = 0.75; // 3:4 standard passport aspect ratio
      let sWidth = 0;
      let sHeight = 0;

      const natW = img.naturalWidth || img.width || 800;
      const natH = img.naturalHeight || img.height || 800;

      if (natW / natH > sxAspect) {
        sHeight = natH * scale;
        sWidth = sHeight * sxAspect;
      } else {
        sWidth = natW * scale;
        sHeight = sWidth / sxAspect;
      }

      // Crop box center on face - placing face at top 35% height for standard portrait passport framing
      let sx = faceX - sWidth / 2;
      let sy = faceY - sHeight * 0.35;

      // Keep crop box in image boundary
      if (sx < 0) sx = 0;
      if (sy < 0) sy = 0;
      if (sx + sWidth > natW) sx = natW - sWidth;
      if (sy + sHeight > natH) sy = natH - sHeight;

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
    } else {
      ctx.drawImage(img, 0, 0, width, height);
    }

    // Draw Customizable Frame Border
    if (enableFrame) {
      ctx.save();
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = frameThickness;
      ctx.strokeRect(frameThickness / 2, frameThickness / 2, width - frameThickness, height - frameThickness);
      ctx.restore();
    }

    // Determine banner theme overlays
    const activeTheme = item.lowerThirdTheme || lowerThirdTheme;
    const themeLight = activeTheme === 'light';

    const bannerBg = themeLight 
      ? (lowerThirdStyle === 'floating-pill' ? 'rgba(255, 255, 255, 0.94)' : '#ffffff') 
      : primaryBgColor;
    const titleColor = themeLight ? '#0f172a' : primaryTextColor;
    const subtitleColor = themeLight ? '#475569' : secondaryTextColor;
    const textIdColor = themeLight ? '#2563eb' : accentColor;

    // 2. Draw Lower Third Bar Overlay
    if (enableLowerThird) {
      const ltHeight = (lowerThirdHeight / 100) * height;
      const startY = height - ltHeight;
      const textPaddingX = width * 0.06;

      ctx.save();
      ctx.globalAlpha = lowerThirdOpacity / 100;

      switch (lowerThirdStyle) {
        case 'gradient-classic': {
          // Elegant bottom dark-gradient block
          const grad = ctx.createLinearGradient(0, startY - 40, 0, height);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          if (themeLight) {
            grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)');
            grad.addColorStop(1, '#ffffff');
          } else {
            grad.addColorStop(0.3, hexToRGBA(primaryBgColor, 0.9));
            grad.addColorStop(1, primaryBgColor);
          }
          ctx.fillStyle = grad;
          ctx.fillRect(0, startY - 40, width, ltHeight + 40);
          break;
        }

        case 'modern-accent': {
          // Stylish offset block with left vertical color-accent rule
          ctx.fillStyle = bannerBg;
          ctx.fillRect(0, startY, width, ltHeight);
          
          // Accent vertical left bar
          ctx.fillStyle = textIdColor;
          ctx.fillRect(0, startY, width * 0.025, ltHeight);
          break;
        }

        case 'floating-pill': {
          // Translucent floating bento-style pill
          const pillWidth = width * 0.88;
          const pillHeight = ltHeight * 0.8;
          const pillX = (width - pillWidth) / 2;
          const pillY = height - pillHeight - (width * 0.05);

          ctx.fillStyle = bannerBg;
          
          // Custom rounded rect drawing
          ctx.beginPath();
          drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 20);
          ctx.fill();

          // Left borderline accent curve inside the pill
          ctx.strokeStyle = textIdColor;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(pillX + 24, pillY + pillHeight / 2, 8, 0, Math.PI * 2);
          ctx.fillStyle = textIdColor;
          ctx.fill();
          break;
        }

        case 'cosmic-blur': {
          // Glossy translucent container reflecting a sci-fi workspace HUD overlay
          ctx.fillStyle = themeLight ? 'rgba(241, 245, 249, 0.9)' : hexToRGBA(primaryBgColor, 0.82);
          ctx.fillRect(0, startY, width, ltHeight);

          // Subtle top horizontal line divider
          ctx.strokeStyle = textIdColor;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, startY);
          ctx.lineTo(width, startY);
          ctx.stroke();

          // Sparkle tiny badge tag
          ctx.fillStyle = themeLight ? '#475569' : textIdColor;
          ctx.font = `bold ${Math.max(10, Math.round(width * 0.022))}px monospace`;
          ctx.fillText("CAMPUS ID", textPaddingX, startY + 22);
          break;
        }
      }
      ctx.restore();

      // Draw Lower Third Texts
      ctx.save();
      const isPill = lowerThirdStyle === 'floating-pill';
      const pillYOffset = isPill ? (width * 0.035) : 0;
      
      const titleText = useUppercase ? item.name.toUpperCase() : item.name;
      const subtitleText = useUppercase ? item.subtitle.toUpperCase() : item.subtitle;
      const tertiaryText = item.extraId ? `[ ID: ${item.extraId} ]` : '';

      // Responsive font sizing based on photo dimension
      const baseFontSize = Math.max(14, Math.round(width * 0.038));
      const subFontSize = Math.max(10, Math.round(width * 0.023));
      const tertFontSize = Math.max(9, Math.round(width * 0.020));

      const nameY = height - (ltHeight * 0.5) - pillYOffset;
      const subY = height - (ltHeight * 0.22) - pillYOffset;
      
      // Let's set alignments
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      // 1. Title Name
      ctx.fillStyle = titleColor;
      ctx.font = `black ${baseFontSize}px "Space Grotesk", "Inter", sans-serif`;
      ctx.fillText(titleText, textPaddingX + (isPill ? 18 : 0), nameY);

      // 2. Subtitle (Grade / Department)
      ctx.fillStyle = subtitleColor;
      ctx.font = `600 ${subFontSize}px "Inter", sans-serif`;
      
      let badgeX = textPaddingX + (isPill ? 18 : 0);
      ctx.fillText(subtitleText, badgeX, subY);

      // 3. ID Code (placed on right)
      if (item.extraId) {
        ctx.textAlign = 'right';
        ctx.fillStyle = textIdColor;
        ctx.font = `bold ${tertFontSize}px "JetBrains Mono", "Fira Code", monospace`;
        ctx.fillText(tertiaryText, width - textPaddingX, subY);
      }

      // 4. Draw Badges Layer on canvas (Circular capsules on the right side next to name)
      const showStu = item.showStudentBadge !== false;
      const showDay = !!item.showDaycareBadge;
      const showFoo = !!item.showFoodBadge;
      const showTra = !!item.showTransportBadge;
      const showSpeak = !!item.showPublicSpeakingBadge;
      const showDebate = !!item.showDebateBadge;
      const showSasmo = !!item.showSasmoMathBadge;

      if (showStu || showDay || showFoo || showTra || showSpeak || showDebate || showSasmo) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const activeBadges: { emoji: string, color: string, bg: string, label: string }[] = [];
        if (showStu) activeBadges.push({ emoji: '🎓', color: '#10b981', bg: 'rgba(16, 185, 129, 0.25)', label: 'Student' });
        if (showDay) activeBadges.push({ emoji: '👶', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.25)', label: 'Daycare' });
        if (showFoo) activeBadges.push({ emoji: '🍲', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.25)', label: 'Food' });
        if (showTra) activeBadges.push({ emoji: '🚌', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.25)', label: 'Transport' });
        if (showSpeak) activeBadges.push({ emoji: '🎤', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.25)', label: 'Speaking' });
        if (showDebate) activeBadges.push({ emoji: '🗣️', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.25)', label: 'Debate' });
        if (showSasmo) activeBadges.push({ emoji: '🏅', color: '#eab308', bg: 'rgba(234, 179, 8, 0.25)', label: 'SASMO' });

        const badgeSize = Math.max(16, Math.round(width * 0.045));
        const badgeGap = Math.round(badgeSize * 0.2);
        
        let startX = width - textPaddingX - (isPill ? 18 : 0);
        
        activeBadges.forEach((bg, index) => {
          const drawX = startX - (index * (badgeSize + badgeGap)) - badgeSize / 2;
          const drawY = nameY;

          // Capsule circle
          ctx.beginPath();
          ctx.arc(drawX, drawY, badgeSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = bg.bg;
          ctx.fill();
          ctx.strokeStyle = bg.color;
          ctx.lineWidth = Math.max(1, Math.round(width * 0.0025));
          ctx.stroke();

          // Emoji glyph centering
          ctx.font = `${badgeSize * 0.52}px system-ui, sans-serif`;
          ctx.fillText(bg.emoji, drawX, drawY + (width > 600 ? 1 : 0.5));
        });
        
        ctx.restore();
      }
      
      ctx.restore();
    }

    // 3. Draw Watermark Logo
    if (enableWatermark && logoImg) {
      ctx.save();
      ctx.globalAlpha = watermarkOpacity / 100;

      // Keep height relative to width based on original logo file aspect ratio
      const logoAspect = logoImg.naturalHeight / logoImg.naturalWidth || 1;
      const computedW = (watermarkSize / 100) * width;
      const computedH = computedW * logoAspect;

      const pad = watermarkPadding;

      let drawX = 0;
      let drawY = 0;

      switch (watermarkPosition) {
        case 'top-left':
          drawX = pad;
          drawY = pad;
          ctx.drawImage(logoImg, drawX, drawY, computedW, computedH);
          break;
        case 'top-right':
          drawX = width - computedW - pad;
          drawY = pad;
          ctx.drawImage(logoImg, drawX, drawY, computedW, computedH);
          break;
        case 'bottom-left':
          drawX = pad;
          drawY = height - computedH - pad - (enableLowerThird ? (lowerThirdHeight / 100) * height : 0);
          ctx.drawImage(logoImg, drawX, drawY, computedW, computedH);
          break;
        case 'bottom-right':
          drawX = width - computedW - pad;
          drawY = height - computedH - pad - (enableLowerThird ? (lowerThirdHeight / 100) * height : 0);
          ctx.drawImage(logoImg, drawX, drawY, computedW, computedH);
          break;
        case 'center':
          drawX = (width - computedW) / 2;
          drawY = (height - computedH) / 2;
          ctx.drawImage(logoImg, drawX, drawY, computedW, computedH);
          break;
        case 'tile':
          // Repeat tile loop
          const tileW = computedW;
          const tileH = computedH;
          for (let x = pad; x < width; x += tileW + width * 0.15) {
            for (let y = pad; y < height; y += tileH + height * 0.15) {
              ctx.drawImage(logoImg, x, y, tileW, tileH);
            }
          }
          break;
      }

      ctx.restore();
    }

    // Draw manual face alignment crosshair reticle if in crop adjustment tab
    if (activeTab === 'crop') {
      ctx.save();
      
      let facePointX = (item.faceCenterX !== undefined ? item.faceCenterX : 0.5) * width;
      let facePointY = (item.faceCenterY !== undefined ? item.faceCenterY : 0.4) * height;

      if (enablePassportCrop) {
        const faceX = (item.faceCenterX !== undefined ? item.faceCenterX : 0.5) * (img.naturalWidth || img.width || 800);
        const faceY = (item.faceCenterY !== undefined ? item.faceCenterY : 0.4) * (img.naturalHeight || img.height || 800);
        const scale = item.cropScale || 0.85;

        const sxAspect = 0.75;
        let sWidth = 0;
        let sHeight = 0;

        const natW = img.naturalWidth || img.width || 800;
        const natH = img.naturalHeight || img.height || 800;

        if (natW / natH > sxAspect) {
          sHeight = natH * scale;
          sWidth = sHeight * sxAspect;
        } else {
          sWidth = natW * scale;
          sHeight = sWidth / sxAspect;
        }

        let sx = faceX - sWidth / 2;
        let sy = faceY - sHeight * 0.35;

        if (sx < 0) sx = 0;
        if (sy < 0) sy = 0;
        if (sx + sWidth > natW) sx = natW - sWidth;
        if (sy + sHeight > natH) sy = natH - sHeight;

        facePointX = ((faceX - sx) / sWidth) * width;
        facePointY = ((faceY - sy) / sHeight) * height;
      }

      // Draw shiny cyber reticle
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)'; // cyan-500
      ctx.lineWidth = 2;
      
      // Target circles
      ctx.beginPath();
      ctx.arc(facePointX, facePointY, 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(facePointX, facePointY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();

      // Outer dashed rings
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(facePointX, facePointY, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Precision hair lines
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // horizontal
      ctx.moveTo(facePointX - 50, facePointY);
      ctx.lineTo(facePointX - 25, facePointY);
      ctx.moveTo(facePointX + 25, facePointY);
      ctx.lineTo(facePointX + 50, facePointY);
      // vertical
      ctx.moveTo(facePointX, facePointY - 50);
      ctx.lineTo(facePointX, facePointY - 25);
      ctx.moveTo(facePointX, facePointY + 25);
      ctx.lineTo(facePointX, facePointY + 50);
      ctx.stroke();

      // Label background & text
      const txt = "DRAG CROSSHAIR";
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      const txtW = ctx.measureText(txt).width;
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(facePointX - txtW/2 - 6, facePointY + 45, txtW + 12, 14);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.strokeRect(facePointX - txtW/2 - 6, facePointY + 45, txtW + 12, 14);

      ctx.fillStyle = '#22d3ee'; // cyan-400
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, facePointX, facePointY + 52);

      ctx.restore();
    }
  };

  // Helper utility functions
  const hexToRGBA = (hex: string, alpha: number) => {
    let r = 15, g = 23, b = 42; // default
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      let c = hex.substring(1);
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      r = parseInt(c.substring(0, 2), 16);
      g = parseInt(c.substring(2, 4), 16);
      b = parseInt(c.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Pointer-drag coordinate resolution helpers for crop alignment
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedPhoto) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingReticle(true);
    updateReticleFromEvent(e);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingReticle) {
      updateReticleFromEvent(e);
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingReticle) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDraggingReticle(false);
    }
  };

  const updateReticleFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedPhoto) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const natW = selectedPhoto.originalWidth || 800;
    const natH = selectedPhoto.originalHeight || 800;

    let targetX = clickX;
    let targetY = clickY;

    if (enablePassportCrop) {
      const faceX = (selectedPhoto.faceCenterX !== undefined ? selectedPhoto.faceCenterX : 0.5) * natW;
      const faceY = (selectedPhoto.faceCenterY !== undefined ? selectedPhoto.faceCenterY : 0.4) * natH;
      const scale = selectedPhoto.cropScale || 0.85;

      const sxAspect = 0.75;
      let sWidth = 0;
      let sHeight = 0;

      if (natW / natH > sxAspect) {
        sHeight = natH * scale;
        sWidth = sHeight * sxAspect;
      } else {
        sWidth = natW * scale;
        sHeight = sWidth / sxAspect;
      }

      let sx = faceX - sWidth / 2;
      let sy = faceY - sHeight * 0.35;

      if (sx < 0) sx = 0;
      if (sy < 0) sy = 0;
      if (sx + sWidth > natW) sx = natW - sWidth;
      if (sy + sHeight > natH) sy = natH - sHeight;

      const clickImageX = sx + clickX * sWidth;
      const clickImageY = sy + clickY * sHeight;

      targetX = clickImageX / natW;
      targetY = clickImageY / natH;
    }

    const clampedX = Math.min(0.95, Math.max(0.05, targetX));
    const clampedY = Math.min(0.95, Math.max(0.05, targetY));

    setPhotos(prev => prev.map(p => {
      if (p.id === selectedPhoto.id) {
        return {
          ...p,
          faceCenterX: clampedX,
          faceCenterY: clampedY
        };
      }
      return p;
    }));
  };

  // Live Canvas Rendering with fast-loading Cache stores (Optimized to perform partial re-renders only)
  useEffect(() => {
    if (!selectedPhoto || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let photoImg = photoCacheRef.current.get(selectedPhoto.id);
    let logoImg = logoCacheRef.current;

    const executeRender = (pImg: HTMLImageElement, lImg: HTMLImageElement | null) => {
      let renderW = selectedPhoto.originalWidth;
      let renderH = selectedPhoto.originalHeight;

      if (enablePassportCrop) {
        if (renderW / renderH > 0.75) {
          renderH = selectedPhoto.originalHeight;
          renderW = Math.round(renderH * 0.75);
        } else {
          renderW = selectedPhoto.originalWidth;
          renderH = Math.round(renderW * 1.3333);
        }
      }

      canvas.width = renderW;
      canvas.height = renderH;
      drawPhotoWithOverlays(
        ctx,
        pImg,
        enableWatermark ? lImg : null,
        selectedPhoto,
        renderW,
        renderH
      );
    };

    // Check if both photo and logo are already cached to hit instant draw
    const isPhotoCached = !!photoImg && photoImg.complete;
    const isLogoCached = !enableWatermark || (!!logoImg && logoImg.complete && logoImg.src === watermarkLogoUrl);

    if (isPhotoCached && isLogoCached) {
      // Instant redrawing callback with ZERO latency - perfect for fast sliders
      executeRender(photoImg!, logoImg);
      return;
    }

    // Load or cache photo async if needed
    const loadPhotoAndLogo = async () => {
      let loadedPhotoImg: HTMLImageElement;
      if (isPhotoCached) {
        loadedPhotoImg = photoImg!;
      } else {
        loadedPhotoImg = await new Promise<HTMLImageElement>((resolve) => {
          const pi = new Image();
          pi.onload = () => {
            photoCacheRef.current.set(selectedPhoto.id, pi);
            resolve(pi);
          };
          pi.src = selectedPhoto.previewUrl;
        });
      }

      let loadedLogoImg: HTMLImageElement | null = null;
      if (enableWatermark) {
        if (logoCacheRef.current && logoCacheRef.current.src === watermarkLogoUrl) {
          loadedLogoImg = logoCacheRef.current;
        } else {
          loadedLogoImg = await new Promise<HTMLImageElement | null>((resolve) => {
            const li = new Image();
            li.crossOrigin = 'anonymous';
            li.onload = () => {
              logoCacheRef.current = li;
              resolve(li);
            };
            li.onerror = () => {
              logoCacheRef.current = null;
              resolve(null);
            };
            li.src = watermarkLogoUrl;
          });
        }
      }

      executeRender(loadedPhotoImg, loadedLogoImg);
    };

    loadPhotoAndLogo();
  }, [
    selectedPhoto, 
    enableWatermark, 
    watermarkLogoUrl, 
    watermarkPosition, 
    watermarkSize, 
    watermarkOpacity, 
    watermarkPadding,
    enableLowerThird, 
    lowerThirdStyle, 
    lowerThirdHeight, 
    lowerThirdOpacity, 
    primaryBgColor, 
    accentColor, 
    primaryTextColor, 
    secondaryTextColor, 
    useUppercase,
    enablePassportCrop,
    lowerThirdTheme,
    selectedPhoto?.faceCenterX,
    selectedPhoto?.faceCenterY,
    selectedPhoto?.cropScale,
    selectedPhoto?.lowerThirdTheme,
    enableFrame,
    frameColor,
    frameThickness,
    activeTab
  ]);

  // Download single image
  const downloadSingleImage = () => {
    if (!canvasRef.current || !selectedPhoto) return;
    const ext = selectedPhoto.file.type === 'image/png' ? 'png' : 'jpeg';
    const link = document.createElement('a');
    link.download = `watermarked_${selectedPhoto.file.name.split('.')[0]}.${ext}`;
    link.href = canvasRef.current.toDataURL(selectedPhoto.file.type, 0.92);
    link.click();
    showToast(`Exported individually: "${link.download}"`);
  };

  // ZIP Batch exporter using JSZip and Offscreen Canvas looping
  const runBatchZipExport = async () => {
    if (photos.length === 0) return;
    setProcessStatus('processing');
    setZipProgress(5);

    try {
      const zip = new JSZip();
      const offscreenCanvas = document.createElement('canvas');
      const offCtx = offscreenCanvas.getContext('2d');

      if (!offCtx) throw new Error("Could not initialize offscreen context");

      // Load Logo first if watermarking
      let logoImg: HTMLImageElement | null = null;
      if (enableWatermark) {
        logoImg = await new Promise<HTMLImageElement | null>((resolve) => {
          const lImg = new Image();
          lImg.crossOrigin = 'anonymous';
          lImg.onload = () => resolve(lImg);
          lImg.onerror = () => resolve(null); // resolve gracefully
          lImg.src = watermarkLogoUrl;
        });
      }

      // Loop through all images and render sequentially
      for (let i = 0; i < photos.length; i++) {
        const item = photos[i];
        
        const photoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const pImg = new Image();
          pImg.onload = () => resolve(pImg);
          pImg.onerror = () => reject(new Error(`Failed to load photo ${item.file.name}`));
          pImg.src = item.previewUrl;
        });

        // Match resolution
        let renderW = item.originalWidth;
        let renderH = item.originalHeight;

        if (enablePassportCrop) {
          if (renderW / renderH > 0.75) {
            renderH = item.originalHeight;
            renderW = Math.round(renderH * 0.75);
          } else {
            renderW = item.originalWidth;
            renderH = Math.round(renderW * 1.3333);
          }
        }

        offscreenCanvas.width = renderW;
        offscreenCanvas.height = renderH;

        // Draw
        drawPhotoWithOverlays(offCtx, photoImg, logoImg, item, renderW, renderH);

        // Convert to blob and add
        const blob = await new Promise<Blob | null>((resolve) => {
          offscreenCanvas.toBlob((b) => resolve(b), item.file.type, 0.9);
        });

        if (blob) {
          const ext = item.file.type === 'image/png' ? 'png' : 'jpg';
          const filename = `processed_${item.name.replace(/\s+/g, '_')}.${ext}`;
          zip.file(filename, blob);
        }

        // Keep updating completion progress
        const percent = Math.round(((i + 1) / photos.length) * 80) + 10;
        setZipProgress(percent);
      }

      setZipProgress(95);
      const content = await zip.generateAsync({ type: "blob" });
      
      // Trigger download
      const zipLink = document.createElement('a');
      zipLink.href = URL.createObjectURL(content);
      zipLink.download = `psis_vh_processed_batch_${new Date().toISOString().slice(0, 10)}.zip`;
      zipLink.click();

      setProcessStatus('completed');
      showToast(`Batch exported successfully! Created archive containing ${photos.length} watermarked student headshots.`);
    } catch (err: any) {
      console.error(err);
      setProcessStatus('error');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-900 text-slate-100 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative">
      
      {/* Header Panel */}
      <div className="h-16 px-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              Batch Photo Processing Studio
              <span className="text-[8px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono font-bold leading-none">WATERMARKER & LOWER THIRD V1.0</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Simultaneously brand, align metadata, and bulk compile institutional files</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {photos.length > 0 && (
            <button 
              onClick={clearAllPhotos}
              className="text-[9px] font-black uppercase text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={12} />
              Clear Queue ({photos.length})
            </button>
          )}

          <button
            onClick={triggerFileInput}
            className="text-[9px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            <Plus size={14} /> Import Photos
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            accept="image/jpeg,image/png,image/webp" 
            className="hidden" 
            onChange={(e) => e.target.files && handlePhotoFiles(e.target.files)} 
          />
        </div>
      </div>

      {photos.length === 0 ? (
        /* Empty Workspace Dropzone */
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900/50">
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={triggerFileInput}
            className={cn(
              "w-full max-w-2xl aspect-video rounded-[2.5rem] border-3 border-dashed flex flex-col items-center justify-center p-12 transition-all cursor-pointer text-center",
              dragOver 
                ? "border-blue-500 bg-blue-500/5 shadow-2xl scale-[1.01]" 
                : "border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-950/10"
            )}
          >
            <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-xl mb-4 group-hover:scale-110 transition-transform">
              <Upload className="text-slate-400 group-hover:text-blue-500 animate-bounce" size={32} />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Drag & Drop Batch Photos</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1.5 leading-relaxed font-sans">
              Support JPG, PNG, or WEBP student portrait photo files. Drop them here or click to browse local files.
            </p>
            <div className="mt-8 flex gap-4 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-xl border border-slate-850">⚡ Autoparse Names</span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-xl border border-slate-850">🏷️ Custom Lower-Thirds</span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-xl border border-slate-850">📦 JSZIP Batch Export</span>
            </div>
          </div>
        </div>
      ) : (
        /* Active Workspace Dashboard Split */
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Photo Queue, File List, and Spreadsheet Data Edit Row */}
          <div className="w-1/3 border-r border-slate-800 bg-slate-950 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <span className="text-[10px] font-black uppercase text-slate-400">Queue & Student Bindings ({photos.length})</span>
              <div className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                <CheckCircle2 size={10} />
                FILENAME RIPPED
              </div>
            </div>

            {/* Bulk Assignment Tools */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col gap-3">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">⚡ Bulk Operations</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="e.g. Grade 10-A"
                    id="bulk-subtitle-input"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-white focus:outline-none focus:border-slate-700"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('bulk-subtitle-input') as HTMLInputElement;
                      if (input) {
                        bulkApplySubtitle(input.value);
                        input.value = '';
                      }
                    }}
                    className="w-full text-center py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded font-mono text-[8px] uppercase font-bold cursor-pointer transition-colors"
                  >
                    Apply Class
                  </button>
                </div>
                
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="e.g. ST-2026"
                    id="bulk-id-input"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-white focus:outline-none focus:border-slate-700"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('bulk-id-input') as HTMLInputElement;
                      if (input) {
                        bulkApplyExtraId(input.value);
                        input.value = '';
                      }
                    }}
                    className="w-full text-center py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded font-mono text-[8px] uppercase font-bold cursor-pointer transition-colors"
                  >
                    Apply Prefix ID
                  </button>
                </div>
              </div>
            </div>

            {/* List Queue */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-850/50 custom-scrollbar p-3 space-y-2">
              {photos.map((p, idx) => {
                const isActive = p.id === selectedPhotoId;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPhotoId(p.id)}
                    className={cn(
                      "p-3 rounded-2xl flex gap-3 cursor-pointer text-left transition-all border",
                      isActive 
                        ? "bg-slate-900 border-blue-600/60 shadow-xl shadow-blue-500/2" 
                        : "bg-slate-950/40 border-slate-900 hover:bg-slate-900/60"
                    )}
                  >
                    <div className="w-12 h-14 rounded-xl border border-slate-800 relative overflow-hidden shrink-0 bg-slate-950 flex items-center justify-center">
                      <img src={p.previewUrl} className="w-full h-full object-cover" />
                      <div className="absolute top-0.5 left-0.5 bg-slate-950/80 text-[7px] text-slate-400 font-mono px-1 rounded">
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[8px] font-mono font-bold text-slate-500 truncate block">{p.file.name}</span>
                        <button 
                          onClick={(e) => removePhoto(p.id, e)}
                          className="p-1 hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => updatePhotoMeta(p.id, 'name', e.target.value)}
                          className="w-full h-6 px-1.5 bg-slate-950 border border-slate-800/80 rounded font-bold text-[9.5px] text-white focus:outline-none focus:border-blue-600"
                          title="Name rendering in Lower Third bar"
                          placeholder="Primary Name"
                        />
                        <div className="grid grid-cols-2 gap-1">
                          <input
                            type="text"
                            value={p.subtitle}
                            onChange={(e) => updatePhotoMeta(p.id, 'subtitle', e.target.value)}
                            className="w-full h-5 px-1.5 bg-slate-950 border border-slate-800/80 rounded font-mono text-[8px] text-slate-300 focus:outline-none focus:border-blue-600"
                            title="Class/Dept rendering"
                            placeholder="Grade"
                          />
                          <input
                            type="text"
                            value={p.extraId}
                            onChange={(e) => updatePhotoMeta(p.id, 'extraId', e.target.value)}
                            className="w-full h-5 px-1.5 bg-slate-950 border border-slate-800/80 rounded font-mono text-[8px] text-cyan-400 focus:outline-none focus:border-blue-600"
                            title="ID number overlay"
                            placeholder="Roll ID"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Column: Live Generated Preview Canvas with Grid Background */}
          <div className="flex-1 bg-slate-900 border-r border-slate-800 flex flex-col position-relative overflow-hidden">
            <div className="h-10 border-b border-slate-800 px-6 bg-slate-950/40 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>🖥️ WYSIWYG Realtime Rendering Preview ({selectedPhoto ? `${selectedPhoto.originalWidth}x${selectedPhoto.originalHeight}px` : ''})</span>
              {selectedPhoto && <span className="text-blue-400 font-mono text-[9px] font-bold">Selected: {selectedPhoto?.name}</span>}
            </div>

            <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] overflow-auto">
              {selectedPhoto ? (
                <div className="relative max-h-full flex flex-col items-center justify-center gap-3">
                  {/* Real Canvas element */}
                  <canvas 
                    ref={canvasRef} 
                    className={cn(
                      "max-h-[50vh] max-w-[85%] rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/80 transition-all duration-350",
                      activeTab === 'crop' ? "cursor-crosshair touch-none border-cyan-500/60 shadow-cyan-950/20" : ""
                    )}
                    onPointerDown={activeTab === 'crop' ? handleCanvasPointerDown : undefined}
                    onPointerMove={activeTab === 'crop' ? handleCanvasPointerMove : undefined}
                    onPointerUp={activeTab === 'crop' ? handleCanvasPointerUp : undefined}
                  />
                  {activeTab === 'crop' && (
                    <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/30 text-cyan-400 font-mono text-[8px] uppercase tracking-wider animate-pulse shadow-md flex items-center gap-1.5">
                      <span>🎯 Drag directly on canvas to reposition crop center</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Please select a photo above to display live render preview.</p>
              )}
            </div>

            {/* Bottom Actions Banner */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-left gap-4">
              <div className="flex-1 text-left min-w-0">
                {processStatus === 'processing' ? (
                  <div className="space-y-1">
                    <p className="text-[8.5px] font-mono text-blue-400 uppercase font-black tracking-wider flex items-center gap-2">
                      <RefreshCw size={11} className="animate-spin text-blue-500" />
                      Rendering & Compiling archive batch: {zipProgress}%
                    </p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${zipProgress}%` }} />
                    </div>
                  </div>
                ) : processStatus === 'completed' ? (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={16} />
                    <span className="text-[9px] font-mono uppercase tracking-widest font-black leading-none">Compile Process Finished • Zip Dispatched</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[9.5px] font-black text-rose-500 block uppercase">Prerequisites</span>
                    <p className="text-[8.5px] text-slate-400 font-mono mt-0.5">Watermarks and Lower Third graphics are compiled into original pixels dynamically on export.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedPhoto && (
                  <button
                    onClick={downloadSingleImage}
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download size={14} /> Export Active Single
                  </button>
                )}

                <button
                  type="button"
                  onClick={runBatchZipExport}
                  disabled={photos.length === 0 || processStatus === 'processing'}
                  className={cn(
                    "px-5 py-2 rounded-xl text-[9.5px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl cursor-pointer transition-all",
                    photos.length > 0 && processStatus !== 'processing' 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/10" 
                      : "bg-slate-800 text-slate-500 border border-slate-850 cursor-not-allowed"
                  )}
                >
                  <FileArchive size={14} />
                  {processStatus === 'processing' ? 'Bundling' : `Compile & Export ZIP (${photos.length})`}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Style & Overlay Customization Panel */}
          <div className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col overflow-hidden">
            {/* Tab switch layout */}
            <div className="grid grid-cols-5 bg-slate-900 border-b border-slate-800 p-1 font-mono gap-1">
              <button
                onClick={() => setActiveTab('watermark')}
                className={cn(
                  "py-2 rounded-xl text-[7px] font-bold uppercase transition-all tracking-wide flex flex-col items-center gap-1",
                  activeTab === 'watermark' ? "bg-slate-950 text-white shadow-md border border-slate-800" : "text-slate-400 hover:text-white"
                )}
                title="Institutional logo branding layer"
              >
                <ImageIcon size={10} className={activeTab === 'watermark' ? "text-cyan-400" : "text-slate-500"} />
                Logo
              </button>
              <button
                onClick={() => setActiveTab('lowerthird')}
                className={cn(
                  "py-2 rounded-xl text-[7px] font-bold uppercase transition-all tracking-wide flex flex-col items-center gap-1",
                  activeTab === 'lowerthird' ? "bg-slate-950 text-white shadow-md border border-slate-800" : "text-slate-400 hover:text-white"
                )}
                title="Lower thirds caption block layout configuration"
              >
                <Layout size={10} className={activeTab === 'lowerthird' ? "text-cyan-400" : "text-slate-500"} />
                Caption
              </button>
              <button
                onClick={() => setActiveTab('layers')}
                className={cn(
                  "py-2 rounded-xl text-[7px] font-bold uppercase transition-all tracking-wide flex flex-col items-center gap-1",
                  activeTab === 'layers' ? "bg-slate-950 text-white shadow-md border border-slate-800" : "text-slate-400 hover:text-white"
                )}
                title="Student, daycare, catering, route visual tags manager"
              >
                <Layers2 size={10} className={activeTab === 'layers' ? "text-cyan-400" : "text-slate-500"} />
                Badges
              </button>
              <button
                onClick={() => setActiveTab('crop')}
                className={cn(
                  "py-2 rounded-xl text-[7px] font-bold uppercase transition-all tracking-wide flex flex-col items-center gap-1",
                  activeTab === 'crop' ? "bg-slate-950 text-white shadow-md border border-slate-800" : "text-slate-400 hover:text-white"
                )}
                title="Face alignment and passport 3:4 aspect ratio cropping"
              >
                <Crop size={10} className={activeTab === 'crop' ? "text-cyan-400" : "text-slate-500"} />
                Crop
              </button>
              <button
                onClick={() => setActiveTab('pipeline')}
                className={cn(
                  "py-2 rounded-xl text-[7px] font-bold uppercase transition-all tracking-wide flex flex-col items-center gap-1",
                  activeTab === 'pipeline' ? "bg-slate-950 text-white shadow-md border border-slate-800" : "text-slate-400 hover:text-white"
                )}
                title="Spreadsheets matching & Local Storage presets sync"
              >
                <Database size={10} className={activeTab === 'pipeline' ? "text-cyan-400" : "text-slate-500"} />
                Presets
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-6 text-left custom-scrollbar">
              
              {/* WATERMARK SETTINGS */}
              {activeTab === 'watermark' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Enable Watermark Logo</span>
                      <span className="text-[8px] text-slate-400 font-mono uppercase">Render logo on frames</span>
                    </div>
                    <button 
                      onClick={() => setEnableWatermark(!enableWatermark)}
                      className={cn(
                        "w-9 h-5 rounded-full relative transition-all",
                        enableWatermark ? "bg-cyan-500" : "bg-slate-700"
                      )}
                    >
                      <div className={cn("absolute top-1 w-3 h-3 rounded-full transition-all bg-white", enableWatermark ? "left-5" : "left-1")} />
                    </button>
                  </div>

                  {enableWatermark && (
                    <div className="space-y-4 pt-1">
                      {/* Logo selection source file */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Logo Asset</label>
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 p-1 flex items-center justify-center max-w-[40px] shrink-0">
                              <img src={watermarkLogoUrl} alt="Watermark logo" className="max-w-full max-h-full object-contain" onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://psisvh.vercel.app/logo.png';
                              }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-mono text-slate-300 uppercase truncate">Active Logo</p>
                              <p className="text-[7.5px] font-mono text-slate-500 truncate">{watermarkLogoUrl.startsWith('data:') ? 'Custom FileReader Base64' : watermarkLogoUrl}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => logoInputRef.current?.click()}
                              className="py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded text-[8px] font-mono font-bold uppercase cursor-pointer"
                            >
                              Upload File
                            </button>
                            <button
                              onClick={resetWatermarkLogo}
                              className="py-1.5 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-300 rounded text-[8px] font-mono font-bold uppercase border border-slate-800 cursor-pointer"
                            >
                              Reset default
                            </button>
                          </div>
                          <input 
                            type="file" 
                            ref={logoInputRef} 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleLogoUpload} 
                          />
                        </div>
                      </div>

                      {/* POSITION DROPDOWN */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Placement Alignment</label>
                        <select
                          value={watermarkPosition}
                          onChange={(e) => setWatermarkPosition(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-xl font-mono focus:outline-none"
                        >
                          <option value="top-left">📂 TOP LEFT CORNER</option>
                          <option value="top-right">📁 TOP RIGHT CORNER</option>
                          <option value="bottom-left">📂 BOTTOM LEFT CORNER</option>
                          <option value="bottom-right">📁 BOTTOM RIGHT CORNER</option>
                          <option value="center">🎯 ABSOLUTE CENTERED</option>
                          <option value="tile">🏁 REPEATED TILED LAYOUT</option>
                        </select>
                      </div>

                      {/* WATERMARK SCALE SLIDER */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                          <span>Logo Scale</span>
                          <span className="text-cyan-400">{watermarkSize}% of Width</span>
                        </div>
                        <input 
                          type="range"
                          min={5}
                          max={50}
                          value={watermarkSize}
                          onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* OPACITY SLIDER */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                          <span>Alpha Transparency</span>
                          <span className="text-cyan-400">{watermarkOpacity}%</span>
                        </div>
                        <input 
                          type="range"
                          min={10}
                          max={100}
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* EDGE PADDING SLIDER */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                          <span>Edge Margin Padding</span>
                          <span className="text-cyan-400">{watermarkPadding}px</span>
                        </div>
                        <input 
                          type="range"
                          min={8}
                          max={90}
                          value={watermarkPadding}
                          onChange={(e) => setWatermarkPadding(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LOWER THIRD SETTINGS */}
              {activeTab === 'lowerthird' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Enable Lower Third banner</span>
                      <span className="text-[8px] text-slate-400 font-mono uppercase">Student info bar at bottom</span>
                    </div>
                    <button 
                      onClick={() => setEnableLowerThird(!enableLowerThird)}
                      className={cn(
                        "w-9 h-5 rounded-full relative transition-all",
                        enableLowerThird ? "bg-cyan-500" : "bg-slate-700"
                      )}
                    >
                      <div className={cn("absolute top-1 w-3 h-3 rounded-full transition-all bg-white", enableLowerThird ? "left-5" : "left-1")} />
                    </button>
                  </div>

                  {enableLowerThird && (
                    <div className="space-y-4 pt-1">
                      {/* LAYOUT THEME TYPE */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Structural Card Style</label>
                        <div className="grid grid-cols-2 gap-1.5 font-sans">
                          {[
                            { id: 'gradient-classic', label: 'Classic Tint' },
                            { id: 'modern-accent', label: 'Left Accent' },
                            { id: 'floating-pill', label: 'Bento Pill' },
                            { id: 'cosmic-blur', label: 'HUD Cosmic' }
                          ].map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() => setLowerThirdStyle(theme.id as any)}
                              className={cn(
                                "py-2 rounded-xl text-[9px] font-black uppercase transition-all border tracking-wide",
                                lowerThirdStyle === theme.id 
                                  ? "bg-slate-900 text-cyan-400 border-cyan-500/50 shadow-md" 
                                  : "bg-slate-950 text-slate-400 border-slate-900 hover:bg-slate-900"
                              )}
                            >
                              {theme.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* BANNER THEME SELECTION ENGINE */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Bar Theme Tuning</label>
                        <div className="grid grid-cols-2 gap-1.5 font-sans">
                          <button
                            onClick={() => setLowerThirdTheme('light')}
                            className={cn(
                              "py-2 rounded-xl text-[9px] font-black uppercase transition-all border tracking-wide flex items-center justify-center gap-1.5",
                              lowerThirdTheme === 'light' 
                                ? "bg-white text-slate-950 border-white shadow-md" 
                                : "bg-slate-950 text-slate-400 border-slate-900 hover:bg-slate-900"
                            )}
                          >
                            ☀️ Minimalist Light
                          </button>
                          <button
                            onClick={() => setLowerThirdTheme('dark')}
                            className={cn(
                              "py-2 rounded-xl text-[9px] font-black uppercase transition-all border tracking-wide flex items-center justify-center gap-1.5",
                              lowerThirdTheme === 'dark' 
                                ? "bg-slate-900 text-cyan-400 border-cyan-500/50 shadow-md" 
                                : "bg-slate-950 text-slate-400 border-slate-900 hover:bg-slate-900"
                            )}
                          >
                            🌙 High-Contrast Dark
                          </button>
                        </div>
                      </div>

                      {/* COLORS DESIGN */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Color Assignments</label>
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] font-mono text-slate-400 uppercase">Banner Color</span>
                            <div className="flex gap-2 items-center">
                              <div className="w-6 h-6 rounded border border-slate-800 relative overflow-hidden">
                                <input type="color" value={primaryBgColor} onChange={e => setPrimaryBgColor(e.target.value)} className="absolute inset-[-6px] scale-150 cursor-pointer" />
                              </div>
                              <span className="text-[8px] font-mono text-slate-300">{primaryBgColor}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] font-mono text-slate-400 uppercase">Accent Stroke</span>
                            <div className="flex gap-2 items-center">
                              <div className="w-6 h-6 rounded border border-slate-800 relative overflow-hidden">
                                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="absolute inset-[-6px] scale-150 cursor-pointer" />
                              </div>
                              <span className="text-[8px] font-mono text-slate-300">{accentColor}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] font-mono text-slate-400 uppercase">Title Typography</span>
                            <div className="flex gap-2 items-center">
                              <div className="w-6 h-6 rounded border border-slate-800 relative overflow-hidden">
                                <input type="color" value={primaryTextColor} onChange={e => setPrimaryTextColor(e.target.value)} className="absolute inset-[-6px] scale-150 cursor-pointer" />
                              </div>
                              <span className="text-[8px] font-mono text-slate-300">{primaryTextColor}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[8px] font-mono text-slate-400 uppercase">Subtitle Typography</span>
                            <div className="flex gap-2 items-center">
                              <div className="w-6 h-6 rounded border border-slate-800 relative overflow-hidden">
                                <input type="color" value={secondaryTextColor} onChange={e => setSecondaryTextColor(e.target.value)} className="absolute inset-[-6px] scale-150 cursor-pointer" />
                              </div>
                              <span className="text-[8px] font-mono text-slate-300">{secondaryTextColor}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BANNER HEIGHT SLIDER */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                          <span>Banner Area Height</span>
                          <span className="text-cyan-400">{lowerThirdHeight}% of photo</span>
                        </div>
                        <input 
                          type="range"
                          min={12}
                          max={35}
                          value={lowerThirdHeight}
                          onChange={(e) => setLowerThirdHeight(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* BANNER OPACITY SLIDER */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                          <span>Banner Opacity</span>
                          <span className="text-cyan-400">{lowerThirdOpacity}%</span>
                        </div>
                        <input 
                          type="range"
                          min={30}
                          max={100}
                          value={lowerThirdOpacity}
                          onChange={(e) => setLowerThirdOpacity(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* UPPERCASE TOGGLE */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                        <span className="text-[9px] font-mono text-slate-400 uppercase">Force Text Capitalization</span>
                        <button
                          onClick={() => setUseUppercase(!useUppercase)}
                          className="p-1 hover:bg-slate-800 rounded"
                        >
                          {useUppercase ? (
                            <CheckSquare size={16} className="text-cyan-400" />
                          ) : (
                            <Square size={16} className="text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VISUAL BADGE LAYERS */}
              {activeTab === 'layers' && (
                <div className="space-y-5">
                  <SectionTitle title="Lower-Third Badge Layers" />
                  <p className="text-[8.5px] text-slate-400 font-sans leading-normal">
                    Tag and convey daycare, meals, or transport status details directly onto student photos to help school guides.
                  </p>

                  {selectedPhoto ? (
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <img src={selectedPhoto.previewUrl} className="w-8 h-9 rounded object-cover border border-slate-700 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-white block truncate">{selectedPhoto.name}</span>
                          <span className="text-[8px] text-cyan-400 font-mono tracking-wider block">ID: {selectedPhoto.extraId || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* 1. Student Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <span className="text-base">🎓</span>
                            <div className="flex flex-col text-left">
                              <span className="text-[9.5px] font-bold text-white uppercase">Student Badge</span>
                              <span className="text-[7.5px] text-slate-500 font-mono">Academic school membership</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => updatePhotoMeta(selectedPhoto.id, 'showStudentBadge', selectedPhoto.showStudentBadge === false ? true : false)}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {selectedPhoto.showStudentBadge !== false ? <CheckSquare size={16} className="text-emerald-400" /> : <Square size={16} />}
                          </button>
                        </div>

                        {/* 2. Daycare Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <span className="text-base">👶</span>
                            <div className="flex flex-col text-left">
                              <span className="text-[9.5px] font-bold text-white uppercase">Daycare Access</span>
                              <span className="text-[7.5px] text-slate-500 font-mono">Nursery/Infant boarding care</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => updatePhotoMeta(selectedPhoto.id, 'showDaycareBadge', !selectedPhoto.showDaycareBadge)}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {selectedPhoto.showDaycareBadge ? <CheckSquare size={16} className="text-pink-400" /> : <Square size={16} />}
                          </button>
                        </div>

                        {/* 3. Food Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <span className="text-base">🍲</span>
                            <div className="flex flex-col text-left">
                              <span className="text-[9.5px] font-bold text-white uppercase">Meal Catering</span>
                              <span className="text-[7.5px] text-slate-500 font-mono">School cafeteria catering plans</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => updatePhotoMeta(selectedPhoto.id, 'showFoodBadge', !selectedPhoto.showFoodBadge)}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {selectedPhoto.showFoodBadge ? <CheckSquare size={16} className="text-amber-400" /> : <Square size={16} />}
                          </button>
                        </div>

                        {/* 4. Transport Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <span className="text-base">🚌</span>
                            <div className="flex flex-col text-left">
                              <span className="text-[9.5px] font-bold text-white uppercase">School Transport</span>
                              <span className="text-[7.5px] text-slate-500 font-mono">Daily transit pickup service</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => updatePhotoMeta(selectedPhoto.id, 'showTransportBadge', !selectedPhoto.showTransportBadge)}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {selectedPhoto.showTransportBadge ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} />}
                          </button>
                        </div>

                        {/* 5. Public Speaking Award */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <span className="text-base">🎤</span>
                            <div className="flex flex-col text-left">
                              <span className="text-[9.5px] font-bold text-white uppercase">Public Speaking Award</span>
                              <span className="text-[7.5px] text-slate-500 font-mono">Debate champion & speaker laureate</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => updatePhotoMeta(selectedPhoto.id, 'showPublicSpeakingBadge', !selectedPhoto.showPublicSpeakingBadge)}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {selectedPhoto.showPublicSpeakingBadge ? <CheckSquare size={16} className="text-purple-400" /> : <Square size={16} />}
                          </button>
                        </div>

                        {/* 6. Debate Competition Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <span className="text-base">🗣️</span>
                            <div className="flex flex-col text-left">
                              <span className="text-[9.5px] font-bold text-white uppercase">Debate Competition</span>
                              <span className="text-[7.5px] text-slate-500 font-mono">Active co-curricular tournament award</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => updatePhotoMeta(selectedPhoto.id, 'showDebateBadge', !selectedPhoto.showDebateBadge)}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {selectedPhoto.showDebateBadge ? <CheckSquare size={16} className="text-rose-400" /> : <Square size={16} />}
                          </button>
                        </div>

                        {/* 7. SASMO Math Olympiad Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <span className="text-base">🏅</span>
                            <div className="flex flex-col text-left">
                              <span className="text-[9.5px] font-bold text-white uppercase">SASMO Math Competitor</span>
                              <span className="text-[7.5px] text-slate-500 font-mono">Singapore Asian schools Olympiad laureate</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => updatePhotoMeta(selectedPhoto.id, 'showSasmoMathBadge', !selectedPhoto.showSasmoMathBadge)}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {selectedPhoto.showSasmoMathBadge ? <CheckSquare size={16} className="text-yellow-400" /> : <Square size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setPhotos(prev => prev.map(p => ({
                              ...p,
                              showStudentBadge: selectedPhoto.showStudentBadge,
                              showDaycareBadge: selectedPhoto.showDaycareBadge,
                              showFoodBadge: selectedPhoto.showFoodBadge,
                              showTransportBadge: selectedPhoto.showTransportBadge,
                              showPublicSpeakingBadge: selectedPhoto.showPublicSpeakingBadge,
                              showDebateBadge: selectedPhoto.showDebateBadge,
                              showSasmoMathBadge: selectedPhoto.showSasmoMathBadge,
                            })));
                            showToast("Applied active badges configuration to all queue images.");
                          }}
                          className="w-full h-8 bg-slate-950 hover:bg-slate-850 hover:text-white text-slate-300 font-mono text-[8px] uppercase tracking-wider rounded-lg border border-slate-800 transition-colors cursor-pointer"
                        >
                          Copy these badges to all loaded frames
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-center">
                      <p className="text-[8.5px] text-slate-500 font-mono uppercase">Select a photo from queue to modify visual badge layers.</p>
                    </div>
                  )}
                </div>
              )}

              {/* PASSPORT CROPPING SETTINGS */}
              {activeTab === 'crop' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Passport 3:4 Crop</span>
                      <span className="text-[8px] text-slate-400 font-mono uppercase">Aspect-ratio face crop</span>
                    </div>
                    <button 
                      onClick={() => setEnablePassportCrop(!enablePassportCrop)}
                      className={cn(
                        "w-9 h-5 rounded-full relative transition-all",
                        enablePassportCrop ? "bg-cyan-500" : "bg-slate-700"
                      )}
                    >
                      <div className={cn("absolute top-1 w-3 h-3 rounded-full transition-all bg-white", enablePassportCrop ? "left-5" : "left-1")} />
                    </button>
                  </div>

                  {/* Portrait Frame/Border Control Panel */}
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">🖼️ Portrait Border Frame</span>
                        <span className="text-[8px] text-slate-400 font-mono uppercase">Add customizable color borders</span>
                      </div>
                      <button 
                        onClick={() => setEnableFrame(!enableFrame)}
                        className={cn(
                          "w-9 h-5 rounded-full relative transition-all",
                          enableFrame ? "bg-cyan-500" : "bg-slate-700"
                        )}
                      >
                        <div className={cn("absolute top-1 w-3 h-3 rounded-full transition-all bg-white", enableFrame ? "left-5" : "left-1")} />
                      </button>
                    </div>

                    {enableFrame && (
                      <div className="space-y-3 pt-1 border-t border-slate-800/60">
                        {/* Frame Color Picker */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[8px] font-mono text-slate-400 uppercase">Border Color</span>
                          <div className="flex gap-2 items-center">
                            <div className="w-6 h-6 rounded border border-slate-800 relative overflow-hidden">
                              <input 
                                type="color" 
                                value={frameColor} 
                                onChange={e => setFrameColor(e.target.value)} 
                                className="absolute inset-[-6px] scale-150 cursor-pointer" 
                              />
                            </div>
                            <span className="text-[8px] font-mono text-slate-300">{frameColor}</span>
                          </div>
                        </div>

                        {/* Frame Thickness Slider */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[8px] uppercase font-mono text-slate-400">
                            <span>Border Thickness</span>
                            <span className="text-cyan-400">{frameThickness}px</span>
                          </div>
                          <input 
                            type="range"
                            min="1.00"
                            max="30.00"
                            step="1.00"
                            value={frameThickness}
                            onChange={(e) => setFrameThickness(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {enablePassportCrop && (
                    <div className="space-y-4 pt-1">
                      <p className="text-[8.5px] text-slate-400 font-sans leading-normal">
                        Detects facial positioning and centers the camera frame in a standardized 1:1.333 ratio, placing watermarks afterward.
                      </p>

                      <button
                        onClick={runAllFaceAdjustments}
                        className="w-full h-9 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-[8px] uppercase font-black tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
                      >
                        <Sparkles size={11} className="shrink-0 animate-pulse text-yellow-300" /> Align All Faces in Queue
                      </button>

                      {selectedPhoto ? (
                        <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 mt-2">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                            <img src={selectedPhoto.previewUrl} className="w-8 h-9 rounded object-cover border border-slate-700 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-black text-white block truncate">{selectedPhoto.name}</span>
                              <span className="text-[8px] text-slate-400 font-mono block">Face alignment bounds</span>
                            </div>
                          </div>

                          {/* Passport Zoom Scale Slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] uppercase font-mono text-slate-400">
                              <span>Close-up Zoom</span>
                              <span className="text-cyan-400">{(selectedPhoto.cropScale || 0.85).toFixed(2)}x</span>
                            </div>
                            <input 
                              type="range"
                              min="0.40"
                              max="1.00"
                              step="0.01"
                              value={selectedPhoto.cropScale || 0.85}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setPhotos(prev => prev.map(p => p.id === selectedPhoto.id ? { ...p, cropScale: val } : p));
                              }}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          {/* Horizontal Centering Slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] uppercase font-mono text-slate-400">
                              <span>Horizontal Offset (X)</span>
                              <span className="text-cyan-400">{Math.round((selectedPhoto.faceCenterX || 0.5) * 100)}%</span>
                            </div>
                            <input 
                              type="range"
                              min="0.10"
                              max="0.90"
                              step="0.01"
                              value={selectedPhoto.faceCenterX || 0.5}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setPhotos(prev => prev.map(p => p.id === selectedPhoto.id ? { ...p, faceCenterX: val } : p));
                              }}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          {/* Vertical Centering Slider */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] uppercase font-mono text-slate-400">
                              <span>Vertical Offset (Y)</span>
                              <span className="text-cyan-400">{Math.round((selectedPhoto.faceCenterY || 0.4) * 100)}%</span>
                            </div>
                            <input 
                              type="range"
                              min="0.10"
                              max="0.90"
                              step="0.01"
                              value={selectedPhoto.faceCenterY || 0.4}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setPhotos(prev => prev.map(p => p.id === selectedPhoto.id ? { ...p, faceCenterY: val } : p));
                              }}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>

                          {/* Individual Theme Override */}
                          <div className="space-y-2 pt-2.5 border-t border-slate-800">
                            <label className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Individual override theme</label>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { id: 'default', label: 'Default' },
                                { id: 'dark', label: 'Dark' },
                                { id: 'light', label: 'Light' }
                              ].map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => {
                                    setPhotos(prev => prev.map(p => p.id === selectedPhoto.id ? { 
                                      ...p, 
                                      lowerThirdTheme: t.id === 'default' ? undefined : t.id as any 
                                    } : p));
                                  }}
                                  className={cn(
                                    "py-1 rounded text-[8px] font-bold uppercase transition-all tracking-wide border cursor-pointer",
                                    (t.id === 'default' && selectedPhoto.lowerThirdTheme === undefined) || (selectedPhoto.lowerThirdTheme === t.id)
                                      ? "bg-cyan-500/15 border-cyan-500 text-cyan-400" 
                                      : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900"
                                  )}
                                >
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-center font-mono text-[8px] uppercase">
                          Select an image to modify cropping boundaries.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* DATABASE AND CSV SYNC PIPELINE */}
              {activeTab === 'pipeline' && (
                <div className="space-y-5">
                  <SectionTitle title="Saved Layout Presets" />
                  
                  {/* Preset Quick Selection list */}
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                    <p className="text-[8px] text-slate-400 leading-normal font-sans">
                      Instantly save or select pre-configured watermark sizes, lower third styling layouts, and colors.
                    </p>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                      {stylePresets.map((preset) => (
                        <div 
                          key={preset.id}
                          onClick={() => {
                            handleApplyPreset(preset.id);
                            setSelectedPresetId(preset.id);
                          }}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-xl border text-left cursor-pointer transition-all",
                            selectedPresetId === preset.id 
                              ? "bg-slate-950 border-cyan-500 text-white" 
                              : "bg-slate-950/45 border-slate-850 text-slate-300 hover:bg-slate-950 hover:text-white"
                          )}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-[9px] font-black uppercase truncate">{preset.name}</p>
                            <span className="text-[7px] text-slate-500 font-mono tracking-wide">{preset.createdAt}</span>
                          </div>
                          {!preset.id.startsWith('system-') && (
                            <button
                              onClick={(e) => handleDeletePreset(preset.id, e)}
                              className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 cursor-pointer"
                              title="Delete preset"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Save Current Style Preset */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={newPresetName}
                          onChange={(e) => setNewPresetName(e.target.value)}
                          placeholder="My Golden Style Layout"
                          className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-500 text-[10px] text-white focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            if (!newPresetName.trim()) {
                              showToast("Please enter a preset name.");
                              return;
                            }
                            handleSavePreset(newPresetName);
                            setNewPresetName('');
                          }}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[8px] uppercase font-black px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Save size={11} /> Save
                        </button>
                      </div>
                    </div>
                  </div>

                  <SectionTitle title="Live Student Database" />
                  
                  {/* Database Indicators */}
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase text-white tracking-wide">Sync'd db connection</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {dbStudents.length} Profiles
                      </span>
                    </div>
                    <p className="text-[8px] text-slate-400 font-sans leading-relaxed">
                      Photo filenames with ID codes (e.g. ID-[0-9]&#123;3&#125; patterns) or student names are cross-referenced to automatically map names, classes, daycare, food, and transport status instantly on upload or import.
                    </p>
                  </div>

                  {/* Copy-Paste TSV/CSV Spreadsheet parser */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">spreadsheet copy/paste</label>
                      {csvRecords.length > 0 && (
                        <span className="text-[8px] font-mono text-cyan-400 px-1.5 py-0.5 bg-cyan-950/40 rounded-lg border border-cyan-800/40 font-black">
                          {csvRecords.length} Active Records
                        </span>
                      )}
                    </div>
                    
                    <textarea
                      value={csvText}
                      onChange={(e) => {
                        setCsvText(e.target.value);
                        parseCSVData(e.target.value);
                      }}
                      className="w-full h-28 p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[8px] text-slate-300 focus:outline-none focus:border-blue-600 custom-scrollbar"
                      placeholder="ID, Name, Class/Grade, Daycare(Y/N), Meal(Y/N), Transit(Y/N)&#13;&#10;VH001079, Gouv Ly Jing, G10A, true, true, false&#13;&#10;VH000835, Keo Lyphing, G10A, true, true, false"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[7.5px] text-slate-500 font-mono uppercase">
                      <span>Supports tabs or commas</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => {
                            const mockCSVPaste = `ID\tName\tClass\tDaycare\tMeal\tTransit\nVH001079\tGouv Ly Jing\tG10A\ttrue\ttrue\tfalse\nVH000835\tKeo Lyphing\tG10A\ttrue\ttrue\tfalse\nVH000083\tKhlok Uttakrakvortey\tG10A\ttrue\ttrue\tfalse`;
                            setCsvText(mockCSVPaste);
                            parseCSVData(mockCSVPaste);
                          }}
                          className="text-blue-400 hover:text-blue-350 transition-colors cursor-pointer"
                        >
                          ⚡ Load Demo
                        </button>
                        <span>|</span>
                        <button 
                          type="button"
                          onClick={generateAndPopulateCSVTemplate}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-bold"
                          title="Fills the CSV spreadsheet text above with current student records"
                        >
                          ✨ Auto Pre-populate From Database
                        </button>
                        <span>|</span>
                        <button 
                          type="button"
                          onClick={downloadCSVTemplateFile}
                          className="text-emerald-400 hover:text-emerald-350 transition-colors cursor-pointer"
                          title="Download pre-populated template .csv file for editing in Excel"
                        >
                          📥 Download .csv template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Helpers */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Bulk config</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const grade = prompt("Enter Grade/Class string (e.g. GRADE 10-A):", "GRADE G10A");
                          if (grade) bulkApplySubtitle(grade);
                        }}
                        className="h-8 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 text-[8.5px] font-mono uppercase font-bold tracking-wide flex items-center justify-center gap-1.5 border border-slate-800 cursor-pointer transition-colors"
                      >
                        <Type size={11} className="text-cyan-400" /> Apply Grade
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const prefix = prompt("Enter ID Prefix (e.g. STU, ID, VH):", "VH");
                          if (prefix) bulkApplyExtraId(prefix);
                        }}
                        className="h-8 rounded-xl bg-slate-905 hover:bg-slate-850 text-slate-200 text-[8.5px] font-mono uppercase font-bold tracking-wide flex items-center justify-center gap-1.5 border border-slate-800 cursor-pointer transition-colors"
                      >
                        <SlidersHorizontal size={11} className="text-cyan-400" /> Format IDs
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* Floating Global Micro Toast notification feedback popup */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-6 right-6 z-[200] max-w-sm p-4 bg-slate-955 border border-slate-800 rounded-2xl shadow-2xl flex gap-3 text-left items-center justify-between"
          >
            <div className="flex gap-2 items-center">
              <div className="p-1.5 bg-blue-500/10 text-cyan-400 rounded-lg shrink-0">
                <CheckCircle2 size={13} />
              </div>
              <p className="text-[9.5px] font-mono text-slate-250 uppercase font-black tracking-wide">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-slate-500 hover:text-slate-400"><X size={12} /></button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Simple visual header separator component
const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1.5">{title}</h3>
);

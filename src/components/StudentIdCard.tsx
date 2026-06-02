import React, { useState, useRef } from 'react';
import { cn } from '@/src/lib/utils';
import { 
  Phone, CheckCircle2, AlertCircle, Clock, AlertTriangle, ShieldCheck, 
  Printer, RefreshCw, Settings, Eye, EyeOff, Move, Plus, Minus, Download, Search,
  Award, Sparkles
} from 'lucide-react';
import { CardConfig, ElementConfig } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import Draggable from 'react-draggable';

interface StudentIdCardProps {
  student: {
    id: string;
    name: string;
    nameKh?: string;
    class: string;
    gender: string;
    profilePic: string;
    academicYear?: string;
    status?: 'active' | 'suspended' | 'warning' | 'dropout';
    paymentStatus?: 'paid' | 'unpaid' | 'partial';
    violationCount?: number;
    guardian1?: { name: string; photo?: string; contact?: string };
    guardian2?: { name: string; photo?: string; contact?: string };
  };
  type?: 'single' | 'pickup' | 'digital';
  side?: 'front' | 'back';
  config?: CardConfig;
  showControls?: boolean;
  onConfigChange?: (config: CardConfig) => void;
}

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
};

export const StudentIdCard: React.FC<StudentIdCardProps> = ({ 
  student, 
  type = 'single', 
  side: propSide = 'front', 
  config = DEFAULT_CONFIG,
  showControls = false,
  onConfigChange
}) => {
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>(propSide);
  const [isEditing, setIsEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const qrValue = `${window.location.origin}/website/studentid/${student.id}${student.name.replace(/\s+/g, '')}`;
  const isBack = currentSide === 'back';

  const handlePrint = () => {
    window.print();
  };

  const toggleSide = () => {
    setCurrentSide(prev => prev === 'front' ? 'back' : 'front');
  };

  const updateLayout = (key: string, updates: Partial<ElementConfig>) => {
    if (!onConfigChange || (!config.layout && !config.backLayout)) return;
    
    const newConfig = { ...config };
    if (isBack) {
      if (!newConfig.backLayout) return;
      const typedKey = key as keyof NonNullable<CardConfig['backLayout']>;
      // @ts-ignore
      newConfig.backLayout = {
        ...newConfig.backLayout,
        [typedKey]: { ...newConfig.backLayout[typedKey], ...updates }
      };
    } else {
      if (!newConfig.layout) return;
      const typedKey = key as keyof NonNullable<CardConfig['layout']>;
      // @ts-ignore
      newConfig.layout = {
        ...newConfig.layout,
        [typedKey]: { ...newConfig.layout[typedKey], ...updates }
      };
    }
    onConfigChange(newConfig);
  };

  const getStatusDisplay = () => {
    switch (student.status) {
      case 'suspended':
        return { color: 'bg-red-500', icon: <AlertCircle size={14} />, text: 'Suspension' };
      case 'warning':
        return { color: 'bg-orange-500', icon: <AlertTriangle size={14} />, text: 'Warning' };
      case 'active':
      default:
        return { color: 'bg-green-500', icon: <CheckCircle2 size={14} />, text: 'Active' };
    }
  };

  const status = getStatusDisplay();

  const cardStyle = {
    borderRadius: config.borderRadius ? `${config.borderRadius}px` : '1.5rem',
    fontFamily: config.fontFamily === 'mono' ? 'var(--font-mono)' 
                : config.fontFamily === 'serif' ? 'var(--font-serif)'
                : config.fontFamily === 'display' ? 'var(--font-display)'
                : config.fontFamily === 'khmer' ? 'var(--font-khmer)'
                : 'var(--font-sans)',
    padding: config.cardPadding ? `${config.cardPadding}px` : '0',
    background: config.bgType === 'gradient' 
      ? `linear-gradient(135deg, ${config.headerColor}, ${config.bgSecondary || '#ffffff'})`
      : config.bgType === 'solid' ? '#ffffff' : '#ffffff',
    position: 'relative' as const
  };

  const renderSchoolHeader = () => (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
         <div className="w-14 h-14 bg-white rounded-full p-1 border-2 shadow-sm flex items-center justify-center overflow-hidden" style={{ borderColor: config.primaryTextColor }}>
            <img src={config.logoUrl || "https://psisvh.vercel.app/logo.png"} alt="Logo" className="w-full h-full object-contain" />
         </div>
         <div className="text-left">
            <h2 className="text-[14px] font-black leading-tight" style={{ color: config.primaryTextColor }}>{config.schoolNameKh}</h2>
            <h3 className="text-[12px] font-bold leading-tight" style={{ color: config.secondaryTextColor }}>{config.schoolNameEn}</h3>
         </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-0 w-full max-w-[280px]">
         <div className="text-center">
            <p className="text-[10px] font-black leading-none" style={{ color: config.primaryTextColor }}>{config.tagline1Kh}</p>
            <p className="text-[8px] font-bold" style={{ color: config.secondaryTextColor }}>{config.tagline1En}</p>
         </div>
         <div className="text-center">
            <p className="text-[10px] font-black leading-none" style={{ color: config.primaryTextColor }}>{config.tagline2Kh}</p>
            <p className="text-[8px] font-bold" style={{ color: config.secondaryTextColor }}>{config.tagline2En}</p>
         </div>
         <div className="text-center">
            <p className="text-[10px] font-black leading-none" style={{ color: config.primaryTextColor }}>{config.tagline3Kh}</p>
            <p className="text-[8px] font-bold" style={{ color: config.secondaryTextColor }}>{config.tagline3En}</p>
         </div>
      </div>
    </div>
  );

  const renderPhoto = (size: number = 40, showBadge: boolean = false, badgeColor?: string) => (
    <div className="relative font-sans">
      <div 
        className={cn(
          "rounded-full border-[6px] p-1.5 bg-white shadow-xl relative z-10 overflow-hidden",
          config.isHonorGold && "border-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 border-amber-400"
        )} 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          borderColor: config.isHonorGold ? undefined : config.profileBorderColor 
        }}
      >
        {student.profilePic ? (
          <img src={student.profilePic} alt={student.name} className="w-full h-full object-cover rounded-full" />
        ) : (
          <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-4xl font-black text-slate-300">
            {student.name.charAt(0)}
          </div>
        )}
      </div>
      {(showBadge || config.isHonorGold) && (
        <div 
          className={cn(
            "absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-white z-20 flex items-center justify-center text-white shadow-lg", 
            config.isHonorGold ? "bg-gradient-to-r from-amber-500 to-yellow-400 border-yellow-250 text-slate-950 font-black" : (!badgeColor && status.color)
          )}
          style={badgeColor && !config.isHonorGold ? { backgroundColor: badgeColor } : {}}
        >
          {config.isHonorGold ? <Award size={14} className="text-slate-950 stroke-[2.5]" /> : status.icon}
        </div>
      )}
    </div>
  );

  const renderQR = (size: number = 80) => (
    <div className="p-2 bg-white rounded-xl shadow-inner border border-slate-100">
      <QRCodeSVG 
        value={qrValue}
        size={size}
        level="H"
        includeMargin={true}
        imageSettings={{
          src: config.logoUrl || "https://psisvh.vercel.app/logo.png",
          x: undefined,
          y: undefined,
          height: size * 0.25,
          width: size * 0.25,
          excavate: true,
        }}
      />
    </div>
  );

  const renderBarcode = (size: number = 130) => {
    const studentId = student.id || 'N/A';
    const bars: boolean[] = [];
    const seed = studentId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const startStop = [true, false, true, true, false, true, true, false, true];
    bars.push(...startStop);
    
    for (let j = 0; j < studentId.length; j++) {
      const code = studentId.charCodeAt(j);
      const pattern = ((code + seed) * 31).toString(2).slice(-7);
      for (const char of pattern) {
        bars.push(char === '1');
      }
      bars.push(false);
    }
    bars.push(...startStop);

    return (
      <div className="p-1.5 bg-white rounded-lg shadow-inner border border-slate-100 flex flex-col items-center gap-0.5 shrink-0">
        <div className="flex bg-white items-end" style={{ width: `${size}px`, height: '28px' }}>
          {bars.map((isBlack, index) => (
            <div
              key={index}
              className="h-full flex-1"
              style={{
                backgroundColor: isBlack ? '#090d16' : 'transparent',
                minWidth: '1.2px'
              }}
            />
          ))}
        </div>
        <span className="text-[7px] font-mono font-black text-slate-700 tracking-[0.2em]">{studentId}</span>
      </div>
    );
  };

  const renderInfo = (fontSize: number = 24) => (
    <div className="text-center space-y-1">
      <h1 className="font-black tracking-tight leading-none uppercase italic" style={{ color: config.primaryTextColor, fontSize: `${fontSize}px` }}>{student.name}</h1>
      {student.nameKh && <h2 className="font-black tracking-tight leading-none font-khmer" style={{ color: config.primaryTextColor, fontSize: `${fontSize * 0.8}px` }}>{student.nameKh}</h2>}
      <p className="font-black" style={{ color: config.primaryTextColor, fontSize: `${fontSize * 1.2}px` }}>({student.class})</p>
      <p className="text-[10px] font-bold text-slate-400">ID: {student.id} {student.academicYear ? `• ${student.academicYear}` : ''}</p>
    </div>
  );

  const renderGuardian = (guardian: { name?: string; photo?: string }, fontSize: number = 20) => (
    <div className="flex flex-col items-center gap-3">
      <div className="w-32 h-32 rounded-full border-[4px] border-amber-400 p-1 bg-white shadow-lg overflow-hidden">
        {guardian?.photo ? (
          <img src={guardian.photo} className="w-full h-full object-cover rounded-full" />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl text-slate-300">
             ?
          </div>
        )}
      </div>
      <div className="text-center">
         <h3 className="font-black" style={{ color: config.primaryTextColor, fontSize: `${fontSize}px` }}>{guardian?.name || 'Guardian Name'}</h3>
      </div>
    </div>
  );

  return (
    <div className="relative group/card-wrapper w-fit">
      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-between px-2 py-2 bg-white/90 backdrop-blur shadow-xl border border-slate-200 rounded-2xl z-[100] no-print opacity-0 group-hover/card-wrapper:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleSide}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Flip Card"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
              title="Print Card"
            >
              <Printer size={16} />
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "p-2 rounded-xl transition-all flex items-center gap-2 px-3",
                isEditing ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <Settings size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Customize</span>
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="absolute top-2 right-[-100px] flex flex-col gap-2 z-[100] no-print">
          <div className="bg-white p-3 rounded-2xl shadow-2xl border border-slate-200 flex flex-col gap-4">
             <SectionLabel label="Styling" />
             <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Header</span>
                  <input 
                    type="color" 
                    value={config.headerColor} 
                    onChange={e => onConfigChange?.({ ...config, headerColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Primary</span>
                  <input 
                    type="color" 
                    value={config.primaryTextColor} 
                    onChange={e => onConfigChange?.({ ...config, primaryTextColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Secondary</span>
                  <input 
                    type="color" 
                    value={config.secondaryTextColor} 
                    onChange={e => onConfigChange?.({ ...config, secondaryTextColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Profile Border</span>
                  <input 
                    type="color" 
                    value={config.profileBorderColor} 
                    onChange={e => onConfigChange?.({ ...config, profileBorderColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Font Family</span>
                  <select 
                    value={config.fontFamily || 'sans'}
                    onChange={e => onConfigChange?.({ ...config, fontFamily: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 text-[8px] font-black uppercase tracking-tight"
                  >
                    <option value="sans">Modern Sans</option>
                    <option value="serif">Classic Serif</option>
                    <option value="mono">Technical Mono</option>
                    <option value="khmer">Khmer Standard</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Radius</span>
                    <span className="text-[8px] font-black">{config.borderRadius || 24}px</span>
                  </div>
                  <input 
                    type="range" min="0" max="60" step="2"
                    value={config.borderRadius || 24}
                    onChange={e => onConfigChange?.({ ...config, borderRadius: parseInt(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>
             </div>

             <SectionLabel label="Visibility" />
             <div className="space-y-2">
                {Object.entries(isBack ? (config.backLayout || {}) : (config.layout || {})).map(([key, val]: [string, any]) => (
                  <button 
                    key={key}
                    onClick={() => updateLayout(key, { visible: !val.visible })}
                    className={cn(
                      "w-full px-2 py-1.5 rounded-lg flex items-center justify-between gap-2 transition-all border",
                      val.visible ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-400 opacity-50"
                    )}
                  >
                    <span className="text-[8px] font-black uppercase tracking-tight">{key}</span>
                    {val.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Top View Toggle */}
      <div className="mb-4 flex items-center justify-center gap-2 no-print">
        <button 
          onClick={() => setCurrentSide('front')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            currentSide === 'front' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-200"
          )}
        >
          Front View
        </button>
        <button 
          onClick={() => setCurrentSide('back')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            currentSide === 'back' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-200"
          )}
        >
          Back View
        </button>
      </div>

      <div 
        ref={cardRef}
        className={cn(
          "id-card-container w-[350px] min-h-[550px] shadow-2xl overflow-hidden relative flex flex-col select-none transition-all",
          config.isHonorGold ? "border-0 shadow-amber-200/40 ring-4 ring-amber-455" : "border border-slate-100",
          type === 'digital' && "scale-105 shadow-blue-200/50",
          config.bgType === 'pattern' && "bg-white",
          isEditing && "ring-4 ring-blue-500/20"
        )}
        style={cardStyle}
      >
        {config.isHonorGold && (
          <>
            {/* Elegant double-ring golden border overlays */}
            <div className="absolute inset-0 border-[6px] border-amber-500 rounded-[32px] pointer-events-none z-50 mix-blend-overlay" style={{ borderRadius: config.borderRadius ? `${config.borderRadius}px` : '1.5rem' }} />
            <div className="absolute inset-1 border-[2px] border-yellow-250 rounded-[28px] pointer-events-none z-50 opacity-60" style={{ borderRadius: config.borderRadius ? `${config.borderRadius - 4}px` : '1.25rem' }} />
            
            {/* Glowing yellow accent in the corners */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-yellow-250/0 to-amber-300/10 pointer-events-none z-10" />

            {/* Top academic honor roll badge */}
            <div className="absolute top-4 left-4 z-40 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-sans px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg border border-yellow-105">
              <Sparkles size={10} className="fill-slate-900 text-slate-900 animate-spin-once" />
              <span>Honor Roll</span>
            </div>
          </>
        )}

        {/* Background Image */}
        {(isBack ? config.backBackgroundImage : config.backgroundImage) && (
          <img src={isBack ? config.backBackgroundImage : config.backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
        )}

        {/* Overlay Image */}
        {config.overlayImage && (
          <img src={config.overlayImage} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none z-[40]" />
        )}

        {/* Custom Layout System */}
        {isBack && config.backLayout ? (
          <div className="absolute inset-0 z-10">
            {config.backLayout.schoolHeader?.visible && (
              <EditableWrapper 
                isEditing={isEditing}
                x={config.backLayout.schoolHeader.x}
                y={config.backLayout.schoolHeader.y}
                onStop={(x, y) => updateLayout('schoolHeader', { x, y })}
                label="Header"
              >
                {renderSchoolHeader()}
              </EditableWrapper>
            )}
            
            <div className="flex justify-around items-center w-full mt-40 px-4">
               {renderGuardian(student.guardian1 || {}, 18)}
               {renderGuardian(student.guardian2 || {}, 18)}
            </div>
            
            <EditableWrapper 
              isEditing={isEditing}
              x={config.backLayout.contactInfo.x}
              y={config.backLayout.contactInfo.y}
              onStop={(x, y) => updateLayout('contactInfo', { x, y })}
              label="Contact"
            >
              <div className="flex flex-col items-center gap-2">
                 <div className="flex items-center gap-3 py-2 px-6 bg-white/80 backdrop-blur rounded-full border border-slate-200">
                    <Phone size={24} className="text-blue-900" />
                    <span className="text-2xl font-black text-blue-900 tracking-tighter tabular-nums">{student.guardian1?.contact || student.guardian2?.contact || '000 000 000'}</span>
                 </div>
                 <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Parent Pickup Card</p>
              </div>
            </EditableWrapper>
          </div>
        ) : config.layout && !isBack ? (
          <div className="absolute inset-0 z-10">
            {config.layout.schoolHeader?.visible && (
              <EditableWrapper 
                isEditing={isEditing}
                x={config.layout.schoolHeader.x}
                y={config.layout.schoolHeader.y}
                onStop={(x, y) => updateLayout('schoolHeader', { x, y })}
                label="Header"
              >
                {renderSchoolHeader()}
              </EditableWrapper>
            )}
            {config.layout.photo.visible && (
              <EditableWrapper 
                isEditing={isEditing}
                x={config.layout.photo.x}
                y={config.layout.photo.y}
                onStop={(x, y) => updateLayout('photo', { x, y })}
                label="Photo"
                onResize={(delta) => updateLayout('photo', { fontSize: (config.layout?.photo.fontSize || 160) + delta })}
                onToggleVisibility={() => updateLayout('photo', { visible: false })}
              >
                {renderPhoto(
                  config.layout.photo.fontSize || 160, 
                  config.layout.photo.statusBadge?.visible,
                  config.layout.photo.statusBadge?.color
                )}
              </EditableWrapper>
            )}
            {config.layout.name.visible && (
              <EditableWrapper 
                isEditing={isEditing}
                x={config.layout.name.x}
                y={config.layout.name.y}
                onStop={(x, y) => updateLayout('name', { x, y })}
                label="Info"
                onResize={(delta) => updateLayout('name', { fontSize: (config.layout?.name.fontSize || 24) + delta })}
              >
                {renderInfo(config.layout.name.fontSize || 24)}
              </EditableWrapper>
            )}
            {config.layout.qr.visible && (
              <EditableWrapper 
                isEditing={isEditing}
                x={config.layout.qr.x}
                y={config.layout.qr.y}
                onStop={(x, y) => updateLayout('qr', { x, y })}
                label="QR"
                onResize={(delta) => updateLayout('qr', { fontSize: (config.layout?.qr.fontSize || 80) + delta })}
              >
                {renderQR(config.layout.qr.fontSize || 80)}
              </EditableWrapper>
            )}
            {config.layout.barcode?.visible && (
              <EditableWrapper 
                isEditing={isEditing}
                x={config.layout.barcode.x}
                y={config.layout.barcode.y}
                onStop={(x, y) => updateLayout('barcode', { x, y })}
                label="Barcode"
                onResize={(delta) => updateLayout('barcode', { fontSize: (config.layout?.barcode?.fontSize || 135) + delta })}
              >
                {renderBarcode(config.layout.barcode.fontSize || 135)}
              </EditableWrapper>
            )}
          </div>
        ) : (
          <>
            {/* Legacy Default Layout */}
            {!config.backgroundImage && (
              <div 
                className="absolute top-0 left-0 w-full h-[140px] z-1" 
                style={{ 
                  backgroundColor: config.headerColor,
                  borderBottomLeftRadius: config.borderRadius ? `${config.borderRadius / 2}px` : '0',
                  borderBottomRightRadius: config.borderRadius ? `${config.borderRadius / 2}px` : '0'
                }} 
              />
            )}
            
            <div className="absolute top-[120px] left-0 w-full h-[40px] z-10">
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full">
                <path d="M0.00,49.98 C150.00,150.00 349.82,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" fill={config.waveColor} className="opacity-100"></path>
              </svg>
            </div>

            <div className="relative z-20 p-4 pt-6 text-center">
              {renderSchoolHeader()}
            </div>

            <div className="relative z-20 flex-1 flex flex-col items-center justify-center pt-8 px-8">
              {renderPhoto(160)}
              <div className="mt-4">
                {renderInfo()}
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                {renderQR(80)}
                {renderBarcode(120)}
              </div>
            </div>

            <div className="relative z-20 mt-auto p-6 pt-0">
              <div className="h-1 w-full rounded-full mb-4 overflow-hidden flex" style={{ backgroundColor: config.primaryTextColor }}>
                <div className="w-1/2 h-full" style={{ backgroundColor: config.secondaryTextColor }} />
              </div>
              
              {type !== 'pickup' ? (
                <div className="text-[10px] font-bold text-slate-700 space-y-2 text-center px-4 leading-relaxed">
                  <p>This card is not transferable and must be returned when your child completes his/her course at PSIS-VH.</p>
                  <div className="flex items-center justify-center gap-2 font-black mt-2" style={{ color: config.primaryTextColor }}>
                    <p>Contact: 089 663 888 / 093 815 888</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                   <div className="flex items-center gap-2" style={{ color: config.primaryTextColor }}>
                      <Phone size={18} className="fill-current" />
                      <span className="text-xl font-black tabular-nums tracking-tighter">070 772 829</span>
                   </div>
                   <p className="text-[8px] font-bold text-slate-400">PICKUP CARD ONLY</p>
                </div>
              )}
            </div>

            <div className="absolute bottom-[-10px] left-0 w-full h-[100px] z-10 pointer-events-none">
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="h-full w-full rotate-180">
                <path d="M0.00,49.98 C150.00,150.00 349.82,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" fill={config.footerColor} className="opacity-80"></path>
              </svg>
            </div>
          </>
        )}

        {/* Profile Section for background ray deco (if decorative only) */}
        {!config.layout && (
          <div className="absolute inset-0 z-1 pointer-events-none opacity-5 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-3/4 h-3/4 fill-current" style={{ color: config.primaryTextColor }}>
                <circle cx="100" cy="100" r="80" />
                <g>
                  {[...Array(12)].map((_, i) => (
                    <rect key={i} x="98" y="10" width="4" height="180" transform={`rotate(${i * 30} 100 100)`} />
                  ))}
                </g>
              </svg>
          </div>
        )}

        {/* Status Badges for Digital Card - always show if digital */}
        {type === 'digital' && (
          <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
            <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 shadow-lg", status.color)}>
              {status.icon}
              {status.text}
            </div>
            {student.paymentStatus === 'unpaid' && (
              <div className="px-3 py-1 rounded-full text-[10px] font-bold text-white bg-red-600 flex items-center gap-1.5 shadow-lg animate-pulse">
                <Clock size={14} />
                Unpaid
              </div>
            )}
            {student.violationCount && student.violationCount > 0 && (
              <div className="px-3 py-1 rounded-full text-[10px] font-bold text-white bg-slate-800 flex items-center gap-1.5 shadow-lg">
                <ShieldCheck size={14} />
                Warning ({student.violationCount})
              </div>
            )}
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .id-card-container, .id-card-container * {
              visibility: visible;
            }
            .id-card-container {
              position: absolute;
              left: 0;
              top: 0;
              box-shadow: none !important;
              border: 1px solid #eee !important;
              break-inside: avoid;
              background-color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />
      </div>
    </div>
  );
};

const SectionLabel = ({ label }: { label: string }) => (
  <h4 className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</h4>
);

interface EditableWrapperProps {
  children: React.ReactNode;
  isEditing: boolean;
  x: number;
  y: number;
  onStop: (x: number, y: number) => void;
  onResize?: (delta: number) => void;
  onToggleVisibility?: () => void;
  label: string;
}

const EditableWrapper: React.FC<EditableWrapperProps> = ({ 
  children, isEditing, x, y, onStop, onResize, onToggleVisibility, label 
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  if (!isEditing) {
    return (
      <div style={{ position: 'absolute', left: x, top: y }}>
        {children}
      </div>
    );
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x, y }}
      onStop={(_, data) => onStop(data.x, data.y)}
      bounds="parent"
    >
      <div ref={nodeRef} className="absolute z-50 cursor-move group">
        <div className="absolute -inset-2 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none" />
        <div className="absolute -top-6 left-0 flex items-center gap-1">
          <div className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-lg">
            {label}
          </div>
          <div className="flex items-center gap-1 bg-white shadow-lg rounded-md border border-slate-200 p-0.5">
            {onResize && (
              <>
                <button onClick={(e) => { e.stopPropagation(); onResize(4); }} className="p-0.5 text-slate-500 hover:text-blue-600"><Plus size={10} /></button>
                <button onClick={(e) => { e.stopPropagation(); onResize(-4); }} className="p-0.5 text-slate-500 hover:text-blue-600"><Minus size={10} /></button>
              </>
            )}
            {onToggleVisibility && (
              <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }} className="p-0.5 text-slate-500 hover:text-rose-600"><EyeOff size={10} /></button>
            )}
          </div>
        </div>
        {children}
      </div>
    </Draggable>
  );
};


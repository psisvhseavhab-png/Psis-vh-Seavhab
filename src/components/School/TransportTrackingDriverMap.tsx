import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, 
  MapPin, 
  ShieldAlert, 
  Navigation, 
  User, 
  Phone, 
  Map, 
  TrendingUp, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Bell, 
  Zap, 
  Gauge,
  Compass,
  MapIcon,
  Search,
  UserCheck,
  Award
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

// Definitive interactive student route location tracking
interface StudentTransportProfile {
  id: string;
  name: string;
  nameKh: string;
  class: string;
  parent: string;
  tel: string;
  address: string;
  status: 'pending' | 'on_board' | 'dropped_off';
  type: 'pickup' | 'dropoff';
  x: number; // SVG horizontal percentage coordinate
  y: number; // SVG vertical percentage coordinate
  avatarColor: string;
  photoUrl?: string;
}

const INITIAL_STUDENTS: StudentTransportProfile[] = [
  { 
    id: 'ST101', 
    name: 'Darith Rotha', 
    nameKh: 'ដារិទ្ធ រដ្ឋា', 
    class: 'Grade 10 - Section A', 
    parent: 'Sokha Rotha (Father)', 
    tel: '012 345 678', 
    address: 'Mao Tse Toung Blvd, Boeung Keng Kang, Phnom Penh', 
    status: 'on_board', 
    type: 'pickup', 
    x: 25, 
    y: 35, 
    avatarColor: 'bg-emerald-500 border-emerald-300' 
  },
  { 
    id: 'ST102', 
    name: 'Chan Daravy', 
    nameKh: 'ចាន់ ដារ៉ាវី', 
    class: 'Grade 11 - Section B', 
    parent: 'Chan Mary (Mother)', 
    tel: '015 678 910', 
    address: 'Norodom Boulevard, Tonle Bassac, Chamkarmon, Phnom Penh', 
    status: 'pending', 
    type: 'pickup', 
    x: 65, 
    y: 28, 
    avatarColor: 'bg-amber-500 border-amber-300' 
  },
  { 
    id: 'ST103', 
    name: 'Ly Jing-Jing', 
    nameKh: 'លី ជីងជីង', 
    class: 'Grade 7 - Section G1', 
    parent: 'Gouv Ly Jing (Father)', 
    tel: '097 333 033', 
    address: 'Tuol Kork Central, Kampuchea Krom Blvd, Phnom Penh', 
    status: 'dropped_off', 
    type: 'dropoff', 
    x: 18, 
    y: 18, 
    avatarColor: 'bg-indigo-500 border-indigo-300' 
  },
  { 
    id: 'ST104', 
    name: 'Ouk Rothvisal', 
    nameKh: 'អ៊ុក រ័ត្នវិសាល', 
    class: 'Grade 12 - Section C', 
    parent: 'Ouk Dara (Father)', 
    tel: '012 251 051', 
    address: 'Russian Federation Blvd, Kakab, Sen Sok, Phnom Penh', 
    status: 'dropped_off', 
    type: 'dropoff', 
    x: 82, 
    y: 52, 
    avatarColor: 'bg-teal-500 border-teal-300' 
  },
  { 
    id: 'ST105', 
    name: 'Sopheak Narita', 
    nameKh: 'សុភ័ក្រ ណារីតា', 
    class: 'Grade 10 - Section A', 
    parent: 'Sopheak Narun (Father)', 
    tel: '015 609 666', 
    address: 'Sihanouk Boulevard, Veal Vong, Prampi Makara, Phnom Penh', 
    status: 'on_board', 
    type: 'dropoff', 
    x: 42, 
    y: 68, 
    avatarColor: 'bg-pink-500 border-pink-300' 
  }
];

// Phnom Penh transit street paths for interactive live visual simulation
const ROUTE_PATH_COORDINATES = [
  { x: 15, y: 15, name: 'Tuol Kork Terminal Start' },
  { x: 25, y: 35, name: 'Mao Tse Toung Waypoint' },
  { x: 42, y: 68, name: 'Sihanouk Blvd Interchange' },
  { x: 50, y: 50, name: 'Paññāsāstra Campus Hub (School)' },
  { x: 65, y: 28, name: 'Norodom Blvd Zone' },
  { x: 82, y: 52, name: 'Russian Blvd Outer Terminal' }
];

export function TransportTrackingDriverMap() {
  const [isOnDuty, setIsOnDuty] = useState<boolean>(true);
  const [students, setStudents] = useState<StudentTransportProfile[]>(INITIAL_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<StudentTransportProfile | null>(INITIAL_STUDENTS[0]);
  const [currentSpeed, setCurrentSpeed] = useState<number>(42);
  const [speedHistory, setSpeedHistory] = useState<number[]>([35, 38, 40, 42, 45, 42, 40, 42, 45, 41, 42, 43, 41, 42, 44]);
  const [busIndex, setBusIndex] = useState<number>(2); // starting intermediate point
  const [busPosition, setBusPosition] = useState<{ x: number; y: number }>({ x: 38, y: 50 });
  const [headingDirection, setHeadingDirection] = useState<string>('ENE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom sound play or tactile vibration alerts
  const [telegramAlertSent, setTelegramAlertSent] = useState<string | null>(null);
  const [routeWaypointName, setRouteWaypointName] = useState<string>('Sihanouk Blvd Interchange');
  const [showSpeedAlertModal, setShowSpeedAlertModal] = useState<boolean>(false);

  // Interval timers for live duty simulation
  useEffect(() => {
    let speedInterval: any;
    let busMovementInterval: any;

    if (isOnDuty) {
      // 1. Live Speedometer volatility simulation
      speedInterval = setInterval(() => {
        setCurrentSpeed(prev => {
          // Normal traffic variations
          const delta = (Math.random() * 8 - 4);
          const nextSpeed = Math.max(0, Math.min(68, Math.round(prev + delta)));
          
          setSpeedHistory(hist => {
            const nextHist = [...hist.slice(1), nextSpeed];
            return nextHist;
          });

          // Check speed limits
          if (nextSpeed > 55) {
            setShowSpeedAlertModal(true);
            setTimeout(() => setShowSpeedAlertModal(false), 3000);
          }

          return nextSpeed;
        });
      }, 1000);

      // 2. Bus smooth GPS crawl simulation across path coordinates
      busMovementInterval = setInterval(() => {
        setBusPosition(prev => {
          const targetNode = ROUTE_PATH_COORDINATES[busIndex];
          const diffX = targetNode.x - prev.x;
          const diffY = targetNode.y - prev.y;
          const distance = Math.sqrt(diffX * diffX + diffY * diffY);

          if (distance < 2.5) {
            // Arrived at waypoint! Advance route coordinates index
            const nextIndex = (busIndex + 1) % ROUTE_PATH_COORDINATES.length;
            setBusIndex(nextIndex);
            setRouteWaypointName(ROUTE_PATH_COORDINATES[nextIndex].name);
            
            // Adjust heading direction representation
            const cardinalDirections = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
            setHeadingDirection(cardinalDirections[Math.floor(Math.random() * cardinalDirections.length)]);
            return prev;
          }

          // Move step closer
          const stepSize = 0.55;
          return {
            x: Number((prev.x + (diffX / distance) * stepSize).toFixed(2)),
            y: Number((prev.y + (diffY / distance) * stepSize).toFixed(2))
          };
        });
      }, 250);
    } else {
      setCurrentSpeed(0);
    }

    return () => {
      clearInterval(speedInterval);
      clearInterval(busMovementInterval);
    };
  }, [isOnDuty, busIndex]);

  // Update a student status from the live interactive control
  const updateStudentStatus = (studentId: string, status: 'pending' | 'on_board' | 'dropped_off') => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const u = { ...s, status };
        if (selectedStudent?.id === studentId) {
          setSelectedStudent(u);
        }
        return u;
      }
      return s;
    }));
  };

  const triggerTelegramAlert = (student: StudentTransportProfile) => {
    setTelegramAlertSent(student.name);
    setTimeout(() => {
      setTelegramAlertSent(null);
    }, 4000);
  };

  const handleForceSpeedSpike = () => {
    setCurrentSpeed(62);
    setSpeedHistory(hist => [...hist.slice(1), 62]);
    setShowSpeedAlertModal(true);
    setTimeout(() => setShowSpeedAlertModal(false), 4000);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Warning HUD Overlay */}
      <AnimatePresence>
        {showSpeedAlertModal && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-rose-600 text-white rounded-2xl flex items-center justify-between gap-4 shadow-xl shadow-rose-600/25 border border-rose-500 z-50 relative"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert size={24} className="animate-bounce text-yellow-300" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">CRITICAL SPEED WARNING ALERT</p>
                <p className="text-[10px] text-rose-100 font-bold">Bus traveling at {currentSpeed} km/h, exceeding the city transport limit of 50 km/h!</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSpeedAlertModal(false)}
              className="px-3 py-1 bg-rose-800 text-[9px] uppercase font-black tracking-widest rounded-lg border border-rose-700 hover:bg-rose-950 transition-colors cursor-pointer"
            >
              Mute Siren
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {telegramAlertSent && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-6 right-6 p-4 bg-teal-600 text-white rounded-2xl flex items-center gap-3.5 shadow-2xl z-50 border border-teal-500 max-w-sm"
          >
            <Bell size={18} className="text-emerald-200 shrink-0 animate-swing" />
            <div>
              <p className="text-[10.5px] font-black leading-none uppercase tracking-wide">TELEGRAM NOTIFICATION BROADCASTED</p>
              <p className="text-[9.5px] font-medium mt-1">Status notification dispatched to parents of <b>{telegramAlertSent}</b> successfully.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Row: Driver Profile & Quick Duty Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 text-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 text-slate-800 opacity-20 pointer-events-none">
            <Compass size={180} />
          </div>

          <div className="flex items-center gap-4 z-10">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 border border-indigo-500/50 flex items-center justify-center font-black text-white text-xl shadow-lg">
              SM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white uppercase italic">Sok Mean</h2>
                <span className="bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-black text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Primary Conductor
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-bold tracking-tight mt-0.5">Vehicle Code: CO-8849 (Blue Coaster 32-Seater)</p>
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Route: Phnom Penh North-South Corridor
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 z-10 w-full sm:w-auto">
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">Conducting Duty Status</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOnDuty(true)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
                  isOnDuty 
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20" 
                    : "bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                ON DUTY
              </button>
              <button
                onClick={() => setIsOnDuty(false)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5",
                  !isOnDuty 
                    ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/20" 
                    : "bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white"
                )}
              >
                OFF DUTY
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Velocity Metrics Card */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-1">
              <Gauge size={14} className="text-blue-500" />
              Transit Velocimetry
            </span>
            <span className={cn(
              "text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
              currentSpeed > 50 
                ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" 
                : currentSpeed > 0 
                ? "bg-slate-100 border-slate-200 text-slate-600" 
                : "bg-amber-50 border-amber-200 text-amber-600"
            )}>
              {currentSpeed > 50 ? "OVER SPEED LIMIT!" : currentSpeed > 0 ? "IN MOTION" : "PARKED"}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tighter italic">{isOnDuty ? currentSpeed : 0}</span>
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">KM/H RECORD</span>
          </div>

          {/* Historical speed sparkline display */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Velocity Timeline History</span>
            <div className="h-6 flex items-end gap-1 select-none">
              {speedHistory.map((v, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "flex-1 rounded-sm transition-all duration-300", 
                    v > 50 ? "bg-rose-500" : v > 35 ? "bg-blue-500" : "bg-teal-400"
                  )}
                  style={{ height: `${Math.max(12, Math.min(100, (v / 68) * 100))}%` }}
                  title={`${v} km/h`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center mt-2.5 text-[8.5px] text-slate-400 font-bold uppercase">
              <span>Avg: 38 km/h</span>
              <button onClick={handleForceSpeedSpike} className="text-blue-500 hover:underline cursor-pointer">
                Simulate Speed Spike
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section split: Interactive Map view vs Student details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Large Interactive vector map Container */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-950/20 flex flex-col h-[520px] relative select-none">
          
          {/* Street Overlay Map Graphics HUD */}
          <div className="absolute top-4 left-4 z-10 p-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-2xl max-w-xs uppercase font-mono text-[8.5px] text-slate-400 flex flex-col gap-1">
            <p className="font-bold text-white flex items-center gap-1.5 mb-1 text-[9px]">
              <MapIcon size={12} className="text-cyan-400" />
              Interactive Radar Map
            </p>
            <p>Heading: <span className="text-cyan-400 font-bold">{isOnDuty ? headingDirection : "N/A"}</span></p>
            <p className="truncate">GPS Station: <span className="text-cyan-400 font-bold">{isOnDuty ? routeWaypointName : "Off Duty"}</span></p>
            <p>Target Campus: <span className="text-indigo-400 font-bold">Paññāsāstra Main campus</span></p>
          </div>

          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <div className="p-2 px-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl text-[8.5px] font-mono font-bold flex items-center gap-6 select-none shadow uppercase">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300">On Board</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-300">Awaiting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-300">Dropped off</span>
              </div>
            </div>
          </div>

          {/* Interactive vector SVG viewport */}
          <div className="flex-1 w-full h-full relative p-6">
            <svg 
              className="w-full h-full opacity-90 transition-all duration-300"
              viewBox="0 0 800 500" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Grid backdrop */}
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1"/>
                </pattern>
                <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />

              {/* Vector major roads map lines */}
              {/* Mao Tse Toung Road */}
              <line x1="50" y1="180" x2="750" y2="180" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="6" strokeLinecap="round" />
              <line x1="50" y1="180" x2="750" y2="180" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Norodom Boulevard */}
              <line x1="400" y1="20" x2="400" y2="480" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="6" strokeLinecap="round" />
              <line x1="400" y1="20" x2="400" y2="480" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Sihanouk Boulevard */}
              <line x1="120" y1="360" x2="680" y2="120" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="5" strokeLinecap="round" />
              <line x1="120" y1="360" x2="680" y2="120" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" strokeLinecap="round" />

              {/* Russian Federation Boulevard */}
              <path d="M 80 80 Q 300 120 400 250 T 720 400" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="4" fill="none" />
              <path d="M 80 80 Q 300 120 400 250 T 720 400" stroke="rgba(6, 182, 212, 0.09)" strokeWidth="1" fill="none" />

              {/* Route Standard Corridor line connector path (Dashed neon) */}
              <path 
                d="M 120 75 L 200 175 L 336 340 L 400 250 L 520 140 L 656 260" 
                stroke="#4338ca" 
                strokeWidth="3.5" 
                fill="none" 
                strokeDasharray="6, 8" 
                className="opacity-45"
              />
              <path 
                d="M 120 75 L 200 175 L 336 340 L 400 250 L 520 140 L 656 260" 
                stroke="#38bdf8" 
                strokeWidth="1.5" 
                fill="none" 
                strokeDasharray="4, 6" 
                className="opacity-70"
              />

              {/* School Node Campus central indicator (Large golden lock) */}
              <g transform="translate(400, 250)">
                <circle r="22" fill="rgba(79, 70, 229, 0.22)" stroke="rgba(79, 70, 229, 0.4)" strokeWidth="1" />
                <circle r="14" fill="#4f46e5" filter="url(#glowGreen)" />
                <circle r="6" fill="#ffffff" />
                <text y="-28" textAnchor="middle" fill="#a5b4fc" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  PAÑÑĀSĀSTRA CAMPUS
                </text>
              </g>

              {/* Live Moving Simulated Bus Icon (Only if on duty) */}
              {isOnDuty && (
                <g 
                  transform={`translate(${(busPosition.x * 8).toFixed(1)}, ${(busPosition.y * 5).toFixed(1)})`}
                  className="transition-all duration-300"
                >
                  <circle r="16" fill="rgba(6, 182, 212, 0.28)" filter="url(#glowCyan)" />
                  <circle r="9" fill="#06b6d4" />
                  <circle r="4" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                  <rect x="-6" y="-6" width="12" height="12" fill="none" stroke="#22d3ee" strokeWidth="1" />
                </g>
              )}
            </svg>

            {/* Html Interactive pins mapped over SVG coordinate ratios */}
            {students.map((student) => {
              const active = selectedStudent?.id === student.id;
              
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="absolute p-1 group z-20 cursor-pointer focus:outline-none transition-transform duration-150 active:scale-95"
                  style={{ 
                    left: `${student.x}%`, 
                    top: `${student.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="relative">
                    {/* Ring animations */}
                    <span className={cn(
                      "absolute -inset-2.5 rounded-full opacity-65 animate-ping",
                      student.status === 'on_board' ? "bg-emerald-500/20" :
                      student.status === 'pending' ? "bg-amber-500/20" :
                      "bg-indigo-500/20"
                    )} style={{ animationDuration: '3s' }} />

                    {/* Pin Box marker */}
                    <div className={cn(
                      "px-2.5 py-1.5 rounded-xl border font-bold text-[8px] flex items-center gap-1.5 shadow-xl transition-all duration-150",
                      active 
                        ? "bg-slate-900 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30 scale-110" 
                        : "bg-slate-950/90 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                    )}>
                      {student.type === 'pickup' ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Pickup" />
                      ) : (
                        <div className="w-1.5 h-1.5 bg-pink-500" title="Dropoff" />
                      )}
                      
                      <span>{student.name}</span>

                      {/* Small Status bead */}
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        student.status === 'on_board' ? "bg-emerald-500" :
                        student.status === 'pending' ? "bg-amber-500 animate-pulse" :
                        "bg-indigo-500"
                      )} />
                    </div>

                    {/* Mini Arrow pin pointing down */}
                    <div className={cn(
                      "w-1.5 h-1.5 rotate-45 mx-auto -mt-0.5 border-r border-b",
                      active ? "bg-slate-900 border-cyan-400" : "bg-slate-950/90 border-slate-800"
                    )} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Profile & Boarding Status Updates */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase italic mb-4 flex items-center justify-between">
              Selected Student Profile
              <User size={16} className="text-blue-500" />
            </h3>

            {selectedStudent ? (
              <div className="space-y-5">
                {/* Profile header visual */}
                <div className="flex items-center gap-4.5 pb-4 border-b border-slate-100">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg uppercase shadow-inner border", selectedStudent.avatarColor)}>
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 leading-tight">{selectedStudent.name}</h4>
                    <p className="font-extrabold text-slate-500 text-[10.5px] tracking-wide">{selectedStudent.nameKh}</p>
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">{selectedStudent.class}</span>
                  </div>
                </div>

                {/* Logistics details details */}
                <div className="space-y-3">
                  <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transport Operation Mode</span>
                    <span className={cn(
                      "font-black text-[10px] uppercase tracking-wide",
                      selectedStudent.type === 'pickup' ? "text-blue-600" : "text-pink-600"
                    )}>
                      {selectedStudent.type === 'pickup' ? "↑ SCHOOL PICK-UP SEQUENCE" : "↓ HOME DROP-OFF SEQUENCE"}
                    </span>
                  </div>

                  <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Residential Location Details</span>
                    <p className="text-[10px] font-bold text-slate-700 leading-relaxed">{selectedStudent.address}</p>
                  </div>

                  <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Parent / Guardian Node</span>
                    <p className="text-[10px] font-bold text-slate-800">{selectedStudent.parent}</p>
                    <a 
                      href={`tel:${selectedStudent.tel}`} 
                      className="text-[9.5px] font-bold text-blue-600 hover:underline flex items-center gap-1.5 mt-1"
                    >
                      <Phone size={11} />
                      {selectedStudent.tel} (Quick Contact)
                    </a>
                  </div>
                </div>

                {/* Duty toggle controls */}
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col gap-2.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block text-center">Conductor status updater</span>
                  
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => updateStudentStatus(selectedStudent.id, 'pending')}
                      className={cn(
                        "py-2 px-1 rounded-xl text-[8.5px] font-black uppercase tracking-wider text-center border transition-all cursor-pointer",
                        selectedStudent.status === 'pending'
                          ? "bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/10"
                          : "bg-white hover:bg-slate-150 text-slate-500 border-slate-200"
                      )}
                    >
                      Awaiting
                    </button>
                    <button
                      onClick={() => updateStudentStatus(selectedStudent.id, 'on_board')}
                      className={cn(
                        "py-2 px-1 rounded-xl text-[8.5px] font-black uppercase tracking-wider text-center border transition-all cursor-pointer",
                        selectedStudent.status === 'on_board'
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/10"
                          : "bg-white hover:bg-slate-150 text-slate-500 border-slate-200"
                      )}
                    >
                      On Board
                    </button>
                    <button
                      onClick={() => updateStudentStatus(selectedStudent.id, 'dropped_off')}
                      className={cn(
                        "py-2 px-1 rounded-xl text-[8.5px] font-black uppercase tracking-wider text-center border transition-all cursor-pointer",
                        selectedStudent.status === 'dropped_off'
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                          : "bg-white hover:bg-slate-150 text-slate-500 border-slate-200"
                      )}
                    >
                      Dropped
                    </button>
                  </div>

                  <button
                    onClick={() => triggerTelegramAlert(selectedStudent)}
                    className="mt-1 w-full py-2 bg-sky-500 hover:bg-sky-600 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow"
                  >
                    <Zap size={10} />
                    Push Parent Telegram Alert
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-2">
                <MapPin size={24} className="text-slate-300" />
                <p className="text-xs font-bold font-mono">Select map pin to view profile</p>
              </div>
            )}
          </div>

          {/* Localized Search & Student roster quick selector */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">Search Bus Service Roster ({students.length})</span>
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Find name/ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500/15"
              />
            </div>

            <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
              {filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={cn(
                    "w-full p-2.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between shrink-0 cursor-pointer",
                    selectedStudent?.id === student.id
                      ? "bg-slate-55 text-slate-900 border-indigo-200"
                      : "bg-white hover:bg-slate-50 border-slate-100"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      student.status === 'on_board' ? "bg-emerald-500" :
                      student.status === 'pending' ? "bg-amber-500" :
                      "bg-indigo-500"
                    )} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-800 truncate leading-tight">{student.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 truncate">{student.id} • {student.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-slate-350 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Transit Logs & Audit History Timeline */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
        <h4 className="font-black text-slate-900 uppercase italic mb-4 flex items-center gap-2">
          <Clock size={16} className="text-indigo-500 animate-spin" style={{ animationDuration: '10s' }} />
          Live GPS Route Transit Log
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[9.5px]">
          <div className="p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 size={13} className="text-emerald-500 mt-0.5" />
            <div>
              <p className="font-extrabold text-slate-800">07:15 AM - Tuol Kork Departure</p>
              <p className="text-slate-450 mt-0.5">Journey started. Sros Sonorakvibol reported present.</p>
            </div>
          </div>
          <div className="p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 size={13} className="text-emerald-500 mt-0.5" />
            <div>
              <p className="font-extrabold text-slate-800">07:35 AM - Mao Tse Toung Road</p>
              <p className="text-slate-450 mt-0.5">Darith Rotha successfully boarded on time.</p>
            </div>
          </div>
          <div className="p-3 bg-blue-50/45 border border-blue-100/55 rounded-xl flex items-start gap-2.5">
            <Navigation size={13} className="text-blue-500 animate-pulse mt-0.5" />
            <div>
              <p className="font-extrabold text-slate-800">07:55 AM - Approaching Sihanouk Blvd</p>
              <p className="text-slate-450 mt-0.5">Driving velocity: {isOnDuty ? currentSpeed : 0} km/h. Smooth traffic flow.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

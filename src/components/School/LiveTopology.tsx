import React, { useState } from 'react';
import { 
  Map, Monitor, Users, User, BookOpen, Clock, Activity, 
  MapPin, Shield, Zap, Search, Filter, Maximize2, MoreHorizontal,
  ChevronRight, Calendar, AlertCircle, Lock, Unlock, Settings, 
  RefreshCw, Play, Volume2, Camera, X, Eye, EyeOff, Power, Terminal, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

// Mock data for rooms and real-time status
const mockTopology = [
  // Ground Floor
  {
    id: 'G-01',
    floor: 'Ground Floor',
    room: 'Main Reception',
    status: 'teaching',
    subject: 'Student Orientation',
    class: 'New Intake',
    teacher: 'Admissions Team',
    studentCount: 45,
    startTime: '08:00 AM',
    endTime: '10:00 AM',
    equipment: ['Info Kiosk', 'Display Wall'],
    temperature: '23°C',
    alerts: [],
    cameraIp: '192.168.1.101',
    cameraFeedUrl: 'https://images.unsplash.com/photo-1541829019-259276a7f013?auto=format&fit=crop&w=800&q=80'
  },
  // Floor 1
  {
    id: 'F1-01',
    floor: 'Floor 1',
    room: 'Room 101',
    status: 'teaching',
    subject: 'Advanced Mathematics',
    class: 'G10-A',
    teacher: 'Dr. Sarah Wilson',
    studentCount: 28,
    startTime: '08:00 AM',
    endTime: '09:30 AM',
    equipment: ['Smart Board', 'Projector'],
    temperature: '22°C',
    alerts: [],
    cameraIp: '192.168.1.102',
    cameraFeedUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80'
  },
  // Floor 2
  {
    id: 'F2-LIB',
    floor: 'Floor 2',
    room: 'Digital Library',
    status: 'teaching',
    subject: 'Research Period',
    class: 'G11-B',
    teacher: 'Librarian Sopheak',
    studentCount: 35,
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    equipment: ['E-Readers', 'Silent Zone'],
    temperature: '21°C',
    alerts: [],
    cameraIp: '192.168.1.103',
    cameraFeedUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'F2-LAB',
    floor: 'Floor 2',
    room: 'Science Lab',
    status: 'teaching',
    subject: 'Chemistry Practical',
    class: 'G12-A',
    teacher: 'Mr. Robert Chen',
    studentCount: 20,
    startTime: '08:30 AM',
    endTime: '10:30 AM',
    equipment: ['Lab Access', 'Safety Kits'],
    temperature: '20°C',
    alerts: ['Chemical Hazard Protocol'],
    cameraIp: '192.168.1.104',
    cameraFeedUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'F2-DIR',
    floor: 'Floor 2',
    room: 'Director Office',
    status: 'event',
    subject: 'Board Meeting',
    class: 'Admin',
    teacher: 'School Director',
    studentCount: 8,
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    equipment: ['Conference Hub'],
    temperature: '22°C',
    alerts: ['Private Session'],
    cameraIp: '192.168.1.105',
    cameraFeedUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'F2-SDIR',
    floor: 'Floor 2',
    room: 'Sub-Director Room',
    status: 'teaching',
    subject: 'Staff Briefing',
    class: 'Faculty',
    teacher: 'Sub-Director',
    studentCount: 12,
    startTime: '08:00 AM',
    endTime: '08:30 AM',
    equipment: ['Admin Console'],
    temperature: '22°C',
    alerts: [],
    cameraIp: '192.168.1.106',
    cameraFeedUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'F2-ACAD',
    floor: 'Floor 2',
    room: 'Head of Academic Affair',
    status: 'teaching',
    subject: 'Curriculum Review',
    class: 'Leads',
    teacher: 'HOD Academic',
    studentCount: 5,
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    equipment: ['Record Archive'],
    temperature: '23°C',
    alerts: [],
    cameraIp: '192.168.1.107',
    cameraFeedUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
  },
  // Floor 3
  {
    id: 'F3-COMP',
    floor: 'Floor 3',
    room: 'Computer Lab 301',
    status: 'teaching',
    subject: 'Python Programming',
    class: 'G10-C',
    teacher: 'Ms. Elena Rodriguez',
    studentCount: 30,
    startTime: '08:00 AM',
    endTime: '09:30 AM',
    equipment: ['Workstations', 'Server Node'],
    temperature: '19°C',
    alerts: ['Network High Load'],
    cameraIp: '192.168.1.108',
    cameraFeedUrl: 'https://images.unsplash.com/photo-1562774053-aa1690e87b7a?auto=format&fit=crop&w=800&q=80'
  },
  // Floor 4
  {
    id: 'F4-01',
    floor: 'Floor 4',
    room: 'Room 401',
    status: 'exam',
    subject: 'History Final',
    class: 'G11-A',
    teacher: 'Prof. Miller',
    studentCount: 25,
    startTime: '08:00 AM',
    endTime: '11:00 AM',
    equipment: ['CCTV Active'],
    temperature: '21°C',
    alerts: ['Exam in Progress'],
    cameraIp: '192.168.1.109',
    cameraFeedUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  },
  // Floor 5
  {
    id: 'F5-HALL',
    floor: 'Floor 5',
    room: 'Main Event Hall',
    status: 'event',
    subject: 'Annual Cultural Fest',
    class: 'Mixed',
    teacher: 'Activity Coord.',
    studentCount: 150,
    startTime: '09:00 AM',
    endTime: '04:00 PM',
    equipment: ['Audio/Visual Max', 'Stage Lights'],
    temperature: '24°C',
    alerts: ['Large Crowd Detected'],
    cameraIp: '192.168.1.110',
    cameraFeedUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80'
  }
];

export function LiveTopology() {
  const [selectedRoom, setSelectedRoom] = useState<typeof mockTopology[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // CCTV local camera security states
  const [userRole, setUserRole] = useState<string>(() => {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        return JSON.parse(demoUser).role || 'admin';
      } catch (e) {}
    }
    return 'admin';
  });

  const [isCctvOpen, setIsCctvOpen] = useState(false);
  const [cctvRoom, setCctvRoom] = useState<typeof mockTopology[0] | null>(null);
  const [cameraIpInput, setCameraIpInput] = useState('');
  const [isNightVision, setIsNightVision] = useState(false);
  const [isGridMode, setIsGridMode] = useState(false);
  const [isSimulatedFeed, setIsSimulatedFeed] = useState(true);
  const [ptzStatus, setPtzStatus] = useState('Centred · Zoom 1.0x');
  const [cameraIframeUrls, setCameraIframeUrls] = useState<Record<string, string>>({});

  // Hikvision NVR & SDK State Variables
  const [hikNvrIp, setHikNvrIp] = useState('192.168.1.50');
  const [hikNvrPort, setHikNvrPort] = useState('8000');
  const [hikChannel, setHikChannel] = useState('1');
  const [hikUsername, setHikUsername] = useState('admin');
  const [hikPassword, setHikPassword] = useState('admin12345');
  const [isSdkInstalled, setIsSdkInstalled] = useState(true);
  const [isSdkConnected, setIsSdkConnected] = useState(true);
  const [sdkLogs, setSdkLogs] = useState<string[]>([
    'System: Initializing Hikvision Web Components SDK V3.2...',
    'System: Loaded WebVideoActiveX.ocx plugin module.',
    'SDK: Net_DVR_Init() called successfully.',
    'SDK: Registered callback Net_DVR_SetDVRMessageCallBack_V30.',
    'NVR: Listening for outbound RTSP-over-HTTP tunnels...',
  ]);

  const addSdkLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSdkLogs(prev => [...prev.slice(-20), `[${time}] ${msg}`]);
  };

  const handleOpenCctv = (room: typeof mockTopology[0]) => {
    setCctvRoom(room);
    setCameraIpInput(room.cameraIp || '192.168.1.100');
    // Pre-calculate custom Hikvision channel based on Room ID or floor prefix
    const channelNum = room.id.includes('F2') ? '2' : room.id.includes('F3') ? '3' : '1';
    setHikChannel(channelNum);
    setIsCctvOpen(true);
    // Reset PTZ when opening a new camera
    setZoomLevel(1.0);
    setPanAngle(0);
    setTiltAngle(0);
    
    // Add initialization logs for Hikvision
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSdkLogs([
      `[${time}] System: Switched camera target to Room ${room.room} (${room.floor})`,
      `[${time}] SDK: Net_DVR_RealPlay_V40 on local camera IP: ${room.cameraIp || '192.168.1.100'}`,
      `[${time}] NVR: Hikvision NVR login verified for channel ${channelNum}`,
      `[${time}] SDK: Decrypted sub-stream pipeline successfully. Ready.`
    ]);
  };

  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panAngle, setPanAngle] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toISOString().replace('T', ' ').substring(0, 19));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSuperAdmin = userRole.toLowerCase().replace(/[\s_-]/g, '') === 'superadmin';
  const ptzStatusText = `Pan: ${panAngle}° · Tilt: ${tiltAngle}° · Zoom: ${zoomLevel.toFixed(1)}x`;

  const floors = ['all', 'Ground Floor', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'];

  const filteredTopology = mockTopology.filter(room => {
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesFloor = floorFilter === 'all' || room.floor === floorFilter;
    const matchesSearch = 
      room.room.toLowerCase().includes(searchTerm.toLowerCase()) || 
      room.floor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesFloor && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8 bg-white min-h-full">
      {/* Header section with Stats */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
            <Monitor className="text-blue-600" size={32} />
            Live School Topology
          </h2>
          <p className="text-slate-500 font-medium mt-1">Real-time room monitoring and tracking system</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
            {['all', 'teaching', 'exam', 'event', 'empty'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  statusFilter === f ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto max-w-md no-scrollbar">
            {floors.map((f) => (
              <button
                key={f}
                onClick={() => setFloorFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  floorFilter === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Stats & Search */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search rooms, subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 italic text-sm"
            />
          </div>

          <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">Live Pulse</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Active Units</p>
                <p className="text-2xl font-black italic">12 / 18</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Students</p>
                <p className="text-2xl font-black italic text-blue-400">428</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <span>System Health</span>
                <span className="text-emerald-400">98% Optimal</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic ml-2">Quick Access</h3>
            <button className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 group hover:border-blue-500 transition-all">
              <div className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <MapPin size={20} />
              </div>
              <span className="text-xs font-black uppercase text-slate-700 italic">Floor Map View</span>
            </button>
            <button className="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 group hover:border-blue-500 transition-all">
              <div className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <Shield size={20} />
              </div>
              <span className="text-xs font-black uppercase text-slate-700 italic">Security Logs</span>
            </button>
          </div>
        </div>

        {/* Right: Room Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTopology.map((room) => (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedRoom(room)}
                  className={cn(
                    "relative overflow-hidden p-6 bg-white border-2 rounded-[2.5rem] cursor-pointer transition-all",
                    selectedRoom?.id === room.id ? "border-blue-600 shadow-2xl shadow-blue-600/10" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  {/* Status Indicator */}
                  <div className={cn(
                    "absolute top-6 right-6 w-3 h-3 rounded-full",
                    room.status === 'teaching' ? "bg-emerald-500 animate-pulse" :
                    room.status === 'exam' ? "bg-rose-500 animate-pulse" :
                    room.status === 'event' ? "bg-amber-500 animate-pulse" :
                    "bg-slate-300"
                  )} />

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.floor}</p>
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic">{room.room}</h3>
                    </div>

                    <div className="space-y-4">
                      {room.status !== 'empty' ? (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Subject / Event</p>
                              <p className="text-sm font-black text-slate-700 italic truncate">{room.subject}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                              <User size={16} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Teacher / Lead</p>
                              <p className="text-sm font-black text-slate-700 italic truncate">{room.teacher}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-slate-400" />
                              <span className="text-[10px] font-black uppercase text-slate-600 italic">{room.studentCount} Students</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-400" />
                              <span className="text-[10px] font-black uppercase text-slate-600 italic whitespace-nowrap">{room.startTime}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-slate-50 rounded-3xl">
                          <Zap size={24} className="text-slate-200" />
                          <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoom(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                {/* Left Sidebar Info */}
                <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-slate-100 flex flex-col">
                  <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-100 mb-8">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Telemetry</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black italic">{selectedRoom.temperature}</span>
                      <Activity size={24} className="text-emerald-500" />
                    </div>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Hardware Status</h4>
                      <div className="space-y-2">
                        {selectedRoom.equipment.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl text-xs font-bold text-slate-600">
                            {item}
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedRoom.alerts.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Active Policies</h4>
                        <div className="space-y-2">
                          {selectedRoom.alerts.map((alert, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold">
                              <AlertCircle size={14} />
                              {alert}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleOpenCctv(selectedRoom)}
                    className="mt-8 w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest italic transition-all flex items-center justify-center gap-2"
                  >
                    <Monitor size={16} />
                    Remote View
                  </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto custom-scrollbar">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[9px] font-black uppercase italic tracking-widest">
                          {selectedRoom.status}
                        </span>
                        <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">{selectedRoom.floor}</span>
                      </div>
                      <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tight">{selectedRoom.room}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedRoom(null)}
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
                    >
                      <Zap className="rotate-12" size={20} />
                    </button>
                  </div>

                  {selectedRoom.status !== 'empty' ? (
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                          <BookOpen className="text-blue-600" size={24} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Current Program</p>
                            <p className="text-xl font-black text-slate-900 italic uppercase">{selectedRoom.subject}</p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg w-fit text-[10px] font-black text-blue-600 uppercase italic">
                            Class: {selectedRoom.class}
                          </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                          <User className="text-indigo-600" size={24} />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Authorized Lead</p>
                            <p className="text-xl font-black text-slate-900 italic uppercase">{selectedRoom.teacher}</p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg w-fit text-[10px] font-black text-indigo-600 uppercase italic">
                            Staff ID: EDU-8221
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Timeline Tracking</h4>
                          <span className="text-[10px] font-black text-slate-900 uppercase italic">Remaining: 45 min</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-2xl overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '45%' }}
                            className="h-full bg-blue-600 rounded-2xl"
                          />
                          <div className="absolute inset-0 flex items-center justify-between px-4 text-[8px] font-black uppercase text-slate-400 tracking-widest">
                            <span>{selectedRoom.startTime}</span>
                            <span>{selectedRoom.endTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Occupancy</h4>
                          <span className="text-[10px] font-black text-emerald-600 uppercase italic">Verified via Check-In</span>
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                          {Array.from({ length: selectedRoom.studentCount }).map((_, i) => (
                            <div key={i} className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                               <User size={14} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center border-4 border-dashed border-slate-50 rounded-[3rem]">
                      <Monitor size={48} className="text-slate-100" />
                      <div>
                        <p className="text-xl font-black text-slate-300 uppercase italic">Room Standby</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System idle. Awaiting next session.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CCTV Local Camera Interactive Security Terminal */}
      <AnimatePresence>
        {isCctvOpen && cctvRoom && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCctvOpen(false)}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-8 py-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl relative">
                    <Camera size={20} className="animate-pulse" />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-200 flex items-center gap-2 text-left">
                      CCTV Device Node Control
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] font-black uppercase tracking-wider">
                        SEC-IP LOCAL
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5 text-left">
                      Room: <span className="text-white font-bold">{cctvRoom.room}</span> ({cctvRoom.floor}) · Device IP: <code className="font-mono text-cyan-400">{cameraIpInput}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 bg-[#1a2333]/80 border border-slate-800 rounded-xl text-xs font-bold uppercase",
                    isSuperAdmin ? "text-emerald-400" : "text-amber-500"
                  )}>
                    <Lock size={12} />
                    <span>{isSuperAdmin ? "SUPER ADMIN APPROVED" : "RESTRICTED VIEW"}</span>
                  </div>
                  <button 
                    onClick={() => setIsCctvOpen(false)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto no-scrollbar">
                
                {/* Visual Player Monitor */}
                <div className="flex-1 bg-slate-950 p-6 flex flex-col justify-center min-h-[300px] md:min-h-[420px] relative overflow-hidden">
                  
                  {!isSuperAdmin ? (
                    /* Restricted View Shield */
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 max-w-lg mx-auto z-10">
                      <div className="w-16 h-16 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full flex items-center justify-center shadow-lg shadow-rose-950/50">
                        <Lock size={32} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-rose-500 uppercase tracking-wider italic">DEVICE FIREWALL LOCKED</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-[10px] pb-1 border-b border-slate-800">
                          IP: {cameraIpInput} · SECURITY PROFILE LIMIT
                        </p>
                        <p className="text-sm leading-relaxed text-slate-300">
                          Live video decoding requires <span className="font-black text-white italic">Super Admin Clearance</span>. Standard administrators or teachers do not hold active access keys to bypass school safety stream proxies.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl w-full text-slate-400 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Security Sandbox Bypass Option</p>
                        <button 
                          onClick={() => {
                            setUserRole('superadmin');
                            // Persist to user state
                            const demoUser = localStorage.getItem('demo_user');
                            if (demoUser) {
                              try {
                                const parsed = JSON.parse(demoUser);
                                parsed.role = 'superadmin';
                                localStorage.setItem('demo_user', JSON.stringify(parsed));
                              } catch (e) {}
                            } else {
                              localStorage.setItem('demo_user', JSON.stringify({ name: 'Super Admin', role: 'superadmin' }));
                            }
                          }}
                          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <Unlock size={14} />
                          Elevate to Super Admin Role (Demo)
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Hikvision NVR Web Player / ActiveX SDK Decryption Panel */
                    <div className="w-full h-full flex flex-col justify-between space-y-4">
                      
                      {!isSdkInstalled ? (
                        /* Case 1: Hikvision SDK Component Plugin is NOT installed */
                        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[350px]">
                          <div className="w-16 h-16 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center justify-center shadow-lg shadow-blue-950/50">
                            <Download size={28} className="animate-bounce" />
                          </div>
                          <div className="space-y-2.5 max-w-md">
                            <h4 className="text-base font-black text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2">
                              HIKVISION WEB CLIENT SDK REQUIRED
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-1 border-b border-slate-900">
                              Hikvision ActiveX / NPAPI Component V3.2.0.1
                            </p>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              Real-time decoding of digital streams over local RTSP pathways requires the client side Hikvision video player integration. Please install the local helper module (ActiveX, NPAPI or Canvas-WASM component) to route camera flows.
                            </p>
                          </div>

                          <button 
                            onClick={() => {
                              setIsSdkInstalled(true);
                              addSdkLog("System: Successfully loaded WebVideoActiveX.ocx plugin.");
                              addSdkLog("SDK: Installed local decoders for H.264 & H.265 streams.");
                            }}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-600/15"
                          >
                            <Play size={13} />
                            Install & Register Local Web SDK Plugin
                          </button>
                        </div>
                      ) : !isSdkConnected ? (
                        /* Case 2: Hikvision NVR is disconnected/unauthenticated */
                        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[350px]">
                          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center shadow-lg shadow-slate-950/50">
                            <Power size={28} className="animate-pulse" />
                          </div>
                          <div className="space-y-2.5 max-w-md">
                            <h4 className="text-base font-black text-amber-500 uppercase tracking-widest">
                              NVR HANDSHAKE DISCONNECTED
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-1 border-b border-slate-900">
                              HOST: {hikNvrIp}:{hikNvrPort} · CHANNEL {hikChannel}
                            </p>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              SDK initial login failed. Ensure the Hikvision NVR credentials and target network IP coordinates are accessible across your local ethernet bridge profile.
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                              onClick={() => {
                                setIsSdkConnected(true);
                                addSdkLog(`NVR: Connection established with NVR [${hikNvrIp}:${hikNvrPort}]`);
                                addSdkLog(`SDK: Logged in successfully as user "${hikUsername}"`);
                                addSdkLog(`SDK: Decoding real-play stream for NVR Channel ${hikChannel}`);
                              }}
                              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-amber-600/15"
                            >
                              <Unlock size={13} />
                              Retry NVR Authentication
                            </button>
                            <button 
                              onClick={() => {
                                setHikNvrIp("192.168.1.50");
                                setHikNvrPort("8000");
                                alert("Reset Hikvision NVR parameters to target defaults.");
                              }}
                              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 font-black rounded-xl text-xs border border-slate-800 transition-colors uppercase"
                            >
                              Reset Config
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Case 3: Display Active Stream & Interactive SDK Logs console */
                        <div className="space-y-4 flex-1 flex flex-col">
                          {/* Live Camera Interface Container */}
                          <div className="relative flex-1 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex items-center justify-center min-h-[350px]">
                            
                            {isSimulatedFeed ? (
                              /* Sandbox Simulated Feed layout */
                              <div className="relative w-full h-full min-h-[350px] overflow-hidden flex items-center justify-center">
                                <motion.img 
                                  src={cctvRoom.cameraFeedUrl} 
                                  alt="Live Stream" 
                                  className={cn(
                                    "absolute inset-0 w-full h-full object-cover origin-center opacity-85 select-none pointer-events-none",
                                    isNightVision && "grayscale [filter:brightness(1.1)_contrast(1.25)_hue-rotate(90deg)_sepia(1)_saturate(3)]"
                                  )}
                                  style={{
                                    transform: `scale(${zoomLevel}) translate(${panAngle}px, ${tiltAngle}px)`,
                                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                  }}
                                />
                                
                                {/* Grungy Matrix Screen Cover Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/10 to-slate-950/35 pointer-events-none" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.45)_100%)] pointer-events-none" />
                                
                                {/* Interlacing scanlines */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40" />

                                {/* PTZ Crosshair in center */}
                                <div className="absolute pointer-events-none border border-white/20 w-32 h-32 rounded-full flex items-center justify-center opacity-40">
                                  <div className="w-4 h-[1px] bg-white text-center" />
                                  <div className="h-4 w-[1px] bg-white absolute" />
                                </div>
                              </div>
                            ) : (
                              /* Direct Player Iframe Mode */
                              <div className="w-full h-full min-h-[350px] relative">
                                <iframe 
                                  src={cameraIpInput.startsWith('http') ? cameraIpInput : `http://${cameraIpInput}`}
                                  title={`Local Device Feed ${cctvRoom.room}`}
                                  className="w-full h-full min-h-[350px] border-0 bg-slate-950 select-none"
                                  sandbox="allow-scripts allow-same-origin"
                                  referrerPolicy="no-referrer"
                                />
                                {/* Overlay tag for physical local subnet note */}
                                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 border border-slate-800 p-3 rounded-xl text-[10.5px] text-slate-400 flex items-start gap-2 backdrop-blur-xs">
                                  <Terminal size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                                  <p className="text-left">
                                    <span className="font-bold text-slate-200">Local Subnet Iframe Active:</span> Embedded browser request routed directly to local device server <code className="text-cyan-400 font-mono bg-cyan-950/30 px-1 py-0.5 rounded">{cameraIpInput}</code>. Requires presence on the school physical intranet path.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Top HUD Stats Overlay */}
                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono select-none pointer-events-none text-white drop-shadow-md z-15">
                              <div className="flex items-center gap-2.5 bg-slate-950/70 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                                <span className="font-black">FEED: LIVE</span>
                                <span className="text-white/40">|</span>
                                <span>CAM-{cctvRoom.id} (HIK SDK)</span>
                              </div>

                              <div className="bg-slate-950/70 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-3">
                                <span className="text-cyan-400 font-semibold">{cameraIpInput}</span>
                                <span className="text-white/40">|</span>
                                <span>{currentTimeStr || 'Ticking...'}</span>
                              </div>
                            </div>

                            {/* Bottom HUD stats overlay */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] font-mono text-white/75 bg-slate-950/75 border border-white/10 px-3 py-1.5 rounded-lg select-none pointer-events-none z-15">
                              <span>1080P FHD @ 30FPS</span>
                              <span className="text-white/30">|</span>
                              <span>H.264 VBR Codec</span>
                              <span className="text-white/30">|</span>
                              <span className="text-yellow-400 font-bold">{ptzStatusText}</span>
                            </div>

                            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-950/75 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-mono text-white/50 select-none pointer-events-none z-15">
                              <span>AUDIO: DISABLED</span>
                            </div>
                          </div>

                          {/* Real-Time Hikvision Local Web SDK Playback Console Logs */}
                          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-900">
                              <span className="text-[9.5px] font-mono font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Hikvision Local Playback SDK Logs
                              </span>
                              <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500">
                                <span>SDK v3.2.0.1</span>
                                <span>·</span>
                                <button 
                                  onClick={() => setSdkLogs([])}
                                  className="text-slate-400 hover:text-white transition-colors"
                                >
                                  Clear Logs
                                </button>
                              </div>
                            </div>
                            <div className="max-h-24 overflow-y-auto no-scrollbar font-mono text-[10px] text-slate-400 space-y-1 block text-left">
                              {sdkLogs.length === 0 ? (
                                <p className="text-slate-600 italic">No logs registered. Interact with camera controls to fetch SDK events.</p>
                              ) : (
                                sdkLogs.map((log, index) => (
                                  <div key={index} className="truncate select-text">
                                    <span className="text-slate-600 opacity-60 mr-1.5">&gt;&gt;</span>
                                    {log}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Panel: Advanced Controls Console */}
                <div className="w-full lg:w-96 bg-slate-950 p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-6">
                  
                  {/* PTZ and Settings section */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Monitor size={12} className="text-blue-500" />
                        PTZ CAMERA PAN/TILT DOME
                      </h4>

                      {/* Joypad controller */}
                      <div className="flex flex-col items-center py-4 bg-slate-900 border border-slate-800/80 rounded-3xl relative">
                        {/* PTZ Steering Panel */}
                        <div className="relative w-36 h-36 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center p-2 shadow-inner">
                          
                          {/* Inner center pad */}
                          <button 
                            disabled={!isSuperAdmin}
                            onClick={() => {
                              setPanAngle(0);
                              setTiltAngle(0);
                              setZoomLevel(1.0);
                            }}
                            className="w-12 h-12 bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-full flex items-center justify-center text-[9px] font-mono uppercase font-black transition-all active:scale-95 disabled:opacity-35"
                            title="Recenter Lens"
                          >
                            C
                          </button>

                          {/* Left Arrow Button */}
                          <button 
                            disabled={!isSuperAdmin}
                            onClick={() => setPanAngle(prev => Math.max(prev - 20, -100))}
                            className="absolute left-2 w-8 h-8 bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-all active:translate-x-[-2px] disabled:opacity-35"
                          >
                            ◀
                          </button>

                          {/* Right Arrow Button */}
                          <button 
                            disabled={!isSuperAdmin}
                            onClick={() => setPanAngle(prev => Math.min(prev + 20, 100))}
                            className="absolute right-2 w-8 h-8 bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-all active:translate-x-[2px] disabled:opacity-35"
                          >
                            ▶
                          </button>

                          {/* Up Arrow Button */}
                          <button 
                            disabled={!isSuperAdmin}
                            onClick={() => setTiltAngle(prev => Math.max(prev - 20, -60))}
                            className="absolute top-2 w-8 h-8 bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-all active:translate-y-[-2px] disabled:opacity-35"
                          >
                            ▲
                          </button>

                          {/* Down Arrow Button */}
                          <button 
                            disabled={!isSuperAdmin}
                            onClick={() => setTiltAngle(prev => Math.min(prev + 20, 60))}
                            className="absolute bottom-2 w-8 h-8 bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-all active:translate-y-[2px] disabled:opacity-35"
                          >
                            ▼
                          </button>
                        </div>

                        {/* Zoom control slider block */}
                        <div className="mt-5 w-full px-6 flex items-center justify-between gap-4">
                          <button 
                            disabled={!isSuperAdmin || zoomLevel <= 1.0}
                            onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1.0))}
                            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-lg text-xs font-black text-slate-300 disabled:opacity-35"
                          >
                            Zoom -
                          </button>
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {zoomLevel.toFixed(1)}x
                          </span>
                          <button 
                            disabled={!isSuperAdmin || zoomLevel >= 4.0}
                            onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 4.0))}
                            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-lg text-xs font-black text-slate-300 disabled:opacity-35"
                          >
                            Zoom +
                          </button>
                        </div>
                      </div>
                     {/* Custom Hikvision NVR & SDK Integration Console */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Settings size={12} className="text-cyan-400 animate-pulse" />
                          HIKVISION NVR SDK CONFIG
                        </h4>
                        <span className="text-[9px] font-mono font-bold text-slate-500">v3.2 API</span>
                      </div>

                      <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-2xl space-y-4">
                        {/* Custom IP Camera input */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left block">
                            Target IP Camera Address
                          </label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={cameraIpInput || ''} 
                              onChange={(e) => {
                                setCameraIpInput(e.target.value);
                              }}
                              placeholder="e.g. 192.168.1.150"
                              className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-100 placeholder:text-slate-600 outline-none font-mono focus:border-cyan-500 transition-colors"
                            />
                            <button 
                              onClick={() => {
                                addSdkLog(`NVR: Mapped Room ${cctvRoom.room} stream route to direct IPv4 camera address: ${cameraIpInput}`);
                                alert(`IP Camera stream target successfully updated to: ${cameraIpInput}. Local RTSP playback pipeline established!`);
                              }}
                              className="absolute right-2 top-1.5 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg text-[9px] font-bold text-cyan-400 uppercase tracking-widest transition-colors border border-cyan-500/20"
                              title="Sync to Local Target"
                            >
                              Sync
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-500 text-left block mt-0.5">Customizes local subnet stream routing</span>
                        </div>

                        {/* Custom Hikvision NVR IP Address */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left block">
                              NVR IP Address
                            </label>
                            <input 
                              type="text" 
                              value={hikNvrIp} 
                              onChange={(e) => {
                                setHikNvrIp(e.target.value);
                                addSdkLog(`SDK: Set Hikvision NVR Host IP to ${e.target.value}`);
                              }}
                              placeholder="192.168.1.50"
                              className="w-full bg-slate-950 text-xs px-2.5 py-2 rounded-xl border border-slate-800 text-slate-100 placeholder:text-slate-700 outline-none font-mono focus:border-cyan-500 transition-colors"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left block">
                              NVR Command Port
                            </label>
                            <input 
                              type="text" 
                              value={hikNvrPort} 
                              onChange={(e) => {
                                setHikNvrPort(e.target.value);
                                addSdkLog(`SDK: Modified NVR command channel port to ${e.target.value}`);
                              }}
                              placeholder="8000"
                              className="w-full bg-slate-950 text-xs px-2.5 py-2 rounded-xl border border-slate-800 text-slate-100 placeholder:text-slate-700 outline-none font-mono focus:border-cyan-500 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Channel Range and authentication */}
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left block">
                              NVR Channel
                            </label>
                            <select 
                              value={hikChannel}
                              onChange={(e) => {
                                setHikChannel(e.target.value);
                                addSdkLog(`SDK: Switched NVR RealPlay decoder to channel ${e.target.value}`);
                              }}
                              className="w-full bg-slate-950 text-xs px-2.5 py-2 rounded-xl border border-slate-800 text-slate-100 outline-none font-mono focus:border-cyan-500 transition-colors"
                            >
                              <option value="1">CH-01 (Main)</option>
                              <option value="2">CH-02 (Aux)</option>
                              <option value="3">CH-03 (Lab)</option>
                              <option value="4">CH-04 (Halls)</option>
                              <option value="5">CH-05 (Staff)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left block">
                              Local SDK Handshake
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newConn = !isSdkConnected;
                                setIsSdkConnected(newConn);
                                if (newConn) {
                                  addSdkLog(`SDK: Connected successfully to ${hikUsername}@${hikNvrIp}:${hikNvrPort}`);
                                  addSdkLog(`SDK: Re-established Net_DVR_RealPlay socket stream.`);
                                } else {
                                  addSdkLog(`SDK: Terminated RealPlay stream tunnel on Channel ${hikChannel}`);
                                }
                              }}
                              className={cn(
                                "w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                                isSdkConnected 
                                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20" 
                                  : "bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20"
                              )}
                            >
                              {isSdkConnected ? '🔌 CONNECTED' : '❌ DISCONNECTED'}
                            </button>
                          </div>
                        </div>

                        {/* Player Source Selection & Plugin Download triggers */}
                        <div className="space-y-2 pt-1 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-left block">
                              Browser SDK Plugin
                            </label>
                            <button 
                              onClick={() => {
                                const newInstall = !isSdkInstalled;
                                setIsSdkInstalled(newInstall);
                                if (newInstall) {
                                  addSdkLog("System: WebLocalPlaySDK has been reloaded and registered.");
                                } else {
                                  addSdkLog("System: WebLocalPlaySDK has been uninstalled/disabled.");
                                }
                              }}
                              className="text-[9px] font-mono font-bold text-sky-400 hover:underline"
                            >
                              {isSdkInstalled ? 'Uninstall SDK Plugin' : 'Install SDK Plugin'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => {
                                setIsSimulatedFeed(true);
                                addSdkLog("Player: Switched video pipeline to high-fidelity Sandbox Simulation.");
                              }}
                              className={cn(
                                "py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                isSimulatedFeed ? "bg-slate-800 text-cyan-400" : "text-slate-500 hover:text-slate-300"
                              )}
                            >
                              Sandbox
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsSimulatedFeed(false);
                                addSdkLog(`Player: Bound H.264 stream frame to physical iframe endpoint at ${cameraIpInput}`);
                              }}
                              className={cn(
                                "py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                !isSimulatedFeed ? "bg-slate-800 text-cyan-400" : "text-slate-500 hover:text-slate-300"
                              )}
                            >
                              Direct IP Frame
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>

                    {/* Quick Access Presets toggle */}
                    <div className="space-y-3 pt-1">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left block">
                        HARDWARE TOGGLES
                      </h4>
                      <div className="grid grid-cols-2 gap-3.5">
                        <button
                          disabled={!isSuperAdmin}
                          onClick={() => setIsNightVision(!isNightVision)}
                          className={cn(
                            "p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all",
                            isNightVision ? "bg-[#022c22]/60 border-emerald-500/35 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                          )}
                        >
                          <Eye size={16} />
                          <span className="text-[10px] font-black uppercase tracking-wider leading-none">Night Vision</span>
                        </button>

                        <button
                          disabled={!isSuperAdmin}
                          onClick={() => {
                            setPanAngle(0);
                            setTiltAngle(0);
                            setZoomLevel(1.0);
                          }}
                          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left flex flex-col justify-between h-20 text-slate-400 transition-all"
                        >
                          <RefreshCw size={16} />
                          <span className="text-[10px] font-black uppercase tracking-wider leading-none">Recenter Lens</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Super admin user simulation helper so testing is effortless */}
                  <div className="pt-4 border-t border-slate-800">
                    {isSuperAdmin ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                          <Unlock size={14} />
                          <span>Super Admin Token Active</span>
                        </div>
                        <button 
                          onClick={() => {
                            setUserRole('admin');
                            // Demote persisted role
                            const demoUser = localStorage.getItem('demo_user');
                            if (demoUser) {
                              try {
                                const parsed = JSON.parse(demoUser);
                                parsed.role = 'admin';
                                localStorage.setItem('demo_user', JSON.stringify(parsed));
                              } catch (e) {}
                            }
                          }}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          🔒 DEMOTE TO GENERAL ADMIN
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-[11px] text-amber-500 leading-relaxed font-semibold text-left">
                        ⚠️ To test access-control limits, elevate to Super Admin above. Standard admin credentials cannot bypass device telemetry firewall logs.
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

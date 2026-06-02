import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  FileText, 
  Plus,
  ChevronRight,
  Filter,
  Search,
  ArrowRight,
  MapPin,
  Globe,
  ShieldCheck,
  Map as MapIcon,
  MoreVertical,
  ExternalLink,
  History,
  Download,
  X,
  Users,
  BarChart3,
  TrendingUp,
  Building2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { EmployeeAttendanceRecord, LeaveRequest, Employee } from '@/src/types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

// Designated office/school location (The "Pin")
const PIN_LOCATION = { lat: 11.5564, lng: 104.9282 }; // Phnom Penh Example

// Helper to calculate distance in meters using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

const mockEmployees: Employee[] = [
  { id: '1', employeeCode: 'EMP001', name: 'John Doe', gender: 'Male', dob: '1990-01-01', positionId: '1', departmentId: '1', contact: '012 345 678', status: 'active' },
  { id: '2', employeeCode: 'EMP002', name: 'Heng Seavhab', gender: 'Male', dob: '1992-04-28', positionId: '2', departmentId: '1', contact: '098 765 432', status: 'active' },
];

const mockAttendance: EmployeeAttendanceRecord[] = [
  { id: '1', employeeId: '1', date: '2024-05-07', checkIn: '07:45', checkOut: '17:05', status: 'present', location: { lat: 11.5565, lng: 104.9281 }, distanceFromPin: 15 },
  { id: '2', employeeId: '1', date: '2024-05-06', checkIn: '08:15', checkOut: '17:00', status: 'late', note: 'Traffic jam', location: { lat: 11.5570, lng: 104.9290 }, distanceFromPin: 110 },
  { id: '3', employeeId: '2', date: '2024-05-07', checkIn: '08:05', status: 'present', location: { lat: 11.5564, lng: 104.9282 }, distanceFromPin: 0 },
];

const mockLeaves: LeaveRequest[] = [
  { id: '1', employeeId: '1', leaveType: 'Annual', startDate: '2024-05-10', endDate: '2024-05-12', reason: 'Family trip', status: 'pending', appliedAt: '2024-05-05' },
  { id: '2', employeeId: '1', leaveType: 'Sick', startDate: '2024-05-04', endDate: '2024-05-04', reason: 'Fever', status: 'approved', appliedAt: '2024-05-04' },
];

function HRStatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: 'blue' | 'emerald' | 'amber' | 'rose' }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4", colors[color])}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

export function EmployeeAttendance() {
  const [attendance, setAttendance] = useState<EmployeeAttendanceRecord[]>(mockAttendance);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaves);
  const [isCheckIn, setIsCheckIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'attendance' | 'leave' | 'hr-dashboard'>('attendance');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [historyEmployeeId, setHistoryEmployeeId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportEndDate, setExportEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleExportCSV = () => {
    // Filter records within date range
    const filteredRecords = attendance.filter(record => {
      const recordDate = record.date;
      return recordDate >= exportStartDate && recordDate <= exportEndDate;
    });

    if (filteredRecords.length === 0) {
      alert("No records found for the selected date range.");
      return;
    }

    // Prepare CSV header
    const headers = ["Employee ID", "Employee Name", "Date", "Check-In", "Check-Out", "Status", "Note", "Latitude", "Longitude", "Distance (m)"];
    
    // Prepare CSV content
    const csvRows = filteredRecords.map(record => {
      const employee = mockEmployees.find(e => e.id === record.employeeId);
      return [
        record.employeeId,
        `"${employee?.name || 'Unknown'}"`,
        record.date,
        record.checkIn || '',
        record.checkOut || '',
        record.status,
        `"${record.note || ''}"`,
        record.location?.lat || '',
        record.location?.lng || '',
        record.distanceFromPin || ''
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Download logic
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_report_${exportStartDate}_to_${exportEndDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExportModalOpen(false);
  };

  const historyRecords = historyEmployeeId 
    ? attendance.filter(r => r.employeeId === historyEmployeeId)
    : [];

  const historyEmployee = historyEmployeeId
    ? mockEmployees.find(e => e.id === historyEmployeeId)
    : null;

  const handleLeaveSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const leaveData = {
      leaveType: formData.get('leaveType') as LeaveRequest['leaveType'],
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      reason: formData.get('reason') as string,
    };

    if (editingLeave) {
      setLeaves(leaves.map(l => l.id === editingLeave.id ? { ...l, ...leaveData } : l));
      setEditingLeave(null);
    } else {
      const newLeave: LeaveRequest = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: '1',
        ...leaveData,
        status: 'pending',
        appliedAt: new Date().toISOString().split('T')[0],
      };
      setLeaves([newLeave, ...leaves]);
    }
    setShowLeaveForm(false);
  };

  const handleEditClick = (leave: LeaveRequest) => {
    setEditingLeave(leave);
    setShowLeaveForm(true);
  };

  const handleLocateAndCheckIn = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLocating(false);
      handleCheckIn(); // Fallback to check-in without location
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = calculateDistance(latitude, longitude, PIN_LOCATION.lat, PIN_LOCATION.lng);
        setUserLocation({ lat: latitude, lng: longitude });
        setDistance(dist);
        setIsLocating(false);
        handleCheckIn(latitude, longitude, dist);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        alert("Could not get your location. Checking in without geolocation.");
        handleCheckIn();
      }
    );
  };

  const handleCheckIn = (lat?: number, lng?: number, dist?: number) => {
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsCheckIn(true);
  };

  const handleCheckOut = () => {
    const now = new Date();
    setCheckOutTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsCheckIn(false);
    
    // Add to history
    const newRecord: EmployeeAttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: '1',
      date: now.toISOString().split('T')[0],
      checkIn: checkInTime || '',
      checkOut: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'present',
      location: userLocation || undefined,
      distanceFromPin: distance || undefined,
    };
    setAttendance([newRecord, ...attendance]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Tracker</h2>
          <p className="text-slate-500">Track your daily work hours and manage leave requests.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('attendance')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'attendance' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Daily Attendance
          </button>
          <button 
            onClick={() => setActiveTab('leave')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'leave' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Leave Requests
          </button>
          <button 
            onClick={() => setActiveTab('hr-dashboard')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'hr-dashboard' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            HR Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions & Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0" />
             <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
                      <Clock size={24} />
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Date</p>
                      <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                   </div>
                </div>

                <div className="space-y-2 text-center py-4">
                   <p className="text-4xl font-black text-slate-900 tracking-tighter">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current System Time</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Check In</span>
                      <span className="text-lg font-black text-emerald-600">{checkInTime || '--:--'}</span>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Check Out</span>
                      <span className="text-lg font-black text-rose-600">{checkOutTime || '--:--'}</span>
                   </div>
                </div>

                {!checkInTime ? (
                  <button 
                    onClick={handleLocateAndCheckIn}
                    disabled={isLocating}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLocating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <LogIn size={20} />
                    )}
                    {isLocating ? 'Locating...' : 'Clock In'}
                  </button>
                ) : !checkOutTime && isCheckIn ? (
                  <button 
                    onClick={handleCheckOut}
                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={20} />
                    Clock Out
                  </button>
                ) : (
                  <div className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-center">
                    Shift Completed
                  </div>
                )}
             </div>
          </div>

          {userLocation && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                   <MapPin size={16} className="text-blue-600" />
                   Your Location
                </h4>
                {distance !== null && (
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                    distance <= 100 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  )}>
                    {distance}m from Pin
                  </span>
                )}
              </div>
              <div className="aspect-[4/3] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-200 overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/104.9282,11.5564,15/400x300?access_token=pk.eyJ1IjoiYWlzdHVkaW8iLCJhIjoiY2x4eGZnd3Z3MDB3eTJqcXN4eGZnd3Z3In0')] bg-cover bg-center" />
                <div className="relative z-10 flex flex-col items-center gap-1">
                   <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
                   <span className="bg-white/80 px-2 py-1 rounded-md text-[10px] shadow-sm backdrop-blur-sm">You are here</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-2">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            </div>
          )}

          <div className="bg-[#0f172a] p-8 rounded-3xl text-white space-y-6 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mb-20 -mr-20 transition-transform group-hover:scale-110" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-bold tracking-tight">Apply for Leave</h3>
              <p className="text-slate-400 text-sm">Need a day off? Submit your leave request easily and track approval status.</p>
              <button 
                onClick={() => {
                  setActiveTab('leave');
                  setShowLeaveForm(true);
                }}
                className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
              >
                Apply Now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'hr-dashboard' ? (
            <div className="space-y-8">
              {/* HR Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <HRStatCard icon={Users} label="Total Staff" value="156" color="blue" />
                 <HRStatCard icon={CheckCircle2} label="On-Time Rate" value="94.2%" color="emerald" />
                 <HRStatCard icon={AlertCircle} label="Late Arrivals" value="8" color="amber" />
                 <HRStatCard icon={XCircle} label="Absent Employees" value="6" color="rose" />
              </div>

              {/* Aggregated Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase italic flex items-center gap-2">
                        <Building2 size={16} className="text-blue-600" />
                        Departmental Distribution
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Staff allocation by department</p>
                    </div>
                    <BarChart3 size={20} className="text-slate-300" />
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'Academic', count: 86, color: 'bg-blue-600' },
                      { name: 'Administration', count: 32, color: 'bg-emerald-600' },
                      { name: 'Support Staff', count: 24, color: 'bg-amber-600' },
                      { name: 'IT & Digital', count: 14, color: 'bg-indigo-600' },
                    ].map((dept) => (
                      <div key={dept.name} className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-700 italic">{dept.name}</span>
                          <span className="text-slate-400">{dept.count} Members</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(dept.count / 156) * 100}%` }}
                            className={cn("h-full rounded-full", dept.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase italic flex items-center gap-2">
                          <TrendingUp size={16} className="text-emerald-600" />
                          Monthly Performance Trends
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Staff 'On-Time' vs 'Late' punch-in ratios</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase italic">
                        94.2% On-Time Avg
                      </div>
                    </div>

                    <div className="h-44 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { month: 'Jan', onTime: 138, late: 18 },
                            { month: 'Feb', onTime: 145, late: 11 },
                            { month: 'Mar', onTime: 132, late: 24 },
                            { month: 'Apr', onTime: 149, late: 7 },
                            { month: 'May', onTime: 153, late: 3 },
                            { month: 'Jun', onTime: 142, late: 13 },
                          ]}
                          margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#cbd5e1" 
                            fontSize={8} 
                            tickLine={false}
                            fontFamily="var(--font-mono)"
                            fontWeight="bold"
                          />
                          <YAxis 
                            stroke="#cbd5e1" 
                            fontSize={8} 
                            tickLine={false}
                            fontFamily="var(--font-mono)"
                            fontWeight="bold"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              fontSize: '10px', 
                              borderRadius: '8px', 
                              border: '1px solid #e1e8f0', 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                            }} 
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '5px' }} 
                          />
                          <Area 
                            type="monotone" 
                            name="On-Time" 
                            dataKey="onTime" 
                            stroke="#10b981" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill="url(#colorOnTime)" 
                          />
                          <Area 
                            type="monotone" 
                            name="Late" 
                            dataKey="late" 
                            stroke="#f59e0b" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill="url(#colorLate)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Management Table */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="text-blue-600" />
                      Staff Attendance Logs
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Advanced management for HR Admins</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsExportModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-all font-bold text-sm shadow-sm"
                    >
                      <Download size={18} />
                      Export Report
                    </button>
                    <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 transition-colors">
                      <Filter size={18} />
                    </button>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Search staff..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none w-full md:w-64 transition-all" />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Logs</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location Verify</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendance.map((record) => {
                        const employee = mockEmployees.find(e => e.id === record.employeeId) || mockEmployees[0];
                        const isMockPin = record.distanceFromPin !== undefined && record.distanceFromPin <= 100;
                        
                        return (
                          <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                  {employee.name[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{employee.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">{employee.employeeCode}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                                  <LogIn size={10} /> {record.checkIn || '--:--'}
                                </div>
                                {record.checkOut && (
                                  <div className="flex items-center gap-2 text-xs font-black text-rose-600 bg-rose-50 w-fit px-2 py-0.5 rounded">
                                    <LogOut size={10} /> {record.checkOut}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col gap-1">
                                <div className={cn(
                                  "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest",
                                  isMockPin ? "text-emerald-600" : "text-rose-600"
                                )}>
                                  <Globe size={12} />
                                  {record.distanceFromPin !== undefined ? `${record.distanceFromPin}m from PIN` : 'No Location Data'}
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold">IP: 103.1.205.{(Math.random() * 255).toFixed(0)}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                record.status === 'present' ? "bg-emerald-100 text-emerald-700" :
                                record.status === 'late' ? "bg-amber-100 text-amber-700" :
                                "bg-rose-100 text-rose-700"
                              )}>
                                {record.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button 
                                onClick={() => setHistoryEmployeeId(employee.id)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              >
                                <History size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">Showing {attendance.length} records</p>
                  <div className="flex gap-2">
                    <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:bg-white transition-all disabled:opacity-50" disabled>
                      <ChevronRight className="rotate-180" size={18} />
                    </button>
                    <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:bg-white transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'attendance' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hours</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">164.5h</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">On-Time Rate</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">92%</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Late Arrivals</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">2</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Attendance History</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tracking your daily records</p>
                    </div>
                    <button 
                      onClick={() => setIsExportModalOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest"
                    >
                      <Download size={14} />
                      Export
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Filter records..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/10 w-full md:w-48" />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">In</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Out</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendance.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <span className="text-sm font-bold text-slate-700">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{record.checkIn || '--:--'}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">{record.checkOut || '--:--'}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                              record.status === 'present' ? "bg-emerald-100 text-emerald-700" :
                              record.status === 'late' ? "bg-amber-100 text-amber-700" :
                              record.status === 'leave' ? "bg-blue-100 text-blue-700" :
                              "bg-rose-100 text-rose-700"
                            )}>
                              {record.status === 'present' && <CheckCircle2 size={12} />}
                              {record.status === 'late' && <AlertCircle size={12} />}
                              {record.status === 'leave' && <Calendar size={12} />}
                              {record.status}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="text-xs text-slate-400 italic">{record.note || '-'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-slate-50/30 border-t border-slate-100 text-center">
                  <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">View All History</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Requests</p>
                      <p className="text-2xl font-black text-slate-900">{leaves.filter(l => l.status === 'pending').length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved Leaves</p>
                      <p className="text-2xl font-black text-slate-900">{leaves.filter(l => l.status === 'approved').length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <XCircle size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejected Leaves</p>
                      <p className="text-2xl font-black text-slate-900">{leaves.filter(l => l.status === 'rejected').length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                  <Filter size={16} className="text-slate-400" />
                  <select 
                    value={leaveTypeFilter}
                    onChange={(e) => setLeaveTypeFilter(e.target.value)}
                    className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="all">All Leave Types</option>
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Personal">Personal Leave</option>
                    <option value="Special">Special Leave</option>
                  </select>
                </div>
              </div>

      <AnimatePresence>
        {isExportModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setIsExportModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic">Export Attendance</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select date range for CSV download</p>
                </div>
                <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-white rounded-xl text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                       <Calendar size={12} className="text-blue-500" />
                       Start Date
                    </label>
                    <input 
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                       <Calendar size={12} className="text-blue-500" />
                       End Date
                    </label>
                    <input 
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                   <div className="flex items-start gap-3">
                      <FileText size={18} className="text-blue-600 mt-1" />
                      <div>
                         <p className="text-xs font-bold text-blue-900">Format: CSV (Excel Compatible)</p>
                         <p className="text-[10px] text-blue-600/80 font-medium mt-0.5">Includes check-in/out, status, and precise location verification data.</p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleExportCSV}
                  className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                >
                  <Download size={20} />
                  Download Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedLeave && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    onClick={() => setSelectedLeave(null)}
                  >
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-slate-900 p-8 text-white">
                        <div className="flex items-start justify-between mb-6">
                          <div className="p-3 bg-white/10 rounded-2xl">
                            <FileText size={24} />
                          </div>
                          <button onClick={() => setSelectedLeave(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <XCircle size={24} />
                          </button>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">{selectedLeave.leaveType} Leave Request</h3>
                        <p className="text-slate-400 text-sm mt-1">Submitted on {new Date(selectedLeave.appliedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Name</p>
                            <p className="text-sm font-bold text-slate-700">John Doe (You)</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                              selectedLeave.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                              selectedLeave.status === 'pending' ? "bg-amber-100 text-amber-700" :
                              "bg-rose-100 text-rose-700"
                            )}>
                              {selectedLeave.status}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</p>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-blue-500" />
                              <p className="text-sm font-bold text-slate-700">{selectedLeave.startDate}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</p>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-blue-500" />
                              <p className="text-sm font-bold text-slate-700">{selectedLeave.endDate}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for Absence</p>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 text-sm">
                            "{selectedLeave.reason}"
                          </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                          {selectedLeave.status === 'pending' && (
                            <button 
                              onClick={() => {
                                handleEditClick(selectedLeave);
                                setSelectedLeave(null);
                              }}
                              className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                            >
                              Edit Request
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedLeave(null)}
                            className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                          >
                            Close Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {historyEmployeeId && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    onClick={() => setHistoryEmployeeId(null)}
                  >
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-blue-600 p-8 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg">
                              {historyEmployee?.name[0]}
                            </div>
                            <div>
                              <h3 className="text-xl font-black">{historyEmployee?.name}'s History</h3>
                              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">{historyEmployee?.employeeCode} • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <button onClick={() => setHistoryEmployeeId(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <XCircle size={24} />
                          </button>
                        </div>
                      </div>
                      <div className="p-0 max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">In / Out</th>
                              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</th>
                              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {historyRecords.length > 0 ? historyRecords.map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-4">
                                  <p className="text-sm font-bold text-slate-700">{new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                </td>
                                <td className="px-8 py-4">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-mono font-bold text-emerald-600">{r.checkIn}</span>
                                    <span className="text-xs font-mono font-bold text-rose-600">{r.checkOut || '--:--'}</span>
                                  </div>
                                </td>
                                <td className="px-8 py-4">
                                  <span className="text-xs font-medium text-slate-500">
                                    {r.distanceFromPin !== undefined ? `${r.distanceFromPin}m` : 'N/A'}
                                  </span>
                                </td>
                                <td className="px-8 py-4">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                    r.status === 'present' ? "bg-emerald-100 text-emerald-700" :
                                    r.status === 'late' ? "bg-amber-100 text-amber-700" :
                                    "bg-rose-100 text-rose-700"
                                  )}>
                                    {r.status}
                                  </span>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={4} className="px-8 py-10 text-center text-slate-400 text-sm italic">No records found for this period.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button 
                          onClick={() => setHistoryEmployeeId(null)}
                          className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          Close History
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showLeaveForm && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold tracking-tight">
                        {editingLeave ? 'Edit Leave Request' : 'Request New Leave'}
                      </h3>
                      <button onClick={() => {
                        setShowLeaveForm(false);
                        setEditingLeave(null);
                      }} className="text-slate-400 hover:text-slate-900"><XCircle size={24} /></button>
                    </div>
                    
                    <form onSubmit={handleLeaveSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Type</label>
                          <select 
                            name="leaveType"
                            defaultValue={editingLeave?.leaveType || 'Annual'}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="Annual">Annual Leave</option>
                            <option value="Sick">Sick Leave</option>
                            <option value="Personal">Personal Leave</option>
                            <option value="Special">Special Leave</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">StartDate</label>
                          <input 
                            name="startDate"
                            type="date" 
                            defaultValue={editingLeave?.startDate}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EndDate</label>
                          <input 
                            name="endDate"
                            type="date" 
                            defaultValue={editingLeave?.endDate}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" 
                          />
                        </div>
                        <div className="md:col-span-1 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days Count</label>
                          <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold">Calculate(s)</div>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Description</label>
                          <textarea 
                            name="reason"
                            rows={3} 
                            defaultValue={editingLeave?.reason}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" 
                            placeholder="Provide more details..."
                          ></textarea>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button 
                          type="submit"
                          className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700"
                        >
                          {editingLeave ? 'Update Request' : 'Submit Request'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Pending Requests</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Awaiting approval</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {leaves
                      .filter(l => l.status === 'pending' && (leaveTypeFilter === 'all' || l.leaveType === leaveTypeFilter))
                      .map(l => (
                      <div key={l.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-amber-200 transition-all">
                        <div 
                          className="cursor-pointer"
                          onClick={() => setSelectedLeave(l)}
                        >
                          <p className="text-sm font-bold text-slate-700">{l.leaveType} Leave</p>
                          <p className="text-[10px] text-slate-400 font-bold">{l.startDate} → {l.endDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditClick(l)}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <FileText size={14} />
                          </button>
                          <div className="text-right">
                            <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-100 px-2 py-1 rounded-md">Pending</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {leaves.filter(l => l.status === 'pending' && (leaveTypeFilter === 'all' || l.leaveType === leaveTypeFilter)).length === 0 && (
                      <p className="text-center py-4 text-xs font-medium text-slate-400 italic">No matching pending requests.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Recently Approved</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Leave history</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {leaves
                      .filter(l => l.status === 'approved' && (leaveTypeFilter === 'all' || l.leaveType === leaveTypeFilter))
                      .map(l => (
                      <div 
                        key={l.id} 
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all cursor-pointer"
                        onClick={() => setSelectedLeave(l)}
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-700">{l.leaveType} Leave</p>
                          <p className="text-[10px] text-slate-400 font-bold">{l.startDate} → {l.endDate}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">Approved</span>
                        </div>
                      </div>
                    ))}
                    {leaves.filter(l => l.status === 'approved' && (leaveTypeFilter === 'all' || l.leaveType === leaveTypeFilter)).length === 0 && (
                      <p className="text-center py-4 text-xs font-medium text-slate-400 italic">No matching approved requests.</p>
                    )}
                  </div>
                </div>
              </div>

              {!showLeaveForm && (
                <button 
                  onClick={() => setShowLeaveForm(true)}
                  className="w-full py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all group"
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                    <Plus size={24} />
                  </div>
                  <span className="font-bold tracking-tight">Create New Leave Request</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

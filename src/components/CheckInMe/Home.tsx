import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MessageSquare, Clock, LayoutGrid, ChevronRight, X, Star, MapPin, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const PIN_LOCATION = { lat: 11.5564, lng: 104.9282 }; // Phnom Penh Example

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const BIRTHDAY_USERS = [
  { id: '1', name: 'Mean Choeurn Sreyroth', role: 'Daycare', rating: 5, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: '2', name: 'Azenith Penaredondo', role: 'Coordinator of the Kindergarten', rating: 5, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { id: '3', name: 'Khorn Sina', role: 'Nanny', rating: 5, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { id: '4', name: 'Lonh Sokkhim', role: 'Teacher Assistant Kindergarten', rating: 5, photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
];

export function Home() {
  const [checkedIn, setCheckedIn] = React.useState(false);
  const [time, setTime] = React.useState(new Date());
  const [showLeaveModal, setShowLeaveModal] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(false);
  const [distance, setDistance] = React.useState<number | null>(null);

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleCheckIn = () => {
    if (checkedIn) {
      setCheckedIn(false);
      setDistance(null);
      return;
    }

    setIsLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setCheckedIn(true);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = calculateDistance(latitude, longitude, PIN_LOCATION.lat, PIN_LOCATION.lng);
        setDistance(dist);
        setIsLocating(false);
        setCheckedIn(true);
      },
      (error) => {
        console.error("Location error:", error);
        setIsLocating(false);
        alert("Could not verify location. Checking in anyway.");
        setCheckedIn(true);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Real-time Clock & Check-in Section */}
      <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group">
        <div className="relative z-10 space-y-2">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Current Time</p>
          <h2 className="text-5xl font-black text-slate-900 tabular-nums">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </h2>
          <p className="text-slate-500 font-medium">{time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="mt-10 relative z-10 w-full max-w-sm">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleCheckIn}
            disabled={isLocating}
            className={cn(
              "w-full py-6 rounded-3xl font-black text-xl transition-all shadow-2xl flex flex-col items-center gap-2",
              checkedIn 
                ? "bg-red-500 text-white shadow-red-200" 
                : "bg-blue-600 text-white shadow-blue-200",
              isLocating && "opacity-50"
            )}
          >
            {isLocating ? <Loader2 className="w-8 h-8 animate-spin" /> : <Clock className="w-8 h-8" />}
            {isLocating ? 'Locating...' : (checkedIn ? 'Check Out' : 'Check In')}
          </motion.button>
          
          {distance !== null && (
            <div className={cn(
              "mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-2xl border",
              distance <= 100 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
            )}>
              <MapPin size={14} />
              {distance}m from verification pin
            </div>
          )}

          <div className="flex justify-between mt-6 px-4">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Check In</p>
              <p className="text-sm font-black text-slate-900">{checkedIn ? '08:30 AM' : '--:--'}</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Check Out</p>
              <p className="text-sm font-black text-slate-900">{checkedIn ? '--:--' : '05:45 PM'}</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-100 transition-colors" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50/50 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-purple-100 transition-colors" />
      </section>

      {/* Quick Menu Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MenuGridItem 
          icon={Calendar} 
          label="Attendance" 
          color="bg-orange-500" 
        />
        <MenuGridItem 
          icon={MessageSquare} 
          label="Apply Leave" 
          color="bg-blue-500" 
          onClick={() => setShowLeaveModal(true)}
        />
        <MenuGridItem 
          icon={Clock} 
          label="Overtime" 
          color="bg-green-500" 
        />
        <MenuGridItem 
          icon={LayoutGrid} 
          label="Report" 
          color="bg-purple-500" 
        />
      </section>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Apply Leave</h3>
              <button 
                onClick={() => setShowLeaveModal(false)}
                className="p-2 transition-colors hover:bg-slate-100 rounded-full"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowLeaveModal(false); }}>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leave Type</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 transition-all">
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Personal Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                <textarea rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Write your reason here..."></textarea>
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all mt-4">
                Submit Request
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Birthday Banner */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Upcoming Birthdays <span className="text-xl">🎂</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">Don't forget to send wishes!</p>
          </div>
          <button className="text-slate-300 hover:text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BIRTHDAY_USERS.map((user, idx) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group/item"
              >
                <div className="relative">
                  <img 
                    src={user.photo} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{user.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
                </div>
                <div className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  12 May
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MenuGridItem({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
    >
      <div className={cn("p-4 rounded-2xl text-white transition-transform group-hover:scale-110 shadow-lg", color, "shadow-" + color.split('-')[1] + "-100")}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-black text-xs text-slate-900">{label}</span>
    </button>
  );
}

function MenuItem({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <button className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all group">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="font-bold text-slate-900">{label}</span>
      </div>
      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </div>
    </button>
  );
}

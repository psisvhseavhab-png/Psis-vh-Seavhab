import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  ArrowRight, 
  Shield, 
  Globe, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  MapPin, 
  Download, 
  ExternalLink, 
  Phone, 
  Send, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Laptop,
  Smartphone
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { websiteService, GalleryItem } from '../services/websiteService';
import { brandingService, BrandingSettings } from '../services/brandingService';
import { WebsiteEvent, NewsPost } from '../types';

export function PublicWebsite() {
  const [events, setEvents] = useState<WebsiteEvent[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeGalleryEvent, setActiveGalleryEvent] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeEventDropdown, setActiveEventDropdown] = useState<string | null>(null);

  const [branding, setBranding] = useState<BrandingSettings>({
    schoolName: 'PSIS-VH',
    heroTitle: 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ វណ្ណ ហុង',
    heroSubtitle: 'សាលាបញ្ញាសាស្រ្តអន្តរជាតិ វណ្ណ ហុង ផ្តល់ជូនការអប់រំគុណភាពខ្ពស់ ចាប់ពីថ្នាក់មត្តេយ្យ រហូតដល់ថ្នាក់ទី១២ ទាំងកម្មវិធីសិក្សាជាតិ និងអន្តរជាតិ។',
    contactEmail: 'info@psisvh.edu.kh',
    contactPhone: '089 663 888',
    address: 'Phnom Penh, Cambodia',
    heroImageUrl: 'https://psisvh.vercel.app/logo.png'
  });

  useEffect(() => {
    const unsubEvents = websiteService.subscribeToEvents(setEvents);
    const unsubNews = websiteService.subscribeToNews(setNews);
    const unsubBranding = brandingService.subscribeToBranding(setBranding);
    
    websiteService.getGallery().then(items => {
      setGallery(items.filter(item => item.isPublic));
    });

    return () => {
      unsubEvents();
      unsubNews();
      unsubBranding();
    };
  }, []);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const hasEventOnDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.some(e => e.date === dateStr);
  };

  const getEventsOnDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  // Helper to parse dates and generate standard ICS formatted timestamp
  const getICSDateString = (dateStr: string, timeStr?: string) => {
    let hours = 8;
    let minutes = 0;
    if (timeStr) {
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        if (timeStr.toLowerCase().includes('pm') && hours < 12) {
          hours += 12;
        } else if (timeStr.toLowerCase().includes('am') && hours === 12) {
          hours = 0;
        }
      }
    }
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    // Format to YYYYMMDDTHHMMSSZ
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Triggers native download of standard .ics file for iOS, Android, macOS, and Windows Calendar systems
  const downloadEventICS = (event: WebsiteEvent) => {
    const start = getICSDateString(event.date, event.startTime);
    const end = getICSDateString(event.date, event.endTime || event.startTime);
    
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Pannasastra International School Van Hong//NONSGML v1.0//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:event-${event.id || Math.random().toString(36).substring(2)}@psisvh.edu.kh`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || 'Pannasastra International School Van Hong Event'}`,
      `LOCATION:${event.location || 'Paññāsāstra International School Van Hong'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'school-event'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveEventDropdown(null);
  };

  // Returns beautiful pre-filled Google Calendar event generation URL
  const getGoogleCalendarUrl = (event: WebsiteEvent) => {
    const start = getICSDateString(event.date, event.startTime);
    const end = getICSDateString(event.date, event.endTime || event.startTime);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${start}/${end}`,
      details: event.description || 'Pannasastra International School Van Hong Event',
      location: event.location || 'Paññāsāstra International School Van Hong'
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 antialiased font-sans">
      {/* Header / Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://psisvh.vercel.app/logo.png" alt="PSIS Logo" className="h-14 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-bold text-blue-900 tracking-wide leading-tight">Pannasastra International School</span>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">VAN HONG</span>
              <span className="text-[10px] md:text-xs text-gray-500 font-medium leading-tight mt-0.5">សាលាបញ្ញាសាស្រ្តអន្តរជាតិ វណ្ណ ហុង</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="#announcement" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm">New Term</a>
            <a href="#curriculum" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm">Curriculum</a>
            <a href="#cooperation" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm">Cooperation</a>
            <a href="#gallery" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm">Gallery</a>
            <a href="#calendar" className="text-gray-600 hover:text-blue-900 font-semibold transition text-sm">Calendar</a>
            <a href="#contact" className="bg-blue-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition text-xs uppercase tracking-wider">Contact Us</a>
            <a href="/login" className="bg-amber-500 text-slate-950 px-5 py-2.5 rounded-lg font-bold hover:bg-amber-600 transition text-xs uppercase tracking-wider">Login</a>
          </div>

          {/* Mobile Burger Trigger */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-blue-900 focus:outline-none" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-inner px-4 py-4 space-y-3"
            >
              <a href="#announcement" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-bold hover:text-blue-900">New Term</a>
              <a href="#curriculum" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-bold hover:text-blue-900">Curriculum</a>
              <a href="#cooperation" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-bold hover:text-blue-900">Cooperation</a>
              <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-bold hover:text-blue-900">Gallery</a>
              <a href="#calendar" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-bold hover:text-blue-900">Calendar</a>
              <div className="pt-2 flex flex-col gap-2">
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="bg-blue-900 text-white text-center py-2.5 rounded-lg font-bold text-sm">Contact Us</a>
                <a href="/login" onClick={() => setMobileMenuOpen(false)} className="bg-amber-500 text-slate-950 text-center py-2.5 rounded-lg font-bold text-sm">Login Portal</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section with Background Video Loop */}
      <section className="relative bg-blue-950 text-white py-24 lg:py-32 overflow-hidden min-h-[600px] flex items-center justify-center">
        {/* Background Video Link */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.4]"
          poster="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
        >
          <source src="https://psis-vh.vercel.app/bk.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Blue Opacity Shade Overlay */}
        <div className="absolute inset-0 bg-blue-950/70 z-10"></div>
        
        {/* Dot Pattern Layer */}
        <div 
          className="absolute inset-0 z-12 opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        ></div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border border-white/20 shadow-2xl">
              <img src="https://psisvh.vercel.app/logo.png" alt="PSIS Logo" className="h-20 md:h-24 w-auto object-contain drop-shadow-md" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 mb-6 border border-amber-500/30 backdrop-blur-md">
            ឆ្នាំសិក្សា ២០២៦–២០២៧ • Academic Year 2026-2027
          </span>

          {/* Heading styled with traditional Moul Font */}
          <h1 className="font-moul text-2xl md:text-4xl lg:text-5xl max-w-5xl mx-auto text-white leading-relaxed tracking-wide drop-shadow-md mb-4 font-normal">
            ចាប់បើកទទួលចុះឈ្មោះ សម្រាប់បវេសនកាលថ្មី
          </h1>
          
          <p className="text-xl md:text-2xl font-bold text-amber-400 drop-shadow-sm tracking-wide">
            Admissions Open for the New Academic Term!
          </p>
          
          <p className="mt-6 text-sm md:text-base text-slate-200 max-w-3xl mx-auto leading-relaxed font-semibold drop-shadow-sm">
            {branding.heroSubtitle || "សាលាបញ្ញាសាស្រ្តអន្តរជាតិ វណ្ណ ហុង ផ្តល់ជូនការអប់រំគុណភាពខ្ពស់ ចាប់ពីថ្នាក់មត្តេយ្យ រហូតដល់ថ្នាក់ទី១២ ទាំងកម្មវិធីសិក្សាជាតិ និងអន្តរជាតិ។"}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a href="#announcement" className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition text-center text-sm uppercase tracking-wider">
              View Start Date
            </a>
            <a href="#contact" className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-8 py-3.5 rounded-xl font-bold transition text-center backdrop-blur-sm text-sm uppercase tracking-wider">
              Contact Admissions
            </a>
          </div>
        </div>
      </section>

      {/* Critical Alert Box (New Term & Promo) */}
      <section id="announcement" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          <div className="flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center font-bold text-2xl shrink-0">📅</div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">ថ្ងៃចូលរៀន / School Starts</h4>
              <p className="text-lg font-black text-blue-900 mt-0.5">០១ កញ្ញា ២០២៦</p>
              <p className="text-xs font-bold text-gray-500">September 01, 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 lg:pr-6">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-2xl shrink-0">🎁</div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">ការផ្តល់ជូនពិសេស / Special Offers</h4>
              <p className="text-sm font-bold text-gray-900 mt-1">ប្រូម៉ូសិនព្រមទាំងការផ្តល់ជូនបន្ថែមជាច្រើនទៀត</p>
              <p className="text-[10px] font-semibold text-gray-500 mt-0.5">*ទៅតាមលក្ខខណ្ឌផ្សេងៗដែលត្រូវបានអនុវត្ត (T&C Apply)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-stretch lg:justify-end">
            <a href="tel:089663888" className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-center py-3 px-4 rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <Phone size={14} /> Line 1: 089 663 888
            </a>
            <a href="tel:093815888" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-center py-3 px-4 rounded-xl transition text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              <Phone size={14} /> Line 2: 093 815 888
            </a>
          </div>

        </div>
      </section>

      {/* Core Curriculum Pillars */}
      <section id="curriculum" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-moul text-2xl md:text-3xl text-gray-900 leading-relaxed font-normal">កម្មវិធីសិក្សារួមមាន</h2>
          <h3 className="text-xs font-black text-amber-600 tracking-wider uppercase -mt-2">Educational Pillars</h3>
          <div className="h-1 w-20 bg-amber-500 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-sm text-gray-600 font-semibold">A holistic academic platform balancing core global knowledge, tech mastery, and moral values.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 bg-blue-50 text-blue-950 rounded-lg flex items-center justify-center text-lg font-bold mb-5">🇰🇭</div>
            <h3 className="text-lg font-bold text-gray-900">កម្មវិធីសិក្សាជាតិ និងអន្តរជាតិ</h3>
            <h4 className="text-xs text-amber-600 font-bold tracking-wider uppercase mt-0.5">National & International Curriculums</h4>
            <p className="text-gray-600 text-xs mt-3 leading-relaxed font-medium">A complete bilingual structure empowering students to master their native heritage alongside rich western standards.</p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 bg-blue-50 text-blue-950 rounded-lg flex items-center justify-center text-lg font-bold mb-5">🇬🇧</div>
            <h3 className="text-lg font-bold text-gray-900">កម្មវិធី Cambridge English</h3>
            <h4 className="text-xs text-amber-600 font-bold tracking-wider uppercase mt-0.5">Cambridge English Framework</h4>
            <p className="text-gray-600 text-xs mt-3 leading-relaxed font-medium">World-class English language training optimized for international certifications, communication fluency, and deep comprehension.</p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 bg-blue-50 text-blue-950 rounded-lg flex items-center justify-center text-lg font-bold mb-5">🌱</div>
            <h3 className="text-lg font-bold text-gray-900">ថ្នាក់បំណិនជីវិត (Life Skills)</h3>
            <h4 className="text-xs text-amber-600 font-bold tracking-wider uppercase mt-0.5">Practical Life Skills</h4>
            <p className="text-gray-600 text-xs mt-3 leading-relaxed font-medium">Hands-on learning designed to foster critical thinking, financial awareness, public collaboration, and smart problem solving.</p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 bg-blue-50 text-blue-950 rounded-lg flex items-center justify-center text-lg font-bold mb-5">🤝</div>
            <h3 className="text-lg font-bold text-gray-900">ថ្នាក់បណ្តុះគុណធម៌ និងមគ្គុទ្ទេសក៍</h3>
            <h4 className="text-xs text-amber-600 font-bold tracking-wider uppercase mt-0.5">Moral & Leadership Development</h4>
            <p className="text-gray-600 text-xs mt-3 leading-relaxed font-medium">Focusing deeply on ethics, civic duties, mutual respect, and leadership qualities to raise up outstanding global citizens.</p>
          </div>

          {/* Pillar 5 */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition col-span-1 md:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 bg-blue-50 text-blue-950 rounded-lg flex items-center justify-center text-lg font-bold mb-5">💻</div>
            <h3 className="text-lg font-bold text-gray-900">ចំណេះដឹងបច្ចេកវិទ្យា និងឌីជីថល</h3>
            <h4 className="text-xs text-amber-600 font-bold tracking-wider uppercase mt-0.5">Technology & Digital Literacy</h4>
            <p className="text-gray-600 text-xs mt-3 leading-relaxed font-medium">Preparing students directly for the future through early computer science foundations, clean workspace logic, and smart tech usage.</p>
          </div>
        </div>
      </section>

      {/* Cooperation & Partnerships Section */}
      <section id="cooperation" className="py-16 bg-white border-t border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-moul text-xl md:text-2xl text-gray-900 leading-relaxed font-normal">កិច្ចសហប្រតិបត្តិការរបស់យើង</h2>
            <h3 className="text-xs font-black text-blue-900 tracking-wider uppercase -mt-1">Educational Cooperation</h3>
            <div className="h-1 w-16 bg-blue-900 mx-auto mt-3 rounded-full"></div>
            <p className="text-xs text-gray-500 font-semibold mt-3">We partner with prestigious national ministries and international networks to deliver elite global curriculum benchmarks.</p>
          </div>
          
          {/* Partners Logo Responsive Grid Layout (5 Items) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center justify-items-center max-w-6xl mx-auto">
            {/* MoEYS Cambodia */}
            <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center h-28 w-full group hover:border-blue-900/20 transition">
              <img src="https://psis-vh.vercel.app/MoEYS%20Cambodia.png" alt="Ministry of Education, Youth and Sports" className="max-h-24 w-auto object-contain transition group-hover:scale-105" />
            </div>
            {/* Cambridge English */}
            <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center h-28 w-full group hover:border-blue-900/20 transition">
              <img src="https://psis-vh.vercel.app/Cambridge%20English%20Authorised%20Exam%20Centre.png" alt="Cambridge English Authorised Exam Centre" className="max-h-16 w-auto object-contain transition group-hover:scale-105" />
            </div>
            {/* SpringBoard Education */}
            <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center h-28 w-full group hover:border-blue-900/20 transition">
              <img src="https://psis-vh.vercel.app/SpringBoard%20Education.png" alt="SpringBoard Education" className="max-h-14 w-auto object-contain transition group-hover:scale-105" />
            </div>
            {/* SIMCC */}
            <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center h-28 w-full group hover:border-blue-900/20 transition">
              <img src="https://psis-vh.vercel.app/Singapore%20International%20Mastery%20Contests%20Center%20-%20SIMCC.png" alt="Singapore International Mastery Contests Center - SIMCC Singapore" className="max-h-24 w-auto object-contain transition group-hover:scale-105" />
            </div>
            {/* STS */}
            <div className="p-4 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center h-28 w-full group hover:border-blue-900/20 transition col-span-2 md:col-span-1">
              <img src="https://psis-vh.vercel.app/International%20Academic%20&%20Cultural%20Contests%20-%20STS%20Scholastic%20Trust%20Singapore.png" alt="International Academic & Cultural Contests - STS Scholastic Trust Singapore" className="max-h-24 w-auto object-contain transition group-hover:scale-105" />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery & Highlights Section */}
      <section id="gallery" className="py-20 bg-slate-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-moul text-xl md:text-2xl text-gray-900 leading-relaxed font-normal">សកម្មភាព និងទិដ្ឋភាពទូទៅ</h2>
            <h3 className="text-xs font-black text-amber-600 tracking-wider uppercase -mt-1">School Highlights</h3>
            <div className="h-1 w-20 bg-amber-500 mx-auto mt-4 rounded-full"></div>
            <p className="mt-4 text-sm text-gray-600 font-semibold">Explore student life, standard competitions, events, and essential announcements through our video updates.</p>
          </div>

          {/* Facebook Reels Block */}
          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-end gap-8 max-w-5xl mx-auto mb-16">
            {/* Vertical Reel Block */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center">
              <div className="overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center">
                <iframe 
                  src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F27239885675692471%2F&show_text=false&width=265&t=0" 
                  width="265" 
                  height="476" 
                  style={{ border: 'none', overflow: 'hidden' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>
              <span className="text-[10px] text-gray-500 mt-3 font-black tracking-widest uppercase">Campus Presentation / ទិដ្ឋភាពសាលា</span>
            </div>

            {/* Horizontal/Wide Reel Block */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center w-full lg:w-auto">
              <div className="overflow-hidden rounded-xl bg-slate-50 max-w-full overflow-x-auto flex items-center justify-center">
                <iframe 
                  src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F27055966314066479%2F&show_text=false&width=560&t=0" 
                  width="560" 
                  height="314" 
                  style={{ border: 'none', overflow: 'hidden' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                ></iframe>
              </div>
              <span className="text-[10px] text-gray-500 mt-3 font-black tracking-widest uppercase">Activities & Events / សកម្មភាពសិក្សារបស់សិស្ស</span>
            </div>
          </div>

          {/* YouTube Video Grid */}
          <div className="border-t border-gray-200/60 pt-12">
            <h3 className="text-xs font-black text-center text-gray-500 mb-8 uppercase tracking-widest">Featured YouTube Presentations / វីដេអូផ្សព្វផ្សាយ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              
              {/* YT Video 1 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/d_tMApRKqXs" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen 
                    className="w-full h-full min-h-[260px] md:min-h-[315px]"
                  ></iframe>
                </div>
              </div>

              {/* YT Video 2 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/oTIfSFvxpLg" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen 
                    className="w-full h-full min-h-[260px] md:min-h-[315px]"
                  ></iframe>
                </div>
              </div>

              {/* YT Video 3 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/dRh7KiNDr7Y" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen 
                    className="w-full h-full min-h-[260px] md:min-h-[315px]"
                  ></iframe>
                </div>
              </div>

              {/* YT Video 4 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/MM26g5IW158" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen 
                    className="w-full h-full min-h-[260px] md:min-h-[315px]"
                  ></iframe>
                </div>
              </div>

            </div>
          </div>

          {/* Photo Gallery - Grid */}
          <div className="mt-16 pt-12 border-t border-gray-200/60">
            <h3 className="text-sm font-black text-center text-slate-800 mb-8 uppercase tracking-widest">Captured Moments & Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {gallery.length > 0 ? gallery
                .filter(item => activeGalleryEvent === 'all' || item.eventId === activeGalleryEvent)
                .map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  viewport={{ once: true }}
                  className={cn(
                    "group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-md cursor-pointer bg-slate-50",
                    (i % 5 === 0) ? "md:row-span-2 md:aspect-auto" : ""
                  )}
                >
                  <img src={item.url} alt={item.description || "Gallery"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {item.eventId && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        {events.find(e => e.id === item.eventId)?.title || 'Event'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-white text-xs font-bold leading-tight line-clamp-2">{item.description || 'School Activity'}</p>
                  </div>
                </motion.div>
              )) : [
                "https://images.unsplash.com/photo-1577891729319-f4871de65df2?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1544391682-17ef1af356b4?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
              ].map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                  <img src={img} alt="School Activity Placeholder" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* School Program Formats Grid */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic">School Levels & Program Formats</h2>
            <div className="h-1.5 w-16 bg-blue-900 mx-auto mt-4 rounded-full"></div>
            <p className="text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest">Flexible academic structures designed around standard family constraints.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <h4 className="text-lg font-black text-gray-950 uppercase italic">K-12 Pathways</h4>
              <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">Nursery, Kindergarten, Primary, and Senior High School levels (Grades 1 to 12).</p>
            </div>
            <div className="bg-slate-50 border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <h4 className="text-lg font-black text-gray-950 uppercase italic">Full-Time Track</h4>
              <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">Immersive daily schedules balancing national curriculums alongside comprehensive language development goals.</p>
            </div>
            <div className="bg-slate-50 border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <h4 className="text-lg font-black text-gray-950 uppercase italic">Part-Time English</h4>
              <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">Targeted language classes mapping standard proficiency scales spanning Level 1 up to Level 12.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Calendar Section (DYNAMIC & INTERACTIVE + ADD TO COMPUTER/ANDROID/IOS) */}
      <section id="calendar" className="py-20 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            <div className="lg:col-span-1 space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 uppercase tracking-widest">
                  <Sparkles size={12} /> Stay Synced
                </span>
                <h2 className="text-3xl font-black text-slate-900 uppercase italic">Event Calendar</h2>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Keep track of all upcoming exams, school holidays, parent-teacher conferences, and extracurricular events.
                </p>
              </div>

              {/* Calendar Help message */}
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon size={14} /> Add to Device Calendar
                </h4>
                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                  You can sync any event straight into your Computer, Android, or iOS device! Click the "Add to Calendar" dropdown next to any event to choose your app.
                </p>
                <div className="flex gap-4 pt-1 text-blue-800 font-semibold text-[10px] uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Laptop size={12} /> Desktop</span>
                  <span className="flex items-center gap-1"><Smartphone size={12} /> Mobile / Tablet</span>
                </div>
              </div>
            </div>

            {/* Interactive Calendar Widget */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-200 shadow-xl">
              
              {/* Month Grid */}
              <div className="md:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase italic">{monthName} {year}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={handlePrevMonth} 
                      className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      onClick={handleNextMonth} 
                      className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-y-3 gap-x-2">
                  {Array.from({ length: firstDayOfMonth(currentMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth(currentMonth) }).map((_, i) => {
                    const day = i + 1;
                    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isToday = new Date().toDateString() === dayDate.toDateString();
                    const dayEvents = getEventsOnDay(day);
                    const hasEvent = dayEvents.length > 0;
                    
                    return (
                      <div 
                        key={day} 
                        className={cn(
                          "aspect-square flex flex-col items-center justify-center text-[10px] font-black rounded-lg transition-all relative cursor-pointer group",
                          isToday ? "border-2 border-amber-500 text-slate-900 bg-amber-50" : "text-slate-600 hover:bg-slate-50",
                          hasEvent ? "bg-blue-900 text-white hover:bg-blue-800 shadow-md shadow-blue-950/20" : ""
                        )}
                        title={hasEvent ? dayEvents.map(e => e.title).join(', ') : undefined}
                      >
                        <span>{day}</span>
                        {hasEvent && (
                          <span className="absolute bottom-1 w-1 h-1 bg-amber-400 rounded-full"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event detail/list for Selected Month */}
              <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 space-y-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full animate-pulse"></span> Scheduled in {monthName}
                  </h4>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {events.filter(e => {
                      const eventDate = new Date(e.date);
                      return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
                    }).length > 0 ? (
                      events.filter(e => {
                        const eventDate = new Date(e.date);
                        return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
                      }).map(event => (
                        <div key={event.id} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl space-y-2 relative transition-all group">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[8px] font-black uppercase tracking-widest rounded">
                                {new Date(event.date).getDate()} {new Date(event.date).toLocaleString('default', { month: 'short' })}
                              </span>
                              {event.time && (
                                <span className="text-[9px] font-bold text-slate-500 uppercase">{event.time}</span>
                              )}
                            </div>
                            <p className="text-[11px] font-black text-slate-900 mt-1 uppercase italic leading-snug line-clamp-2">{event.title}</p>
                            {event.location && (
                              <p className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5 mt-0.5"><MapPin size={8} /> {event.location}</p>
                            )}
                          </div>

                          {/* Add to Computer / iOS / Android dropdown handler */}
                          <div className="relative pt-1">
                            <button 
                              onClick={() => setActiveEventDropdown(activeEventDropdown === event.id ? null : event.id)}
                              className="text-[10px] font-black text-blue-900 hover:text-blue-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                              <CalendarIcon size={12} /> Add to Calendar
                            </button>

                            {activeEventDropdown === event.id && (
                              <div className="absolute left-0 bottom-full mb-1 z-50 w-44 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 space-y-1">
                                <a 
                                  href={getGoogleCalendarUrl(event)}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => setActiveEventDropdown(null)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[10px] text-gray-700 hover:bg-blue-50 font-black rounded-lg transition-colors uppercase italic"
                                >
                                  <span className="text-xs">🌐</span> Google Calendar
                                </a>
                                <button 
                                  onClick={() => downloadEventICS(event)}
                                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-[10px] text-gray-700 hover:bg-blue-50 font-black rounded-lg transition-colors uppercase italic"
                                >
                                  <span className="text-xs">🍏</span> Apple / iOS / Mac
                                </button>
                                <button 
                                  onClick={() => downloadEventICS(event)}
                                  className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-[10px] text-gray-700 hover:bg-blue-50 font-black rounded-lg transition-colors uppercase italic"
                                >
                                  <span className="text-xs">🤖</span> Android / Outlook
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] font-bold text-slate-400 italic py-6">No events scheduled for this month.</p>
                    )}
                  </div>
                </div>

                <div className="text-[9px] text-slate-400 font-bold leading-relaxed pt-3 border-t border-slate-50">
                  *Device compatibility: Downloading the .ics file is supported natively on iOS Calendar, Android Calendar, Outlook, and macOS Calendar.
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Contact / Admissions Channels */}
      <section id="contact" className="bg-slate-950 text-white py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-moul text-xl md:text-2xl text-white leading-relaxed font-normal">ព័ត៌មានបន្ថែមអំពីការចុះឈ្មោះ</h2>
            <h3 className="text-xs font-black text-amber-500 tracking-wider uppercase -mt-1">Contact Admissions</h3>
            <div className="h-1 w-20 bg-amber-500 mx-auto mt-4 rounded-full"></div>
            <p className="mt-4 text-xs text-slate-400 font-semibold leading-relaxed">Connect directly with our admissions desk via phone or Telegram for speedy inquiries.</p>
          </div>

          {/* Contact Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Contact Line 1 */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between hover:border-blue-500/30 transition">
              <div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-md">Admissions Line 1</span>
                <h3 className="text-xl font-black mt-4 text-white">Call Office: 089 663 888</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">Direct voice assistance regarding fee structures, enrollment guidelines, and general school documents.</p>
              </div>
              <div className="mt-8">
                <a href="tel:089663888" className="inline-flex w-full items-center justify-center bg-blue-900 hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl transition gap-2 text-xs uppercase tracking-widest shadow-md">
                  📞 Voice Call Line 1
                </a>
              </div>
            </div>

            {/* Contact Line 2 & Telegram */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition">
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-md">Admissions Line 2 & Chat</span>
                <h3 className="text-xl font-black mt-4 text-white">Direct Line: 093 815 888</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">Reach out on the phone or open instant chat handling to consult about student orientations and discounts.</p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href="tel:093815888" className="flex-1 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition gap-2 text-xs uppercase tracking-widest shadow-md">
                  📞 Phone Call
                </a>
                <a href="https://t.me/+85593815888" target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-4 rounded-xl transition gap-2 text-xs uppercase tracking-widest shadow-md">
                  <Send size={14} /> Telegram Chat
                </a>
              </div>
            </div>

          </div>

          {/* Footer Line */}
          <div className="mt-20 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <div className="flex items-center gap-2">
              <img src="https://psisvh.vercel.app/logo.png" alt="PSIS Logo" className="h-6 w-auto brightness-90" />
              <p>&copy; 2026 Pannasastra International School VAN HONG. All rights reserved.</p>
            </div>
            <p className="font-bold text-slate-400 text-sm font-khmer">សាលាបញ្ញាសាស្រ្តអន្តរជាតិ វណ្ណ ហុង</p>
          </div>
        </div>
      </section>
    </div>
  );
}

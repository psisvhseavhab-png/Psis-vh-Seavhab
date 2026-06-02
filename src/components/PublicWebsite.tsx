import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Users, Award, Clock, ArrowRight, Shield, Globe, MessageSquare, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { websiteService, GalleryItem } from '../services/websiteService';
import { brandingService, BrandingSettings } from '../services/brandingService';
import { WebsiteEvent, NewsPost } from '../types';

export function PublicWebsite() {
  const [events, setEvents] = useState<WebsiteEvent[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeGalleryEvent, setActiveGalleryEvent] = useState<string>('all');
  const [branding, setBranding] = useState<BrandingSettings>({
    schoolName: 'PSIS-VH',
    heroTitle: 'Paññāsāstra International School Van Hong',
    heroSubtitle: 'Unlock your potential at PSIS-VH. We provide a world-class environment where innovation meets tradition, empowering students to excel in a rapidly changing world.',
    contactEmail: 'info@psisvh.edu.kh',
    contactPhone: '+855 12 345 678',
    address: 'Phnom Penh, Cambodia',
    heroImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop'
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
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
              <img src={branding.logoUrl || "https://psisvh.vercel.app/logo.png"} alt="School Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-black text-slate-900 text-xl tracking-tight italic uppercase">{branding.schoolName}</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">About Us</a>
            <a href="#programs" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Programs</a>
            <a href="#news" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">News & Events</a>
            <a href="#gallery" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Gallery</a>
            <a href="/login" className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Login Portal</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <Award size={14} />
              Premier Education Excellence
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight italic uppercase whitespace-pre-line">
              {branding.heroTitle}
            </h1>
            <p className="text-lg text-slate-500 font-bold leading-relaxed max-w-xl">
              {branding.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/login" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-2xl hover:bg-slate-800 transition-all group">
                Join our community
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#programs" className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">
                Our Programs
              </a>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-slate-100 rounded-[4rem] overflow-hidden shadow-2xl relative group">
              <img 
                src={branding.heroImageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"} 
                alt="School Environment"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Student" />
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-white text-[10px] font-black italic">+2k</div>
                   </div>
                   <div>
                      <p className="text-white font-black text-sm uppercase">Join 2,000+ Students</p>
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Enrolling for 2024-2025</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Programs Section */}
      <section id="programs" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-24">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Our Curriculum</h4>
            <h2 className="text-5xl font-black text-slate-900 italic uppercase">Academic Programs</h2>
            <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full mt-6" />
          </div>

          <div className="space-y-32">
            {/* Kindergarten Curriculum */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  Ages 1y - 6y • Early Years
                </div>
                <h3 className="text-4xl font-black text-slate-900 italic uppercase leading-tight">Kindergarten <br/><span className="text-emerald-600">Foundation</span></h3>
                <p className="text-slate-500 font-bold leading-relaxed">
                  Our curriculum is planned across areas of learning and experience, based on children's interests. We establish a strong foundation in a safe, academic-based environment that promotes physical, social, emotional, and cognitive development.
                </p>
                <div className="space-y-4">
                  {[
                    "Play-based learning foundation",
                    "Child-centered classroom environment",
                    "English language immersion",
                    "Social and cultural understanding"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      </div>
                      <span className="text-xs font-black text-slate-700 uppercase italic">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <div className="relative group">
                <div className="aspect-video bg-emerald-50 rounded-[3rem] overflow-hidden border-2 border-emerald-100 shadow-2xl relative">
                  <img 
                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1972&auto=format&fit=crop" 
                    alt="Kindergarten"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-emerald-900/10" />
                </div>
                <div className="absolute -bottom-6 -right-6 p-8 bg-white rounded-3xl shadow-xl border border-emerald-50 max-w-[240px]">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Enrollment Open</p>
                   <p className="text-sm font-bold text-slate-900 leading-tight italic">Welcoming children from 1 to 6 years old for 2024-2025.</p>
                </div>
              </div>
            </div>

            {/* Primary Curriculum */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                  Grades 1 - 6
                </div>
                <h3 className="text-4xl font-black text-slate-900 italic uppercase">Primary Curriculum</h3>
                <p className="text-slate-500 font-bold leading-relaxed">
                  From 1st to 6th grade, we offer each and every student an education emphasized on various subjects. The primary curriculum focuses on preparing students for academic challenges and moral virtues, as well as cultivating positive character.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  {[
                    "Art (Drawing & Music)", "Computer (English)", "Core English", "Mathematics (EN/KH)",
                    "Science & Social (EN/KH)", "Health Education", "Local Life Skills"
                  ].map(subject => (
                    <div key={subject} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="text-sm font-black text-slate-700 italic uppercase">{subject}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 p-12 rounded-[4rem] text-white space-y-10 shadow-2xl">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Core Aims</h4>
                <div className="space-y-8">
                   <div className="space-y-3">
                      <p className="text-sm font-black italic uppercase text-blue-200">Art & Music</p>
                      <p className="text-slate-400 text-sm leading-relaxed">Nurturing self-esteem through self-expression, creativity, and joyful participation in art forms.</p>
                   </div>
                   <div className="space-y-3">
                      <p className="text-sm font-black italic uppercase text-blue-200">Bilingual Proficiency</p>
                      <p className="text-slate-400 text-sm leading-relaxed">Developing competence in Khmer and English through listening, speaking, reading, and writing.</p>
                   </div>
                   <div className="space-y-3">
                      <p className="text-sm font-black italic uppercase text-blue-200">Character & Science</p>
                      <p className="text-slate-400 text-sm leading-relaxed">Fostering curiosity, social responsibility, and scientific approaches to problem-solving.</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Junior & Senior High */}
            <div className="pt-20 border-t border-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="lg:order-2 space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-purple-100">
                    Grades 7 - 12
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 italic uppercase">Secondary Education</h3>
                  <p className="text-slate-500 font-bold leading-relaxed">
                    Our Junior and Senior High programs provide continued academic growth, extra-curricular exploration, social interaction, and character building. We offer a balanced academic curriculum where learning flourishes.
                  </p>
                  <div className="space-y-4">
                    {[
                      { title: "College Preparatory", desc: "Designed to familiarize students with college-level teaching and expectations." },
                      { title: "NIB Pathway", desc: "National and International Baccalaureate candidate participation." }
                    ].map((path, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                        <h5 className="font-black text-slate-900 uppercase italic text-sm">{path.title}</h5>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed">{path.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:order-1 space-y-4">
                  <div className="p-10 bg-white border-2 border-slate-900 rounded-[3rem] shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr>
                          <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Subjects</th>
                          <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Language</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-4 text-sm font-bold text-slate-700">
                        {[
                          ["English", "English"], ["Mathematics", "English"], ["Physics", "English"],
                          ["Chemistry", "English"], ["Biology", "English"], ["Computer", "English"],
                          ["Khmer Literature", "Khmer"], ["History & Morality", "Khmer"]
                        ].map((row, i) => (
                          <tr key={i} className="border-t border-slate-50 h-12">
                            <td className="font-black italic uppercase text-xs">{row[0]}</td>
                            <td className="text-slate-400 text-[10px] font-black uppercase">{row[1]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News & Events Section */}
      <section id="news" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Latest Updates</h4>
                <h2 className="text-5xl font-black text-slate-900 italic uppercase">News & Announcements</h2>
              </div>
              
              <div className="space-y-8">
                {news.length > 0 ? news.slice(0, 3).map((item, i) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ x: 10 }}
                    className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center cursor-pointer transition-all"
                  >
                    <div className="w-full md:w-48 h-32 bg-slate-100 rounded-3xl overflow-hidden shrink-0">
                       {item.image ? (
                         <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-200">
                            <BookOpen size={40} />
                         </div>
                       )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.category}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.publishedAt}</span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 italic uppercase group-hover:text-blue-600 transition-colors uppercase leading-tight line-clamp-2">{item.title}</h4>
                      <p className="text-slate-500 text-sm font-bold leading-relaxed line-clamp-2">{item.summary}</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic">No recent news available.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Mark Your Day</h4>
                <h2 className="text-3xl font-black text-slate-900 italic uppercase">Event Calendar</h2>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black text-slate-900 uppercase italic">{monthName} {year}</h3>
                   <div className="flex gap-2">
                      <div onClick={handlePrevMonth} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><ArrowRight size={14} className="rotate-180" /></div>
                      <div onClick={handleNextMonth} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><ArrowRight size={14} /></div>
                   </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                  {Array.from({ length: firstDayOfMonth(currentMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth(currentMonth) }).map((_, i) => {
                    const day = i + 1;
                    const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                    const hasEvent = hasEventOnDay(day);
                    return (
                      <div 
                        key={day} 
                        className={cn(
                          "aspect-square flex items-center justify-center text-[10px] font-black rounded-lg transition-all relative cursor-pointer",
                          isToday ? "border border-blue-600 text-blue-600" : "text-slate-400 hover:bg-slate-50",
                          hasEvent && "bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-black"
                        )}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                  {events.filter(e => {
                    const eventDate = new Date(e.date);
                    return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
                  }).slice(0, 3).map(event => (
                    <div key={event.id} className="flex gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                         <span className="text-[10px] font-black text-blue-600">{new Date(event.date).getDate()}</span>
                         <span className="text-[10px] font-bold text-blue-400 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase italic line-clamp-1">{event.title}</p>
                        <p className="text-[10px] font-bold text-slate-400">{event.time} • {event.location}</p>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-[10px] font-bold text-slate-400 italic">No events scheduled for this month.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Visual Journey</h4>
            <h2 className="text-5xl font-black text-slate-900 italic uppercase">Photos Gallery</h2>
            <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full mt-6" />
          </div>

          {/* Event Filter for Gallery */}
          {events.length > 0 && gallery.some(item => item.eventId) && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button 
                onClick={() => setActiveGalleryEvent('all')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  activeGalleryEvent === 'all' ? "bg-slate-900 text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                )}
              >
                All Moments
              </button>
              {events.filter(e => gallery.some(item => item.eventId === e.id)).map(event => (
                <button 
                  key={event.id}
                  onClick={() => setActiveGalleryEvent(event.id)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    activeGalleryEvent === event.id ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  )}
                >
                  {event.title}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gallery.length > 0 ? gallery
              .filter(item => activeGalleryEvent === 'all' || item.eventId === activeGalleryEvent)
              .map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 1 : -1 }}
                viewport={{ once: true }}
                className={cn(
                  "group relative aspect-square rounded-[2rem] overflow-hidden border border-slate-100 shadow-lg cursor-pointer bg-slate-50",
                  (i % 5 === 0) ? "md:row-span-2 md:aspect-auto" : ""
                )}
              >
                <img src={item.url} alt={item.description || "Gallery"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                
                {item.eventId && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[8px] font-black uppercase tracking-widest rounded-full shadow-sm">
                      {events.find(e => e.id === item.eventId)?.title || 'Event'}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <p className="text-white text-xs font-bold leading-tight line-clamp-2">{item.description || 'School Activity'}</p>
                </div>
              </motion.div>
            )) : [
              "https://images.unsplash.com/photo-1577891729319-f4871de65df2?q=80&w=2070&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1544391682-17ef1af356b4?q=80&w=2070&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2070&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1972&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
            ].map((img, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                className={cn(
                  "aspect-square rounded-[2rem] overflow-hidden border border-slate-100 shadow-lg cursor-pointer",
                  i === 1 || i === 6 ? "md:row-span-2 md:aspect-auto" : ""
                )}
              >
                <img src={img} alt="Gallery Placeholder" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm">
                <img src={branding.logoUrl || "https://psisvh.vercel.app/logo.png"} alt="School Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-black text-white text-xl tracking-tight italic uppercase">{branding.schoolName}</span>
            </div>
            <p className="text-slate-400 font-bold leading-relaxed max-w-sm">
              {branding.heroSubtitle.substring(0, 200)}...
            </p>
          </div>
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Contact Us</h5>
            <ul className="space-y-4 text-sm font-bold text-slate-300">
              <li>{branding.contactPhone}</li>
              <li>{branding.contactEmail}</li>
              <li>{branding.address}</li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Quick Links</h5>
            <ul className="space-y-4 text-sm font-bold text-slate-300">
              <li>Admission Process</li>
              <li>Academic Calendar</li>
              <li>Student Life</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase italic tracking-widest">© 2025 Paññāsāstra International School - Van Hong (PSIS VH). All Rights Reserved.</p>
          <div className="flex gap-6 text-slate-500">
            <Globe size={18} className="hover:text-white transition-colors cursor-pointer" />
            <MessageSquare size={18} className="hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}

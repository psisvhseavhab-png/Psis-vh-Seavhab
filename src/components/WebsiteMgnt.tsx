import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  Globe, 
  Briefcase, 
  Calendar, 
  Newspaper, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle2, 
  Clock, 
  MapPin, 
  Tag, 
  Image as ImageIcon,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  Upload,
  Loader2,
  X,
  Save
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { JobHiring, WebsiteEvent, NewsPost } from '@/src/types';
import { websiteService, GalleryItem } from '../services/websiteService';
import { brandingService, BrandingSettings } from '../services/brandingService';
import { applyWatermark } from '../lib/watermark';

const mockJobs: JobHiring[] = [
  { 
    id: '1', 
    title: 'Secondary Mathematics Teacher', 
    department: 'Academic', 
    location: 'Sen Sok Campus', 
    jobType: 'Full-time', 
    description: 'Looking for an experienced educator...', 
    requirements: ['Bachelor of Education', '3+ years experience'], 
    status: 'Published', 
    deadline: '2024-06-30', 
    postedAt: '2024-05-01' 
  },
  { 
    id: '2', 
    title: 'Admission Officer', 
    department: 'Administration', 
    location: 'Main Campus', 
    jobType: 'Full-time', 
    description: 'Passionate about helping families...', 
    requirements: ['Great communication', 'Fluent in English'], 
    status: 'Draft', 
    deadline: '2024-06-15', 
    postedAt: '2024-05-05' 
  },
];

const mockEvents: WebsiteEvent[] = [
  { 
    id: '1', 
    title: 'Annual Sports Day 2024', 
    date: '2024-05-20', 
    startTime: '08:00', 
    endTime: '16:00',
    location: 'School Stadium', 
    description: 'Our annual celebration of fitness...', 
    category: 'Sports', 
    status: 'Upcoming' 
  },
  { 
    id: '2', 
    title: 'Parent-Teacher Conference', 
    date: '2024-05-12', 
    startTime: '14:00', 
    endTime: '17:00',
    location: 'Conference Hall', 
    description: 'Individual progress review...', 
    category: 'Academic', 
    status: 'Upcoming' 
  },
];

const mockNews: NewsPost[] = [
  { 
    id: '1', 
    title: 'PSIS Students Win Gold at Regional Science Fair', 
    summary: 'A team of grade 10 students developed...', 
    content: 'Full story about the science fair...', 
    category: 'Achievement', 
    author: 'Marketing Dept', 
    status: 'Published', 
    publishedAt: '2024-05-03' 
  },
];

export function WebsiteMgnt() {
  const [activeTab, setActiveTab] = useState<'branding' | 'jobs' | 'events' | 'news' | 'gallery'>('branding');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [events, setEvents] = useState<WebsiteEvent[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [branding, setBranding] = useState<BrandingSettings>({
    schoolName: '',
    heroTitle: '',
    heroSubtitle: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubEvents = websiteService.subscribeToEvents(setEvents);
    const unsubNews = websiteService.subscribeToNews(setNews);
    const unsubBranding = brandingService.subscribeToBranding(setBranding);
    
    websiteService.getGallery().then(setGallery);
    setIsLoading(false);

    return () => {
      unsubEvents();
      unsubNews();
      unsubBranding();
    };
  }, []);
  
  // News filtering/sorting state
  const [newsSortBy, setNewsSortBy] = useState<'date' | 'category'>('date');
  const [newsSortDir, setNewsSortDir] = useState<'asc' | 'desc'>('desc');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>('All');
  
  // Gallery state
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'public' | 'private'>('all');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('All');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [galleryForm, setGalleryForm] = useState({
    description: '',
    eventId: '',
    category: 'General',
    isPublic: true
  });

  const filteredGallery = useMemo(() => {
    let result = [...gallery];
    if (galleryFilter === 'public') result = result.filter(item => item.isPublic);
    if (galleryFilter === 'private') result = result.filter(item => !item.isPublic);
    if (galleryCategoryFilter !== 'All') result = result.filter(item => item.category === galleryCategoryFilter);
    if (gallerySearch) {
      const q = gallerySearch.toLowerCase();
      result = result.filter(item => 
        item.description?.toLowerCase().includes(q) || 
        item.category?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [gallery, galleryFilter, galleryCategoryFilter, gallerySearch]);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGallery(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawUrl = event.target?.result as string;
        
        // Apply watermark
        const watermarkedUrl = await applyWatermark(rawUrl);
        
        // Auto-associate with event if selected
        let finalCategory = galleryForm.category;
        if (galleryForm.eventId) {
          finalCategory = 'Event';
        } else if (!finalCategory) {
          finalCategory = 'General';
        }
        
        await websiteService.addGalleryItem({
          url: watermarkedUrl,
          description: galleryForm.description,
          eventId: galleryForm.eventId,
          category: finalCategory,
          isPublic: galleryForm.isPublic,
          createdAt: new Date().toISOString()
        });
        
        const updated = await websiteService.getGallery();
        setGallery(updated);
        setIsAddingMode(false);
        setGalleryForm({ description: '', eventId: '', category: 'General', isPublic: true });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Gallery upload error:", error);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const toggleGalleryItemStatus = async (item: GalleryItem) => {
    if (!item.id) return;
    try {
      await websiteService.updateGalleryItem(item.id, { isPublic: !item.isPublic });
      const updated = await websiteService.getGallery();
      setGallery(updated);
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const updateGalleryItemField = async (id: string, field: keyof GalleryItem, value: any) => {
    try {
      await websiteService.updateGalleryItem(id, { [field]: value });
      const updated = await websiteService.getGallery();
      setGallery(updated);
    } catch (error) {
      console.error(`Error updating gallery item ${field}:`, error);
    }
  };
  
  // Event search state
  const [eventSearch, setEventSearch] = useState('');
  
  // Common search (if used globally)
  const [globalSearch, setGlobalSearch] = useState('');

  const [uploadingEventId, setUploadingEventId] = useState<string | null>(null);
  const eventFileInputRef = useRef<HTMLInputElement>(null);

  // Form state for creating/editing
  const [eventForm, setEventForm] = useState<Partial<WebsiteEvent>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    location: '',
    description: '',
    category: 'Academic',
    status: 'Upcoming'
  });

  const [newsForm, setNewsForm] = useState<Partial<NewsPost>>({
    title: '',
    summary: '',
    content: '',
    category: 'Achievement',
    author: 'Marketing Dept'
  });

  const sortedNews = useMemo(() => {
    let filtered = [...news];
    if (newsCategoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === newsCategoryFilter);
    }
    
    return filtered.sort((a, b) => {
      if (newsSortBy === 'date') {
        const dateA = new Date(a.publishedAt || '').getTime();
        const dateB = new Date(b.publishedAt || '').getTime();
        return newsSortDir === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        const catA = a.category.toLowerCase();
        const catB = b.category.toLowerCase();
        if (catA < catB) return newsSortDir === 'asc' ? -1 : 1;
        if (catA > catB) return newsSortDir === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [news, newsSortBy, newsSortDir, newsCategoryFilter]);

  const filteredEvents = useMemo(() => {
    if (!eventSearch) return events;
    const query = eventSearch.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(query) || 
      e.location.toLowerCase().includes(query) ||
      e.date.includes(query)
    );
  }, [events, eventSearch]);

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, eventId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEventId(eventId);
    // Simulating upload with a local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setEvents(prev => prev.map(ev => 
        ev.id === eventId ? { ...ev, image: result } : ev
      ));
      setUploadingEventId(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Website Control Panel</h2>
          <p className="text-slate-500 font-medium">Manage public-facing content, announcements, and career opportunities.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-2xl">
          {(['branding', 'news', 'events', 'jobs', 'gallery'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsAddingMode(false);
              }}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === tab 
                  ? "bg-white text-blue-600 shadow-lg shadow-blue-500/5 translate-y-[-1px]" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Statistics Bar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Public Status</h3>
              <div className="flex items-center gap-2 text-emerald-500">
                <Globe size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Live: {branding.schoolName.toLowerCase().replace(/\s+/g, '-')}.edu</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Briefcase size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Open Vacancies</span>
                </div>
                <span className="text-sm font-black text-slate-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Calendar size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Upcoming Events</span>
                </div>
                <span className="text-sm font-black text-slate-900">4</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                    <ImageIcon size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">Gallery Items</span>
                </div>
                <span className="text-sm font-black text-slate-900">{gallery.length}</span>
              </div>
            </div>

            <button 
              onClick={() => setIsAddingMode(true)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
              <Plus size={16} /> Create New {activeTab === 'gallery' ? 'Image' : activeTab.slice(0, -1)}
            </button>
          </div>

          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <h4 className="text-lg font-black tracking-tight relative z-10">SEO Analytics</h4>
            <p className="text-blue-100 text-xs leading-relaxed relative z-10">Last month your school website appeared in 12,400 search results.</p>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors relative z-10">
              View Detailed Report <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
                  {activeTab === 'jobs' && <Briefcase size={20} />}
                  {activeTab === 'events' && <Calendar size={20} />}
                  {activeTab === 'news' && <Newspaper size={20} />}
                  {activeTab === 'gallery' && <ImageIcon size={20} />}
                  {activeTab === 'branding' && <Globe size={20} />}
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight capitalize">{activeTab} Management</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     {activeTab === 'branding' ? 'Update global site identity' : `Showing all ${activeTab} currently in queue`}
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={activeTab === 'events' ? eventSearch : activeTab === 'gallery' ? gallerySearch : globalSearch}
                    onChange={(e) => {
                      if (activeTab === 'events') setEventSearch(e.target.value);
                      else if (activeTab === 'gallery') setGallerySearch(e.target.value);
                      else setGlobalSearch(e.target.value);
                    }}
                    placeholder={`Search ${activeTab}...`} 
                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 w-full md:w-64 transition-all" 
                  />
                </div>
                {activeTab === 'gallery' && (
                  <div className="flex items-center gap-2">
                    <select 
                      value={galleryCategoryFilter}
                      onChange={(e) => setGalleryCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-600"
                    >
                      <option value="All">All Categories</option>
                      <option value="General">General</option>
                      <option value="Campus">Campus</option>
                      <option value="Classroom">Classroom</option>
                      <option value="Event">Event Highlights</option>
                      <option value="Awards">Awards</option>
                    </select>
                    <select 
                      value={galleryFilter}
                      onChange={(e) => setGalleryFilter(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-600"
                    >
                      <option value="all">All Visibility</option>
                      <option value="public">Published</option>
                      <option value="private">Hidden</option>
                    </select>
                  </div>
                )}
                {activeTab === 'news' && (
                  <div className="flex items-center gap-2">
                    <select 
                      value={newsCategoryFilter}
                      onChange={(e) => setNewsCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-600"
                    >
                      <option value="All">All Categories</option>
                      <option value="Achievement">Achievement</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Student Life">Student Life</option>
                    </select>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                      <button 
                        onClick={() => {
                          if (newsSortBy === 'date') setNewsSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
                          else setNewsSortBy('date');
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          newsSortBy === 'date' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        Date {newsSortBy === 'date' && (newsSortDir === 'desc' ? '↓' : '↑')}
                      </button>
                      <button 
                        onClick={() => {
                          if (newsSortBy === 'category') setNewsSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
                          else setNewsSortBy('category');
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          newsSortBy === 'category' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        Category {newsSortBy === 'category' && (newsSortDir === 'desc' ? '↓' : '↑')}
                      </button>
                    </div>
                  </div>
                )}
                <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'jobs' && (
                  <motion.div 
                    key="jobs-table"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {mockJobs.map(job => (
                      <div key={job.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            job.status === 'Published' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          )}>
                            <Briefcase size={24} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-900 tracking-tight">{job.title}</h4>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                <MapPin size={10} /> {job.location}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                <Clock size={10} /> {job.jobType}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="text-center hidden md:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                            <p className="text-xs font-bold text-slate-700">{job.deadline}</p>
                          </div>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                            job.status === 'Published' ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                          )}>
                            {job.status}
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'events' && !isAddingMode && (
                  <motion.div 
                    key="events-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <input 
                      type="file" 
                      ref={eventFileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        const eventId = eventFileInputRef.current?.getAttribute('data-event-id');
                        if (eventId) handleEventImageUpload(e, eventId);
                      }} 
                    />
                    <div className="grid grid-cols-1 gap-4">
                      {filteredEvents.map(event => (
                        <div key={event.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden relative shrink-0">
                               {event.image ? (
                                 <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Calendar size={24} />
                                 </div>
                               )}
                               <button 
                                 onClick={() => {
                                   eventFileInputRef.current?.setAttribute('data-event-id', event.id);
                                   eventFileInputRef.current?.click();
                                 }}
                                 className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                               >
                                 <Upload size={14} />
                               </button>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-slate-900 tracking-tight">{event.title}</h4>
                              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                                <span className={cn(
                                   "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                                   event.category === 'Academic' ? "bg-blue-100 text-blue-600" :
                                   event.category === 'Sports' ? "bg-emerald-100 text-emerald-600" : "bg-purple-100 text-purple-600"
                                )}>
                                   {event.category}
                                </span>
                                <div className="space-y-0.5">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Schedule</p>
                                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase">
                                    <Clock size={10} className="text-amber-500" /> {event.date} • {event.startTime} - {event.endTime}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="text-center hidden md:block">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                                <MapPin size={10} className="text-amber-500" /> {event.location}
                              </div>
                            </div>
                            <div className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                              "bg-amber-100 text-amber-600"
                            )}>
                              {event.status}
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                              <button onClick={() => websiteService.deleteEvent(event.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'events' && isAddingMode && (
                  <motion.div 
                    key="events-form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Title</label>
                             <input 
                               type="text" 
                               value={eventForm.title}
                               onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                               className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" 
                               placeholder="Name of the event..."
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Image</label>
                             <div 
                               onClick={() => eventFileInputRef.current?.click()}
                               className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden group"
                             >
                               {eventForm.image ? (
                                 <img src={eventForm.image} alt="Preview" className="w-full h-full object-cover" />
                               ) : (
                                 <>
                                   <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-blue-600 transition-colors">
                                     <Upload size={20} />
                                   </div>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to upload image</span>
                                 </>
                               )}
                             </div>
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                          <select 
                            value={eventForm.category}
                            onChange={(e) => setEventForm(prev => ({ ...prev, category: e.target.value as any }))}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600"
                          >
                            <option value="Academic">Academic</option>
                            <option value="Sports">Sports</option>
                            <option value="Culture">Culture</option>
                            <option value="Holiday">Holiday</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                          <input 
                            type="date" 
                            value={eventForm.date}
                            onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" 
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                            <input 
                              type="time" 
                              value={eventForm.startTime}
                              onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" 
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                            <input 
                              type="time" 
                              value={eventForm.endTime}
                              onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" 
                            />
                         </div>
                       </div>
                       <div className="space-y-2 col-span-full">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                          <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              value={eventForm.location}
                              onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" 
                              placeholder="Where is the event happening?"
                            />
                          </div>
                       </div>
                    </div>
                  </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                       <textarea 
                         value={eventForm.description}
                         onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold h-32" 
                         placeholder="Details about the event..."
                       />
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-10">
                       <button 
                         onClick={() => setIsAddingMode(false)}
                         className="px-8 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                       >
                         Cancel
                       </button>
                       <button 
                         onClick={async () => {
                           const newEvent: Omit<WebsiteEvent, 'id'> = {
                             title: eventForm.title || '',
                             date: eventForm.date || '',
                             startTime: eventForm.startTime || '',
                             endTime: eventForm.endTime || '',
                             location: eventForm.location || '',
                             description: eventForm.description || '',
                             category: eventForm.category as any || 'Academic',
                             image: eventForm.image,
                             status: 'Upcoming'
                           };
                           await websiteService.addEvent(newEvent);
                           setIsAddingMode(false);
                           setEventForm({ title: '', date: '', startTime: '08:00', endTime: '09:00', location: '', description: '', category: 'Academic', status: 'Upcoming', image: undefined });
                         } }
                         className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                       >
                         Create Event
                       </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'news' && !isAddingMode && (
                  <motion.div 
                    key="news-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                   >
                    {sortedNews.map(post => (
                      <div key={post.id} className="flex gap-8 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all group">
                         <div className="w-40 h-40 bg-slate-200 rounded-3xl overflow-hidden relative shrink-0">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                               <ImageIcon size={32} />
                            </div>
                            <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-black uppercase tracking-tighter">
                               {post.category}
                            </div>
                         </div>

                         <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between">
                               <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-purple-600 transition-colors">{post.title}</h4>
                               <div className="flex gap-1 shrink-0">
                                  <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm"><Edit2 size={16} /></button>
                                  <button onClick={() => websiteService.deleteNews(post.id)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-rose-600 shadow-sm"><Trash2 size={16} /></button>
                               </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{post.summary}</p>
                            
                            <div className="flex items-center justify-between pt-4">
                               <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">{post.author}</span>
                                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">{post.publishedAt}</span>
                               </div>
                               <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                                  Read Content <ChevronRight size={14} />
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'news' && isAddingMode && (
                  <motion.div 
                    key="news-form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">News Title</label>
                          <input 
                            type="text" 
                            value={newsForm.title}
                            onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold" 
                            placeholder="Headline of the story..."
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                          <select 
                            value={newsForm.category}
                            onChange={(e) => setNewsForm(prev => ({ ...prev, category: e.target.value as any }))}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-600"
                          >
                            <option value="Achievement">Achievement</option>
                            <option value="Announcement">Announcement</option>
                            <option value="Student Life">Student Life</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary</label>
                       <textarea 
                         value={newsForm.summary}
                         onChange={(e) => setNewsForm(prev => ({ ...prev, summary: e.target.value }))}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold h-24" 
                         placeholder="Brief excerpt for index pages..."
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Content (Rich Text Editor)</label>
                       <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col min-h-[400px]">
                         <ReactQuill 
                           theme="snow" 
                           value={newsForm.content} 
                           onChange={(content) => setNewsForm(prev => ({ ...prev, content }))}
                           className="flex-1 ql-editor-dynamic"
                         />
                       </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-10">
                       <button 
                         onClick={() => setIsAddingMode(false)}
                         className="px-8 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                       >
                         Cancel
                       </button>
                       <button 
                         onClick={() => {
                           const newPost: Omit<NewsPost, 'id'> = {
                             title: newsForm.title || '',
                             summary: newsForm.summary || '',
                             content: newsForm.content || '',
                             category: newsForm.category as any || 'Achievement',
                             author: newsForm.author || 'Marketing Dept',
                             status: 'Published',
                             publishedAt: new Date().toISOString().split('T')[0]
                           };
                           websiteService.addNews(newPost);
                           setIsAddingMode(false);
                           setNewsForm({ title: '', summary: '', content: '', category: 'Achievement', author: 'Marketing Dept' });
                         } }
                         className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
                       >
                         Publish Story
                       </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'gallery' && !isAddingMode && (
                  <motion.div 
                    key="gallery-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {filteredGallery.map(item => (
                        <div key={item.id} className="group relative aspect-square rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                          <img src={item.url} alt="Gallery item" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          
                          {/* Visibility Badge */}
                          <div className={cn(
                            "absolute top-3 left-3 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg",
                            item.isPublic ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-200"
                          )}>
                            {item.isPublic ? <Eye size={10} /> : <EyeOff size={10} />}
                            {item.isPublic ? 'Public' : 'Hidden'}
                          </div>

                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 px-4 text-center">
                             {editingGalleryId === item.id ? (
                               <div className="bg-white p-4 rounded-2xl w-full space-y-3 shadow-2xl">
                                 <div className="space-y-1 text-left">
                                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                   <select 
                                     value={item.category || 'General'}
                                     onChange={(e) => updateGalleryItemField(item.id!, 'category', e.target.value)}
                                     className="w-full bg-slate-50 border border-slate-100 rounded-lg py-1 px-2 text-[10px] font-bold outline-none"
                                   >
                                     <option value="General">General</option>
                                     <option value="Campus">Campus</option>
                                     <option value="Classroom">Classroom</option>
                                     <option value="Event">Event Highlights</option>
                                     <option value="Awards">Awards</option>
                                   </select>
                                 </div>
                                 <div className="space-y-1 text-left">
                                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Linked Event</label>
                                   <select 
                                     value={item.eventId || ''}
                                     onChange={(e) => updateGalleryItemField(item.id!, 'eventId', e.target.value)}
                                     className="w-full bg-slate-50 border border-slate-100 rounded-lg py-1 px-2 text-[10px] font-bold outline-none"
                                   >
                                     <option value="">No Event</option>
                                     {events.map(ev => (
                                       <option key={ev.id} value={ev.id}>{ev.title}</option>
                                     ))}
                                   </select>
                                 </div>
                                 <button 
                                   onClick={() => setEditingGalleryId(null)}
                                   className="w-full py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                                 >
                                   Done
                                 </button>
                               </div>
                             ) : (
                               <>
                                 <div className="flex items-center gap-2">
                                   <button 
                                     onClick={() => setEditingGalleryId(item.id!)}
                                     className="p-3 bg-white rounded-xl text-slate-600 hover:text-blue-600 transition-all font-bold"
                                     title="Edit item"
                                   >
                                     <Edit2 size={18} />
                                   </button>
                                   <button 
                                     onClick={() => toggleGalleryItemStatus(item)}
                                     className="p-3 bg-white rounded-xl text-slate-600 hover:text-blue-600 transition-all font-bold"
                                     title="Toggle visibility"
                                   >
                                     {item.isPublic ? <EyeOff size={18} /> : <Eye size={18} />}
                                   </button>
                                   <button 
                                     onClick={() => item.id && websiteService.deleteGalleryItem(item.id).then(() => websiteService.getGallery().then(setGallery))} 
                                     className="p-3 bg-white rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
                                   >
                                      <Trash2 size={18} />
                                   </button>
                                 </div>
                                 {item.eventId && (
                                   <div className="px-3 py-1 bg-amber-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                                     <Calendar size={10} />
                                     {events.find(e => e.id === item.eventId)?.title || 'Linked Event'}
                                   </div>
                                 )}
                                 {item.category && (
                                   <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest mt-1">
                                     {item.category}
                                   </div>
                                 )}
                               </>
                             )}
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => setIsAddingMode(true)}
                        className="aspect-square border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center p-6 text-slate-300 hover:border-blue-200 hover:text-blue-400 transition-all group"
                      >
                        <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">Add Photo to Gallery</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'gallery' && isAddingMode && (
                  <motion.div 
                    key="gallery-upload-form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl mx-auto space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setIsAddingMode(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all">
                          <X size={20} />
                        </button>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Upload New Media</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                          <select 
                            value={galleryForm.category}
                            onChange={(e) => setGalleryForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-600"
                          >
                            <option value="General">General</option>
                            <option value="Campus">Campus</option>
                            <option value="Classroom">Classroom</option>
                            <option value="Event">Event Highlights</option>
                            <option value="Awards">Awards</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign to Event (Optional)</label>
                          <select 
                            value={galleryForm.eventId}
                            onChange={(e) => setGalleryForm(prev => ({ ...prev, eventId: e.target.value }))}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-600"
                          >
                            <option value="">No Specific Event</option>
                            {events.map(event => (
                              <option key={event.id} value={event.id}>{event.title}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Initial Visibility</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setGalleryForm(prev => ({ ...prev, isPublic: true }))}
                              className={cn(
                                "flex-1 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                galleryForm.isPublic ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white border-slate-200 text-slate-400"
                              )}
                            >
                              <Eye size={14} /> Public
                            </button>
                            <button 
                              onClick={() => setGalleryForm(prev => ({ ...prev, isPublic: false }))}
                              className={cn(
                                "flex-1 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                !galleryForm.isPublic ? "bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-800/20" : "bg-white border-slate-200 text-slate-400"
                              )}
                            >
                              <EyeOff size={14} /> Hidden
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <input 
                          type="text" 
                          value={galleryForm.description}
                          onChange={(e) => setGalleryForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                          placeholder="What is happening in this photo?"
                        />
                      </div>

                      <div className="relative group">
                        <input 
                          type="file" 
                          ref={galleryFileInputRef}
                          onChange={handleGalleryUpload}
                          className="hidden" 
                          accept="image/*"
                        />
                        <button 
                          disabled={isUploadingGallery}
                          onClick={() => galleryFileInputRef.current?.click()}
                          className="w-full aspect-[21/9] border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:border-blue-200 hover:bg-blue-50/50 transition-all group-hover:scale-[0.99]"
                        >
                          {isUploadingGallery ? (
                            <Loader2 size={40} className="animate-spin text-blue-500" />
                          ) : (
                            <>
                              <div className="p-5 bg-white rounded-3xl shadow-xl shadow-slate-200/50 text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                                <Upload size={32} />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Upload Photo</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Watermark will be applied automatically</p>
                              </div>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'branding' && (
                  <motion.div
                    key="branding-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4 col-span-full">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Identity & Logo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Name</label>
                            <input 
                              type="text" 
                              value={branding.schoolName}
                              onChange={e => setBranding(prev => ({ ...prev, schoolName: e.target.value }))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" 
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logo URL</label>
                             <input 
                               type="text" 
                               value={branding.logoUrl}
                               onChange={e => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                               placeholder="https://example.com/logo.png"
                               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" 
                             />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 col-span-full pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Hero Section Content</h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Headline (Hero Title)</label>
                             <textarea 
                               rows={2}
                               value={branding.heroTitle}
                               onChange={e => setBranding(prev => ({ ...prev, heroTitle: e.target.value }))}
                               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtitle / Description</label>
                             <textarea 
                               rows={3}
                               value={branding.heroSubtitle}
                               onChange={e => setBranding(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Banner Image URL</label>
                             <input 
                               type="text" 
                               value={branding.heroImageUrl}
                               onChange={e => setBranding(prev => ({ ...prev, heroImageUrl: e.target.value }))}
                               placeholder="High quality Unsplash or custom URL"
                               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" 
                             />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 col-span-full pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">Contact Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Phone</label>
                              <input 
                                type="text" 
                                value={branding.contactPhone}
                                onChange={e => setBranding(prev => ({ ...prev, contactPhone: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Email</label>
                              <input 
                                type="text" 
                                value={branding.contactEmail}
                                onChange={e => setBranding(prev => ({ ...prev, contactEmail: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" 
                              />
                           </div>
                           <div className="space-y-2 col-span-full">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Address</label>
                              <input 
                                type="text" 
                                value={branding.address}
                                onChange={e => setBranding(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700" 
                              />
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-10">
                      <button 
                        onClick={async () => {
                          setIsLoading(true);
                          await brandingService.updateBranding(branding);
                          setIsLoading(false);
                          alert('Branding settings pushed to host! The public website is now updated.');
                        }}
                        disabled={isLoading}
                        className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                      >
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save & Deploy to Host
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

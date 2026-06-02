import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  CreditCard, 
  UserPlus, 
  Upload, 
  Image as ImageIcon, 
  Tag, 
  Loader2,
  CheckCircle2,
  Info,
  Zap,
  BarChart2,
  Sparkles,
  Award,
  ChevronDown,
  RefreshCw,
  Cloud,
  MapPin,
  ExternalLink,
  Lock,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart as ReBarChart, 
  Bar, 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { cn } from '@/src/lib/utils';
import { websiteService } from '../services/websiteService';
import { studentService } from '../services/studentService';
import { WebsiteEvent } from '../types';
import { applyWatermark } from '../lib/watermark';
import { signInWithGoogleWorkspace, getGoogleAccessToken } from '../lib/googleAuth';
import { FullCalendarView } from './FullCalendarView';
import { StudentAttendanceScanner } from './StudentAttendanceScanner';

// Standardized academic year trend datasets
const academicYearData: Record<string, { month: string; enrolled: number; graduated: number }[]> = {
  '2025 - 2026': [
    { month: 'Sep', enrolled: 120, graduated: 0 },
    { month: 'Oct', enrolled: 95, graduated: 5 },
    { month: 'Nov', enrolled: 88, graduated: 0 },
    { month: 'Dec', enrolled: 110, graduated: 85 },
    { month: 'Jan', enrolled: 145, graduated: 10 },
    { month: 'Feb', enrolled: 130, graduated: 15 },
    { month: 'Mar', enrolled: 160, graduated: 0 },
    { month: 'Apr', enrolled: 175, graduated: 120 },
    { month: 'May', enrolled: 215, graduated: 35 },
    { month: 'Jun', enrolled: 150, graduated: 180 },
    { month: 'Jul', enrolled: 80, graduated: 40 },
    { month: 'Aug', enrolled: 65, graduated: 220 }
  ],
  '2024 - 2025': [
    { month: 'Sep', enrolled: 110, graduated: 0 },
    { month: 'Oct', enrolled: 85, graduated: 0 },
    { month: 'Nov', enrolled: 92, graduated: 12 },
    { month: 'Dec', enrolled: 105, graduated: 75 },
    { month: 'Jan', enrolled: 130, graduated: 8 },
    { month: 'Feb', enrolled: 115, graduated: 12 },
    { month: 'Mar', enrolled: 140, graduated: 2 },
    { month: 'Apr', enrolled: 155, graduated: 110 },
    { month: 'May', enrolled: 180, graduated: 20 },
    { month: 'Jun', enrolled: 135, graduated: 160 },
    { month: 'Jul', enrolled: 75, graduated: 30 },
    { month: 'Aug', enrolled: 60, graduated: 200 }
  ]
};

const attendancePerformanceData: Record<string, { month: string; attendance: number; performance: number }[]> = {
  '2025 - 2026': [
    { month: 'Sep', attendance: 91.5, performance: 72.4 },
    { month: 'Oct', attendance: 92.8, performance: 74.5 },
    { month: 'Nov', attendance: 93.4, performance: 76.8 },
    { month: 'Dec', attendance: 91.2, performance: 75.2 },
    { month: 'Jan', attendance: 94.6, performance: 79.5 },
    { month: 'Feb', attendance: 95.1, performance: 81.0 },
    { month: 'Mar', attendance: 95.8, performance: 83.4 },
    { month: 'Apr', attendance: 94.9, performance: 82.6 },
    { month: 'May', attendance: 96.4, performance: 86.8 },
    { month: 'Jun', attendance: 97.2, performance: 89.2 },
    { month: 'Jul', attendance: 95.5, performance: 88.0 },
    { month: 'Aug', attendance: 96.0, performance: 88.5 }
  ],
  '2024 - 2025': [
    { month: 'Sep', attendance: 89.2, performance: 68.5 },
    { month: 'Oct', attendance: 90.5, performance: 70.2 },
    { month: 'Nov', attendance: 91.0, performance: 71.4 },
    { month: 'Dec', attendance: 88.6, performance: 70.5 },
    { month: 'Jan', attendance: 92.4, performance: 74.8 },
    { month: 'Feb', attendance: 93.0, performance: 76.2 },
    { month: 'Mar', attendance: 93.5, performance: 78.0 },
    { month: 'Apr', attendance: 92.8, performance: 77.4 },
    { month: 'May', attendance: 94.2, performance: 81.5 },
    { month: 'Jun', attendance: 95.0, performance: 83.6 },
    { month: 'Jul', attendance: 93.8, performance: 82.0 },
    { month: 'Aug', attendance: 94.1, performance: 82.8 }
  ]
};

const AttendanceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[10px] font-bold text-slate-300 uppercase">{entry.name}:</span>
              <span className="text-xs font-black italic">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[10px] font-bold text-slate-300 uppercase">{entry.name}:</span>
              <span className="text-xs font-black italic">{entry.value} Students</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const stats = [
  { label: 'Total Students', value: '1,280', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Classes', value: '42', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Active Projects', value: '3', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Revenue (May)', value: '$12,450', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const weekdaysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weeksList = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);

const attendanceHeatmapData: Record<string, Record<string, { rate: number; absentees: string[]; cause: string }>> = {
  'Monday': {
    'Week 1': { rate: 98, absentees: ['Michael Brown'], cause: 'Late ferry boarding' },
    'Week 2': { rate: 96, absentees: ['David Lee'], cause: 'Overslept' },
    'Week 3': { rate: 97, absentees: ['John Smith'], cause: 'Dental visit' },
    'Week 4': { rate: 99, absentees: [], cause: '' },
    'Week 5': { rate: 96, absentees: ['Michael Brown'], cause: 'Family transit delayed' },
    'Week 6': { rate: 98, absentees: [], cause: '' },
    'Week 7': { rate: 95, absentees: ['David Lee', 'John Smith'], cause: 'Heavy rain flooding' },
    'Week 8': { rate: 87, absentees: ['David Lee', 'Michael Brown', 'John Smith'], cause: 'Viral flu outbreak' }, // Alert Pattern
    'Week 9': { rate: 98, absentees: [], cause: '' },
    'Week 10': { rate: 96, absentees: ['David Lee'], cause: 'Personal reason' },
    'Week 11': { rate: 98, absentees: [], cause: '' },
    'Week 12': { rate: 99, absentees: [], cause: '' },
  },
  'Tuesday': {
    'Week 1': { rate: 97, absentees: ['David Lee'], cause: 'Minor transport lag' },
    'Week 2': { rate: 98, absentees: [], cause: '' },
    'Week 3': { rate: 99, absentees: [], cause: '' },
    'Week 4': { rate: 96, absentees: ['Michael Brown'], cause: 'Medical checkup' },
    'Week 5': { rate: 98, absentees: [], cause: '' },
    'Week 6': { rate: 97, absentees: ['David Lee'], cause: 'Fever' },
    'Week 7': { rate: 98, absentees: [], cause: '' },
    'Week 8': { rate: 95, absentees: ['Michael Brown'], cause: 'Ferry delay' },
    'Week 9': { rate: 99, absentees: [], cause: '' },
    'Week 10': { rate: 97, absentees: ['John Smith'], cause: 'Sports event fatigue' },
    'Week 11': { rate: 98, absentees: [], cause: '' },
    'Week 12': { rate: 99, absentees: [], cause: '' },
  },
  'Wednesday': {
    'Week 1': { rate: 96, absentees: ['John Smith'], cause: 'Family trip' },
    'Week 2': { rate: 98, absentees: [], cause: '' },
    'Week 3': { rate: 95, absentees: ['David Lee'], cause: 'Cold symptoms' },
    'Week 4': { rate: 99, absentees: [], cause: '' },
    'Week 5': { rate: 97, absentees: ['Michael Brown'], cause: 'Dental care' },
    'Week 6': { rate: 82, absentees: ['David Lee', 'Michael Brown', 'Kevin White'], cause: 'Midterm project prep burnout' }, // Alert Pattern
    'Week 7': { rate: 98, absentees: [], cause: '' },
    'Week 8': { rate: 96, absentees: ['John Smith'], cause: 'Sore throat' },
    'Week 9': { rate: 99, absentees: [], cause: '' },
    'Week 10': { rate: 95, absentees: ['Michael Brown'], cause: 'Personal appointment' },
    'Week 11': { rate: 98, absentees: [], cause: '' },
    'Week 12': { rate: 97, absentees: ['David Lee'], cause: 'Transport issues' },
  },
  'Thursday': {
    'Week 1': { rate: 98, absentees: [], cause: '' },
    'Week 2': { rate: 97, absentees: ['Michael Brown'], cause: 'Overslept' },
    'Week 3': { rate: 99, absentees: [], cause: '' },
    'Week 4': { rate: 96, absentees: ['John Smith'], cause: 'Delayed travel' },
    'Week 5': { rate: 98, absentees: [], cause: '' },
    'Week 6': { rate: 97, absentees: ['David Lee'], cause: 'Doctor visit' },
    'Week 7': { rate: 99, absentees: [], cause: '' },
    'Week 8': { rate: 97, absentees: ['Michael Brown'], cause: 'Car breakdown' },
    'Week 9': { rate: 98, absentees: [], cause: '' },
    'Week 10': { rate: 99, absentees: [], cause: '' },
    'Week 11': { rate: 96, absentees: ['David Lee'], cause: 'Heavy traffic' },
    'Week 12': { rate: 98, absentees: [], cause: '' },
  },
  'Friday': {
    'Week 1': { rate: 94, absentees: ['David Lee', 'Michael Brown'], cause: 'Extended weekend travel' },
    'Week 2': { rate: 95, absentees: ['John Smith'], cause: 'Overslept' },
    'Week 3': { rate: 88, absentees: ['David Lee', 'John Smith', 'Michael Brown'], cause: 'Weekend trip early departure' }, // Alert Pattern
    'Week 4': { rate: 96, absentees: ['Michael Brown'], cause: 'Fever' },
    'Week 5': { rate: 94, absentees: ['David Lee', 'Kevin White'], cause: 'Early train connection' },
    'Week 6': { rate: 97, absentees: ['John Smith'], cause: 'Headache' },
    'Week 7': { rate: 95, absentees: ['Michael Brown'], cause: 'Family obligations' },
    'Week 8': { rate: 96, absentees: ['David Lee'], cause: 'Heavy rain' },
    'Week 9': { rate: 95, absentees: ['John Smith'], cause: 'Pre-holiday trip' },
    'Week 10': { rate: 84, absentees: ['David Lee', 'Michael Brown', 'John Smith', 'Kevin White'], cause: 'Inter-high sports day off-site' }, // Alert Pattern
    'Week 11': { rate: 94, absentees: ['David Lee', 'Michael Brown'], cause: 'Overslept' },
    'Week 12': { rate: 93, absentees: ['Michael Brown', 'John Smith'], cause: 'Early summer break trip' },
  }
};

export function Dashboard() {
  const [activeDashboardSubTab, setActiveDashboardSubTab] = useState<'analytics' | 'insights'>('analytics');
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ day: string; week: string } | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [generatingInsights, setGeneratingInsights] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string>('');

  const handleGenerateInsights = async () => {
    setGeneratingInsights(true);
    setInsightsError('');
    try {
      const resp = await fetch('/api/academic-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          term: 'Term 2',
          students: [
            {
              id: 'ST003',
              name: 'Michael Brown',
              grades: {
                'Term 1': { Mathematics: 72, Physics: 68, History: 85, English: 70, Biology: 75, 'Computer Science': 80 },
                'Term 2': { Mathematics: 50, Physics: 45, History: 62, English: 52, Biology: 55, 'Computer Science': 58 }
              }
            },
            {
              id: 'ST009',
              name: 'David Lee',
              grades: {
                'Term 1': { Mathematics: 60, Physics: 55, History: 62, English: 58, Biology: 65, 'Computer Science': 60 },
                'Term 2': { Mathematics: 45, Physics: 40, History: 48, English: 42, Biology: 50, 'Computer Science': 52 }
              }
            }
          ]
        })
      });
      const data = await resp.json();
      if (data.insights) {
        setAiInsights(data.insights);
      } else if (data.error) {
        setInsightsError(data.error);
      } else {
        setInsightsError('An unknown error occurred during Gemini processing.');
      }
    } catch (err: any) {
      console.error(err);
      setInsightsError('Failed to communicate with Academic Insights server.');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const [events, setEvents] = useState<WebsiteEvent[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [description, setDescription] = useState('');
  const [selectedYear, setSelectedYear] = useState<'2025 - 2026' | '2024 - 2025'>('2025 - 2026');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');

  // Real Student Data for Enrollment Counts by Class
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = studentService.subscribeToStudents((data) => {
      setStudentsData(data);
      setStudentsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const classCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    studentsData.forEach((s: any) => {
      const cls = s.class || 'Unknown';
      counts[cls] = (counts[cls] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([className, count]) => ({
        name: className,
        count: count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [studentsData]);

  // Google Calendar Master Schedule Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  // Synchronized May 2026 monthly metrics and 48H alert triggers
  const mayEvents = events.filter(ev => ev.date && ev.date.startsWith('2026-05'));
  const mayCounts = mayEvents.reduce((acc, ev) => {
    const cat = ev.category || 'Academic';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, { Academic: 0, Sports: 0, Culture: 0, Holiday: 0 } as Record<string, number>);

  const alerts48h = events.filter(ev => {
    return ev.date === '2026-05-21' || ev.date === '2026-05-22' || ev.date === '2026-05-23';
  });

  const handleReschedule = async (eventId: string, targetDateStr: string) => {
    const dragEvent = events.find(ev => ev.id === eventId);
    if (!dragEvent) return;

    if (dragEvent.date === targetDateStr) return;

    const confirmed = window.confirm(
      `Master Schedule Event Update:\n\n` +
      `Are you sure you want to change the date of "${dragEvent.title}" from ${dragEvent.date} to ${targetDateStr}? This updates the central school master records.`
    );
    if (!confirmed) return;

    try {
      setSyncStatus('idle');
      setSyncMessage('Updating central record...');

      // 1. Update the local Firestore database
      await websiteService.updateEvent(eventId, { date: targetDateStr });

      // 2. If it was synced from Google, update Google Calendar remotely
      const activeToken = getGoogleAccessToken();
      if (dragEvent.syncedFromGoogle && (dragEvent as any).googleEventId && activeToken) {
        setSyncMessage('Syncing schedule modification to Google Calendar...');
        
        const startVal = dragEvent.startTime || 'All Day';
        const endVal = dragEvent.endTime || 'All Day';
        const isAllDay = startVal === 'All Day';

        let startBody: any = {};
        let endBody: any = {};

        if (isAllDay) {
          startBody = { date: targetDateStr };
          endBody = { date: targetDateStr };
        } else {
          const parseTimeToISO = (dateStr: string, timeStr: string) => {
            const cleanTime = timeStr.trim();
            const spaceIdx = cleanTime.lastIndexOf(' ');
            if (spaceIdx === -1) return `${dateStr}T12:00:00`;
            const time = cleanTime.substring(0, spaceIdx);
            const modifier = cleanTime.substring(spaceIdx + 1).toUpperCase();
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${dateStr}T${pad(hours)}:${pad(minutes || 0)}:00`;
          };

          try {
            const startISO = parseTimeToISO(targetDateStr, startVal);
            const endISO = parseTimeToISO(targetDateStr, endVal);
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            startBody = { dateTime: startISO, timeZone: tz };
            endBody = { dateTime: endISO, timeZone: tz };
          } catch (e) {
             console.error("Error formatting time parameters:", e);
             startBody = { date: targetDateStr };
             endBody = { date: targetDateStr };
          }
        }

        const gRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${(dragEvent as any).googleEventId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            start: startBody,
            end: endBody
          })
        });

        if (!gRes.ok) {
          const errData = await gRes.json().catch(() => ({}));
          console.error("Google Calendar PATCH failed:", errData);
          setSyncStatus('error');
          setSyncMessage(`Updated locally, but Google Calendar failed: ${errData.error?.message || 'Unauthorized'}`);
        } else {
          setSyncStatus('success');
          setSyncMessage('Rescheduled locally and updated on Google Calendar successfully!');
        }
      } else {
        setSyncStatus('success');
        setSyncMessage('Rescheduled locally in central database.');
      }

      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 5000);

    } catch (err: any) {
      console.error('Rescheduling handler error:', err);
      setSyncStatus('error');
      setSyncMessage(err.message || 'Operation failed.');
    }
  };

  // Subscribe to real-time additions of school master schedule / website events
  useEffect(() => {
    const unsubscribe = websiteService.subscribeToEvents(setEvents);
    return () => unsubscribe();
  }, []);

  const handleGoogleCalendarSync = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('');

    try {
      let activeToken = getGoogleAccessToken();
      if (!activeToken) {
        setSyncMessage('Authorizing with Google Workspace...');
        const authResult = await signInWithGoogleWorkspace();
        if (!authResult) {
          throw new Error('Google Workspace OAuth failed or was cancelled.');
        }
        activeToken = authResult.accessToken;
      }

      const confirmed = window.confirm(
        "Authorize Master Schedule Sync:\n\n" +
        "Are you sure you want to pull school events from your primary Google Calendar and sync them with the school's central database? This will update the main dashboard for all students, parents, and teachers."
      );
      if (!confirmed) {
        setIsSyncing(false);
        return;
      }

      setSyncMessage('Fetching Google Calendar events...');
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=20&orderBy=startTime&singleEvents=true', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });

      if (res.status === 401) {
        sessionStorage.removeItem('google_ws_access_token');
        throw new Error('Workspace session expired. Please re-authenticate and try again.');
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Failed connecting to Google Calendar API.');
      }

      const data = await res.json();
      const googleEvents = data.items || [];

      if (googleEvents.length === 0) {
        setSyncStatus('success');
        setSyncMessage('Sync finished: No upcoming events found on Google Calendar.');
        setIsSyncing(false);
        return;
      }

      setSyncMessage(`Writing ${googleEvents.length} events to Firestore...`);
      let addCount = 0;
      let updateCount = 0;

      for (const gEvent of googleEvents) {
        const startVal = gEvent.start?.dateTime || gEvent.start?.date || '';
        const endVal = gEvent.end?.dateTime || gEvent.end?.date || '';
        
        const dateStr = startVal ? startVal.split('T')[0] : new Date().toISOString().split('T')[0];
        
        const formatTime = (isoStr: string) => {
          if (!isoStr || !isoStr.includes('T')) return 'All Day';
          try {
            return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch {
            return 'All Day';
          }
        };

        const startTime = formatTime(startVal);
        const endTime = formatTime(endVal);

        let category: 'Academic' | 'Sports' | 'Culture' | 'Holiday' = 'Academic';
        const titleLower = (gEvent.summary || '').toLowerCase();
        if (titleLower.includes('sport') || titleLower.includes('match') || titleLower.includes('game') || titleLower.includes('run')) {
          category = 'Sports';
        } else if (titleLower.includes('holiday') || titleLower.includes('break') || titleLower.includes('vacation') || titleLower.includes('closed') || titleLower.includes('festival')) {
          category = 'Holiday';
        } else if (titleLower.includes('art') || titleLower.includes('music') || titleLower.includes('concert') || titleLower.includes('exhibition') || titleLower.includes('festival')) {
          category = 'Culture';
        }

        const eventPayload: any = {
          title: gEvent.summary || 'Google Calendar Event',
          description: gEvent.description || 'Synced automatically from the central Google Calendar API.',
          date: dateStr,
          startTime: startTime,
          endTime: endTime,
          location: gEvent.location || 'Main Campus',
          category: category,
          status: 'Upcoming',
          syncedFromGoogle: true,
          googleEventId: gEvent.id
        };

        const duplicate = events.find(e => 
          ((e as any).googleEventId && (e as any).googleEventId === gEvent.id) || 
          (e.title === eventPayload.title && e.date === eventPayload.date)
        );

        if (duplicate) {
          await websiteService.updateEvent(duplicate.id, eventPayload);
          updateCount++;
        } else {
          await websiteService.addEvent(eventPayload);
          addCount++;
        }
      }

      setSyncStatus('success');
      setSyncMessage(`Central Schedule Updated! Saved ${addCount} new events, refreshed ${updateCount} existing entries.`);
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 6000);

    } catch (err: any) {
      console.error('Master schedule sync error:', err);
      setSyncStatus('error');
      setSyncMessage(err.message || 'Synchronization exception. Check credentials.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    let count = 0;
    try {
      for (const file of files) {
        const reader = new FileReader();
        const promise = new Promise<void>((resolve, reject) => {
          reader.onload = async (event) => {
            try {
              const rawUrl = event.target?.result as string;
              const watermarkedUrl = await applyWatermark(rawUrl);
              
              await websiteService.addGalleryItem({
                url: watermarkedUrl,
                description: description || 'New activity upload',
                eventId: selectedEventId || undefined,
                isPublic: false,
                createdAt: new Date().toISOString(),
                authorName: 'Teacher'
              });
              count++;
              resolve();
            } catch (err) { reject(err); }
          };
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file as any);
        });
        await promise;
      }
      
      setUploadStatus('success');
      setDescription('');
      setSelectedEventId('');
      setTimeout(() => setUploadStatus('idle'), 3000);
      alert(`${count} photos watermarked and sent for review!`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading some files.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (showFullCalendar) {
    return (
      <FullCalendarView
        events={events}
        onClose={() => setShowFullCalendar(false)}
        onReschedule={handleReschedule}
        isSyncing={isSyncing}
        syncMessage={syncMessage}
        handleGoogleCalendarSync={handleGoogleCalendarSync}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">EduPulse Dashboard</h1>
          <p className="text-slate-500 text-xs font-sans">Welcome back, school administrators</p>
        </div>
        
        {/* Dashboard Sub-Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveDashboardSubTab('analytics')}
            className={cn(
              "px-4 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all",
              activeDashboardSubTab === 'analytics'
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveDashboardSubTab('insights')}
            className={cn(
              "px-4 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center gap-1.5",
              activeDashboardSubTab === 'insights'
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 animate-fade-in"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Sparkles size={11} className={cn(activeDashboardSubTab === 'insights' && "animate-pulse")} />
            AI Academic Insights
          </button>
        </div>
      </div>

      {activeDashboardSubTab === 'insights' ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="text-indigo-600 animate-pulse animate-bounce duration-[1500]" size={22} />
                Gemini AI Academic Insights & Interventions
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Using Google Gemini 3.5-Flash to analyze current Gradebook levels and suggest structured interventions for struggling students.
              </p>
            </div>
            
            <button
              onClick={handleGenerateInsights}
              disabled={generatingInsights}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/10 transition-all cursor-pointer"
            >
              {generatingInsights ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing Gradebook...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate AI Interventions
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            <div className="lg:col-span-1 space-y-6">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Students Flagged in Term 2</h3>
              <div className="space-y-4">
                {[
                  { id: 'ST003', name: 'Michael Brown', drop: '24%', avatar: 'MB', current: '54.5%', previous: '75.0%', alert: 'In Danger' },
                  { id: 'ST009', name: 'David Lee', drop: '23.3%', avatar: 'DL', current: '46.0%', previous: '60.0%', alert: 'Critical Risk' }
                ].map((student) => (
                  <div key={student.id} className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100/60 flex items-start gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 font-black text-xs flex items-center justify-center">
                      {student.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate">{student.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.id}</span>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-sans">
                        <div>
                          <span className="text-slate-400 block text-[9px] font-bold uppercase">Term 1 Avg</span>
                          <span className="font-bold text-slate-600">{student.previous}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] font-bold uppercase">Term 2 Avg</span>
                          <span className="font-bold text-rose-600">{student.current}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[8px] font-black uppercase tracking-wider animate-pulse whitespace-nowrap">
                      -{student.drop}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 font-sans">
                <h4 className="text-xs font-bold text-slate-700 mb-2">How it works:</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The Academic Insights engine automatically scans absolute term grades and extracts scores that drop by 10% or more. The data is analyzed by the Gemini LLM with context on Cambodian system parameters to draft custom action lists.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-50 rounded-3xl border border-slate-200/60 p-6 md:p-8 min-h-[400px] flex flex-col justify-between">
              {generatingInsights ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <Loader2 className="text-indigo-600 animate-spin mb-4" size={36} />
                  <h4 className="font-bold text-slate-800 text-sm">Gemini is compiling intervention models...</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1 font-sans">Cross-referencing Gradebook drops with academic counseling strategies</p>
                </div>
              ) : aiInsights ? (
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#2563eb] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full font-sans">Report Compiled</span>
                    <button
                       onClick={() => { navigator.clipboard.writeText(aiInsights); alert('AI Insights report copied!'); }}
                       className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
                    >
                       Copy Text Report
                    </button>
                  </div>
                  {/* Markdown Content container */}
                  <div className="prose prose-slate max-w-none text-left text-sm text-slate-650 leading-relaxed font-sans space-y-4">
                     {aiInsights.split('\n').map((line, idx) => {
                       if (line.startsWith('### ')) {
                         return <h3 key={idx} className="text-base font-black text-slate-900 mt-6 mb-2 tracking-tight">{line.replace('### ', '')}</h3>;
                       }
                       if (line.startsWith('## ')) {
                         return <h2 key={idx} className="text-lg font-black text-indigo-700 mt-6 mb-3 tracking-tight border-b border-indigo-100 pb-1">{line.replace('## ', '')}</h2>;
                       }
                       if (line.startsWith('# ')) {
                         return <h1 key={idx} className="text-xl font-black text-slate-900 mt-6 mb-4 tracking-tight">{line.replace('# ', '')}</h1>;
                       }
                       if (line.startsWith('- ') || line.startsWith('* ')) {
                         return <li key={idx} className="list-disc ml-4 my-1.5 text-slate-650">{line.substring(2)}</li>;
                       }
                       if (line.trim() === '') return <div key={idx} className="h-2" />;
                       return <p key={idx} className="text-slate-650">{line}</p>;
                     })}
                  </div>
                </div>
              ) : insightsError ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
                  <AlertCircle className="text-rose-500 mb-4" size={36} />
                  <h4 className="font-bold text-slate-800 text-sm">Insights Unavailable</h4>
                  <p className="text-xs text-rose-600 max-w-md mt-1 font-sans">{insightsError}</p>
                  <button 
                    onClick={handleGenerateInsights}
                    className="mt-6 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-sans cursor-pointer animate-pulse"
                  >
                    Retry Generation
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <Sparkles className="text-indigo-600/30 mb-4 animate-bounce shrink-0" size={48} />
                  <h4 className="font-bold text-slate-800 text-sm">Ready for AI Generation</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1 font-sans">Click the button in the header to run live evaluation on flagged students.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-start justify-between group"
              >
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
                <TrendingUp size={12} />
                <span>+2.5% from last month</span>
              </div>
            </div>
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live System Status Card */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <Zap size={32} className="animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</span>
            </div>
            <div>
               <h2 className="text-2xl font-black uppercase italic tracking-tight">System Health & Live Operations</h2>
               <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Cloud Sync: Online
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Database Auth: Verified
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Real-time Gateway: Established
                  </span>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-10">
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Latency</p>
                <p className="text-xl font-black italic">14ms</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Uptime</p>
                <p className="text-xl font-black italic text-emerald-400">99.9%</p>
             </div>
             <div className="h-10 w-px bg-slate-800" />
             <div className="flex items-center gap-3 px-6 py-3 bg-emerald-600 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20">
                <CheckCircle2 size={16} />
                Live OS v2.0
             </div>
          </div>
        </div>
      </div>

      {/* Student Enrollment vs Graduation Trend Analytics Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Sparkles size={16} />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Enrollment & Graduation Audit</h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Monthly student flow metrics for the selected academic cycle
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Year Selector dropdown */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value as any)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider py-2.5 pl-4 pr-10 rounded-xl outline-none cursor-pointer transition-all focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="2025 - 2026">AY 2025 - 2026</option>
                <option value="2024 - 2025">AY 2024 - 2025</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Chart Type Toggles */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/55">
              {(['area', 'bar', 'line'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    chartType === type 
                      ? "bg-white text-slate-900 shadow-sm font-black" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Summary Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="p-5 bg-blue-50/40 border border-blue-100/50 rounded-2xl">
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Total Enrolled</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black italic text-slate-900">
                {academicYearData[selectedYear].reduce((sum, item) => sum + item.enrolled, 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-blue-600">Students</span>
            </div>
          </div>

          <div className="p-5 bg-emerald-50/40 border border-emerald-100/50 rounded-2xl">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Graduated</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black italic text-slate-900">
                {academicYearData[selectedYear].reduce((sum, item) => sum + item.graduated, 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-600">Alumni</span>
            </div>
          </div>

          <div className="p-5 bg-purple-50/40 border border-purple-100/50 rounded-2xl">
            <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1">Successful Graduation Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black italic text-slate-900">
                {(() => {
                  const enrolled = academicYearData[selectedYear].reduce((sum, item) => sum + item.enrolled, 0);
                  const graduated = academicYearData[selectedYear].reduce((sum, item) => sum + item.graduated, 0);
                  return enrolled > 0 ? ((graduated / enrolled) * 100).toFixed(1) : '0';
                })()}%
              </span>
              <span className="text-[10px] font-bold text-purple-600 flex items-center gap-0.5">
                <Award size={12} /> Target Met
              </span>
            </div>
          </div>
        </div>

        {/* The Recharts Container */}
        <div className="w-full h-[360px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={academicYearData[selectedYear]}
                margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorGraduated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 mr-4 font-sans">
                      {value === 'enrolled' ? 'Students Enrolled' : 'Graduated Students'}
                    </span>
                  )}
                />
                <Area 
                  name="enrolled" 
                  type="monotone" 
                  dataKey="enrolled" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorEnrolled)" 
                />
                <Area 
                  name="graduated" 
                  type="monotone" 
                  dataKey="graduated" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorGraduated)" 
                />
              </AreaChart>
            ) : chartType === 'bar' ? (
              <ReBarChart
                data={academicYearData[selectedYear]}
                margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
                barSize={16}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 mr-4 font-sans">
                      {value === 'enrolled' ? 'Students Enrolled' : 'Graduated Students'}
                    </span>
                  )}
                />
                <Bar name="enrolled" dataKey="enrolled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar name="graduated" dataKey="graduated" fill="#10b981" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            ) : (
              <ReLineChart
                data={academicYearData[selectedYear]}
                margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 mr-4 font-sans">
                      {value === 'enrolled' ? 'Students Enrolled' : 'Graduated Students'}
                    </span>
                  )}
                />
                <Line 
                  name="enrolled" 
                  type="monotone" 
                  dataKey="enrolled" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  name="graduated" 
                  type="monotone" 
                  dataKey="graduated" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                />
              </ReLineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class Enrollment Breakdown Dashboard Widget */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
                <BarChart2 size={16} />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Enrollment Distribution</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="text-slate-700" size={22} />
              Class Enrollment Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Real-time summary of student counts across active classrooms.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">Total Classes</span>
            <span className="text-2xl font-black italic text-indigo-600">{classCounts.length}</span>
          </div>
        </div>

        {studentsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4">
            <div className="lg:col-span-7 h-[300px] flex flex-col justify-end gap-3 p-6 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-[2rem] animate-pulse">
              <div className="flex justify-between items-end h-full px-6 gap-4">
                <div className="w-12 bg-slate-200 dark:bg-slate-800 rounded-t-xl" style={{ height: '40%' }}></div>
                <div className="w-12 bg-slate-300 dark:bg-slate-750 rounded-t-xl" style={{ height: '75%' }}></div>
                <div className="w-12 bg-slate-200 dark:bg-slate-800 rounded-t-xl" style={{ height: '55%' }}></div>
                <div className="w-12 bg-slate-305 dark:bg-slate-700 rounded-t-xl" style={{ height: '90%' }}></div>
                <div className="w-12 bg-slate-200 dark:bg-slate-800 rounded-t-xl" style={{ height: '30%' }}></div>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-full mt-2"></div>
            </div>
            <div className="lg:col-span-5 space-y-4 animate-pulse">
              <div className="p-5 bg-slate-50/60 dark:bg-slate-950/30 rounded-2xl h-[72px] flex items-center justify-between border border-slate-105 dark:border-slate-850">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/3"></div>
                <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded-full w-12"></div>
              </div>
              <div className="p-5 bg-slate-50/60 dark:bg-slate-950/30 rounded-2xl h-[72px] flex items-center justify-between border border-slate-105 dark:border-slate-850">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/4"></div>
                <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded-full w-14"></div>
              </div>
              <div className="p-5 bg-slate-50/60 dark:bg-slate-950/30 rounded-2xl h-[72px] flex items-center justify-between border border-slate-105 dark:border-slate-850">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2"></div>
                <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded-full w-10"></div>
              </div>
            </div>
          </div>
        ) : classCounts.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 p-4">
            <Info size={24} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">No Student Data Found</p>
            <p className="text-xs text-slate-400 mt-1">Enroll students under the Student Enrollment panel to see class distribution metrics.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Visual Recharts BarChart */}
            <div className="lg:col-span-7 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={classCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontWeight="bold" 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontWeight="bold" 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-white text-xs">
                            <p className="font-extrabold uppercase tracking-wide text-slate-400 text-[10px] mb-1">Class {label}</p>
                            <p className="font-black italic text-indigo-400">{payload[0].value} Enrolled Students</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={32} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>

            {/* List with styled progress bars */}
            <div className="lg:col-span-5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {classCounts.map((item, idx) => {
                const maxCount = Math.max(...classCounts.map(c => c.count)) || 1;
                const percentage = Math.round((item.count / maxCount) * 100);
                
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Class {item.name}
                      </span>
                      <span className="font-black italic text-slate-900">
                        {item.count} <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider not-italic">Students</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Attendance & Performance Trend Analytics Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <TrendingUp size={16} />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Attendance & Academic Improvements</h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Academic cycle analysis comparing student attendance rates with GPA benchmarks
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 px-4 py-2 rounded-xl">
             <span className="text-[10px] font-black uppercase text-slate-400">Selected Cycle:</span>
             <span className="text-[10px] font-black uppercase text-indigo-650 tracking-wider">AY {selectedYear}</span>
          </div>
        </div>

        {/* Comparison indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="p-5 bg-blue-50/30 border border-blue-100/50 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Average Attendance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black italic text-slate-900">
                  {(attendancePerformanceData[selectedYear]?.reduce((sum, item) => sum + item.attendance, 0) / 12 || 94.2).toFixed(1)}%
                </span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp size={12} /> Optimal
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-650">
               <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="p-5 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Academic Performance Index</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black italic text-slate-900">
                  {(attendancePerformanceData[selectedYear]?.reduce((sum, item) => sum + item.performance, 0) / 12 || 80.5).toFixed(1)}%
                </span>
                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
                  <Sparkles size={12} /> +4.2% Growth
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
               <Award size={20} />
            </div>
          </div>
        </div>

        {/* Combined Area & Line Chart */}
        <div className="w-full h-[360px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={attendancePerformanceData[selectedYear] || []}
              margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight="bold" 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight="bold" 
                tickLine={false} 
                axisLine={false}
                dx={-10}
                domain={[50, 100]}
              />
              <Tooltip content={<AttendanceTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                formatter={(value) => (
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 mr-4 font-sans">
                    {value === 'attendance' ? 'Average Attendance Rate (%)' : 'Academic Class Scores (%)'}
                  </span>
                )}
              />
              <Area name="attendance" type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
              <Area name="performance" type="monotone" dataKey="performance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPerformance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap Section Divider */}
        <div className="my-8 border-t border-slate-100 pt-8 font-sans">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                Interpreted Weekly Attendance Density
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Visualizing student attendance rates. Yellow/rose coordinates represent patterns of interest (burnout Wednesdays, Friday travel rushes).
              </p>
            </div>
            
            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-150 px-4 py-2.5 rounded-xl font-sans">
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span>High (95-100%)</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-amber-400" />
                  <span>Mild Drop (90-94%)</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span>Significant Absences (&lt;90%)</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 overflow-x-auto pb-4">
              <div className="min-w-[650px] space-y-2">
                {/* Weeks Header Row */}
                <div 
                  className="grid gap-1 pl-12 text-center text-[9px] font-black uppercase tracking-widest text-slate-400"
                  style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
                >
                  <div className="text-left text-[9px]" style={{ gridColumn: 'span 1' }}>Day</div>
                  {weeksList.map((week) => (
                    <div key={week} style={{ gridColumn: 'span 1' }}>{week.replace('Week ', 'W')}</div>
                  ))}
                </div>

                {/* Heatmap Rows */}
                {weekdaysList.map((day) => (
                  <div 
                    key={day} 
                    className="grid gap-1 items-center"
                    style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
                  >
                    <div className="text-left text-[10px] font-black text-slate-500 truncate pr-2" style={{ gridColumn: 'span 1' }}>{day.substring(0, 3)}</div>
                    {weeksList.map((week) => {
                      const cell = attendanceHeatmapData[day]?.[week] || { rate: 100, absentees: [], cause: '' };
                      const isSelected = selectedHeatmapCell?.day === day && selectedHeatmapCell?.week === week;
                      
                      let cellBg = 'bg-emerald-500 hover:bg-emerald-600';
                      if (cell.rate < 90) {
                        cellBg = 'bg-rose-500 hover:bg-rose-600 animate-pulse border border-red-300';
                      } else if (cell.rate < 95) {
                        cellBg = 'bg-amber-400 hover:bg-amber-500';
                      }

                      return (
                        <div key={week} className="aspect-square relative group" style={{ gridColumn: 'span 1' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedHeatmapCell({ day, week })}
                            className={cn(
                              "w-full h-full rounded-lg transition-all focus:outline-none flex flex-col items-center justify-center text-[9px] font-black text-white cursor-pointer select-none",
                              cellBg,
                              isSelected ? "ring-4 ring-indigo-600 ring-offset-2 scale-105 z-10 shadow-lg" : ""
                            )}
                            title={`${day} ${week}: ${cell.rate}%`}
                          >
                            {cell.rate}%
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Cell Detail Display */}
            <div className="lg:col-span-1 bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between font-sans">
              {selectedHeatmapCell ? (() => {
                const day = selectedHeatmapCell.day;
                const week = selectedHeatmapCell.week;
                const cell = attendanceHeatmapData[day]?.[week] || { rate: 100, absentees: [], cause: '' };
                
                return (
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">{week}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{day}</p>
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap",
                        cell.rate >= 95 ? "bg-emerald-100 text-emerald-700" : cell.rate >= 90 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700 animate-pulse"
                      )}>
                        {cell.rate}% Rate
                      </span>
                    </div>

                    {cell.rate < 95 ? (
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">Identified Trend Patterns</span>
                          <p className="text-xs font-extrabold text-indigo-700 leading-snug">{cell.cause || 'General absences registered.'}</p>
                        </div>

                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-2">Registered Absent Students</span>
                          <div className="space-y-1.5">
                            {cell.absentees.map((st, idx) => (
                              <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                {st}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-450 space-y-2">
                        <CheckCircle2 className="text-emerald-500 mx-auto" size={24} />
                        <h4 className="text-xs font-bold text-slate-700">Healthy Enrollment</h4>
                        <p className="text-[10px] text-slate-505 leading-relaxed">No abnormal absences or recurring trends detected for this coordinate.</p>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="py-12 text-center text-slate-400 space-y-2 my-auto">
                  <Info className="text-indigo-400 mx-auto animate-bounce" size={24} />
                  <h4 className="text-xs font-bold text-slate-500">Coordinate Diagnostics</h4>
                  <p className="text-[10px] leading-relaxed">Select any daily coordinate cell to inspect historical trend insights.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Central School Master Schedule widget synced with Google Calendar */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">G-Suite Synchronized</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="text-slate-700" size={22} />
              School Master Schedule
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Displaying official events, academic deadlines, and holidays synced in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {syncMessage && (
              <div className="text-right flex flex-col justify-center">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  syncStatus === 'success' ? "text-emerald-600" :
                  syncStatus === 'error' ? "text-rose-600" : "text-blue-600"
                )}>
                  {syncStatus === 'success' ? 'Sync Completed' : syncStatus === 'error' ? 'Sync Failed' : 'Syncing...'}
                </span>
                <span className="text-[10px] text-slate-400 max-w-[240px] truncate leading-tight mt-0.5" title={syncMessage}>
                  {syncMessage}
                </span>
              </div>
            )}

            <button
              id="open-full-calendar-btn"
              onClick={() => setShowFullCalendar(true)}
              className="px-5 py-3 bg-slate-900 border border-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
            >
              <Calendar size={14} />
              Interactive Planner
            </button>

            <button
              id="google-calendar-sync-btn"
              disabled={isSyncing}
              onClick={handleGoogleCalendarSync}
              className={cn(
                "px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm border",
                isSyncing 
                  ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-blue-600 border-blue-700 hover:bg-blue-700 text-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
              )}
            >
              {isSyncing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Master Schedule'}
            </button>
          </div>
        </div>

        {/* Category Summary Cards for Current Month */}
        {events.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60 shadow-xs">
            {[
              { label: 'Academic', count: mayCounts['Academic'] || 0, color: 'text-blue-600 bg-blue-50/40 border-blue-200/50' },
              { label: 'Sports', count: mayCounts['Sports'] || 0, color: 'text-emerald-600 bg-emerald-50/40 border-emerald-200/50' },
              { label: 'Culture', count: mayCounts['Culture'] || 0, color: 'text-purple-600 bg-purple-50/40 border-purple-200/50' },
              { label: 'Holiday', count: mayCounts['Holiday'] || 0, color: 'text-rose-600 bg-rose-50/40 border-rose-200/50' }
            ].map(item => (
              <div key={item.label} className={cn("p-4 rounded-xl border flex flex-col justify-between shadow-xs", item.color)}>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black">{item.count}</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Scheduled May</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border border-slate-100 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Cloud size={24} />
            </div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">No Central Schedule Loaded</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              No school master events exist in the database. Instruct school admins to trigger a sync to pull verified schedules from the central Google Calendar!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left Side: Main Events List Grid */}
            <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.slice(0, 6).map((event) => {
                const eventDate = new Date(event.date);
                const formattedDay = !isNaN(eventDate.getTime()) ? eventDate.getDate() : '--';
                const formattedMonth = !isNaN(eventDate.getTime()) ? eventDate.toLocaleDateString([], { month: 'short' }) : 'N/A';

                const getCategoryStyles = (category: string) => {
                  switch (category) {
                    case 'Sports':
                      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    case 'Culture':
                      return 'bg-purple-50 text-purple-700 border-purple-100';
                    case 'Holiday':
                      return 'bg-rose-50 text-rose-700 border-rose-100';
                    default:
                      return 'bg-blue-50 text-blue-700 border-blue-100';
                  }
                };

                return (
                  <motion.div
                    key={event.id}
                    whileHover={{ y: -4 }}
                    className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl p-5 transition-all duration-200 flex flex-col gap-4 relative group hover:shadow-xs"
                  >
                    {/* Google Icon Badge if it's synced */}
                    { (event as any).syncedFromGoogle && (
                      <span className="absolute top-4 right-4 bg-white/80 border border-slate-200 px-1.5 py-0.5 rounded text-[8px] font-black text-blue-600 flex items-center gap-1 uppercase tracking-widest leading-none pointer-events-none">
                        <span className="w-1 h-1 rounded-full bg-blue-600 inline-block animate-pulse"></span>
                        Google Synced
                      </span>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Date Block */}
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 -mb-0.5">{formattedMonth}</span>
                        <span className="text-lg font-black text-slate-800 leading-none">{formattedDay}</span>
                      </div>

                      <div className="min-w-0">
                        <span className={cn(
                          "inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border mb-1.5",
                          getCategoryStyles(event.category)
                        )}>
                          {event.category || 'Academic'}
                        </span>
                        <h4 className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors truncate" title={event.title}>
                          {event.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {event.description || 'No description provided.'}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-slate-500 font-sans">
                        <Clock size={12} className="shrink-0 text-slate-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {event.startTime === 'All Day' ? 'All Day Event' : `${event.startTime} - ${event.endTime}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <MapPin size={12} className="shrink-0 text-slate-400" />
                          <span className="text-[10px] font-medium truncate uppercase tracking-wider">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Side: Priority 48h Broadcast/Notification Board */}
            <div className="xl:col-span-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800">48h Priority alerts</h4>
                </div>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[8px] font-black uppercase tracking-wider">
                  {alerts48h.length} Active
                </span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {alerts48h.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-white border border-slate-200/30 rounded-xl p-4">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                    <p className="text-[9.5px] font-black uppercase tracking-wider text-slate-500">All Operations Optimal</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed">No critical schedules found in the coming 48 hour frame.</p>
                  </div>
                ) : (
                  alerts48h.map(event => (
                    <div 
                      key={`alert-${event.id}`}
                      className={cn(
                        "p-3 bg-white border rounded-xl flex flex-col gap-1.5 shadow-xs transition-colors hover:bg-slate-50/50",
                        (event as any).syncedFromGoogle 
                          ? "border-blue-200 bg-blue-50/10 hover:border-blue-300" 
                          : "border-slate-200"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-extrabold text-[10px] uppercase text-slate-800 leading-tight tracking-wide line-clamp-2">
                          {event.title}
                        </span>
                        {/* Synced with G-Suite Indicator Badge */}
                        {(event as any).syncedFromGoogle ? (
                          <span className="shrink-0 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[6.5px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-blue-600 inline-block animate-pulse" />
                            G-Sync
                          </span>
                        ) : (
                          <span className="shrink-0 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[6.5px] font-black uppercase tracking-widest rounded">
                            Local
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[8.5px] text-slate-400 font-extrabold uppercase">
                        <span className="text-rose-600 font-black">{event.date}</span>
                        <span>•</span>
                        <span>{event.startTime === 'All Day' ? 'All Day' : event.startTime}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Media Contribution Section (Teacher/Staff) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon size={18} className="text-blue-600" />
              Activity Media Hub
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share Photos</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl text-blue-700">
              <Info size={24} className="shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-relaxed">
                Upload school activities here. Photos will be watermarked and sent to Admin for approval before appearing on the public gallery.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Tag</label>
              <select 
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">General Activity</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Short Description</label>
              <input 
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Science experiment Grade 5"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleMediaUpload}
              className="hidden" 
              accept="image/*"
              multiple
            />

            <button 
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full py-4 rounded-xl flex flex-col items-center justify-center gap-3 transition-all border-2 border-dashed",
                uploadStatus === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-600" : 
                isUploading ? "bg-slate-50 border-slate-200" : "bg-blue-50/50 border-blue-200 text-blue-600 hover:bg-blue-50"
              )}
            >
              {uploadStatus === 'success' ? (
                <>
                  <CheckCircle2 size={32} />
                  <span className="text-xs font-black uppercase tracking-widest">Sent to Admin!</span>
                </>
              ) : isUploading ? (
                <>
                  <Loader2 size={32} className="animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest">Applying Watermark...</span>
                </>
              ) : (
                <>
                  <Upload size={32} className="transition-transform group-hover:-translate-y-1" />
                  <span className="text-xs font-black uppercase tracking-widest">Upload Activity Photo</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <StudentAttendanceScanner />

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Recent Attendance</h3>
            <button className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:underline">
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { class: 'G10-A (Mathematics)', time: '08:00 AM', status: 'Marked', count: '28/30' },
              { class: 'G12-B (Physics)', time: '09:30 AM', status: 'Marked', count: '24/25' },
              { class: 'G8-C (English)', time: '11:00 AM', status: 'Pending', count: '- / 32' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                    {item.class.split(' ')[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.class}</p>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    item.status === 'Marked' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {item.status}
                  </span>
                  <p className="text-xs font-medium text-slate-600 mt-1">{item.count} Present</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-slate-900">New Enrollments</h3>
             <button className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:text-blue-600 transition-colors">
                <UserPlus size={16} />
             </button>
          </div>
          <div className="space-y-4">
             {[
               { name: 'Sovann Pich', id: 'VH001420', date: 'Today' },
               { name: 'Arya Stark', id: 'VH001419', date: 'Yesterday' },
               { name: 'John Doe', id: 'VH001418', date: '2 days ago' },
             ].map((student, i) => (
               <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-xs font-bold text-slate-700 truncate">{student.name}</p>
                     <p className="text-[10px] text-slate-400 font-mono">{student.id}</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{student.date}</span>
               </div>
             ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50">
             <h3 className="font-bold text-slate-900 mb-6">Latest Announcements</h3>
             <div className="space-y-6">
            {[
              { title: 'Midterm Break', date: 'Oct 15 - Oct 20', content: 'The school will remain closed for the annual midterm break.', type: 'General' },
              { title: 'Parent-Teacher Meeting', date: 'Oct 22', content: 'Meeting scheduled for Grade 12 students regarding university applications.', type: 'Event' },
            ].map((news, i) => (
              <div key={i} className="relative pl-6 border-l-2 border-slate-100 pb-2 last:pb-0">
                <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">{news.type}</p>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{news.title}</h4>
                <p className="text-xs text-slate-500 mb-2">{news.date}</p>
                <p className="text-xs text-slate-600 line-clamp-2">{news.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

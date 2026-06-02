import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  Target, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ArrowUp,
  ArrowDown,
  SortAsc,
  Building,
  GraduationCap,
  Settings as SettingsIcon,
  Globe,
  Zap,
  BarChart3,
  DollarSign,
  ChevronRight,
  Layout,
  ExternalLink,
  ChevronDown,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Project, ProjectStatus, ProjectCategory } from '@/src/types';
import { getDb, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, getDocs, setDoc, doc, onSnapshot } from 'firebase/firestore';

const INITIAL_PROJECTS: Project[] = [
  // ... (keeping the same initial projects for reference or fallback)
  {
    id: 'PRJ-2026-001',
    title: 'Science Lab Modernization',
    description: 'Upgrading Grade 10-12 labs with new digital microscopes and sensor systems to support the new STEM curriculum.',
    status: 'Active',
    category: 'Infrastructure',
    startDate: '2026-04-01',
    endDate: '2026-07-15',
    progress: 65,
    budget: 45000,
    spent: 28000,
    managerId: 'EMP001',
    teamIds: ['EMP005', 'EMP012', 'EMP018'],
    tasksCount: 24,
    completedTasksCount: 15,
    priority: 'High',
    createdAt: '2026-03-15'
  },
  {
    id: 'PRJ-2026-002',
    title: 'E-Learning Portal v2.0',
    description: 'Complete overhaul of the student learning management system with mobile-first design and offline access capabilities.',
    status: 'Planning',
    category: 'Technology',
    startDate: '2026-06-01',
    endDate: '2026-10-30',
    progress: 15,
    budget: 12000,
    spent: 1200,
    managerId: 'EMP003',
    teamIds: ['EMP009', 'EMP022'],
    tasksCount: 48,
    completedTasksCount: 8,
    priority: 'Critical',
    createdAt: '2026-04-10'
  },
  {
    id: 'PRJ-2026-003',
    title: 'Annual Cultural Festival',
    description: 'Planning and execution of the 5-day multi-campus cultural exchange program and talent showcase.',
    status: 'Active',
    category: 'Student Event',
    startDate: '2026-05-01',
    endDate: '2026-05-25',
    progress: 85,
    budget: 8000,
    spent: 7200,
    managerId: 'EMP007',
    teamIds: ['EMP015', 'EMP030', 'EMP042'],
    tasksCount: 110,
    completedTasksCount: 94,
    priority: 'High',
    createdAt: '2026-02-20'
  },
  {
    id: 'PRJ-2026-004',
    title: 'Solar Panel Installation',
    description: 'Installing 200kW solar array across the South and North wing roofs to reduce electricity costs by 40%.',
    status: 'Completed',
    category: 'Infrastructure',
    startDate: '2026-01-10',
    endDate: '2026-03-20',
    progress: 100,
    budget: 65000,
    spent: 62500,
    managerId: 'EMP002',
    teamIds: ['EMP011', 'EMP008'],
    tasksCount: 32,
    completedTasksCount: 32,
    priority: 'Medium',
    createdAt: '2026-01-05'
  }
];

export function ProjectMgnt() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [sortBy, setBy] = useState<keyof Project>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'grid' | 'budget'>('grid');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);

  useEffect(() => {
    let unsubscribe: any;
    async function loadProjects() {
      try {
        const db = await getDb();
        if (!db) {
          setProjects(INITIAL_PROJECTS);
          setLoading(false);
          return;
        }

        const q = query(collection(db, 'projects'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            setProjects(INITIAL_PROJECTS);
          } else {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(list);
          }
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, 'projects');
          setProjects(INITIAL_PROJECTS);
          setLoading(false);
        });
      } catch (e) {
        console.error("Error loading projects:", e);
        setProjects(INITIAL_PROJECTS);
        setLoading(false);
      }
    }
    loadProjects();
    return () => unsubscribe?.();
  }, []);

  const syncToCloud = async () => {
    setSyncing(true);
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not connected");

      for (const p of INITIAL_PROJECTS) {
        await setDoc(doc(db, 'projects', p.id), p);
      }
      // alert("Projects synced to cloud successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'projects/sync');
    } finally {
      setSyncing(false);
    }
  };

  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const stats = [
    { label: 'Active Projects', value: projects.filter(p => p.status === 'Active').length, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Budgeted', value: `$${(projects.reduce((sum, p) => sum + p.budget, 0) / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Planned Initiatives', value: projects.filter(p => p.status === 'Planning').length, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Active': return 'bg-amber-100 text-amber-700';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'Planning': return 'bg-blue-100 text-blue-700';
      case 'On Hold': return 'bg-slate-100 text-slate-700';
      case 'Cancelled': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500 text-white shadow-rose-200';
      case 'High': return 'bg-orange-500 text-white shadow-orange-200';
      case 'Medium': return 'bg-blue-500 text-white shadow-blue-200';
      case 'Low': return 'bg-slate-500 text-white shadow-slate-200';
      default: return 'bg-slate-500 text-white shadow-slate-200';
    }
  };

  const updateProjectField = async (projectId: string, field: keyof Project, value: any) => {
    try {
      const db = await getDb();
      if (!db) {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, [field]: value } : p));
        return;
      }
      
      const projectRef = doc(db, 'projects', projectId);
      await setDoc(projectRef, { [field]: value }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  const getCategoryIcon = (category: ProjectCategory) => {
    switch (category) {
      case 'Infrastructure': return <Building size={16} />;
      case 'Academic': return <GraduationCap size={16} />;
      case 'Administrative': return <SettingsIcon size={16} />;
      case 'Student Event': return <Target size={16} />;
      case 'Technology': return <Globe size={16} />;
      default: return <TrendingUp size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400 font-black uppercase italic tracking-widest animate-pulse">
        <RefreshCw size={48} className="animate-spin text-blue-500" />
        Syncing Project Board...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-200">
            <Briefcase size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">School Projects Master</h1>
            <p className="text-slate-500 font-bold text-sm tracking-tight italic">Strategic initiatives and large-scale operations tracking.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {projects.length <= INITIAL_PROJECTS.length && (
             <button 
               onClick={syncToCloud}
               disabled={syncing}
               className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
             >
               <Cloud size={16} className={cn(syncing && "animate-spin")} />
               {syncing ? "Syncing..." : "Sync to Cloud"}
             </button>
           )}
           <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all">
             <Plus size={16} />
             Launch Project
           </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2">
            {['All', 'Infrastructure', 'Academic', 'Administrative', 'Student Event', 'Technology'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeCategory === cat 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
            <Filter size={14} className="text-slate-400" />
            {['All', 'Planning', 'Active', 'On Hold', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  statusFilter === status 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative group/search flex-1 md:w-80">
                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-600 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search projects by ID or title..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-10 pr-6 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm shadow-sm"
                 />
              </div>
              
              <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
                <SortAsc size={14} className="ml-2 text-slate-400" />
                <select 
                  value={sortBy}
                  onChange={(e) => setBy(e.target.value as any)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-slate-600 pr-2"
                >
                  <option value="startDate">Start Date</option>
                  <option value="endDate">End Date</option>
                  <option value="progress">Progress</option>
                  <option value="budget">Budget</option>
                  <option value="priority">Priority</option>
                </select>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                >
                  {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </button>
              </div>
           </div>

           <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm font-sans shrink-0">
              <button 
                onClick={() => setView('grid')}
                className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", view === 'grid' ? "bg-slate-900 shadow-md text-white" : "text-slate-400 hover:text-slate-600")}
              >
                <Layout size={14} /> Grid Board
              </button>
              <button 
                onClick={() => setView('budget')}
                className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", view === 'budget' ? "bg-slate-900 shadow-md text-white" : "text-slate-400 hover:text-slate-600")}
              >
                <BarChart3 size={14} /> Budget Audit Chart
              </button>
           </div>
        </div>
      </div>

      {view === 'grid' ? (
        <>
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  index={idx}
                  getCategoryIcon={getCategoryIcon}
                  getStatusColor={getStatusColor}
                  onClick={() => setSelectedProjectId(project.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredProjects.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
               <h3 className="text-lg font-black text-slate-900 uppercase italic">No projects found</h3>
               <p className="text-slate-400 font-bold text-sm">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </>
      ) : (
        /* Recharts Budget vs Actual spending bar chart */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-8 font-sans"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={18} />
                Financial Performance: Budgeted vs. Actual Cost Breakdown
              </h3>
              <p className="text-slate-500 font-bold text-[11px] tracking-tight italic mt-1">Comparative analytics of the strategic capital allocation against actual spend for active & launched initiatives.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-blue-600 block shadow-sm shadow-blue-500/20" /> Budgeted
              </span>
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 block shadow-sm shadow-emerald-500/20" /> Actual Spend
              </span>
            </div>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredProjects}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="title" 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(v) => `$${v.toLocaleString()}`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as Project;
                      const overspent = data.spent > data.budget;
                      const percentage = ((data.spent / data.budget) * 100).toFixed(0);
                      return (
                        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white p-4.5 rounded-2xl shadow-xl space-y-1.5 font-sans text-[11px]">
                          <p className="font-black text-blue-400 uppercase tracking-widest">{data.id}</p>
                          <p className="font-extrabold text-slate-100 text-xs">{data.title}</p>
                          <div className="pt-2 flex flex-col gap-1 font-bold">
                            <div className="flex items-center justify-between gap-6">
                              <span className="text-slate-400">Total Budget:</span>
                              <span className="font-black text-slate-100">${data.budget.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6">
                              <span className="text-slate-400">Actual Cost:</span>
                              <span className="font-black text-slate-100">${data.spent.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between gap-6 pt-1.5 border-t border-slate-800">
                              <span className="text-slate-400">Utilization:</span>
                              <span className={cn("font-black", overspent ? "text-rose-400" : "text-emerald-400")}>
                                {percentage}% ({overspent ? "Over Budget" : "On Budget"})
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="budget" 
                  name="Budgeted" 
                  fill="#2563eb" 
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="spent" 
                  name="Actual Spend" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Detail Overlay */}
      {selectedProjectId && (
        <ProjectDetail 
          project={projects.find(p => p.id === selectedProjectId)!} 
          onClose={() => setSelectedProjectId(null)} 
          getStatusColor={getStatusColor}
          getCategoryIcon={getCategoryIcon}
          updateProjectField={updateProjectField}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, index, getCategoryIcon, getStatusColor, getPriorityColor, onClick }: any) {
  const budgetUsage = (project.spent / project.budget) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-white rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all group overflow-hidden cursor-pointer flex flex-col h-full"
    >
      {/* Priority Indicator */}
      <div className={cn("px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] shadow-sm", getPriorityColor(project.priority))}>
        Priority: {project.priority}
      </div>

      <div className="p-8 space-y-6 flex-1">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               {getCategoryIcon(project.category)}
               {project.category}
             </div>
             <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase italic line-clamp-1">{project.title}</h3>
          </div>
          <span className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter", getStatusColor(project.status))}>
            {project.status}
          </span>
        </div>

        <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2 italic">
          "{project.description}"
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
               <span className="text-slate-400">Launch Status</span>
               <span className="text-slate-900">{project.progress}% Complete</span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
               <div 
                 className={cn("h-full rounded-full transition-all duration-1000", project.progress === 100 ? "bg-emerald-500" : "bg-blue-600")} 
                 style={{ width: `${project.progress}%` }} 
               />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
               <span className="text-slate-400">Budget Utilized</span>
               <span className={cn(budgetUsage > 90 ? "text-rose-500" : "text-slate-900")}>{(project.spent/project.budget*100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
               <div 
                 className={cn("h-full rounded-full transition-all duration-1000", budgetUsage > 100 ? "bg-rose-500" : budgetUsage > 90 ? "bg-amber-500" : "bg-emerald-500")} 
                 style={{ width: `${Math.min(budgetUsage, 100)}%` }} 
               />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
           <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Schedule</p>
              <div className="flex items-center gap-1.5 text-slate-700 font-black text-[10px] uppercase italic">
                <Clock size={12} className="text-blue-500" />
                {project.startDate} — {project.endDate}
              </div>
           </div>
           <div className="space-y-1 text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Budget</p>
              <div className="text-slate-900 font-black text-[12px] italic">
                ${(project.budget / 1000).toFixed(1)}k
              </div>
           </div>
        </div>

        <div className="flex items-center justify-between pt-4">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-400">
                 <CheckCircle2 size={12} className={project.completedTasksCount > 0 ? "text-emerald-500" : ""} />
                 <span className="text-[10px] font-black uppercase tracking-tighter">{project.completedTasksCount}/{project.tasksCount} Tasks</span>
              </div>
           </div>
           <button className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
             Operational Insights <ArrowRight size={14} />
           </button>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectDetail({ project, onClose, getStatusColor, getCategoryIcon, updateProjectField }: any) {
  const budgetUsage = (project.spent / project.budget) * 100;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
       <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.95, y: 20 }}
         className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row h-[85vh]"
       >
          {/* Sidebar Info */}
          <div className="w-full md:w-80 bg-slate-50 p-10 flex flex-col gap-8 border-r border-slate-100">
             <div className="space-y-4">
                <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                  <ChevronRight size={16} className="rotate-180" /> Back to List
                </button>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{project.id}</p>
                   <h2 className="text-2xl font-black text-slate-900 italic uppercase leading-tight">{project.title}</h2>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Management Controls</p>
                   <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase">Priority Status</label>
                        <select 
                          value={project.priority}
                          onChange={(e) => updateProjectField(project.id, 'priority', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg p-1 text-[10px] font-black uppercase"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-slate-400 uppercase">Tasks Total</label>
                           <input 
                             type="number"
                             value={project.tasksCount}
                             onChange={(e) => updateProjectField(project.id, 'tasksCount', parseInt(e.target.value) || 0)}
                             className="w-full bg-slate-50 border border-slate-100 rounded-lg p-1 text-[10px] font-black tracking-tighter"
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[8px] font-black text-slate-400 uppercase">Completed</label>
                           <input 
                             type="number"
                             value={project.completedTasksCount}
                             onChange={(e) => updateProjectField(project.id, 'completedTasksCount', parseInt(e.target.value) || 0)}
                             className="w-full bg-slate-50 border border-slate-100 rounded-lg p-1 text-[10px] font-black tracking-tighter"
                           />
                        </div>
                      </div>

                      <div className="space-y-1">
                         <label className="text-[8px] font-black text-slate-400 uppercase">Project Progress (%)</label>
                         <input 
                           type="range"
                           min="0"
                           max="100"
                           value={project.progress}
                           onChange={(e) => updateProjectField(project.id, 'progress', parseInt(e.target.value))}
                           className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                         />
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Project Health</p>
                   <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-700 italic">Timeline</span>
                         <span className="text-[10px] font-black text-emerald-500 uppercase">On Track</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-700 italic">Budget</span>
                         <span className={cn("text-[10px] font-black uppercase", budgetUsage > 90 ? "text-rose-500" : "text-amber-500")}>
                           {budgetUsage.toFixed(0)}% Utilized
                         </span>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Key Metrics</p>
                   <div className="grid grid-cols-1 gap-2">
                      <MetricRow label="Team Size" value={project.teamIds.length} icon={Users} />
                      <MetricRow label="Milestones" value="4/6" icon={TrendingUp} />
                      <MetricRow label="Active Tasks" value={project.tasksCount - project.completedTasksCount} icon={CheckCircle2} />
                   </div>
                </div>
             </div>

             <div className="mt-auto pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">M</div>
                   <div>
                      <p className="text-xs font-black text-slate-900 italic uppercase">Manager Name</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Project Lead</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-12 custom-scrollbar">
             <div className="flex items-start justify-between">
                <div className="space-y-4 max-w-2xl">
                   <div className="flex items-center gap-3">
                      <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", getStatusColor(project.status))}>
                        {project.status}
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {getCategoryIcon(project.category)}
                        {project.category}
                      </span>
                   </div>
                   <p className="text-lg font-bold text-slate-600 italic leading-relaxed">
                     "{project.description}"
                   </p>
                </div>
                <div className="hidden lg:block text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Progress</p>
                   <h3 className="text-5xl font-black text-blue-600 italic tracking-tighter select-none">{project.progress}%</h3>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <h4 className="text-sm font-black text-slate-900 uppercase italic flex items-center gap-2">
                     <Target className="text-blue-600" size={18} />
                     Financial Overview
                   </h4>
                   <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Allocated Budget</p>
                            <div className="flex items-center gap-2">
                               <span className="text-sm font-black text-slate-400">$</span>
                               <input 
                                 type="number"
                                 value={project.budget}
                                 onChange={(e) => updateProjectField(project.id, 'budget', parseInt(e.target.value) || 0)}
                                 className="bg-transparent text-2xl font-black text-slate-900 italic tracking-tight outline-none focus:text-blue-600 transition-colors w-full"
                               />
                            </div>
                         </div>
                         <div className="space-y-2 text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Actual Spend</p>
                            <div className="flex items-center justify-end gap-2">
                               <input 
                                 type="number"
                                 value={project.spent}
                                 onChange={(e) => updateProjectField(project.id, 'spent', parseInt(e.target.value) || 0)}
                                 className="bg-transparent text-2xl font-black text-emerald-600 italic tracking-tight outline-none focus:text-blue-600 transition-colors text-right w-full"
                               />
                               <span className="text-sm font-black text-emerald-400">$</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                           <span>Budget Utilization</span>
                           <span className={cn(budgetUsage > 100 ? "text-rose-500" : "text-slate-900")}>
                             {budgetUsage.toFixed(1)}% ({budgetUsage > 100 ? "Over Budget" : "On Track"})
                           </span>
                        </div>
                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                           <div 
                             className={cn("h-full transition-all", budgetUsage > 100 ? "bg-rose-500" : budgetUsage > 90 ? "bg-amber-500" : "bg-blue-600")} 
                             style={{ width: `${Math.min(budgetUsage, 100)}%` }} 
                           />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-sm font-black text-slate-900 uppercase italic flex items-center gap-2">
                     <TrendingUp className="text-blue-600" size={18} />
                     Timeline & Milestones
                   </h4>
                   <div className="space-y-4">
                      {[
                        { title: 'Project Initiation/Kickoff', date: 'Done', status: 'completed' },
                        { title: 'Conceptual Design Phase', date: 'Done', status: 'completed' },
                        { title: 'Execution & Development', date: 'In Progress', status: 'active' },
                        { title: 'Final Handover', date: 'Scheduled', status: 'pending' },
                      ].map((m, i) => (
                        <div key={i} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-all cursor-pointer">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center",
                                m.status === 'completed' ? "bg-emerald-50 text-emerald-500" : 
                                m.status === 'active' ? "bg-blue-50 text-blue-500" : "bg-slate-50 text-slate-300"
                              )}>
                                 {m.status === 'completed' ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                              </div>
                              <span className={cn("text-xs font-black italic uppercase", m.status === 'pending' ? "text-slate-400" : "text-slate-900")}>{m.title}</span>
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.date}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="pt-12 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
                      Generate Full Audit Report
                   </button>
                   <button className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-slate-900 hover:bg-slate-50 transition-all">
                      Manage Team
                   </button>
                </div>
                <div className="flex items-center gap-2 text-rose-500 font-black cursor-pointer hover:underline uppercase text-[10px] tracking-widest">
                   <AlertCircle size={14} /> Suspend Operations
                </div>
             </div>
          </div>
       </motion.div>
    </div>
  );
}

function MetricRow({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
       <div className="flex items-center gap-3">
          <Icon size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
       </div>
       <span className="text-xs font-black text-slate-900">{value}</span>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Building, School, Briefcase, GraduationCap, 
  ChevronRight, ChevronDown, CheckCircle2, ShieldCheck, 
  UserCircle, Heart, Layout, Globe, Layers,
  Settings, Clock, Sparkles, AlertCircle, ArrowRight,
  BookOpen, Landmark, UserPlus, Search, PenTool, Database
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface OrgNodeProps {
  id: string;
  title: string;
  role: string;
  icon: any;
  subNodes?: OrgNodeProps[];
  isExpanded?: boolean;
  colorClass: string;
  borderColor: string;
  description?: string;
  level: number;
}

const ORG_DATA: OrgNodeProps = {
  id: 'board',
  title: 'Board of Directors / School Board',
  role: 'Governance & Strategy',
  icon: Building,
  level: 0,
  colorClass: 'bg-slate-900',
  borderColor: 'border-slate-800',
  description: 'Highest governing body responsible for policy and strategic direction.',
  subNodes: [
    {
      id: 'ceo',
      title: 'Chief Executive / School Director',
      role: 'Operations Bridge',
      icon: Briefcase,
      level: 1,
      colorClass: 'bg-blue-600',
      borderColor: 'border-blue-700',
      description: 'The primary bridge between the board and daily school operations.',
      subNodes: [
        {
          id: 'academic-consultant',
          title: 'Education Director / Consultant',
          role: 'Curriculum & MoEYS Compliance',
          icon: Landmark,
          level: 2,
          colorClass: 'bg-indigo-600',
          borderColor: 'border-indigo-700',
          description: 'Oversees curriculum standards and Ministry of Education (MoEYS) compliance.',
        },
        {
          id: 'principal',
          title: 'School Director / Principal',
          role: 'Daily Authority',
          icon: School,
          level: 2,
          colorClass: 'bg-emerald-600',
          borderColor: 'border-emerald-700',
          description: 'The central authority for all daily operations and academic execution.',
          subNodes: [
            {
              id: 'chaplain',
              title: 'School Chaplain / Ethics',
              role: 'Spiritual Guidance',
              icon: Heart,
              level: 3,
              colorClass: 'bg-rose-500',
              borderColor: 'border-rose-600',
              description: 'Provides moral and spiritual guidance (Common in mission-based schools).',
            }
          ]
        }
      ]
    }
  ]
};

const DEPARTMENTS = [
  {
    name: 'Academic Principal',
    icon: GraduationCap,
    roles: ['UAIMS Teachers', 'Pre-School Teachers', 'Primary Teachers'],
    color: 'border-blue-500'
  },
  {
    name: 'Academic Affairs & HR',
    icon: Users,
    roles: ['Development Manager', 'Monitoring & Evaluation', 'Liaison Officer (MoEYS)'],
    color: 'border-emerald-500'
  },
  {
    name: 'Finance Department',
    icon: Landmark,
    roles: ['Chief Accountant', 'Cashier/Clerk', 'Internal Auditor'],
    color: 'border-amber-500'
  },
  {
    name: 'Facilities & Operations',
    icon: Layout,
    roles: ['Maintenance Team', 'Security', 'Matron/Cook'],
    color: 'border-purple-500'
  },
  {
    name: 'Marketing & Community',
    icon: Globe,
    roles: ['Fundraising Manager', 'Social Media', 'Admissions'],
    color: 'border-indigo-500'
  }
];

const WORKFLOWS = [
  {
    id: 'moeys-liaison',
    title: 'MoEYS Liaison Process',
    description: 'Critical coordination with District and Provincial Offices of Education (POE/DOE).',
    steps: [
      { id: '1', title: 'Compliance Check', desc: 'Liaison Officer reviews MOE standards.' },
      { id: '2', title: 'Data Prep', desc: 'Registrar prepares student/staff statistics.' },
      { id: '3', title: 'Submission', desc: 'Formal reporting to DOE/POE.' },
      { id: '4', title: 'Inspection', desc: 'Hosting provincial inspectors periodically.' }
    ]
  },
  {
    id: 'admission',
    title: 'Admission Workflow (Nursery - G12)',
    description: 'Standard student onboarding and placement sequence.',
    steps: [
      { id: 'a1', title: 'Inquiry', desc: 'Parent initial contact with Marketing/Admissions.' },
      { id: 'a2', title: 'Assessment', desc: 'Academic Principal oversees placement testing.' },
      { id: 'a3', title: 'Finance', desc: 'Tuition agreement and initial deposit.' },
      { id: 'a4', title: 'Enrollment', desc: 'Registrar creates official student record.' }
    ]
  }
];

export function OrgChart() {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'workflow'>('hierarchy');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const renderNode = (node: OrgNodeProps) => (
    <div key={node.id} className="flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        className={cn(
          "relative w-72 p-4 rounded-2xl border-4 shadow-xl transition-all duration-300 z-10",
          node.colorClass,
          node.borderColor,
          hoveredNode === node.id ? "scale-105 shadow-2xl -translate-y-2" : ""
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <node.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-white font-black text-sm leading-tight">{node.title}</h4>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{node.role}</span>
          </div>
        </div>
        <AnimatePresence>
          {hoveredNode === node.id && node.description && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-white/10"
            >
              <p className="text-[10px] text-white/80 font-medium leading-relaxed italic">
                {node.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {node.subNodes && node.subNodes.length > 0 && (
        <div className="flex flex-col items-center mt-8 relative">
          <div className="absolute top-[-30px] w-1 h-[30px] bg-slate-200" />
          <div className="flex gap-8">
            {node.subNodes.map(renderNode)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Layers className="w-10 h-10 text-blue-600" />
            School Organization
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Standard Cambodian International & Private School Structure</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('hierarchy')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'hierarchy' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Building size={16} />
            Governance Hierarchy
          </button>
          <button 
            onClick={() => setActiveTab('workflow')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'workflow' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Clock size={16} />
            Work Flow Chart
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'hierarchy' ? (
          <motion.div 
            key="hierarchy"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-12"
          >
            {/* Top Tier Hierarchy */}
            <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-200 overflow-x-auto min-w-full flex items-center justify-center">
              <div className="py-8">
                {renderNode(ORG_DATA)}
              </div>
            </div>

            {/* Department Level */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {DEPARTMENTS.map((dept, idx) => (
                <motion.div 
                  key={dept.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "bg-white p-6 rounded-[2rem] border-2 shadow-sm relative group hover:shadow-xl transition-all",
                    dept.color
                  )}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <dept.icon className="w-6 h-6 text-slate-800" />
                  </div>
                  <h3 className="font-black text-slate-900 text-sm leading-tight mb-4">{dept.name}</h3>
                  <div className="space-y-3">
                    {dept.roles.map(role => (
                      <div key={role} className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-[10px] font-bold text-slate-600 leading-tight">{role}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Academic Student-Facing Hierarchy */}
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <GraduationCap className="text-blue-400" />
                Academic Student-Facing Structure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                  <div className="inline-block p-3 bg-blue-500/20 rounded-2xl mb-4">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-black text-lg mb-4 italic">Kindergarten to Primary</h4>
                  <ul className="space-y-3">
                    {['Nursery, K1, K2, K3', 'Primary School Supervisor', 'Class Advisers (G1-G6)', 'Student Council (Primary)'].map((item, idx) => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-full text-[10px] font-black">{idx + 1}</span>
                        <span className="text-sm font-medium text-white/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                   <div className="inline-block p-3 bg-emerald-500/20 rounded-2xl mb-4">
                    <BookOpen className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="font-black text-lg mb-4 italic">Secondary Level (G7-G12)</h4>
                  <ul className="space-y-3">
                    {['Subject Specialists', 'Level Coordinators', 'Exams Officer', 'Prefect Board'].map((item, idx) => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-full text-[10px] font-black">{idx + 1}</span>
                        <span className="text-sm font-medium text-white/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                   <div className="inline-block p-3 bg-amber-500/20 rounded-2xl mb-4">
                    <Landmark className="w-6 h-6 text-amber-400" />
                  </div>
                  <h4 className="font-black text-lg mb-4 italic">Language School (K-E-T)</h4>
                  <ul className="space-y-3">
                    {['Khmer Language Supervisor', 'English/ESL Supervisor', 'Assistant Teachers', 'Language Support Staff'].map((item, idx) => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded-full text-[10px] font-black">{idx + 1}</span>
                        <span className="text-sm font-medium text-white/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="workflow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {WORKFLOWS.map((workflow) => (
                <div key={workflow.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-2 italic tracking-tight">{workflow.title}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8">{workflow.description}</p>
                  
                  <div className="space-y-6 relative ml-4">
                    <div className="absolute left-[11px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-200" />
                    {workflow.steps.map((step, idx) => (
                      <div key={step.id} className="flex gap-6 relative">
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10 transition-transform group-hover:scale-110",
                          idx === 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-2 border-slate-200 text-slate-400"
                        )}>
                          {idx + 1}
                        </div>
                        <div className="pb-4">
                          <h4 className="font-black text-slate-900 text-sm">{step.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-xs">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-slate-50 rounded-2xl flex items-center gap-4 border border-slate-100">
                    <div className="bg-emerald-500/10 p-2 rounded-xl">
                       <ShieldCheck className="text-emerald-500" size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase">Process Integrity</p>
                      <p className="text-[10px] text-slate-500 font-medium">Verified by Quality Assurance & Academic Affairs</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-emerald-600 p-10 rounded-[3rem] text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-black mb-2">Technical & Support Workflow</h3>
                  <p className="text-emerald-100 text-sm leading-relaxed">
                    At the base of our chart, specialized support ensures the daily functional environment. 
                    From IT infrastructure managing digital tools to specialized maintenance teams assigned 
                    to specific wings (Electricity, Plumbing, Grounds).
                  </p>
                </div>
                <div className="flex gap-4">
                   <div className="bg-white/10 p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-2 min-w-[140px] hover:bg-white/20 transition-all cursor-pointer">
                      <Database className="w-8 h-8" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">IT Support</span>
                   </div>
                   <div className="bg-white/10 p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-2 min-w-[140px] hover:bg-white/20 transition-all cursor-pointer">
                      <PenTool className="w-8 h-8" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">Equipment</span>
                   </div>
                   <div className="bg-white/10 p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-2 min-w-[140px] hover:bg-white/20 transition-all cursor-pointer">
                      <Settings className="w-8 h-8" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">Maintenance</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] flex flex-col gap-4">
           <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <AlertCircle size={24} />
           </div>
           <h4 className="font-black text-blue-900 text-lg italic">Cambodia Context Tip</h4>
           <p className="text-blue-800/70 text-xs leading-relaxed font-medium">
             Ensure the **Liaison Officer** (under Academic Affairs) is clearly defined. 
             They handle critical relationships with District and Provincial Offices of Education 
             responsible for accreditation and statistics.
           </p>
           <button className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mt-2 hover:translate-x-2 transition-transform">
             Learn More About MoEYS Compliance <ArrowRight size={14} />
           </button>
        </div>

        <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] flex flex-col gap-4">
           <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={24} />
           </div>
           <h4 className="font-black text-emerald-900 text-lg italic">Strategic Planning</h4>
           <p className="text-emerald-800/70 text-xs leading-relaxed font-medium">
             The Board of Directors sets the annual Strategic Goal. The Chief Executive 
             translates this into Operational Budgets and Personnel KPIs that flow down to 
             Principal and Principal levels.
           </p>
           <button className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-2 hover:translate-x-2 transition-transform">
             View Strategic KPIs <ArrowRight size={14} />
           </button>
        </div>

        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col gap-4 text-white">
           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Users size={24} />
           </div>
           <h4 className="font-black text-white text-lg italic">Parent Pickup Workflow</h4>
           <p className="text-white/60 text-xs leading-relaxed font-medium">
             Security Guards and Admissions work closely on the "Authorized Guardian" verification flow. 
             A dedicated system verifies QR codes for every student departure from Nursery to G6.
           </p>
           <button className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest mt-2 hover:translate-x-2 transition-transform">
             Go to Security Mgnt <ArrowRight size={14} />
           </button>
        </div>
      </div>
    </div>
  );
}

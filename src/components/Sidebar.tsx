import React, { useState } from 'react';
import { LayoutDashboard, Users, CalendarCheck, GraduationCap, MessageSquare, Settings as SettingsIcon, LogOut, Menu, X, Bell, ChevronRight, Search, School, Calendar, List, Layers, Home, ChevronDown, UserCircle, UserPlus, Contact, Briefcase, Building, Clock, MapPin, TrendingUp, CreditCard, Tag, Shield, Globe, Smartphone, PieChart, BarChart3, Monitor, Bot, BookOpen, Cloud, Image, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

import { getAuthInstance } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (state: boolean) => void;
  userRole: 'admin' | 'teacher' | 'student' | 'parent';
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent'] },
  { 
    id: 'school', 
    label: 'School', 
    icon: School,
    roles: ['admin', 'teacher'],
    subItems: [
      { id: 'academic-year', label: 'Academic Year', icon: Calendar },
      { id: 'main-program', label: 'Main Program', icon: List },
      { id: 'sub-program', label: 'Sub Program', icon: List },
      { id: 'proficiency-level', label: 'Proficiency Level', icon: Layers },
      { id: 'room', label: 'Room', icon: Home },
      { id: 'live-topology', label: 'Live Topology', icon: Monitor },
      { id: 'grade-level', label: 'Grade / Level', icon: Layers },
      { id: 'create-class', label: 'Create Class', icon: School },
      { id: 'class-period', label: 'Class Period', icon: Clock },
      { id: 'floor', label: 'Floor', icon: Layers },
      { id: 'school-group', label: 'Group', icon: Users },
      { id: 'org-chart', label: 'Hierarchy & Workflow', icon: Layers },
      { id: 'curriculum-audit', label: 'Curriculum Audit', icon: BookOpen },
      { id: 'curriculum-lessons', label: 'Curriculum & Lessons', icon: BookOpen },
    ]
  },
  { 
    id: 'student-mgnt', 
    label: 'Student', 
    icon: Users,
    roles: ['admin', 'teacher'],
    subItems: [
      { id: 'family-profile', label: 'Family Profile', icon: Users },
      { id: 'student-profile', label: 'Student Profile', icon: GraduationCap },
      { id: 'student-enrollment', label: 'Student Enrollment', icon: UserPlus },
      { id: 'student-promotion', label: 'Student Promotion', icon: TrendingUp },
      { id: 'student-graduated', label: 'Student Graduated', icon: GraduationCap },
      { id: 'student-dropout', label: 'Student Dropout', icon: X },
      { id: 'student-suspended', label: 'Student Suspended', icon: Bell },
      { id: 'scholarship', label: 'Scholarship', icon: GraduationCap },
      { id: 'id-builder', label: 'ID Card Builder', icon: CreditCard },
      { id: 'photo-editor', label: 'Batch Photo Utility', icon: Image },
    ]
  },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'teacher', 'student', 'parent'] },
  { id: 'grades', label: 'Gradebook', icon: GraduationCap, roles: ['admin', 'teacher', 'student', 'parent'] },
  { 
    id: 'operations', 
    label: 'Operations', 
    icon: LayoutDashboard,
    roles: ['admin', 'teacher'],
    subItems: [
      { id: 'projects', label: 'Project Mgnt', icon: Briefcase },
      { id: 'work-flow', label: 'Work Flow Board', icon: List },
    ]
  },
  {
    id: 'auxiliary',
    label: 'Auxiliary Services',
    icon: Home,
    roles: ['admin', 'teacher', 'student', 'parent'],
    subItems: [
      { id: 'daycare-mgnt', label: 'Daycare Management', icon: Home },
      { id: 'food-mgnt', label: 'Food & Nutrition', icon: Tag },
      { id: 'transport-mgnt', label: 'Transport / Car Delivery', icon: MapPin },
    ]
  },
  { 
    id: 'employee-mgnt', 
    label: 'Employee', 
    icon: Contact,
    roles: ['admin'],
    subItems: [
      { id: 'employee-profile', label: 'Staff Profile', icon: UserCircle },
      { id: 'employee-attendance', label: 'Attendance & Leave', icon: Clock },
      { id: 'employee-position', label: 'Positions', icon: Briefcase },
      { id: 'employee-department', label: 'Departments', icon: Building },
      { id: 'public-holiday', label: 'Public Holiday', icon: Calendar },
    ]
  },
  { id: 'workspace-hub', label: 'Workspace Hub', icon: Cloud, roles: ['admin', 'teacher', 'student', 'parent'] },
  { id: 'communication', label: 'Communication', icon: MessageSquare, roles: ['admin', 'teacher', 'student', 'parent'] },
  { 
    id: 'finance', 
    label: 'Finance & Fees', 
    icon: Bell,
    roles: ['admin', 'parent'],
    subItems: [
      { id: 'finance-payment', label: 'Payment', icon: CreditCard },
      { id: 'finance-service', label: 'Service & Catalog', icon: Tag },
      { id: 'finance-accounting', label: 'Accounting (Income/Exp)', icon: BarChart3 },
    ]
  },
  { 
    id: 'experience-web', 
    label: 'Experience & Web', 
    icon: Globe,
    roles: ['admin', 'teacher', 'student', 'parent'],
    subItems: [
      { id: 'website-mgnt', label: 'News & Events', icon:Globe },
      { id: 'test-digital-card', label: 'Test Digital Card', icon: Smartphone, roles: ['student'] },
      { id: 'checkin-me-theme', label: 'Check-in Me Theme', icon: Smartphone, roles: ['student', 'teacher'] },
    ]
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: SettingsIcon,
    roles: ['admin', 'teacher', 'student', 'parent'],
    subItems: [
      { id: 'user-profile', label: 'User Profile', icon: UserCircle },
      { id: 'user-role', label: 'User Role', icon: Users, roles: ['admin'] },
      { id: 'role-access', label: 'Role Access', icon: Shield, roles: ['admin'] },
      { id: 'bot-settings', label: 'Bot Settings', icon: Bot, roles: ['admin'] },
      { id: 'system-settings', label: 'System Settings', icon: SettingsIcon, roles: ['admin'] },
      { id: 'activity-log', label: 'Activity Log', icon: Activity, roles: ['admin'] },
      { id: 'page-mgnt', label: 'Page', icon: List, roles: ['admin'] },
    ]
  },
];

export function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, userRole }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState<string[]>(['school', 'student-mgnt', 'settings']);

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleLogout = async () => {
    localStorage.removeItem('demo_user');
    const auth = await getAuthInstance();
    if (auth) {
      await signOut(auth);
    }
    window.location.href = '/';
  };

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  ).map(item => ({
    ...item,
    subItems: item.subItems?.filter(si => !si.roles || si.roles.includes(userRole))
  }));

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="bg-[#0f172a] text-slate-300 h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-slate-800"
    >
      <div className="p-6 flex items-center justify-between overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-800 shadow-sm">
                <img src="https://psisvh.vercel.app/logo.png" alt="PSIS-VH Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">PSIS-VH</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => (
          <div key={item.id}>
            {item.subItems && item.subItems.length > 0 ? (
              <div className="space-y-1">
                <button
                  onClick={() => !isCollapsed && toggleMenu(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group",
                    (activeTab.startsWith(item.id) || item.subItems.some(si => si.id === activeTab))
                      ? "text-blue-400 font-medium" 
                      : "hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={cn(
                      (activeTab.startsWith(item.id) || item.subItems.some(si => si.id === activeTab)) ? "text-blue-500" : "group-hover:text-blue-400"
                    )} />
                    {!isCollapsed && <span className="text-sm">{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown size={14} className={cn(
                      "transition-transform",
                      openMenus.includes(item.id) ? "rotate-0" : "-rotate-90"
                    )} />
                  )}
                </button>
                <AnimatePresence>
                  {!isCollapsed && openMenus.includes(item.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-1 ml-4"
                    >
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => setActiveTab(subItem.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group text-slate-400 text-xs",
                            activeTab === subItem.id 
                              ? "bg-blue-600/10 text-blue-400 font-medium" 
                              : "hover:bg-slate-800/50 hover:text-white"
                          )}
                        >
                          <subItem.icon size={14} />
                          <span>{subItem.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : !item.subItems ? (
              <button
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                  activeTab === item.id 
                    ? "bg-blue-600/10 text-blue-400 font-medium" 
                    : "hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn(activeTab === item.id ? "text-blue-500" : "group-hover:text-blue-400")} />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                  />
                )}
              </button>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm">Log Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}

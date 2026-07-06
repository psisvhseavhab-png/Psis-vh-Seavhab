/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Attendance } from './components/Attendance';
import { Gradebook } from './components/Gradebook';
import { AcademicYearMgnt } from './components/School/AcademicYearMgnt';
import { MainProgramMgnt } from './components/School/MainProgramMgnt';
import { SubProgramMgnt } from './components/School/SubProgramMgnt';
import { RoomMgnt } from './components/School/RoomMgnt';
import { ProficiencyLevelMgnt } from './components/School/ProficiencyLevelMgnt';
import { GradeLevelMgnt } from './components/School/GradeLevelMgnt';
import { ClassMgnt } from './components/School/ClassMgnt';
import { ClassPeriodMgnt } from './components/School/ClassPeriodMgnt';
import { FamilyMgnt } from './components/FamilyMgnt';
import { ScholarshipMgnt } from './components/ScholarshipMgnt';
import { StudentEnrollment } from './components/StudentEnrollment';
import { FinanceMgnt } from './components/FinanceMgnt';
import { EmployeeMgnt } from './components/EmployeeMgnt';
import { PublicHolidayMgnt } from './components/PublicHolidayMgnt';
import { StudentStatusMgnt } from './components/StudentStatusMgnt';
import { TableMgnt } from './components/TableMgnt';
import { CommunicationMgnt } from './components/CommunicationMgnt';
import { ServiceMgnt } from './components/Finance/ServiceMgnt';
import { EmployeeAttendance } from './components/EmployeeAttendance';
import { UserProfileMgnt } from './components/Settings/UserProfileMgnt';
import { UserRoleMgnt } from './components/Settings/UserRoleMgnt';
import { RoleAccessMgnt } from './components/Settings/RoleAccessMgnt';
import { WebsiteMgnt } from './components/WebsiteMgnt';
import { CardBuilder } from './components/CardBuilder';
import { BatchPhotoEditor } from './components/BatchPhotoEditor';
import { StudentIdCard } from './components/StudentIdCard';
import { OrgChart } from './components/OrgChart';
import { TaskBoard } from './components/TaskBoard';
import { ProjectMgnt } from './components/ProjectMgnt';
import { AccountingMgnt } from './components/Finance/AccountingMgnt';
import { AuxiliaryMgnt } from './components/School/AuxiliaryMgnt';
import { SystemSettings } from './components/Settings/SystemSettings';
import { BotSettings } from './components/Settings/BotSettings';
import { ActivityLog } from './components/ActivityLog';
import { LiveTopology } from './components/School/LiveTopology';
import { CheckInMeLayout } from './components/CheckInMe/CheckInMeLayout';
import { Home as CheckInMeHome } from './components/CheckInMe/Home';
import { Attendance as CheckInMeAttendance } from './components/CheckInMe/Attendance';
import { Notify as CheckInMeNotify } from './components/CheckInMe/Notify';
import { Profile as CheckInMeProfile } from './components/CheckInMe/Profile';
import { PublicWebsite } from './components/PublicWebsite';
import { CurriculumAudit } from './components/CurriculumAudit';
import { TeacherCurriculumMgnt } from './components/TeacherCurriculumMgnt';
import { WorkspaceHub } from './components/WorkspaceHub';
import { Login } from './components/Login';
import { BrowserAssistant } from './components/BrowserAssistant';
import { MessageSquare, Settings as SettingsIcon, CreditCard, Award, TrendingUp, Tag, Globe, Smartphone } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getAuthInstance, getDb, handleFirestoreError, OperationType } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [layoutTheme, setLayoutTheme] = useState<'default' | 'check-in-me' | 'digital-card'>('default');
  const [checkInMeTab, setCheckInMeTab] = useState('home');
  const [digitalStudent, setDigitalStudent] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'teacher' | 'student' | 'parent' | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const navigateToStudentModule = (tab: string, studentId?: string) => {
    if (studentId) setSelectedStudentId(studentId);
    setActiveTab(tab);
  };

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab) {
        if (customEvent.detail.studentId) {
          setSelectedStudentId(customEvent.detail.studentId);
        }
        setActiveTab(customEvent.detail.tab);
      }
    };
    window.addEventListener('navigateTab', handleNavigate);
    return () => window.removeEventListener('navigateTab', handleNavigate);
  }, []);

  useEffect(() => {
    let unsubscribe: any;
    async function initAuth() {
      // Check for demo user first
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        try {
          const parsed = JSON.parse(demoUser);
          setUser(parsed);
          setRole(parsed.role || 'admin');
          setAuthLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('demo_user');
        }
      }

      const auth = await getAuthInstance();
      if (!auth) {
        setAuthLoading(false);
        return;
      }
      unsubscribe = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          // Hardcoded super admin as requested
          if (u.email === 'sopheakpat01@gmail.com' || u.email === 'admin@psisvh.edu' || u.email === 'admin@xau.news') {
            setRole('admin');
          } else {
            try {
              const db = await getDb();
              if (db) {
                const docRef = doc(db, 'users', u.uid);
                try {
                  const userDoc = await getDoc(docRef);
                  if (userDoc.exists()) {
                    setRole(userDoc.data().role);
                  } else {
                    setRole('student'); 
                  }
                } catch (err) {
                  handleFirestoreError(err, OperationType.GET, 'users/' + u.uid);
                }
              }
            } catch (e) {
              console.error("Error fetching user role:", e);
              setRole('student');
            }
          }
        }
        setAuthLoading(false);
      }, (err) => {
        console.warn("Firebase Auth state observation failed. Fallback or unconfigured system active.", err);
        setAuthLoading(false);
      });
    }
    initAuth();
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/website/studentid/')) {
      const slug = path.replace('/website/studentid/', '');
      const match = slug.match(/^([A-Z0-9]+?)([A-Z].*)$/);
      let id = slug.substring(0, 6);
      let name = slug.substring(6);
      if (match) { id = match[1]; name = match[2]; }
      const formattedName = name.replace(/([A-Z])/g, ' $1').trim();
      setDigitalStudent({
        id: id,
        name: formattedName || 'Digital Student',
        class: 'Grade 12-A',
        gender: 'Male',
        profilePic: '',
        status: id === '202488' ? 'warning' : 'active',
        paymentStatus: id === '202488' ? 'unpaid' : 'paid',
        violationCount: id === '202488' ? 2 : 0
      });
      setLayoutTheme('digital-card');
    }

    if (activeTab === 'test-digital-card') {
      setLayoutTheme('digital-card');
      setActiveTab('dashboard');
    } else if (activeTab === 'checkin-me-theme') {
      setLayoutTheme('check-in-me');
      setActiveTab('dashboard');
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'student-profile':
      case 'students': return <Students setActiveTab={navigateToStudentModule} selectedStudentId={selectedStudentId} />;
      case 'student-enrollment': return <StudentEnrollment />;
      case 'academic-year': return <AcademicYearMgnt />;
      case 'main-program': return <MainProgramMgnt />;
      case 'sub-program': return <SubProgramMgnt />;
      case 'proficiency-level': return <ProficiencyLevelMgnt />;
      case 'grade-level': return <GradeLevelMgnt />;
      case 'room': return <RoomMgnt />;
      case 'system-settings': return <SystemSettings />;
      case 'activity-log': return <ActivityLog />;
      case 'bot-settings': return <BotSettings />;
      case 'live-topology': return <LiveTopology />;
      case 'create-class': return <ClassMgnt />;
      case 'class-period': return <ClassPeriodMgnt />;
      case 'floor': return <TableMgnt type="floor" />;
      case 'school-group': return <TableMgnt type="group" />;
      case 'attendance': return <Attendance studentId={selectedStudentId} />;
      case 'grades': return <Gradebook studentId={selectedStudentId} />;
      case 'projects': return <ProjectMgnt />;
      case 'work-flow': return <TaskBoard />;
      case 'daycare-mgnt': return <AuxiliaryMgnt type="daycare" />;
      case 'food-mgnt': return <AuxiliaryMgnt type="food" />;
      case 'transport-mgnt': return <AuxiliaryMgnt type="transport" />;
      case 'student-promotion': return <StudentStatusMgnt type="promotion" />;
      case 'student-graduated': return <StudentStatusMgnt type="promotion" />;
      case 'student-dropout': return <StudentStatusMgnt type="dropout" />;
      case 'student-suspended': return <StudentStatusMgnt type="suspended" />;
      case 'employee-profile':
      case 'employee-position':
      case 'employee-department': return <EmployeeMgnt />;
      case 'employee-attendance': return <EmployeeAttendance />;
      case 'public-holiday': return <PublicHolidayMgnt />;
      case 'communication': return <CommunicationMgnt />;
      case 'family-profile': return <FamilyMgnt studentId={selectedStudentId} />;
      case 'scholarship': return <ScholarshipMgnt />;
      case 'finance':
      case 'finance-payment': return <FinanceMgnt />;
      case 'finance-service': return <ServiceMgnt />;
      case 'finance-accounting': return <AccountingMgnt />;
      case 'user-profile': return <UserProfileMgnt />;
      case 'user-role': return <UserRoleMgnt />;
      case 'role-access': return <RoleAccessMgnt />;
      case 'curriculum-audit': return <CurriculumAudit />;
      case 'curriculum-lessons': return <TeacherCurriculumMgnt />;
      case 'workspace-hub': return <WorkspaceHub />;
      case 'website-mgnt': return <WebsiteMgnt />;
      case 'id-builder': return <CardBuilder />;
      case 'photo-editor': return <BatchPhotoEditor />;
      case 'org-chart': return <OrgChart />;
      case 'settings': return (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Branding & Identity</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">School Name</label>
                  <input type="text" defaultValue="PSIS VH Management System" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      default: return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
          <p className="text-slate-500 max-w-sm mt-2">This module is under development to match the legacy WIS Cambodia system.</p>
        </div>
      );
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-black italic uppercase text-slate-400 animate-pulse">Initializing Portal...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (layoutTheme === 'digital-card' && digitalStudent) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center text-white">
          <h2 className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-2">Digital Student ID Card</h2>
          <p className="text-slate-400 text-sm">Official PSIS-VH Student Verification</p>
        </div>
        <StudentIdCard student={digitalStudent} type="digital" />
        <div className="mt-12 flex gap-4">
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Verification link copied to clipboard!'); }} className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40">
            <Smartphone className="w-4 h-4" /> Copy Verification Link
          </button>
          <button onClick={() => setLayoutTheme('default')} className="px-6 py-2 border border-slate-700 text-slate-400 rounded-full hover:bg-slate-800 transition-colors text-sm font-bold"> Exit Verification View </button>
        </div>
      </div>
    );
  }

  if (layoutTheme === 'check-in-me') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 sm:p-8">
        <CheckInMeLayout activeTab={checkInMeTab} onTabChange={setCheckInMeTab} onExit={() => setLayoutTheme('default')}>
          {checkInMeTab === 'home' && <CheckInMeHome />}
          {checkInMeTab === 'benefit' && <CheckInMeAttendance />}
          {checkInMeTab === 'notify' && <CheckInMeNotify />}
          {checkInMeTab === 'profile' && <CheckInMeProfile />}
        </CheckInMeLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} userRole={role || 'student'} />
      <BrowserAssistant />
      <main className="flex-1 transition-all duration-300" style={{ marginLeft: isCollapsed ? '80px' : '260px' }}>
        <Header />
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicWebsite />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<MainLayout />} />
        {/* Backward compatibility for verification links */}
        <Route path="/website/*" element={<MainLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}


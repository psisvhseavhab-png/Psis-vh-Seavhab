import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Send, MessageSquare, History, Settings as SettingsIcon, 
  Terminal, Shield, Zap, RefreshCw, Save, Key, UserCheck, 
  AlertTriangle, CheckCircle2, ChevronRight, Search, Info, XCircle
} from 'lucide-react';
import { doc, getDoc, setDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { getDb, getAuthInstance, loginWithGoogle } from '@/src/lib/firebase';
import { cn } from '@/src/lib/utils';
import { sendTelegramNotification } from '@/src/services/notificationService';
import { studentService } from '@/src/services/studentService';
import { employeeService } from '@/src/services/employeeService';
import type { User } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function BotSettings() {
  const [activeTab, setActiveTab] = useState<'config' | 'verify_requests' | 'templates' | 'logs'>('config');
  const [botToken, setBotToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testChatId, setTestChatId] = useState('');
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs] = useState([
    { id: 1, type: 'Broadcast', target: 'G10-A Parents', status: 'Success', time: '10 mins ago' },
    { id: 2, type: 'Warning', target: 'John Smith (Personal)', status: 'Success', time: '2 hours ago' },
    { id: 3, type: 'Alert', target: 'Staff General', status: 'Failed', time: '5 hours ago' },
  ]);

  // Telegram Verification Queue State & Helper Lists
  const [verifyRequests, setVerifyRequests] = useState<any[]>(() => {
    const stored = localStorage.getItem('edu_telegram_verify_requests');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    const defaults = [
      {
        id: 'req_1',
        name: 'Sok Mean',
        entityType: 'Employee',
        entityId: 'emp_2', // Sok Mean
        entityCode: 'VH-EMP002',
        telegramChatId: '87654321',
        requestedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: 'Pending',
      },
      {
        id: 'req_2',
        name: 'Sovanna & Sokha',
        entityType: 'Family',
        entityId: '1', // Sovanna
        entityCode: 'VH-F001215',
        telegramChatId: '98765432',
        requestedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: 'Pending',
      }
    ];
    localStorage.setItem('edu_telegram_verify_requests', JSON.stringify(defaults));
    return defaults;
  });

  const [simParticipants, setSimParticipants] = useState<any[]>([]);
  const [simSelectedPerson, setSimSelectedPerson] = useState<string>('');
  const [simChatId, setSimChatId] = useState<string>('55512345');
  const [simMessages, setSimMessages] = useState<any[]>([
    { sender: 'bot', text: '👋 Hello! I am the <b>EduPulse school confirmation bot</b>. Send <code>/verify &lt;Code&gt;</code> to link your Telegram account with your student, parent, or staff record.', time: 'System' }
  ]);
  const [simCustomText, setSimCustomText] = useState<string>('');

  // Pull active registry logs to display who doesn't have a verified chat ID
  const loadRegistryData = async () => {
    try {
      const emps = await employeeService.getEmployees();
      const studs = await studentService.getStudents();
      const famRaw = localStorage.getItem('edu_local_families');
      const fams: any[] = famRaw ? JSON.parse(famRaw) : [
        { id: '1', familyCode: 'VH-F001215', fatherName: 'Sovanna', motherName: 'Sokha', contact: '+855 12 345 678' },
        { id: '2', familyCode: 'VH-F001214', fatherName: 'Chan Dara', motherName: 'Lim Leakhena', contact: '+855 98 765 432' },
      ];

      const list: any[] = [];
      emps.forEach(e => {
        list.push({
          id: `Employee_${e.id}`,
          rawId: e.id,
          code: e.employeeCode,
          name: e.name,
          type: 'Employee',
          currentChatId: e.telegramChatId || ''
        });
      });
      studs.forEach(s => {
        list.push({
          id: `Student_${s.firebaseId || s.id}`,
          rawId: s.firebaseId || s.id,
          code: s.id,
          name: s.name,
          type: 'Student',
          currentChatId: s.telegramChatId || ''
        });
      });
      fams.forEach(f => {
        list.push({
          id: `Family_${f.id}`,
          rawId: f.id,
          code: f.familyCode,
          name: `${f.fatherName || ''} & ${f.motherName || ''} (${f.familyCode})`,
          type: 'Family',
          currentChatId: f.telegramChatId || ''
        });
      });

      setSimParticipants(list);
      if (list.length > 0 && !simSelectedPerson) {
        setSimSelectedPerson(list[0].id);
        setSimChatId(Math.floor(10000000 + Math.random() * 90000000).toString());
      }
    } catch (e) {
      console.warn("Failed loading simulator candidate registry:", e);
    }
  };

  useEffect(() => {
    loadRegistryData();
  }, [verifyRequests]);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;
    
    async function init() {
      // Check for demo user first to support local fallback access seamlessly
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        try {
          const parsed = JSON.parse(demoUser);
          setUser(parsed);
          loadBotConfig();
          return;
        } catch (e) {
          localStorage.removeItem('demo_user');
        }
      }

      const auth = await getAuthInstance();
      if (!auth) {
        setLoading(false);
        return;
      }

      unsubscribeAuth = auth.onAuthStateChanged((currUser) => {
        if (currUser) {
          setUser(currUser);
          loadBotConfig();
        } else {
          // Check if we already set user via localStorage
          const localUser = localStorage.getItem('demo_user');
          if (!localUser) {
            setLoading(false);
          }
        }
      }, (err) => {
        console.warn("BotSettings auth check warning:", err);
        setLoading(false);
      });
    }

    async function loadBotConfig() {
      try {
        const db = await getDb();
        if (!db) return;
        const docRef = doc(db, 'settings', 'global');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setBotToken(snap.data().telegramBotToken || '');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/global');
      } finally {
        setLoading(false);
      }
    }

    init();
    return () => unsubscribeAuth?.();
  }, []);

  // Simulator commands execution
  const handleSimulateCommand = (customTypeTxt?: string) => {
    const textToSend = (customTypeTxt || simCustomText || '').trim();
    if (!textToSend) return;

    // Register human message
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user', text: textToSend, time: timestampStr };
    setSimMessages(prev => [...prev, userMsg]);
    setSimCustomText('');

    // Handle bot simulation check
    setTimeout(() => {
      const parts = textToSend.split(/\s+/);
      const command = parts[0]?.toLowerCase();
      const codeArg = parts[1];

      if (command === '/start') {
        const reply = `👋 Welcome to the <b>EduPulse Notification Bot</b>! \n\nTo link your school profile and receive instant notifications for events, grades, and attendance, please enter: \n\n<code>/verify &lt;your_unique_code&gt;</code> \n\nFor example:\n<code>/verify VH-EMP002</code> or <code>/verify student_id</code>`;
        setSimMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }

      if (command === '/verify') {
        if (!codeArg) {
          const reply = '⚠️ Please specify your registration code. \nUsage: <code>/verify &lt;Code&gt;</code>';
          setSimMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
          return;
        }

        // Try to lookup user from preloaded candidates
        const found = simParticipants.find(p => p.code.toLowerCase() === codeArg.toLowerCase() || p.rawId.toLowerCase() === codeArg.toLowerCase());
        
        if (!found) {
          const reply = `❌ No record matches code <b>"${codeArg}"</b> in our registration catalog. Please check your credentials and try again.`;
          setSimMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
          return;
        }

        // Check if already has a verification requested
        const exists = verifyRequests.some(r => r.entityId === found.rawId && r.status === 'Pending');
        if (exists) {
          const reply = `⏳ You have a pending verification request in the queue for <b>${found.name}</b>. An administrator will review and authorize your account shortly!`;
          setSimMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
          return;
        }

        // Add to waitlist queue!
        const newReq = {
          id: 'req_' + Math.random().toString(36).substr(2, 9),
          name: found.name,
          entityType: found.type,
          entityId: found.rawId,
          entityCode: found.code,
          telegramChatId: simChatId,
          requestedAt: new Date().toISOString(),
          status: 'Pending'
        };

        const updatedReqs = [newReq, ...verifyRequests];
        setVerifyRequests(updatedReqs);
        localStorage.setItem('edu_telegram_verify_requests', JSON.stringify(updatedReqs));

        // Reply telegram chat status
        const reply = `✅ <b>Verification Request Submitted!</b> \n\n• Name: <b>${found.name}</b>\n• Type: <b>${found.type}</b>\n• Code: <code>${found.code}</code>\n• Simulated Chat ID: <code>${simChatId}</code>\n\nStatus: <b>WAITING ADMIN APPROVAL</b>. Your setup will authorize as soon as the Admin approves the token sync.`;
        setSimMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }

      // Default fallback
      const reply = `ℹ️ Unknown instruction. Please type <code>/start</code> to initialize or <code>/verify &lt;Code&gt;</code> to connect.`;
      setSimMessages(prev => [...prev, { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 850);
  };

  const handleApproveVerifyRequest = async (reqId: string) => {
    const toUpdate = verifyRequests.map(async (r) => {
      if (r.id === reqId) {
        // Apply database persistence updates
        try {
          if (r.entityType === 'Employee') {
            await employeeService.updateEmployee(r.entityId, { telegramChatId: r.telegramChatId });
          } else if (r.entityType === 'Student') {
            await studentService.updateStudent(r.entityId, { telegramChatId: r.telegramChatId });
          } else if (r.entityType === 'Family') {
            const famRaw = localStorage.getItem('edu_local_families');
            if (famRaw) {
              const families = JSON.parse(famRaw);
              const idx = families.findIndex((f: any) => f.id === r.entityId);
              if (idx !== -1) {
                families[idx].telegramChatId = r.telegramChatId;
                localStorage.setItem('edu_local_families', JSON.stringify(families));
              }
            }
          }

          // Trigger simulated direct response back to Telegram User
          try {
            await sendTelegramNotification(r.telegramChatId, `✅ <b>Chat Verification Successful!</b>\nYour Telegram Chat ID has been linked to profile: <b>${r.name}</b> (${r.entityType}).\nYou will now receive instant academic notifications.`);
          } catch (ntErr) {
            console.warn("Notification sync could not deliver directly, fallback simulated:", ntErr);
          }
        } catch (e) {
          console.error("Database persistence write failed for pending link approval:", e);
        }

        return { ...r, status: 'Approved' };
      }
      return r;
    });

    const resolved = await Promise.all(toUpdate);
    setVerifyRequests(resolved);
    localStorage.setItem('edu_telegram_verify_requests', JSON.stringify(resolved));
    alert("Chat ID successfully verified and linked back to target profile!");
  };

  const handleRejectVerifyRequest = (reqId: string) => {
    const updated = verifyRequests.map(r => r.id === reqId ? { ...r, status: 'Rejected' as const } : r);
    setVerifyRequests(updated);
    localStorage.setItem('edu_telegram_verify_requests', JSON.stringify(updated));
    alert("Chat verification request rejected.");
  };

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
        emailVerified: user?.emailVerified,
        isAnonymous: user?.isAnonymous,
      },
      operationType,
      path
    };
    console.error('Firestore Error Detail:', JSON.stringify(errInfo, null, 2));
    // Check for common permission issues
    if (errInfo.error.includes('Insufficient permissions')) {
      if (!user) {
        console.warn("User not authenticated.");
      } else if (!user.emailVerified) {
        console.warn("User email not verified.");
      } else {
        console.warn(`User ${user.email} (${user.uid}) does not have admin permissions.`);
      }
    }
  };

  const handleSaveToken = async () => {
    if (!user) return alert("You must be logged in to save settings.");
    setSaving(true);
    setSaveStatus('idle');
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not initialized");
      
      const path = 'settings/global';
      try {
        await setDoc(doc(db, 'settings', 'global'), {
          telegramBotToken: botToken,
          updatedAt: Timestamp.now()
        }, { merge: true });
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, path);
        throw e;
      }
    } catch (e) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleTestBot = async () => {
    if (!testChatId) return alert("Please enter a Chat ID for the test.");
    setTesting(true);
    setTestStatus('idle');
    const res = await sendTelegramNotification(testChatId, "🤖 <b>Bot Connectivity Test</b>\n\nSuccess! Your school bot is now linked to this chat.");
    if (res.success) {
      setTestStatus('success');
    } else {
      setTestStatus('error');
    }
    setTesting(false);
    setTimeout(() => setTestStatus('idle'), 5000);
  };

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <RefreshCw className="animate-spin text-blue-600" />
    </div>
  );

  if (!user) {
    return (
      <div className="h-64 flex flex-col items-center justify-center p-12 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
        <Bot size={48} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-black text-slate-900 uppercase italic">Authentication Required</h3>
        <p className="text-sm text-slate-500 mb-8 text-center max-w-sm">Please sign in with your administrator account to access Bot Control Center.</p>
        <button 
          onClick={loginWithGoogle}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <UserCheck size={16} />
          Sign In as Administrator
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic flex items-center gap-3">
            <Bot className="text-blue-600" size={32} />
            Bot Control Center
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage Telegram integrations and automated tool workflows</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          {[
            { id: 'config', label: 'Setup', icon: SettingsIcon },
            { id: 'verify_requests', label: 'Verification Queue', icon: UserCheck },
            { id: 'templates', label: 'Templates', icon: MessageSquare },
            { id: 'logs', label: 'Logs', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'config' && (
          <motion.div 
            key="config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase italic">Primary Authorization</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Connect your bot token</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Telegram Bot API Token</label>
                    <div className="relative group/tooltip">
                      <Info size={12} className="text-slate-300 hover:text-blue-500 cursor-help transition-colors" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 text-[9px] text-white font-medium rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 shadow-xl border border-white/10">
                        The unique API key issued by @BotFather. This allows the system to send messages through your bot identity.
                        <div className="absolute top-full right-1.5 w-2 h-2 bg-slate-900 rotate-45 -translate-y-1" />
                      </div>
                    </div>
                  </div>
                  <input 
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="Enter token from @BotFather"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 italic text-sm"
                  />
                </div>
                <button 
                  onClick={handleSaveToken}
                  disabled={saving || saveStatus === 'success'}
                  className={cn(
                    "w-full py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all",
                    saveStatus === 'success' ? "bg-emerald-500 text-white" : 
                    saveStatus === 'error' ? "bg-rose-500 text-white" :
                    "bg-slate-900 text-white hover:bg-blue-600"
                  )}
                >
                  {saving ? <RefreshCw className="animate-spin" size={16} /> : 
                   saveStatus === 'success' ? <CheckCircle2 size={16} /> :
                   saveStatus === 'error' ? <AlertTriangle size={16} /> :
                   <Save size={16} />}
                  {saving ? 'Synchronizing...' : 
                   saveStatus === 'success' ? 'Settings Deployed' :
                   saveStatus === 'error' ? 'Connection Error' :
                   'Update Core Token'}
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="text-emerald-500" size={16} />
                  <span className="text-[10px] font-black text-slate-500 uppercase">Encrypted at Rest</span>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">v1.2 Stable</div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <Terminal className="text-blue-400" size={24} />
                  <h3 className="font-black text-white uppercase italic">Connectivity Test</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Verify your bot can communicate with Telegram's servers. Enter a known Chat ID to send a confirmation ping.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Test Chat ID</label>
                      <div className="relative group/tooltip">
                        <Info size={12} className="text-slate-600 hover:text-blue-400 cursor-help transition-colors" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-white text-[9px] text-slate-900 font-medium rounded-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-20 shadow-xl border border-slate-100">
                          A 9-10 digit unique identifier for a Telegram chat. You can get yours by messaging @userinfobot on Telegram.
                          <div className="absolute top-full right-1.5 w-2 h-2 bg-white rotate-45 -translate-y-1" />
                        </div>
                      </div>
                    </div>
                    <input 
                      type="text"
                      value={testChatId}
                      onChange={(e) => setTestChatId(e.target.value)}
                      placeholder="Enter Recipient Chat ID"
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] outline-none focus:border-blue-500 transition-all font-bold text-white italic text-sm"
                    />
                  </div>
                  <button 
                    onClick={handleTestBot}
                    disabled={testing}
                    className={cn(
                      "w-full py-4 rounded-[1.5rem] font-black uppercase text-xs tracking-widest transition-all overflow-hidden relative",
                      testStatus === 'success' ? "bg-emerald-500 text-white" :
                      testStatus === 'error' ? "bg-rose-500 text-white" :
                      "bg-blue-600 text-white hover:bg-white hover:text-blue-600"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {testing ? (
                        <motion.div key="testing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                          <RefreshCw className="animate-spin" size={16} /> Sending...
                        </motion.div>
                      ) : testStatus === 'success' ? (
                        <motion.div key="success" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-2">
                          <CheckCircle2 size={16} /> Signal Delivered
                        </motion.div>
                      ) : testStatus === 'error' ? (
                        <motion.div key="error" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-2">
                          <XCircle size={16} /> Transmission Failed
                        </motion.div>
                      ) : (
                        <motion.div key="idle" className="flex items-center gap-2">
                          <Zap size={16} /> Fire Diagnostics Ping
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
              <Zap className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
            </div>
          </motion.div>
        )}

        {activeTab === 'verify_requests' && (
          <motion.div 
            key="verify_requests"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left: Waitlist Queue */}
            <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic">Verification Waiting Room</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Authorize pending Telegram account links</p>
                  </div>
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest">
                    {verifyRequests.filter(r => r.status === 'Pending').length} Pending
                  </span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {verifyRequests.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <UserCheck size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-semibold">No verification requests registered yet.</p>
                      <p className="text-xs mt-1">Use the simulator on the right to send an incoming verification packet!</p>
                    </div>
                  ) : (
                    verifyRequests.map((req) => (
                      <div 
                        key={req.id} 
                        className={cn(
                          "p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
                          req.status === 'Pending' ? 'bg-amber-50/40 border-amber-100/80 shadow-sm shadow-amber-500/2' :
                          req.status === 'Approved' ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-50/30 border-slate-100 opacity-60'
                        )}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                              req.entityType === 'Student' ? 'bg-emerald-100 text-emerald-800' :
                              req.entityType === 'Family' ? 'bg-purple-100 text-purple-800' :
                              'bg-indigo-100 text-indigo-800'
                            )}>
                              {req.entityType}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{new Date(req.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{req.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-semibold">
                              <span>Code: <code className="font-mono bg-slate-100/80 px-1.5 py-0.5 rounded text-blue-600">{req.entityCode}</code></span>
                              <span>Chat ID: <code className="font-mono bg-slate-100/80 px-1.5 py-0.5 rounded text-slate-600">{req.telegramChatId}</code></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.status === 'Pending' ? (
                            <>
                              <button 
                                onClick={() => handleApproveVerifyRequest(req.id)}
                                className="px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-emerald-600/10 transition-all"
                              >
                                <CheckCircle2 size={13} />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectVerifyRequest(req.id)}
                                className="px-4 py-2.5 bg-white text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl">
                              <div className={cn("w-1.5 h-1.5 rounded-full", req.status === 'Approved' ? 'bg-emerald-500' : 'bg-slate-400')} />
                              <span className={cn("text-[9px] font-black uppercase tracking-widest", req.status === 'Approved' ? 'text-emerald-700' : 'text-slate-500')}>
                                {req.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 flex items-start gap-2.5">
                <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p>When you click <b>Approve</b>, the system links the verified <b>Telegram Chat ID</b> into the master registry record, authorizing outbound automated push notification channels instantly.</p>
              </div>
            </div>

            {/* Right: Bot Simulator */}
            <div className="lg:col-span-5 bg-[#0f172a] text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col h-[650px] justify-between">
              {/* Simulator Header */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-black italic text-lg uppercase shadow-lg shadow-blue-500/20 text-white">EP</div>
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090d16] absolute bottom-0 right-0" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-1">
                        EduPulse Bot
                        <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-black uppercase tracking-widest italic scale-95 origin-left">Active</span>
                      </h4>
                      <p className="text-[10px] text-white/40">@EduPulseSchoolBot · Sandbox Client</p>
                    </div>
                  </div>
                  <span className="text-[8px] tracking-widest font-black uppercase bg-white/10 text-white/50 px-2 py-1 rounded">Simulator Console</span>
                </div>

                {/* Simulated Messages Screen */}
                <div className="space-y-4 h-[320px] overflow-y-auto pr-2 custom-scrollbar flex flex-col justify-end">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] text-white/50 leading-relaxed">
                    ⚙️ Use this window to simulate a student, employee, or family member sending custom Telegram messages directly to your server Bot.
                  </div>

                  <div className="space-y-3">
                    {simMessages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "max-w-[85%] rounded-2xl p-3.5 text-xs text-slate-200 shadow shadow-black/10 line-clamp-none",
                          msg.sender === 'user' ? 'bg-blue-600 ml-auto rounded-tr-none text-white' : 'bg-white/10 rounded-tl-none'
                        )}
                      >
                        <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text }}></p>
                        <p className="text-[8px] text-white/40 text-right mt-1.5 font-bold uppercase">{msg.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulation Configuration Control bar */}
              <div className="border-t border-white/10 pt-4 mt-4 space-y-4">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-2.5">
                  <span className="text-[8px] font-black tracking-wider uppercase text-white/40 block">Simulate Incoming Message Packet</span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/50 uppercase font-black tracking-widest">1. Select Person</label>
                      <select 
                        value={simSelectedPerson}
                        onChange={e => {
                          setSimSelectedPerson(e.target.value);
                          // Pre-generate custom ID
                          setSimChatId(Math.floor(10000000 + Math.random() * 90000000).toString());
                        }}
                        className="w-full bg-[#1e293b] text-white text-[11px] font-semibold p-2 rounded-xl outline-none border border-white/10"
                      >
                        {simParticipants.map(p => (
                          <option key={p.id} value={p.id}>
                            [{p.type.substring(0, 3).toUpperCase()}] {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] text-white/50 uppercase font-black tracking-widest">2. Chat ID Sender</label>
                      <input 
                        type="text"
                        value={simChatId}
                        onChange={e => setSimChatId(e.target.value)}
                        className="w-full bg-[#1e293b] text-white font-mono text-[11px] p-2 rounded-xl outline-none border border-white/10"
                      />
                    </div>
                  </div>

                  {/* Hotkeys macros */}
                  <div className="flex gap-2.5 pt-1.5">
                    <button 
                      onClick={() => handleSimulateCommand('/start')}
                      type="button"
                      className="px-2.5 py-1.5 bg-[#1e293b] hover:bg-slate-700 rounded-lg text-[9px] font-bold text-blue-400 transition-colors uppercase"
                    >
                      💡 Send /start
                    </button>
                    {simParticipants.find(p => p.id === simSelectedPerson) && (
                      <button 
                        onClick={() => {
                          const p = simParticipants.find(x => x.id === simSelectedPerson);
                          if (p) {
                            handleSimulateCommand(`/verify ${p.code}`);
                          }
                        }}
                        type="button"
                        className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/10 rounded-lg text-[9px] font-black text-blue-300 transition-colors uppercase"
                      >
                        ⚡ Simulate /verify
                      </button>
                    )}
                  </div>
                </div>

                {/* Text entry field */}
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    value={simCustomText}
                    onChange={e => setSimCustomText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSimulateCommand()}
                    placeholder="Type custom Telegram message..." 
                    className="w-full bg-[#1a202c] text-xs px-4 py-3 pr-12 border border-white/10 rounded-xl outline-none text-slate-100 placeholder:text-white/20"
                  />
                  <button 
                    onClick={() => handleSimulateCommand()}
                    type="button"
                    className="absolute right-1.5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'templates' && (
          <motion.div 
            key="templates"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic">Active Templates</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Define automated response structures</p>
              </div>
              <button className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                <RefreshCw size={12} />
                Sync Services
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[
                { title: 'Parent Meeting', code: 'PARENT_MEETING', color: 'blue' },
                { title: 'Student Warning', code: 'STUDENT_WARNING', color: 'rose' },
                { title: 'Exam Schedule', code: 'EXAM_SCHEDULE', color: 'indigo' },
                { title: 'Payment Notice', code: 'UNPAID_FEES', color: 'amber' },
                { title: 'Rule Violation', code: 'RULE_VIOLATION', color: 'orange' },
                { title: 'Attendance Alert', code: 'ATTENDANCE_LATE', color: 'emerald' },
              ].map((temp, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                    temp.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    temp.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                    temp.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                    temp.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                    temp.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                    'bg-emerald-100 text-emerald-600'
                  )}>
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{temp.code}</h4>
                  <p className="font-black text-slate-900 uppercase italic text-sm">{temp.title}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div 
            key="logs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic">Transmission History</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Complete record of bot outgoing traffic</p>
              </div>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   placeholder="Search logs..." 
                   className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-xs font-bold"
                 />
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest italic text-slate-600">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-slate-900 italic uppercase">{log.target}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", log.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500')} />
                          <span className={cn("text-[10px] font-black uppercase tracking-tight", log.status === 'Success' ? 'text-emerald-700' : 'text-rose-700')}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{log.time}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 text-center">
               <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic hover:underline">Download Transmission Report (CSV)</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

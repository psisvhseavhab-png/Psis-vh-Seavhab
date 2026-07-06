import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Smartphone, ShieldCheck, RefreshCw, Key } from 'lucide-react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getDb, getAuthInstance, loginWithGoogle } from '@/src/lib/firebase';
import { cn } from '@/src/lib/utils';
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
  }
}

export function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;

    async function init() {
      // Check for demo user first to support local fallback access seamlessly
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        try {
          const parsed = JSON.parse(demoUser);
          setUser(parsed);
          loadSettings();
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
          loadSettings();
        } else {
          // Check if we already set user via localStorage
          const localUser = localStorage.getItem('demo_user');
          if (!localUser) {
            setLoading(false);
          }
        }
      }, (err) => {
        console.warn("SystemSettings auth check warning:", err);
        setLoading(false);
      });
    }

    async function loadSettings() {
      try {
        const db = await getDb();
        if (!db) return;
        const settingsRef = doc(db, 'settings', 'global');
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          const data = snap.data();
          setBotToken(data.telegramBotToken || '');
          if (data.updatedAt) {
            setLastUpdated((data.updatedAt as Timestamp).toDate());
          }
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

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
        emailVerified: user?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error:', JSON.stringify(errInfo, null, 2));
  };

  const handleSave = async () => {
    if (!user) return alert("Please sign in to modify settings.");
    setSaving(true);
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not initialized");
      
      const settingsRef = doc(db, 'settings', 'global');
      try {
        await setDoc(settingsRef, {
          telegramBotToken: botToken,
          updatedAt: Timestamp.now()
        }, { merge: true });
        
        // Log the system setting update in the Activity Log
        try {
          const { logActivity } = await import('../../utils/activityLogger');
          logActivity(
            'config_change',
            'Updated global system configurations (Telegram Token modified)',
            user.email || 'Super Admin',
            { telegramBotToken: '***masked***' }
          );
        } catch (logErr) {
          console.error(logErr);
        }

        setLastUpdated(new Date());
        alert("Settings saved successfully!");
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'settings/global');
        throw e;
      }
    } catch (error) {
      alert("Failed to save settings. Please ensure you have sufficient permissions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto h-64 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <ShieldCheck size={48} className="text-slate-200 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Admin Authentication Required</h2>
        <p className="text-slate-500 mb-8">Please sign in to manage system-wide parameters.</p>
        <button 
          onClick={loginWithGoogle}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          Authorize as Super Admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-500 italic">Configure global school parameters and external integrations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase italic leading-none">Telegram Integration</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Notification Bot Configuration</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-2 flex items-center gap-2">
                  <Key size={12} />
                  Bot API Token
                </label>
                <div className="relative">
                  <input 
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="Enter your bot token from @BotFather"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 italic text-sm"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic ml-2">
                  Never share your token. This token allows the application to send automated messages to Telegram chat IDs associated with students and staff.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                {lastUpdated ? `Last Sync: ${lastUpdated.toLocaleString()}` : 'Never synchronized'}
              </div>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest italic shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Deploy Settings'}
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <ShieldCheck size={40} className="mb-4 text-emerald-200/50" shrink={0} />
              <h3 className="text-xl font-black uppercase italic leading-tight mb-2">Security Status: Hardened</h3>
              <p className="text-sm text-emerald-100/80 font-medium">
                System settings are only accessible to accounts with the Super Admin role. All changes are logged for auditing purposes.
              </p>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-400">Telegram Bot Setup</h4>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <p className="text-[10px] font-medium leading-relaxed">Message <b>@BotFather</b> on Telegram to create a new bot and receive your API token.</p>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <p className="text-[10px] font-medium leading-relaxed">Paste the token in the API Token field above and click <b>Deploy Settings</b>.</p>
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <p className="text-[10px] font-medium leading-relaxed">Collect <b>Chat IDs</b> from parents and staff to start sending automated notifications.</p>
              </li>
            </ol>
          </div>

          <div className="p-6 border border-slate-200 rounded-[2rem] space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] italic text-slate-400">Integration Logs</h4>
            <div className="space-y-3">
              {[
                { event: 'Token Update', time: '2m ago', status: 'success' },
                { event: 'Notification Sent', time: '1h ago', status: 'success' },
                { event: 'Broadcast Failed', time: '3h ago', status: 'error' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tight text-slate-700">{log.event}</p>
                    <p className="text-[8px] text-slate-400 font-medium uppercase">{log.time}</p>
                  </div>
                  <div className={cn("w-1.5 h-1.5 rounded-full", log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500')} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

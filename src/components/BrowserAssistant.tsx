import React, { useState, useEffect } from 'react';
import { Smartphone, Bell, Download, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { browserNotificationService } from '../services/browserNotificationService';

export function BrowserAssistant() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [notifPermission, setNotifPermission] = useState(Notification.permission);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleEnableNotifications = async () => {
    const granted = await browserNotificationService.requestPermission();
    setNotifPermission(Notification.permission);
    if (granted) {
      browserNotificationService.sendNotification('Notifications Enabled', {
        body: 'You will now receive alerts for staff and guests directly on your screen.'
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 pointer-events-none">
        {/* Install Banner */}
        {showInstallBanner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xl max-w-sm pointer-events-auto"
          >
            <div className="flex gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Smartphone size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">Install Multi-System App</h4>
                <p className="text-sm text-slate-500 mt-1">Add to your home screen for faster access and offline support.</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={16} /> Install Now
                  </button>
                  <button
                    onClick={() => setShowInstallBanner(false)}
                    className="px-3 py-2 text-slate-400 hover:text-slate-600 transition-all font-medium text-sm"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notification Banner */}
        {notifPermission !== 'granted' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl max-w-xs pointer-events-auto border border-white/10"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold">Public Alerts Enabled?</h5>
                <p className="text-xs text-slate-400 mt-1">Get real-time browser alerts for staff and security notifications.</p>
                <button
                  onClick={handleEnableNotifications}
                  className="mt-3 text-xs font-bold text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1"
                >
                  Enable Now <CheckCircle2 size={12} />
                </button>
              </div>
              <button
                onClick={() => setNotifPermission('denied')}
                className="text-slate-500 hover:text-slate-400"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

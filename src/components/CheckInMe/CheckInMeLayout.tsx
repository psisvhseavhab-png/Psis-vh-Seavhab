import React from 'react';
import { motion } from 'motion/react';
import { Home, LayoutGrid, Bell, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CheckInMeLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExit: () => void;
}

export function CheckInMeLayout({ children, activeTab, onTabChange, onExit }: CheckInMeLayoutProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'benefit', icon: LayoutGrid, label: 'Benefit' },
    { id: 'notify', icon: Bell, label: 'Notify' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 w-full overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 pt-6 pb-4 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-10 w-full">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">CM</span>
          {activeTab === 'home' && 'CheckinMe'}
          {activeTab === 'benefit' && 'Benefits'}
          {activeTab === 'notify' && 'NotifiMe'}
          {activeTab === 'profile' && 'ProfileMe'}
        </h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all text-sm font-bold"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Theme</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 w-full">
        <div className="max-w-4xl mx-auto w-full">
          {children}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-around items-center z-20">
        <div className="max-w-md w-full flex justify-between mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-1 group relative"
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  <Icon className="w-6 h-6" />
                  {isActive && tab.id === 'notify' && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-bold transition-colors",
                  isActive ? "text-blue-600" : "text-slate-400"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

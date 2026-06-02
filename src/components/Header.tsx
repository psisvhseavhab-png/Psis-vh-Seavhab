import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, User as UserIcon, Loader2, Sun, Moon, GraduationCap, Users, Shield, Compass, BookOpen } from 'lucide-react';
import { getAuthInstance } from '@/src/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { mockStudents } from '../data/mockStudents';

interface SearchResult {
  id: string;
  name: string;
  type: 'student' | 'staff' | 'class';
  subText: string;
}

const mockStaffList = [
  { id: 'STF001', name: 'Mr. Sopheak Pat', role: 'Super Admin / Registrar' },
  { id: 'STF002', name: 'Ms. Leakhena Chan', role: 'Homeroom Instructor (G10A)' },
  { id: 'STF003', name: 'Mr. Bun Thoeun', role: 'Lead Science Professor' },
  { id: 'STF004', name: 'Mrs. Srey Mom', role: 'Daycare & Food Coordinator' },
  { id: 'STF005', name: 'Admin Sihanoukville', role: 'Regional campus support' }
];

const mockClassList = [
  { id: 'CLS001', name: 'G10A', desc: 'Grade 10-A Secondary Classroom' },
  { id: 'CLS002', name: 'G11', desc: 'Grade 11 Upper Secondary Room' },
  { id: 'CLS003', name: 'G12', desc: 'Grade 12 Science Track Level' }
];

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize Firebase Auth
  useEffect(() => {
    async function initAuth() {
      const auth = await getAuthInstance();
      if (auth) {
        onAuthStateChanged(auth, (u) => {
          setUser(u);
        });
      }
    }
    initAuth();
  }, []);

  // Initialize active theme from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem('psis_theme') === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark/light theme state + update DOM / local storage & body
  const handleThemeToggle = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('psis_theme', nextDark ? 'dark' : 'light');
    
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Perform dynamic quick search in Students, Staff, Classes
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(() => {
      const query = searchValue.toLowerCase();
      
      // Filter Students
      const studentMatches: SearchResult[] = mockStudents
        .filter(s => s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query))
        .map(s => ({
          id: s.id,
          name: s.name,
          type: 'student',
          subText: `Student • Class ${s.class} (ID: ${s.id})`
        }));

      // Filter Staff
      const staffMatches: SearchResult[] = mockStaffList
        .filter(s => s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query))
        .map(s => ({
          id: s.id,
          name: s.name,
          type: 'staff',
          subText: `${s.role} • ${s.id}`
        }));

      // Filter Classes
      const classMatches: SearchResult[] = mockClassList
        .filter(c => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query))
        .map(c => ({
          id: c.id,
          name: c.name,
          type: 'class',
          subText: `${c.desc}`
        }));

      const combined = [...studentMatches, ...staffMatches, ...classMatches].slice(0, 10);
      setSearchResults(combined);
      setIsSearching(false);
      setShowDropdown(true);

      // Dispatch global search event
      window.dispatchEvent(new CustomEvent('globalSearch', { detail: searchValue }));
    }, 250);

    return () => clearTimeout(handler);
  }, [searchValue]);

  // Handle clicks off-element to close search drop down
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle quick selection redirect
  const handleSelectResult = (result: SearchResult) => {
    setShowDropdown(false);
    setSearchValue('');
    
    if (result.type === 'student') {
      window.dispatchEvent(new CustomEvent('navigateTab', { 
        detail: { tab: 'students', studentId: result.id } 
      }));
    } else if (result.type === 'staff') {
      window.dispatchEvent(new CustomEvent('navigateTab', { 
        detail: { tab: 'employee-profile' } 
      }));
    } else if (result.type === 'class') {
      window.dispatchEvent(new CustomEvent('navigateTab', { 
        detail: { tab: 'create-class' } 
      }));
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center gap-4 w-1/3 relative" ref={dropdownRef}>
        <div className="relative w-full max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {isSearching ? (
              <Loader2 size={18} className="text-blue-500 animate-spin" />
            ) : (
              <Search size={18} className="text-slate-400" />
            )}
          </div>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search students, staff, classes..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
            className="w-full pl-10 pr-16 py-2 bg-slate-100/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none select-none bg-slate-200/60 dark:bg-slate-800 text-[9px] font-bold text-slate-500 rounded px-1.5 py-0.5 tracking-wider border border-slate-300 dark:border-slate-700">
            Ctrl+K
          </div>
        </div>

        {/* Floating Quick Search dropdown results */}
        <AnimatePresence>
          {showDropdown && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 mt-2 w-[420px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-2xl overflow-hidden z-50 text-left"
            >
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Search Results Matched</span>
                <span className="text-[9px] font-mono text-slate-400">Total matched: {searchResults.length}</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850 custom-scrollbar">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className="w-full px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        result.type === 'student' ? 'bg-blue-50 text-blue-500 dark:bg-blue-950/30' :
                        result.type === 'staff' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30' :
                        'bg-amber-50 text-amber-500 dark:bg-amber-950/30'
                      }`}>
                        {result.type === 'student' ? <GraduationCap size={16} /> :
                         result.type === 'staff' ? <Users size={16} /> :
                         <BookOpen size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{result.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{result.subText}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-500 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 rounded">
                      Go
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100/50 dark:border-emerald-900/10 mr-4">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
           <span className="text-[10px] font-black uppercase tracking-widest leading-none pt-0.5">Live Mode Active</span>
        </div>

        {/* Global Dark Mode / Light Mode Theme Toggle */}
        <button 
          onClick={handleThemeToggle}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-800 dark:bg-slate-950 bg-white"
          title={isDarkMode ? "Set Light Mode" : "Set Dark Mode"}
        >
          {isDarkMode ? <Sun size={18} className="text-amber-400 rotate-animation" /> : <Moon size={18} className="text-slate-600" />}
        </button>

        <button className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 ml-2"></div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">
              {user?.displayName || (user?.email === 'admin@psisvh.edu' || user?.email === 'admin@xau.news' ? 'Super Admin' : 'PSIS Member')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 uppercase tracking-widest font-black italic">
              {user?.email === 'admin@psisvh.edu' || user?.email === 'sopheakpat01@gmail.com' || user?.email === 'admin@xau.news' ? 'Super Admin' : 'Staff/Student'}
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-950 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={20} className="text-slate-400" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

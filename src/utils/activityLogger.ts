export interface ActivityLogItem {
  id: string;
  timestamp: string;
  actionType: 'student_enrollment' | 'grade_update' | 'config_change' | 'system';
  description: string;
  user: string;
  metadata?: Record<string, any>;
}

const DEFAULT_LOGS: ActivityLogItem[] = [
  {
    id: "ACT-005",
    timestamp: "2026-06-02 12:15:00",
    actionType: "config_change",
    description: "Updated Telegram Bot Integration Token inside System Settings",
    user: "admin@psisvh.edu",
    metadata: { key: "telegramBotToken" }
  },
  {
    id: "ACT-004",
    timestamp: "2026-06-02 11:30:20",
    actionType: "grade_update",
    description: "Adjusted English Term 1 point modifier for Student Alice Parker (ST006)",
    user: "sopheakpat01@gmail.com",
    metadata: { studentId: "ST006", score: 95 }
  },
  {
    id: "ACT-003",
    timestamp: "2026-06-02 09:45:12",
    actionType: "student_enrollment",
    description: "Enrolled student 'Sophia Martinez' into Grade 12-A",
    user: "admin@psisvh.edu",
    metadata: { class: "Grade 12-A", name: "Sophia Martinez" }
  },
  {
    id: "ACT-002",
    timestamp: "2026-06-01 15:20:00",
    actionType: "grade_update",
    description: "Updated Mathematics Term 1 grades for David Lee (ST009)",
    user: "admin@psisvh.edu",
    metadata: { studentId: "ST009", score: 60 }
  },
  {
    id: "ACT-001",
    timestamp: "2026-06-01 08:30:00",
    actionType: "system",
    description: "Global Web local Playback Hikvision NVR SDK synchronized",
    user: "admin@xau.news"
  }
];

export function getLogs(): ActivityLogItem[] {
  const stored = localStorage.getItem('psis_activity_logs');
  if (!stored) {
    localStorage.setItem('psis_activity_logs', JSON.stringify(DEFAULT_LOGS));
    return DEFAULT_LOGS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_LOGS;
  }
}

export function logActivity(
  actionType: ActivityLogItem['actionType'],
  description: string,
  user?: string,
  metadata?: Record<string, any>
): ActivityLogItem {
  const logs = getLogs();
  
  // Get active user email from credentials if helper is omitted
  let activeUser = user || "admin@psisvh.edu";
  try {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      const parsed = JSON.parse(demoUser);
      activeUser = parsed.email || parsed.name || activeUser;
    }
  } catch (e) {}

  const newLog: ActivityLogItem = {
    id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    actionType,
    description,
    user: activeUser,
    metadata
  };

  const updated = [newLog, ...logs];
  localStorage.setItem('psis_activity_logs', JSON.stringify(updated));
  
  // Dispatch custom event for real-time reactivity
  window.dispatchEvent(new CustomEvent('activity_logged', { detail: newLog }));
  
  return newLog;
}

export function clearActivityLogs() {
  localStorage.setItem('psis_activity_logs', JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('activity_logged', { detail: null }));
}

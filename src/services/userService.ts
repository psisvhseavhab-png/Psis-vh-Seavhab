import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot 
} from 'firebase/firestore';
import { getDb, withTimeout } from '../lib/firebase';
import { SystemUser, Employee } from '../types';

const SYSTEM_USERS_COLLECTION = 'systemUsers';

const DEFAULT_USERS: (SystemUser & { password?: string })[] = [
  {
    id: 'usr_admin',
    employeeId: 'emp_1',
    firstName: 'Chan',
    lastName: 'Dara',
    username: 'admin',
    email: 'admin@psisvh.edu',
    roleId: 'admin',
    academicYearId: '2024-2025',
    dashboardLevel: 'Full',
    branchIds: ['Van Hong Campus'],
    campusIds: ['Campus East'],
    subProgramIds: ['English Foundation'],
    status: 'Active',
    password: 'admin'
  }
];

function getLocalUsers(): (SystemUser & { password?: string })[] {
  const data = localStorage.getItem('edu_local_system_users');
  if (!data) {
    localStorage.setItem('edu_local_system_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_USERS;
  }
}

function setLocalUsers(users: (SystemUser & { password?: string })[]) {
  localStorage.setItem('edu_local_system_users', JSON.stringify(users));
}

export const userService = {
  async getUsers(): Promise<(SystemUser & { password?: string })[]> {
    try {
      const db = await getDb();
      if (!db) return getLocalUsers();
      const q = query(collection(db, SYSTEM_USERS_COLLECTION));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemUser & { password?: string }));
      if (users.length > 0) {
        setLocalUsers(users);
        return users;
      }
      return getLocalUsers();
    } catch (e) {
      console.warn("Firestore getUsers error, returning local backup:", e);
      return getLocalUsers();
    }
  },

  subscribeToUsers(callback: (users: (SystemUser & { password?: string })[]) => void) {
    let unsubscribe = () => {};
    // Deliver instant local data for responsiveness
    callback(getLocalUsers());

    getDb().then(db => {
      if (!db) return;
      const q = query(collection(db, SYSTEM_USERS_COLLECTION));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemUser & { password?: string }));
        if (users.length > 0) {
          setLocalUsers(users);
          callback(users);
        } else {
          callback(getLocalUsers());
        }
      }, (error) => {
        console.warn("Firestore users sub error:", error);
        callback(getLocalUsers());
      });
    }).catch(err => {
      console.warn("getDb in users sub error:", err);
      callback(getLocalUsers());
    });
    return () => unsubscribe();
  },

  async addUser(user: Omit<SystemUser & { password?: string }, 'id'>) {
    const id = 'usr_' + Math.random().toString(36).substr(2, 9);
    const newUser = { id, ...user } as SystemUser & { password?: string };

    const local = getLocalUsers();
    local.push(newUser);
    setLocalUsers(local);

    try {
      const db = await getDb();
      if (db) {
        await withTimeout(
          addDoc(collection(db, SYSTEM_USERS_COLLECTION), user),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore addUser failed, saved locally:", error);
    }
    return newUser;
  },

  async updateUser(id: string, user: Partial<SystemUser & { password?: string }>) {
    const local = getLocalUsers();
    const idx = local.findIndex(u => u.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...user };
      setLocalUsers(local);
    }

    try {
      const db = await getDb();
      if (db) {
        const docRef = doc(db, SYSTEM_USERS_COLLECTION, id);
        await withTimeout(
          updateDoc(docRef, user),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore updateUser failed, saved locally:", error);
    }
  },

  async deleteUser(id: string) {
    const local = getLocalUsers();
    const updated = local.filter(u => u.id !== id);
    setLocalUsers(updated);

    try {
      const db = await getDb();
      if (db) {
        const docRef = doc(db, SYSTEM_USERS_COLLECTION, id);
        await withTimeout(
          deleteDoc(docRef),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore deleteUser failed, saved locally:", error);
    }
  },

  // Auto-create pending waitlist user for a new employee
  async createPendingWaitlist(employee: Employee): Promise<SystemUser & { password?: string }> {
    const localUsers = getLocalUsers();
    
    // Check if user already exists for this employee to prevent duplicates
    const existing = localUsers.find(u => u.employeeId === employee.id || u.employeeId === employee.employeeCode);
    if (existing) {
      return existing;
    }

    // Split name into first and last name
    const parts = (employee.name || '').trim().split(/\s+/);
    const firstName = parts[0] || 'Employee';
    const lastName = parts.slice(1).join(' ') || 'User';
    const cleanUsername = (employee.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fallbackUsername = cleanUsername ? cleanUsername : ('emp_' + employee.employeeCode.toLowerCase().replace(/[^a-z0-9]/g, ''));

    const pendingUser: Omit<SystemUser & { password?: string }, 'id'> = {
      employeeId: employee.id || employee.employeeCode,
      firstName,
      lastName,
      username: fallbackUsername,
      email: `${fallbackUsername}@psisvh.edu`,
      roleId: 'student', // default fallback, waitlist will edit this
      academicYearId: '2024-2025',
      dashboardLevel: 'Limited',
      branchIds: [],
      campusIds: [],
      subProgramIds: [],
      status: 'Pending' as any, // "Pending" Waitlist
      password: 'psis' + employee.employeeCode.replace(/[^0-9]/g, '') // default password is psis + numbers, e.g. psis001
    };

    return await this.addUser(pendingUser);
  }
};

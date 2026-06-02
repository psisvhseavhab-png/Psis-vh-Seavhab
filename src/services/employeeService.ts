import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { getDb, withTimeout } from '../lib/firebase';
import { Employee } from '../types';
import { userService } from './userService';

const EMPLOYEES_COLLECTION = 'employees';

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp_1',
    employeeCode: 'VH-EMP001',
    name: 'Chan Dara',
    gender: 'Male',
    dob: '1988-04-12',
    positionId: 'pos_teacher', // Teacher
    departmentId: 'dep_academic', // Academic
    contact: '+855 12 888 777',
    status: 'active',
    telegramChatId: '12345678',
    createdAt: new Date().toISOString()
  },
  {
    id: 'emp_2',
    employeeCode: 'VH-EMP002',
    name: 'Sok Mean',
    gender: 'Female',
    dob: '1992-09-24',
    positionId: 'pos_hr', // HR Officer
    departmentId: 'dep_admin', // Admin
    contact: '+855 16 555 111',
    status: 'active',
    telegramChatId: '87654321',
    createdAt: new Date().toISOString()
  }
];

function getLocalEmployees(): Employee[] {
  const data = localStorage.getItem('edu_local_employees');
  if (!data) {
    localStorage.setItem('edu_local_employees', JSON.stringify(DEFAULT_EMPLOYEES));
    return DEFAULT_EMPLOYEES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_EMPLOYEES;
  }
}

function setLocalEmployees(employees: Employee[]) {
  localStorage.setItem('edu_local_employees', JSON.stringify(employees));
}

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    try {
      const db = await getDb();
      if (!db) return getLocalEmployees();
      const q = query(collection(db, EMPLOYEES_COLLECTION), orderBy('employeeCode', 'asc'));
      const snapshot = await getDocs(q);
      const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      if (employees.length > 0) {
        setLocalEmployees(employees);
        return employees;
      }
      return getLocalEmployees();
    } catch (e) {
      console.warn("Firestore getEmployees error, returning local backup:", e);
      return getLocalEmployees();
    }
  },

  subscribeToEmployees(callback: (employees: Employee[]) => void) {
    let unsubscribe = () => {};
    // Deliver instant local data for responsiveness
    callback(getLocalEmployees());

    getDb().then(db => {
      if (!db) return;
      const q = query(collection(db, EMPLOYEES_COLLECTION), orderBy('employeeCode', 'asc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        if (employees.length > 0) {
          setLocalEmployees(employees);
          callback(employees);
        } else {
          callback(getLocalEmployees());
        }
      }, (error) => {
        console.warn("Firestore employees sub error:", error);
        callback(getLocalEmployees());
      });
    }).catch(err => {
      console.warn("getDb in employees sub error:", err);
      callback(getLocalEmployees());
    });
    return () => unsubscribe();
  },

  async addEmployee(employee: Omit<Employee, 'id'>) {
    const id = 'emp_' + Math.random().toString(36).substr(2, 9);
    const newEmp = { id, ...employee } as Employee;

    const local = getLocalEmployees();
    local.push(newEmp);
    setLocalEmployees(local);

    try {
      const db = await getDb();
      if (db) {
        await withTimeout(
          addDoc(collection(db, EMPLOYEES_COLLECTION), employee),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore addEmployee failed, saved locally:", error);
    }

    // Auto trigger user profile waitlist creation
    try {
      await userService.createPendingWaitlist(newEmp);
    } catch (err) {
      console.warn("Failed to create pending user profile waitlist:", err);
    }

    return newEmp;
  },

  async updateEmployee(id: string, employee: Partial<Employee>) {
    const local = getLocalEmployees();
    const idx = local.findIndex(e => e.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...employee };
      setLocalEmployees(local);
    }

    try {
      const db = await getDb();
      if (db) {
        const docRef = doc(db, EMPLOYEES_COLLECTION, id);
        await withTimeout(
          updateDoc(docRef, employee),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore updateEmployee failed, saved locally:", error);
    }
  },

  async deleteEmployee(id: string) {
    const local = getLocalEmployees();
    const updated = local.filter(e => e.id !== id);
    setLocalEmployees(updated);

    try {
      const db = await getDb();
      if (db) {
        const docRef = doc(db, EMPLOYEES_COLLECTION, id);
        await withTimeout(
          deleteDoc(docRef),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore deleteEmployee failed, saved locally:", error);
    }
  }
};

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
import { getDb, OperationType, handleFirestoreError, withTimeout } from '../lib/firebase';
import { EmployeePosition, EmployeeDepartment } from '../types';

const POSITIONS_COLLECTION = 'employeePositions';
const DEPARTMENTS_COLLECTION = 'employeeDepartments';

const DEFAULT_POSITIONS: EmployeePosition[] = [
  { id: 'pos_principal', name: 'Principal' },
  { id: 'pos_vp', name: 'Vice Principal' },
  { id: 'pos_teacher', name: 'Teacher' },
  { id: 'pos_it', name: 'IT Admin' },
  { id: 'pos_hr', name: 'HR Officer' },
  { id: 'pos_accountant', name: 'Accountant' }
];

const DEFAULT_DEPARTMENTS: EmployeeDepartment[] = [
  { id: 'dep_academic', name: 'Academic' },
  { id: 'dep_admin', name: 'Administration' },
  { id: 'dep_finance', name: 'Finance' },
  { id: 'dep_it', name: 'IT Support' }
];

function getLocalPositions(): EmployeePosition[] {
  const data = localStorage.getItem('edu_local_positions');
  if (!data) {
    localStorage.setItem('edu_local_positions', JSON.stringify(DEFAULT_POSITIONS));
    return DEFAULT_POSITIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_POSITIONS;
  }
}

function setLocalPositions(positions: EmployeePosition[]) {
  localStorage.setItem('edu_local_positions', JSON.stringify(positions));
}

function getLocalDepartments(): EmployeeDepartment[] {
  const data = localStorage.getItem('edu_local_departments');
  if (!data) {
    localStorage.setItem('edu_local_departments', JSON.stringify(DEFAULT_DEPARTMENTS));
    return DEFAULT_DEPARTMENTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_DEPARTMENTS;
  }
}

function setLocalDepartments(departments: EmployeeDepartment[]) {
  localStorage.setItem('edu_local_departments', JSON.stringify(departments));
}

export const orgService = {
  // Positions
  async getPositions(): Promise<EmployeePosition[]> {
    try {
      const db = await getDb();
      if (!db) return getLocalPositions();
      const q = query(collection(db, POSITIONS_COLLECTION), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const positions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeePosition));
      if (positions.length > 0) {
        setLocalPositions(positions);
        return positions;
      }
      return getLocalPositions();
    } catch (error) {
      console.warn("Firestore getPositions failed, returning local storage:", error);
      return getLocalPositions();
    }
  },

  subscribeToPositions(callback: (positions: EmployeePosition[]) => void) {
    let unsubscribe = () => {};
    // Push instant local results so UI is never blocked empty
    callback(getLocalPositions());

    getDb().then(db => {
      if (!db) return;
      const q = query(collection(db, POSITIONS_COLLECTION), orderBy('name', 'asc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const positions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeePosition));
        if (positions.length > 0) {
          setLocalPositions(positions);
          callback(positions);
        } else {
          callback(getLocalPositions());
        }
      }, (error) => {
        console.warn("Firestore positions sub error:", error);
        callback(getLocalPositions());
      });
    }).catch(err => {
      console.warn("getDb in positions sub error:", err);
      callback(getLocalPositions());
    });
    return () => unsubscribe();
  },

  async addPosition(position: Omit<EmployeePosition, 'id'>) {
    const id = 'pos_' + Math.random().toString(36).substr(2, 9);
    const newPos = { id, ...position } as EmployeePosition;
    
    const local = getLocalPositions();
    local.push(newPos);
    setLocalPositions(local);

    try {
      const db = await getDb();
      if (db) {
        await withTimeout(
          addDoc(collection(db, POSITIONS_COLLECTION), position),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore addPosition failed, saved locally:", error);
    }
    return newPos;
  },

  async updatePosition(id: string, updates: Partial<EmployeePosition>) {
    const local = getLocalPositions();
    const idx = local.findIndex(p => p.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates };
      setLocalPositions(local);
    }

    try {
      const db = await getDb();
      if (db) {
        const docRef = doc(db, POSITIONS_COLLECTION, id);
        await withTimeout(
          updateDoc(docRef, updates),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore updatePosition failed, saved locally:", error);
    }
  },

  async deletePosition(id: string) {
    const local = getLocalPositions();
    const updated = local.filter(p => p.id !== id);
    setLocalPositions(updated);

    try {
      const db = await getDb();
      if (db) {
        await withTimeout(
          deleteDoc(doc(db, POSITIONS_COLLECTION, id)),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore deletePosition failed, saved locally:", error);
    }
  },

  // Departments
  async getDepartments(): Promise<EmployeeDepartment[]> {
    try {
      const db = await getDb();
      if (!db) return getLocalDepartments();
      const q = query(collection(db, DEPARTMENTS_COLLECTION), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const departments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeeDepartment));
      if (departments.length > 0) {
        setLocalDepartments(departments);
        return departments;
      }
      return getLocalDepartments();
    } catch (error) {
      console.warn("Firestore getDepartments failed, returning local storage:", error);
      return getLocalDepartments();
    }
  },

  subscribeToDepartments(callback: (departments: EmployeeDepartment[]) => void) {
    let unsubscribe = () => {};
    // Push instant local results so UI is never blocked empty
    callback(getLocalDepartments());

    getDb().then(db => {
      if (!db) return;
      const q = query(collection(db, DEPARTMENTS_COLLECTION), orderBy('name', 'asc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const departments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmployeeDepartment));
        if (departments.length > 0) {
          setLocalDepartments(departments);
          callback(departments);
        } else {
          callback(getLocalDepartments());
        }
      }, (error) => {
        console.warn("Firestore departments sub error:", error);
        callback(getLocalDepartments());
      });
    }).catch(err => {
      console.warn("getDb in departments sub error:", err);
      callback(getLocalDepartments());
    });
    return () => unsubscribe();
  },

  async addDepartment(department: Omit<EmployeeDepartment, 'id'>) {
    const id = 'dep_' + Math.random().toString(36).substr(2, 9);
    const newDep = { id, ...department } as EmployeeDepartment;

    const local = getLocalDepartments();
    local.push(newDep);
    setLocalDepartments(local);

    try {
      const db = await getDb();
      if (db) {
        await withTimeout(
          addDoc(collection(db, DEPARTMENTS_COLLECTION), department),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore addDepartment failed, saved locally:", error);
    }
    return newDep;
  },

  async updateDepartment(id: string, updates: Partial<EmployeeDepartment>) {
    const local = getLocalDepartments();
    const idx = local.findIndex(d => d.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates };
      setLocalDepartments(local);
    }

    try {
      const db = await getDb();
      if (db) {
        const docRef = doc(db, DEPARTMENTS_COLLECTION, id);
        await withTimeout(
          updateDoc(docRef, updates),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore updateDepartment failed, saved locally:", error);
    }
  },

  async deleteDepartment(id: string) {
    const local = getLocalDepartments();
    const updated = local.filter(d => d.id !== id);
    setLocalDepartments(updated);

    try {
      const db = await getDb();
      if (db) {
        await withTimeout(
          deleteDoc(doc(db, DEPARTMENTS_COLLECTION, id)),
          2500,
          null
        );
      }
    } catch (error) {
      console.warn("Firestore deleteDepartment failed, saved locally:", error);
    }
  }
};

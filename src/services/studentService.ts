import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  where
} from 'firebase/firestore';
import { getDb, OperationType, handleFirestoreError, withTimeout } from '../lib/firebase';
import { Student } from '../types';
import { mockStudents } from '../data/mockStudents';

const STUDENTS_COLLECTION = 'students';
const LOCAL_STORAGE_KEY = 'psis_students_backup';

function getLocalStudents(): Student[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockStudents));
    return mockStudents;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return mockStudents;
  }
}

function saveLocalStudents(students: Student[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
}

export const studentService = {
  async getStudents(): Promise<Student[]> {
    const local = getLocalStudents();
    const db = await getDb().catch(() => null);
    if (!db) {
      return local;
    }
    try {
      const q = query(collection(db, STUDENTS_COLLECTION), orderBy('id', 'asc'));
      const snapshot = await getDocs(q);
      const students = snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id } as unknown as Student));
      if (students && students.length > 0) {
        saveLocalStudents(students);
        return students;
      }
      return local;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, STUDENTS_COLLECTION);
      return local;
    }
  },

  subscribeToStudents(callback: (students: Student[]) => void) {
    const local = getLocalStudents();
    callback(local);

    let unsubscribe = () => {};
    getDb().then(db => {
      if (!db) return;
      const q = query(collection(db, STUDENTS_COLLECTION), orderBy('id', 'asc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const students = snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id } as unknown as Student));
        if (students && students.length > 0) {
          saveLocalStudents(students);
          callback(students);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, STUDENTS_COLLECTION);
      });
    }).catch(err => {
      console.warn("Could not subscribe to Firestore, running in offline mode:", err);
    });

    return () => unsubscribe();
  },

  async addStudent(student: Omit<Student, 'firebaseId'>) {
    const local = getLocalStudents();
    const tempId = `local_${Date.now()}`;
    const newStudent: Student = { ...student, firebaseId: tempId };
    
    local.push(newStudent);
    saveLocalStudents(local);

    const db = await getDb().catch(() => null);
    if (!db) {
      return { id: tempId };
    }
    try {
      const docRef = await withTimeout(
        addDoc(collection(db, STUDENTS_COLLECTION), student),
        2500,
        null
      );
      if (docRef) {
        // Update local storage with real Firebase ID once created
        const updatedLocal = getLocalStudents().map(s => s.firebaseId === tempId ? { ...s, firebaseId: docRef.id } : s);
        saveLocalStudents(updatedLocal);
        return docRef;
      }
      return { id: tempId };
    } catch (error) {
      console.warn("Firestore addStudent error, saved locally as backup:", error);
      return { id: tempId };
    }
  },

  async updateStudent(firebaseId: string, student: Partial<Student>) {
    const local = getLocalStudents();
    const idx = local.findIndex(s => s.firebaseId === firebaseId);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...student };
      saveLocalStudents(local);
    }

    const db = await getDb().catch(() => null);
    if (!db) {
      return;
    }
    try {
      const docRef = doc(db, STUDENTS_COLLECTION, firebaseId);
      await withTimeout(
        updateDoc(docRef, student),
        2500,
        null
      );
    } catch (error) {
      console.warn("Firestore updateStudent error, updated locally as backup:", error);
    }
  },

  async deleteStudent(firebaseId: string) {
    const local = getLocalStudents();
    const filtered = local.filter(s => s.firebaseId !== firebaseId);
    saveLocalStudents(filtered);

    const db = await getDb().catch(() => null);
    if (!db) {
      return;
    }
    try {
      const docRef = doc(db, STUDENTS_COLLECTION, firebaseId);
      await withTimeout(
        deleteDoc(docRef),
        2500,
        null
      );
    } catch (error) {
      console.warn("Firestore deleteStudent error, deleted locally as backup:", error);
    }
  },

  getTopStudentsForClass(className: string): (Student & { gpa: number; avgScore: number; scores: Record<string, number> })[] {
    const local = getLocalStudents();
    const classStudents = local.filter(s => s.class === className);
    
    const studentsWithGrades = classStudents.map(student => {
      const subjects = ['Mathematics', 'Physics', 'History', 'English', 'Biology', 'Computer Science'];
      let hash = 0;
      for (let i = 0; i < student.id.length; i++) {
        hash = student.id.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const scores: Record<string, number> = {};
      subjects.forEach((subj, idx) => {
        const seedValue = Math.abs(Math.sin(hash + idx) * 1000);
        const baseOffset = (hash % 10) > 4 ? 85 : 70;
        const score = Math.floor(baseOffset + (seedValue % 16)); // 85-100 or 70-85
        scores[subj] = score;
      });

      const scoreValues = Object.values(scores);
      const points = scoreValues.map(s => s >= 90 ? 4 : s >= 80 ? 3 : s >= 70 ? 2 : s >= 60 ? 1 : 0);
      const gpa = Number((points.reduce((a, b) => a + b, 0) / points.length).toFixed(2));
      const avgScore = Number((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1));

      return {
        ...student,
        scores,
        gpa,
        avgScore
      };
    });

    return studentsWithGrades
      .sort((a, b) => {
        if (b.gpa !== a.gpa) return b.gpa - a.gpa;
        return b.avgScore - a.avgScore;
      })
      .slice(0, 5);
  }
};


import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc,
  doc, 
  query, 
  where,
  getDoc
} from 'firebase/firestore';
import { getDb, OperationType, handleFirestoreError } from '../lib/firebase';

const ATTENDANCE_COLLECTION = 'attendance';

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  classId: string;
  records: Record<string, 'present' | 'absent' | 'late'>; // studentId -> status
  recordedBy: string;
  recordedAt: string;
}

export const attendanceService = {
  async getAttendance(date: string, classId: string): Promise<AttendanceRecord | null> {
    const localKey = `attendance_${date}_${classId}`;
    const db = await getDb().catch(() => null);
    if (!db) {
      const localData = localStorage.getItem(localKey);
      return localData ? JSON.parse(localData) : null;
    }
    try {
      const docId = `${date}_${classId}`;
      const docRef = doc(db, ATTENDANCE_COLLECTION, docId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as AttendanceRecord;
        localStorage.setItem(localKey, JSON.stringify(data));
        return data;
      }
      return null;
    } catch (error: any) {
      const isOfflineErr = error.message?.includes('offline') || error.code === 'unavailable' || !window.navigator.onLine;
      if (isOfflineErr) {
        const localData = localStorage.getItem(localKey);
        return localData ? JSON.parse(localData) : null;
      }
      handleFirestoreError(error, OperationType.GET, `${ATTENDANCE_COLLECTION}`);
      return null;
    }
  },

  async saveAttendance(record: AttendanceRecord) {
    const localKey = `attendance_${record.date}_${record.classId}`;
    localStorage.setItem(localKey, JSON.stringify(record));

    const db = await getDb().catch(() => null);
    if (!db) return;
    try {
      const docId = `${record.date}_${record.classId}`;
      const docRef = doc(db, ATTENDANCE_COLLECTION, docId);
      await setDoc(docRef, record);
    } catch (error: any) {
      const isOfflineErr = error.message?.includes('offline') || error.code === 'unavailable' || !window.navigator.onLine;
      if (isOfflineErr) {
        console.warn("Firestore offline - saved attendance to local storage cache.");
        return;
      }
      handleFirestoreError(error, OperationType.WRITE, `${ATTENDANCE_COLLECTION}`);
    }
  }
};

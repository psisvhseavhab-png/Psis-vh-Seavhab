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
    const db = await getDb();
    if (!db) return null;
    try {
      const docId = `${date}_${classId}`;
      const docRef = doc(db, ATTENDANCE_COLLECTION, docId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as AttendanceRecord;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${ATTENDANCE_COLLECTION}`);
      return null;
    }
  },

  async saveAttendance(record: AttendanceRecord) {
    const db = await getDb();
    if (!db) return;
    try {
      const docId = `${record.date}_${record.classId}`;
      const docRef = doc(db, ATTENDANCE_COLLECTION, docId);
      await setDoc(docRef, record);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${ATTENDANCE_COLLECTION}`);
    }
  }
};

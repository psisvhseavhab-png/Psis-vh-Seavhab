import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { getDb, OperationType, handleFirestoreError } from '../lib/firebase';

export interface BrandingSettings {
  schoolName: string;
  logoUrl?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

const SETTINGS_COLLECTION = 'settings';
const BRANDING_DOC = 'branding';

export const brandingService = {
  async getBranding(): Promise<BrandingSettings | null> {
    const db = await getDb();
    if (!db) return null;
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, BRANDING_DOC);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as BrandingSettings;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${BRANDING_DOC}`);
      return null;
    }
  },

  subscribeToBranding(callback: (settings: BrandingSettings) => void) {
    let unsubscribe = () => {};
    getDb().then(db => {
      if (!db) return;
      const docRef = doc(db, SETTINGS_COLLECTION, BRANDING_DOC);
      unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as BrandingSettings);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${BRANDING_DOC}`);
      });
    }).catch(err => {
      console.warn("getDb in subscribeToBranding error:", err);
    });
    return () => unsubscribe();
  },

  async updateBranding(settings: Partial<BrandingSettings>) {
    const db = await getDb();
    if (!db) return;
    try {
      const docRef = doc(db, SETTINGS_COLLECTION, BRANDING_DOC);
      await setDoc(docRef, settings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/${BRANDING_DOC}`);
    }
  }
};

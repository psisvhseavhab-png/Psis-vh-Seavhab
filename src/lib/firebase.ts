import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, type Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, type Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  let currentUser: any = null;
  try {
    if (getApps().length > 0) {
      const auth = getAuth(getApp());
      currentUser = auth.currentUser;
    }
  } catch (e) {
    // Ignore auth retrieve errors if firebase state is not ready or initialized
  }
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // Only throw for mutations to comply with instructions, 
  // but allow reads to fail gracefully to avoid app-wide crashes
  if ([OperationType.CREATE, OperationType.UPDATE, OperationType.DELETE, OperationType.WRITE].includes(operationType)) {
    throw new Error(JSON.stringify(errInfo));
  }
}

// Try to load the config. Use a try-catch for the import to handle cases where it might not exist yet.
let firebaseConfig: any = null;

async function initFirebase() {
  if (getApps().length > 0) {
    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    return { app, auth, db, storage };
  }

  try {
    // Relative to src/lib/firebase.ts, config is at root /firebase-applet-config.json
    const module = await import('../../firebase-applet-config.json');
    firebaseConfig = module.default || module;
    
    // Check if placeholder values are still there
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('INSERT_')) {
      throw new Error("Configuration placeholder detected");
    }
  } catch (err) {
    console.warn("Firebase config file not found or invalid. App will run in offline/demo mode.", err);
    return { app: null, auth: null, db: null, storage: null };
  }

  try {
    const app = initializeApp(firebaseConfig);
    const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' 
      ? firebaseConfig.firestoreDatabaseId 
      : undefined;
    
    const db = getFirestore(app, dbId);
    const auth = getAuth(app);
    const storage = getStorage(app);

    // Test connection requirement
    setTimeout(() => {
      getDocFromServer(doc(db, 'test', 'connection'))
        .then(() => {
          console.log("Firestore connection verified.");
        })
        .catch(err => {
          console.warn("Firestore connectivity warning:", err.message);
        });
    }, 1000);

    return { app, auth, db, storage };
  } catch (err) {
    console.error("Firebase initialization failed:", err);
    return { app: null, auth: null, db: null, storage: null };
  }
}

export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  const { auth } = await initFirebase();
  return signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  const { auth } = await initFirebase();
  try {
    return await signInWithEmailAndPassword(auth, email, pass);
  } catch (error: any) {
    console.error("Auth Error Detail:", error.code, error.message);
    if (error.code === 'auth/network-request-failed') {
      throw new Error("Network error: Unable to reach Firebase. This may be due to a slow connection or firewall settings.");
    }
    throw error;
  }
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, defaultValue: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`Firebase operation timed out after ${timeoutMs}ms. Fallback database operation selected.`);
      resolve(defaultValue);
    }, timeoutMs);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }).catch((err) => {
      clearTimeout(timer);
      throw err;
    }),
    timeoutPromise,
  ]);
}

export async function uploadFile(path: string, file: File): Promise<string> {
  try {
    const { storage } = await initFirebase();
    if (!storage) {
      console.warn("Firebase Storage is not initialized/configured. Returning local object URL.");
      return URL.createObjectURL(file);
    }
    const storageRef = ref(storage, path);
    const result = await withTimeout(uploadBytes(storageRef, file), 3000, null);
    if (!result) {
      console.warn("Firebase upload operation timed out. Returning local object URL.");
      return URL.createObjectURL(file);
    }
    return getDownloadURL(result.ref);
  } catch (error) {
    console.error("Firebase upload error, falling back to local object URL:", error);
    return URL.createObjectURL(file);
  }
}

export async function getDb(): Promise<Firestore | null> {
  try {
    const dbPromise = initFirebase().then(res => res.db).catch(() => null);
    const db = await withTimeout(dbPromise, 2000, null);
    return db;
  } catch (error) {
    console.warn("getDb execution failed, returning null for offline fallback:", error);
    return null;
  }
}

export async function getAuthInstance(): Promise<Auth | null> {
  try {
    const authPromise = initFirebase().then(res => res.auth).catch(() => null);
    return await withTimeout(authPromise, 2000, null);
  } catch (error) {
    return null;
  }
}

export async function getStorageInstance(): Promise<FirebaseStorage | null> {
  try {
    const storagePromise = initFirebase().then(res => res.storage).catch(() => null);
    return await withTimeout(storagePromise, 2000, null);
  } catch (error) {
    return null;
  }
}

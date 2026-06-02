import { GoogleAuthProvider, signInWithPopup, type Auth, type User, onAuthStateChanged } from 'firebase/auth';
import { getAuthInstance } from './firebase';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/documents'
];

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Attempt to restore cached login tokens from session/in-memory states
export const initGoogleAuth = async (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const auth = await getAuthInstance();
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  // Look for session token saved in sessionStorage temporarily for page reload resilience
  const sessionToken = sessionStorage.getItem('google_ws_access_token');
  if (sessionToken) {
    cachedAccessToken = sessionToken;
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      sessionStorage.removeItem('google_ws_access_token');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleWorkspace = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const auth = await getAuthInstance();
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    const provider = new GoogleAuthProvider();
    // Add all core workspace scopes
    WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));

    // Force prompt to ensure the user gets a fresh consent with all requested scopes
    provider.setCustomParameters({
      prompt: 'consent',
      access_type: 'offline'
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from sign-completions');
    }

    cachedAccessToken = credential.accessToken;
    // Store temporarily in sessionStorage so page reload inside the developer sandbox doesn't wipe auth
    sessionStorage.setItem('google_ws_access_token', cachedAccessToken);

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Workspace Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = (): string | null => {
  if (!cachedAccessToken) {
    cachedAccessToken = sessionStorage.getItem('google_ws_access_token');
  }
  return cachedAccessToken;
};

export const logoutGoogleWorkspace = async () => {
  cachedAccessToken = null;
  sessionStorage.removeItem('google_ws_access_token');
  const auth = await getAuthInstance();
  if (auth) {
    await auth.signOut();
  }
};

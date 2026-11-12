import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  updateDoc,
  Unsubscribe,
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getMessaging, isSupported, getToken, onMessage, Messaging } from 'firebase/messaging';
import {
  FirestoreUserProfile,
  SmartAlertNotification,
  NotificationRuleSettings,
  UserRole,
  SavedLocationRecord,
  AlertRuleRecord,
  FullUserProfile,
} from '../types/personalization';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC3GTyyGRPPLMXqYGeUZ8uuZ4dX37OcOKI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "weatherguard-26.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://weatherguard-26-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "weatherguard-26",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "weatherguard-26.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "334832000766",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:334832000766:web:00b1130a352859cc888faf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BCM15X81V2",
};

// Initialize Firebase App singleton safely
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

let messagingInstance: Messaging | null = null;

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;
  try {
    const supported = await isSupported();
    if (supported && !messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  } catch (err) {
    console.warn('Firebase Messaging not supported in this environment:', err);
    return null;
  }
};

/**
 * Standard Firestore Error Handler conforming to Security & Context standards
 */
export interface FirestoreErrorInfo {
  code: string;
  message: string;
  operationContext: string;
  userFacingMessage: string;
}

export const handleFirestoreError = (error: any, operationContext: string): FirestoreErrorInfo => {
  const code = error?.code || 'unknown';
  let userFacingMessage = 'An unexpected cloud database error occurred. Please try again.';

  switch (code) {
    case 'permission-denied':
      userFacingMessage = 'Permission denied. Please verify your signed-in session permissions.';
      break;
    case 'not-found':
      userFacingMessage = 'The requested telemetry resource or document was not found.';
      break;
    case 'already-exists':
      userFacingMessage = 'A document with this identifier already exists in cloud storage.';
      break;
    case 'unavailable':
      userFacingMessage = 'Cloud servers are currently unreachable. Using local cache.';
      break;
    case 'unauthenticated':
      userFacingMessage = 'Please sign in with your WeatherGuard credentials to perform this action.';
      break;
    default:
      if (error?.message) {
        userFacingMessage = error.message;
      }
      break;
  }

  console.warn(`[Firestore Error] [${operationContext}]:`, { code, message: error?.message, error });
  return {
    code,
    message: error?.message || String(error),
    operationContext,
    userFacingMessage,
  };
};

/**
 * Request Web Push Permission & Retrieve FCM Device Registration Token
 */
export const requestFcmPushToken = async (): Promise<{
  token: string | null;
  status: 'granted' | 'denied' | 'unsupported' | 'error';
  error?: string;
}> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { token: null, status: 'unsupported' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { token: null, status: 'denied' };
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      // Simulated token for development/sandbox iframe
      const simulatedToken = `fcm_dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      return { token: simulatedToken, status: 'granted' };
    }

    try {
      const currentToken = await getToken(messaging, {
        vapidKey: 'BEl-1Y40g4_Sample_WeatherGuard_VAPID_Key_JPL_Atmosphere_2026',
      });
      return { token: currentToken || `fcm_client_${Date.now()}`, status: 'granted' };
    } catch (e: any) {
      const fallbackToken = `fcm_active_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      return { token: fallbackToken, status: 'granted' };
    }
  } catch (error: any) {
    console.warn('Error requesting FCM push token:', error);
    return { token: null, status: 'error', error: error?.message };
  }
};

// -------------------------------------------------------------
// Firebase Storage: Profile Photo Management
// -------------------------------------------------------------

export const uploadProfilePhotoToStorage = async (
  uid: string,
  file: File,
  userName?: string
): Promise<string> => {
  // Client validation
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (PNG, JPG, WEBP, GIF).');
  }
  const MAX_SIZE_MB = 5;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Profile photo must be smaller than ${MAX_SIZE_MB}MB.`);
  }

  try {
    const formData = new FormData();
    formData.append('photo', file);
    if (userName) {
      formData.append('userName', userName);
    }

    const response = await fetch('/api/users/profile-photo', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Cloudinary API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (err: any) {
    console.warn('Cloudinary upload error:', err);
    throw new Error(err.message || 'Failed to upload photo to Cloudinary.');
  }
};

export const deleteProfilePhotoFromStorage = async (photoUrl: string): Promise<void> => {
  if (!photoUrl || photoUrl.startsWith('data:')) return;
  try {
    const response = await fetch('/api/users/profile-photo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: photoUrl })
    });
    if (!response.ok) {
      console.warn('Failed to delete photo from Cloudinary API');
    }
  } catch (err) {
    console.warn('Error deleting photo from Cloudinary:', err);
  }
};

// -------------------------------------------------------------
// Firestore Helpers for User Profiles
// -------------------------------------------------------------

export const saveUserProfileToFirestore = async (
  profile: Partial<FirestoreUserProfile> & { uid: string }
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    const cleanProfile = Object.fromEntries(
      Object.entries(profile).filter(([_, v]) => v !== undefined)
    );
    await setDoc(
      userDocRef,
      {
        ...cleanProfile,
        updatedAt: Date.now(),
        lastActive: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, 'saveUserProfileToFirestore');
    try {
      localStorage.setItem(`wg_profile_${profile.uid}`, JSON.stringify(profile));
    } catch {}
  }
};

export const fetchUserProfileFromFirestore = async (
  uid: string
): Promise<FirestoreUserProfile | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as FirestoreUserProfile;
    }
  } catch (err) {
    handleFirestoreError(err, 'fetchUserProfileFromFirestore');
  }

  // Fallback to local storage
  try {
    const local = localStorage.getItem(`wg_profile_${uid}`);
    if (local) return JSON.parse(local);
  } catch {}
  return null;
};

export const subscribeToUserProfile = (
  uid: string,
  onUpdate: (profile: FirestoreUserProfile | null) => void
): Unsubscribe => {
  try {
    const userDocRef = doc(db, 'users', uid);
    return onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as FirestoreUserProfile);
        } else {
          onUpdate(null);
        }
      },
      (err) => {
        handleFirestoreError(err, 'subscribeToUserProfile');
      }
    );
  } catch (err) {
    console.warn('Failed to attach Firestore snapshot listener:', err);
    return () => {};
  }
};

// -------------------------------------------------------------
// Firestore Helpers for Saved Locations Subcollection
// -------------------------------------------------------------

export const saveSavedLocationToFirestore = async (
  uid: string,
  location: SavedLocationRecord
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    let existingLocs: SavedLocationRecord[] = [];
    if (snap.exists() && snap.data().savedLocations) {
      existingLocs = snap.data().savedLocations;
    }
    const filtered = existingLocs.filter(l => l.locationId !== location.locationId);
    
    // Strip undefined values that cause Firestore to fail silently
    const cleanLocation = Object.fromEntries(
      Object.entries(location).filter(([_, v]) => v !== undefined)
    ) as SavedLocationRecord;

    filtered.push({ ...cleanLocation, updatedAt: Date.now() });
    
    await updateDoc(userDocRef, {
      savedLocations: filtered,
      savedLocationsCount: filtered.length
    });
  } catch (err) {
    handleFirestoreError(err, 'saveSavedLocationToFirestore');
    try {
      const key = `wg_saved_locs_${uid}`;
      const existing = localStorage.getItem(key);
      let locs: SavedLocationRecord[] = existing ? JSON.parse(existing) : [];
      locs = locs.filter((l) => l.locationId !== location.locationId);
      locs.push({ ...location, updatedAt: Date.now() });
      localStorage.setItem(key, JSON.stringify(locs));
    } catch {}
  }
};

export const deleteSavedLocationFromFirestore = async (
  uid: string,
  locationId: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists() && snap.data().savedLocations) {
      const existingLocs: SavedLocationRecord[] = snap.data().savedLocations;
      const filtered = existingLocs.filter(l => l.locationId !== locationId);
      await updateDoc(userDocRef, {
        savedLocations: filtered,
        savedLocationsCount: filtered.length
      });
    }
  } catch (err) {
    handleFirestoreError(err, 'deleteSavedLocationFromFirestore');
    try {
      const key = `wg_saved_locs_${uid}`;
      const existing = localStorage.getItem(key);
      if (existing) {
        let locs: SavedLocationRecord[] = JSON.parse(existing);
        locs = locs.filter((l) => l.locationId !== locationId);
        localStorage.setItem(key, JSON.stringify(locs));
      }
    } catch {}
  }
};

export const subscribeToSavedLocations = (
  uid: string,
  onUpdate: (locations: SavedLocationRecord[]) => void
): Unsubscribe => {
  try {
    const userDocRef = doc(db, 'users', uid);
    return onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.savedLocations && Array.isArray(data.savedLocations)) {
            onUpdate(data.savedLocations);
          } else {
            onUpdate([]);
          }
        } else {
          onUpdate([]);
        }
      },
      (err) => {
        handleFirestoreError(err, 'subscribeToSavedLocations');
        try {
          const key = `wg_saved_locs_${uid}`;
          const existing = localStorage.getItem(key);
          if (existing) {
            const locs: SavedLocationRecord[] = JSON.parse(existing);
            onUpdate(locs);
          }
        } catch {}
      }
    );
  } catch (err) {
    console.warn('Error subscribing to saved locations:', err);
    try {
      const key = `wg_saved_locs_${uid}`;
      const existing = localStorage.getItem(key);
      if (existing) {
        const locs: SavedLocationRecord[] = JSON.parse(existing);
        setTimeout(() => onUpdate(locs), 100);
      }
    } catch {}
    
    return () => {};
  }
};

// -------------------------------------------------------------
// Firestore Helpers for Alert Rules Subcollection
// -------------------------------------------------------------

export const saveAlertRuleToFirestore = async (
  uid: string,
  rule: AlertRuleRecord
): Promise<void> => {
  try {
    const ruleDocRef = doc(db, 'users', uid, 'alertRules', rule.ruleId);
    const cleanRule = Object.fromEntries(
      Object.entries(rule).filter(([_, v]) => v !== undefined)
    );
    await setDoc(
      ruleDocRef,
      {
        ...cleanRule,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, 'saveAlertRuleToFirestore');
  }
};

export const deleteAlertRuleFromFirestore = async (
  uid: string,
  ruleId: string
): Promise<void> => {
  try {
    const ruleDocRef = doc(db, 'users', uid, 'alertRules', ruleId);
    await deleteDoc(ruleDocRef);
  } catch (err) {
    handleFirestoreError(err, 'deleteAlertRuleFromFirestore');
  }
};

export const subscribeToAlertRules = (
  uid: string,
  onUpdate: (rules: AlertRuleRecord[]) => void
): Unsubscribe => {
  try {
    const colRef = collection(db, 'users', uid, 'alertRules');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const rules: AlertRuleRecord[] = [];
        snapshot.forEach((docSnap) => {
          rules.push(docSnap.data() as AlertRuleRecord);
        });
        onUpdate(rules);
      },
      (err) => {
        handleFirestoreError(err, 'subscribeToAlertRules');
      }
    );
  } catch (err) {
    console.warn('Error subscribing to alert rules:', err);
    return () => {};
  }
};

// -------------------------------------------------------------
// Firestore Helpers for Notification Tokens Subcollection
// -------------------------------------------------------------

export const saveNotificationTokenToFirestore = async (
  uid: string,
  token: string
): Promise<void> => {
  try {
    const tokenId = token.substring(0, 32).replace(/[^a-zA-Z0-9]/g, '_');
    const tokenDocRef = doc(db, 'users', uid, 'notificationTokens', tokenId);
    await setDoc(
      tokenDocRef,
      {
        tokenId,
        token,
        platform: 'web',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, 'saveNotificationTokenToFirestore');
  }
};

// -------------------------------------------------------------
// Firestore Global & Targeted Smart Alerts
// -------------------------------------------------------------

export const saveAlertToFirestore = async (alert: SmartAlertNotification, uid?: string): Promise<void> => {
  try {
    const alertColRef = collection(db, 'smart_alerts');
    await addDoc(alertColRef, {
      ...alert,
      uid: uid || 'global',
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('Firestore alert save fallback:', err);
  }
};

export const markAlertReadInFirestore = async (alertId: string): Promise<void> => {
  try {
    const alertDocRef = doc(db, 'smart_alerts', alertId);
    await updateDoc(alertDocRef, {
      isRead: true,
      readAt: Date.now(),
    });
  } catch (err) {
    console.warn('Firestore mark read error:', err);
  }
};

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  auth,
  googleAuthProvider,
  saveUserProfileToFirestore,
  fetchUserProfileFromFirestore,
  subscribeToUserProfile,
  uploadProfilePhotoToStorage,
  deleteProfilePhotoFromStorage,
  handleFirestoreError,
} from '../services/firebase';
import { UserProfile, UserRole } from '../types';
import {
  FirestoreUserProfile,
  PrimaryUserType,
  UserInterest,
} from '../types/personalization';

interface AuthContextType {
  user: UserProfile;
  firestoreProfile: FirestoreUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginWithEmail: (email: string, password?: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    displayName: string,
    password?: string,
    primaryUserType?: PrimaryUserType,
    interests?: UserInterest[]
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<FirestoreUserProfile>) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string>;
  removePhoto: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  setUserRole: (role: UserRole) => void;
}

const STORAGE_AUTH = 'weatherguard_user_session_v2';

const DEFAULT_GUEST_USER: UserProfile = {
  uid: 'guest_dev_user',
  email: null,
  displayName: 'Atmospheric Analyst',
  profilePhotoUrl: null,
  phoneNumber: '',
  dateOfBirth: '',
  emailVerified: false,
  isAnonymous: true,
  primaryUserType: 'General User',
  specificProfession: '',
  interests: ['Weather Monitoring', 'Disaster Awareness'],
  role: 'general',
  address: {
    line1: '',
    line2: '',
    country: '',
    state: '',
    district: '',
    city: '',
    pincode: ''
  },
  createdAt: Date.now(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_AUTH);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return DEFAULT_GUEST_USER;
  });

  const [firestoreProfile, setFirestoreProfile] = useState<FirestoreUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Map Firebase User to App UserProfile
  const mapFirebaseUser = (fbUser: FirebaseUser, extraData?: Partial<FirestoreUserProfile>): UserProfile => {
    return {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || extraData?.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Meteorologist'),
      profilePhotoUrl: fbUser.photoURL || extraData?.profilePhotoUrl || null,
      phoneNumber: fbUser.phoneNumber || extraData?.phoneNumber || '',
      dateOfBirth: extraData?.dateOfBirth || '',
      gender: extraData?.gender,
      emailVerified: fbUser.emailVerified || false,
      isAnonymous: fbUser.isAnonymous,
      primaryUserType: extraData?.primaryUserType || 'General User',
      specificProfession: extraData?.specificProfession || '',
      interests: (extraData?.interests as string[]) || ['Weather Monitoring', 'Disaster Awareness'],
      address: extraData?.address as any || {
        line1: '',
        line2: '',
        country: '',
        state: '',
        district: '',
        city: '',
        pincode: ''
      },
      role: extraData?.role || 'general',
      createdAt: fbUser.metadata.creationTime ? new Date(fbUser.metadata.creationTime).getTime() : Date.now(),
      lastLoginAt: Date.now(),
    };
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    // Handle potential redirect result from Google sign in
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          const existingProfile = await fetchUserProfileFromFirestore(result.user.uid);
          if (!existingProfile) {
            const initialDoc: FirestoreUserProfile = {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName || 'Planetary Explorer',
              profilePhotoUrl: result.user.photoURL || null,
              phoneNumber: result.user.phoneNumber || '',
              primaryUserType: 'General User',
              interests: ['Weather Monitoring', 'Disaster Awareness', 'Astronomy'],
              role: 'general',
              createdAt: Date.now(),
              lastActive: Date.now(),
              savedLocationsCount: 0,
            };
            await saveUserProfileToFirestore(initialDoc);
            setFirestoreProfile(initialDoc);
          } else {
            setFirestoreProfile(existingProfile);
          }
          const mapped = mapFirebaseUser(result.user, existingProfile || undefined);
          setUser(mapped);
        }
      })
      .catch((err) => {
        console.warn('Redirect result error:', err);
      });

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      if (fbUser && !fbUser.isAnonymous) {
        // Fetch or subscribe to user doc in Firestore
        const profileData = await fetchUserProfileFromFirestore(fbUser.uid);
        const mapped = mapFirebaseUser(fbUser, profileData || undefined);
        setUser(mapped);
        if (profileData) {
          setFirestoreProfile(profileData);
        }

        // Setup real-time listener for Firestore profile changes
        unsubscribeFirestore = subscribeToUserProfile(fbUser.uid, (updatedProfile) => {
          if (updatedProfile) {
            setFirestoreProfile(updatedProfile);
            setUser((prev) => ({
              ...prev,
              displayName: updatedProfile.displayName || prev.displayName,
              profilePhotoUrl: updatedProfile.profilePhotoUrl !== undefined ? updatedProfile.profilePhotoUrl : prev.profilePhotoUrl,
              phoneNumber: updatedProfile.phoneNumber || prev.phoneNumber,
              dateOfBirth: updatedProfile.dateOfBirth || prev.dateOfBirth,
              gender: updatedProfile.gender !== undefined ? updatedProfile.gender : prev.gender,
              primaryUserType: updatedProfile.primaryUserType || prev.primaryUserType,
              specificProfession: updatedProfile.specificProfession || prev.specificProfession,
              interests: (updatedProfile.interests as string[]) || prev.interests,
              role: updatedProfile.role || prev.role,
            }));
          }
        });
      } else {
        // Guest user state
        setUser((prev) => (prev.isAnonymous ? prev : DEFAULT_GUEST_USER));
        setFirestoreProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  // Sync to local storage for quick reload UX
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AUTH, JSON.stringify(user));
    } catch {
      // Ignore
    }
  }, [user]);

  // Inactivity Timer
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // 20 minutes = 1200000 ms
      inactivityTimer = setTimeout(() => {
        const rememberMe = localStorage.getItem('weatherguard_remember_me') !== 'false';
        if (!rememberMe && !user.isAnonymous) {
          firebaseSignOut(auth).finally(() => {
            setUser({
              ...DEFAULT_GUEST_USER,
              uid: `guest_${Date.now()}`,
            });
            setFirestoreProfile(null);
            try {
              localStorage.removeItem(STORAGE_AUTH);
            } catch {}
          });
        }
      }, 1200000);
    };

    const handleActivity = () => {
      const rememberMe = localStorage.getItem('weatherguard_remember_me') !== 'false';
      if (!rememberMe && !user.isAnonymous) {
        resetTimer();
      }
    };

    if (!user.isAnonymous) {
      const rememberMe = localStorage.getItem('weatherguard_remember_me') !== 'false';
      if (!rememberMe) {
        resetTimer();
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('touchstart', handleActivity);
      }
    }

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [user.isAnonymous]);

  const loginWithEmail = async (email: string, password?: string) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      if (password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const profile = await fetchUserProfileFromFirestore(userCredential.user.uid);
        const mapped = mapFirebaseUser(userCredential.user, profile || undefined);
        setUser(mapped);
      } else {
        // Demo fallback without password
        const upgraded: UserProfile = {
          uid: `usr_${Math.random().toString(36).substring(2, 9)}`,
          email,
          displayName: email.split('@')[0] || 'Meteorologist',
          profilePhotoUrl: null,
          phoneNumber: '',
          dateOfBirth: '',
          emailVerified: true,
          isAnonymous: false,
          primaryUserType: 'General User',
          specificProfession: '',
          interests: ['Weather Monitoring', 'Disaster Awareness'],
          role: user.role,
          createdAt: Date.now(),
        };
        setUser(upgraded);
      }
    } catch (err: any) {
      console.warn('Firebase login failed:', err);
      // If Firebase Auth fails (e.g. user not found or wrong password), supply clear error
      let msg = err.message || 'Login failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'User does not exist. Please create an account.';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'Invalid password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string,
    displayName: string,
    password?: string,
    primaryUserType: PrimaryUserType = 'General User',
    interests: UserInterest[] = ['Weather Monitoring', 'Disaster Awareness']
  ) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      if (password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await firebaseUpdateProfile(userCredential.user, {
            displayName: displayName || email.split('@')[0],
          });
        } catch (authErr) {
          console.warn('Firebase Auth profile update failed:', authErr);
        }

        // Initialize Firestore Profile
        const newFirestoreDoc: FirestoreUserProfile = {
          uid: userCredential.user.uid,
          email,
          displayName: displayName || email.split('@')[0],
          profilePhotoUrl: null,
          phoneNumber: '',
          dateOfBirth: '',
          primaryUserType,
          specificProfession: '',
          interests,
          role: user.role || 'general',
          createdAt: Date.now(),
          lastActive: Date.now(),
          savedLocationsCount: 0,
        };
        await saveUserProfileToFirestore(newFirestoreDoc);

        const mapped = mapFirebaseUser(userCredential.user, newFirestoreDoc);
        setUser(mapped);
        setFirestoreProfile(newFirestoreDoc);
      } else {
        // Sandbox fallback
        const newUser: UserProfile = {
          uid: `usr_${Math.random().toString(36).substring(2, 9)}`,
          email,
          displayName: displayName || email.split('@')[0] || 'Planetary Explorer',
          profilePhotoUrl: null,
          phoneNumber: '',
          dateOfBirth: '',
          emailVerified: true,
          isAnonymous: false,
          primaryUserType,
          specificProfession: '',
          interests,
          role: user.role,
          createdAt: Date.now(),
        };
        setUser(newUser);
      }
    } catch (err: any) {
      console.warn('Firebase registration failed:', err);
      let msg = err.message || 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      }
      setAuthError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const existingProfile = await fetchUserProfileFromFirestore(result.user.uid);
      if (!existingProfile) {
        // Initialize Firestore document for new Google user
        const initialDoc: FirestoreUserProfile = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Planetary Explorer',
          profilePhotoUrl: result.user.photoURL || null,
          phoneNumber: result.user.phoneNumber || '',
          primaryUserType: 'General User',
          interests: ['Weather Monitoring', 'Disaster Awareness', 'Astronomy'],
          role: 'general',
          createdAt: Date.now(),
          lastActive: Date.now(),
          savedLocationsCount: 0,
        };
        await saveUserProfileToFirestore(initialDoc);
        setFirestoreProfile(initialDoc);
      } else {
        setFirestoreProfile(existingProfile);
      }
      const mapped = mapFirebaseUser(result.user, existingProfile || undefined);
      setUser(mapped);
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      if (
        err.code === 'auth/popup-blocked' || 
        err.code === 'auth/cancelled-popup-request' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cross-origin-opener-policy-incompatible'
      ) {
        try {
          await signInWithRedirect(auth, googleAuthProvider);
          return; // The page will redirect
        } catch (redirectErr: any) {
          setAuthError('Sign in failed. Please try again.');
        }
      } else {
        setAuthError(err.message || 'Google sign in encountered an issue.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser({
        ...DEFAULT_GUEST_USER,
        uid: `guest_${Date.now()}`,
      });
      setFirestoreProfile(null);
      try {
        localStorage.removeItem(STORAGE_AUTH);
      } catch {}
    }
  };

  const updateProfileData = async (updates: Partial<FirestoreUserProfile>) => {
    if (user.isAnonymous) {
      setUser((prev) => ({
        ...prev,
        displayName: updates.displayName || prev.displayName,
        phoneNumber: updates.phoneNumber !== undefined ? updates.phoneNumber : prev.phoneNumber,
        dateOfBirth: updates.dateOfBirth !== undefined ? updates.dateOfBirth : prev.dateOfBirth,
        gender: updates.gender !== undefined ? updates.gender : prev.gender,
        primaryUserType: updates.primaryUserType || prev.primaryUserType,
        specificProfession: updates.specificProfession !== undefined ? updates.specificProfession : prev.specificProfession,
        interests: (updates.interests as string[]) || prev.interests,
        role: updates.role || prev.role,
      }));
      return;
    }

    try {
      const merged: Partial<FirestoreUserProfile> & { uid: string } = {
        ...updates,
        uid: user.uid,
      };

      if (auth.currentUser && updates.displayName) {
        try {
          await firebaseUpdateProfile(auth.currentUser, {
            displayName: updates.displayName,
          });
        } catch (authErr) {
          console.warn('Firebase Auth profile update failed (network/CORS), gracefully degrading to Firestore only:', authErr);
        }
      }

      await saveUserProfileToFirestore(merged);
      setUser((prev) => ({
        ...prev,
        displayName: updates.displayName || prev.displayName,
        profilePhotoUrl: updates.profilePhotoUrl !== undefined ? updates.profilePhotoUrl : prev.profilePhotoUrl,
        phoneNumber: updates.phoneNumber !== undefined ? updates.phoneNumber : prev.phoneNumber,
        dateOfBirth: updates.dateOfBirth !== undefined ? updates.dateOfBirth : prev.dateOfBirth,
        gender: updates.gender !== undefined ? updates.gender : prev.gender,
        primaryUserType: updates.primaryUserType || prev.primaryUserType,
        specificProfession: updates.specificProfession !== undefined ? updates.specificProfession : prev.specificProfession,
        interests: (updates.interests as string[]) || prev.interests,
        role: updates.role || prev.role,
      }));
    } catch (err) {
      console.warn('Error updating profile data in Firestore:', err);
      throw err;
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    try {
      const downloadUrl = await uploadProfilePhotoToStorage(user.uid, file, user.displayName);
      if (auth.currentUser && !downloadUrl.startsWith('data:')) {
        try {
          await firebaseUpdateProfile(auth.currentUser, {
            photoURL: downloadUrl,
          });
        } catch (authErr) {
          console.warn('Firebase Auth profile update failed (network/CORS), gracefully degrading to Firestore only:', authErr);
        }
      }
      await updateProfileData({ profilePhotoUrl: downloadUrl });
      setUser((prev) => ({ ...prev, profilePhotoUrl: downloadUrl }));
      return downloadUrl;
    } catch (err) {
      console.warn('Error uploading photo:', err);
      throw err;
    }
  };

  const removePhoto = async () => {
    try {
      if (user.profilePhotoUrl) {
        await deleteProfilePhotoFromStorage(user.profilePhotoUrl);
      }
      if (auth.currentUser) {
        try {
          await firebaseUpdateProfile(auth.currentUser, {
            photoURL: '',
          });
        } catch (authErr) {
          console.warn('Firebase Auth profile update failed, ignoring:', authErr);
        }
      }
      await updateProfileData({ profilePhotoUrl: null });
      setUser((prev) => ({ ...prev, profilePhotoUrl: null }));
    } catch (err) {
      console.warn('Error removing photo:', err);
      throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.warn('Error sending password reset email:', err);
      throw err;
    }
  };

  const setUserRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }));
    if (!user.isAnonymous) {
      saveUserProfileToFirestore({ uid: user.uid, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firestoreProfile,
        isAuthenticated: !user.isAnonymous,
        isLoading,
        authError,
        clearAuthError,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        updateProfileData,
        uploadPhoto,
        removePhoto,
        sendPasswordReset,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

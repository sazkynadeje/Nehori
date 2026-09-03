import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendEmailVerification as fbSendEmailVerification,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { UserProfile, UserStats, CategoryId, GuessRecord } from '../types';
import { INITIAL_TEAM_COLLEAGUES } from '../data/team';

// Firebase Client Configuration
// In production, these are injected via environment or firebase-applet-config.json
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyMockForSeamlessPreview12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "korpo-lingvo-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "korpo-lingvo-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "korpo-lingvo-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102630834113",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102630834113:web:a1b2c3d4e5f6g7h8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Local persistence key for robust offline / preview data sync
const LOCAL_STORAGE_USER_KEY = 'korpo_lingvo_user_profile';
const LOCAL_USERS_DB_KEY = 'korpo_lingvo_all_users';

export function getStoredLocalUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local user profile:', e);
  }
  return null;
}

export function saveStoredLocalUser(profile: UserProfile): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    // Also save in mock team database for leaderboard
    const allUsersRaw = localStorage.getItem(LOCAL_USERS_DB_KEY);
    let allUsers: Record<string, UserProfile> = allUsersRaw ? JSON.parse(allUsersRaw) : {};
    allUsers[profile.uid] = profile;
    localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(allUsers));
  } catch (e) {
    console.error('Error saving local user profile:', e);
  }
}

export function createDefaultProfile(uid: string, email: string, displayName: string, department = 'Vývoj & IT'): UserProfile {
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'UZ';

  return {
    uid,
    email,
    displayName: displayName || email.split('@')[0],
    department,
    role: 'Člen týmu',
    avatarSeed: initials,
    emailVerified: false,
    createdAt: Date.now(),
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 1,
      maxStreak: 1,
      totalGuesses: 0,
      millionaireCorrect: 0,
      hangmanUsed: 0,
      totalScore: 0
    },
    badges: ['first_word'],
    dailyProgress: {}
  };
}

export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Firestore offline or permission restricted, falling back to local state:', err);
  }
  return getStoredLocalUser();
}

export async function syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
  saveStoredLocalUser(profile);
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore sync postponed (local storage active):', err);
  }
}

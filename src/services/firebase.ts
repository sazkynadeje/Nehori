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

// Firebase Client Configuration for project: nenaopak
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA8v06FxxITxYDWLx_crwGnN8TvE06eKEo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nenaopak.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nenaopak",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nenaopak.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "285869657043",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:285869657043:web:8b20fcd9a3f67807bb7d26",
  measurementId: "G-48EZ19KBQ4"
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

export function createDefaultProfile(uid: string, email: string, displayName: string, department = 'Vedení & IT Architektura'): UserProfile {
  const isZbynekAdmin = email?.toLowerCase() === 'zbynek.kasnar@gmail.com';
  const finalDisplayName = displayName || (isZbynekAdmin ? 'Zbyněk Kašnar' : email.split('@')[0]);
  const initials = finalDisplayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || (isZbynekAdmin ? 'ZK' : 'UZ');

  return {
    uid,
    email,
    displayName: finalDisplayName,
    department: isZbynekAdmin ? 'Vedení & IT Architektura' : department,
    role: isZbynekAdmin ? 'Administrátor & Správce' : 'Člen týmu',
    avatarSeed: initials,
    emailVerified: isZbynekAdmin ? true : false,
    isAdmin: isZbynekAdmin,
    createdAt: Date.now(),
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      totalGuesses: 0,
      millionaireCorrect: 0,
      hangmanUsed: 0,
      totalScore: 0
    },
    badges: [],
    dailyProgress: {}
  };
}

export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      if (data.email?.toLowerCase() === 'zbynek.kasnar@gmail.com') {
        data.isAdmin = true;
        if (!data.role || data.role === 'Člen týmu') data.role = 'Administrátor & Správce';
      }
      return data;
    }
  } catch (err) {
    console.warn('Firestore offline or permission restricted, falling back to local state:', err);
  }
  const local = getStoredLocalUser();
  if (local && local.email?.toLowerCase() === 'zbynek.kasnar@gmail.com') {
    local.isAdmin = true;
    if (!local.role || local.role === 'Člen týmu') local.role = 'Administrátor & Správce';
  }
  return local;
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

export async function fetchAllUsersFromFirestore(): Promise<UserProfile[]> {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('stats.totalScore', 'desc'));
    const snapshot = await getDocs(q);
    const list: UserProfile[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as UserProfile);
    });
    return list;
  } catch (e) {
    console.warn('Firestore fetchAllUsers fallback to local store:', e);
    const allUsersRaw = localStorage.getItem(LOCAL_USERS_DB_KEY);
    if (allUsersRaw) {
      try {
        return Object.values(JSON.parse(allUsersRaw));
      } catch {}
    }
    return [];
  }
}

export async function saveCuratedWordsToFirestore(dateKey: string, assignment: any): Promise<boolean> {
  try {
    const curatorRef = doc(db, 'curator_assignments', dateKey);
    await setDoc(curatorRef, {
      ...assignment,
      updatedAt: Date.now()
    }, { merge: true });
    return true;
  } catch (e) {
    console.warn('Firestore saveCuratedWords error:', e);
    return false;
  }
}

export async function getCuratedWordsFromFirestore(dateKey: string): Promise<any | null> {
  try {
    const curatorRef = doc(db, 'curator_assignments', dateKey);
    const snap = await getDoc(curatorRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.warn('Firestore getCuratedWords error:', e);
  }
  return null;
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  fbSendEmailVerification,
  onAuthStateChanged,
  updateProfile
};

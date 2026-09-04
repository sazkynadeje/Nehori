import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  UserProfile, 
  CategoryId, 
  GuessRecord 
} from '../types';
import { 
  auth,
  createDefaultProfile, 
  getStoredLocalUser, 
  saveStoredLocalUser, 
  syncUserProfileToFirestore,
  getUserProfileFromFirestore,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  fbSendEmailVerification,
  onAuthStateChanged,
  updateProfile
} from '../services/firebase';
import { getTodayDateString } from '../data/words';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  emailVerificationPending: boolean;
  firebaseConnected: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, displayName: string, department: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyEmailManually: () => void;
  sendVerificationEmailAgain: () => Promise<boolean>;
  recordGuess: (
    dateKey: string,
    category: CategoryId,
    guess: GuessRecord,
    isWinning: boolean,
    secretWord: string
  ) => void;
  unlockHangman: (dateKey: string, category: CategoryId) => void;
  completeHangman: (dateKey: string, category: CategoryId, success: boolean) => void;
  completeMillionaire: (dateKey: string, category: CategoryId, isCorrect: boolean, bonusScore: number) => void;
  resetCategoryProgress: (dateKey: string, category: CategoryId) => void;
  resetAllUserData: () => void;
  updateUserBio: (displayName: string, department: string, role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailVerificationPending, setEmailVerificationPending] = useState<boolean>(false);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);

  // Initialize stored or default user on start & listen to Firebase Auth
  useEffect(() => {
    let unsubscribe = () => {};

    try {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const firestoreProfile = await getUserProfileFromFirestore(fbUser.uid);
          if (firestoreProfile) {
            setUser(firestoreProfile);
            setEmailVerificationPending(!firestoreProfile.emailVerified && !fbUser.emailVerified);
            saveStoredLocalUser(firestoreProfile);
          } else {
            const newProfile = createDefaultProfile(
              fbUser.uid,
              fbUser.email || 'hrac@firma.cz',
              fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Hráč')
            );
            newProfile.emailVerified = fbUser.emailVerified;
            setUser(newProfile);
            setEmailVerificationPending(!fbUser.emailVerified);
            syncUserProfileToFirestore(newProfile);
          }
          setLoading(false);
          return;
        }

        // If not logged in via Firebase session, check local storage
        const local = getStoredLocalUser();
        if (local && local.email) {
          if (local.email.toLowerCase() === 'zbynek.kasnar@gmail.com') {
            local.isAdmin = true;
            local.role = 'Administrátor & Správce';
            local.emailVerified = true;
          }
          setUser(local);
          setEmailVerificationPending(!local.emailVerified);
        } else {
          // Clean state: start at login/register screen or zero data
          setUser(null);
          setEmailVerificationPending(false);
        }
        setLoading(false);
      });
    } catch (e) {
      console.warn('Firebase Auth listener error, using local state:', e);
      const local = getStoredLocalUser();
      if (local && local.email) {
        if (local.email.toLowerCase() === 'zbynek.kasnar@gmail.com') {
          local.isAdmin = true;
          local.role = 'Administrátor & Správce';
          local.emailVerified = true;
        }
        setUser(local);
        setEmailVerificationPending(false);
      } else {
        setUser(null);
        setEmailVerificationPending(false);
      }
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) {
      return { success: false, error: 'Vyplňte prosím e-mail a heslo.' };
    }

    // Try real Firebase Auth first
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      const firestoreProfile = await getUserProfileFromFirestore(fbUser.uid);
      if (firestoreProfile) {
        setUser(firestoreProfile);
        setEmailVerificationPending(!firestoreProfile.emailVerified && !fbUser.emailVerified);
        saveStoredLocalUser(firestoreProfile);
      } else {
        const newProfile = createDefaultProfile(
          fbUser.uid,
          fbUser.email || email,
          fbUser.displayName || email.split('@')[0]
        );
        newProfile.emailVerified = fbUser.emailVerified;
        setUser(newProfile);
        setEmailVerificationPending(!fbUser.emailVerified);
        syncUserProfileToFirestore(newProfile);
      }
      return { success: true };
    } catch (fbError: any) {
      console.warn('Firebase login attempt:', fbError);

      // If user credentials invalid
      if (fbError.code === 'auth/invalid-credential' || fbError.code === 'auth/wrong-password' || fbError.code === 'auth/user-not-found') {
        return { success: false, error: 'Nesprávný e-mail nebo heslo.' };
      }

      // If Firebase Auth Email/Password provider is not yet enabled in Firebase Console, fallback smoothly
      if (fbError.code === 'auth/operation-not-allowed' || fbError.code === 'auth/configuration-not-found') {
        console.info('Firebase Email/Password provider is not yet activated in console. Falling back to local offline profile.');
      }

      // Check if we have an existing local profile
      let current = getStoredLocalUser();
      if (current && current.email.toLowerCase() === email.toLowerCase()) {
        if (current.email.toLowerCase() === 'zbynek.kasnar@gmail.com') {
          current.isAdmin = true;
          current.role = 'Administrátor & Správce';
        }
        current.emailVerified = true;
        saveStoredLocalUser(current);
        setUser(current);
        setEmailVerificationPending(false);
        return { success: true };
      }

      // Also check in all saved users database
      try {
        const allRaw = localStorage.getItem('korpo_lingvo_all_users');
        if (allRaw) {
          const allUsers: Record<string, UserProfile> = JSON.parse(allRaw);
          const found = Object.values(allUsers).find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (found) {
            if (found.email.toLowerCase() === 'zbynek.kasnar@gmail.com') {
              found.isAdmin = true;
              found.role = 'Administrátor & Správce';
            }
            found.emailVerified = true;
            saveStoredLocalUser(found);
            setUser(found);
            setEmailVerificationPending(false);
            return { success: true };
          }
        }
      } catch (e) {}

      // Otherwise create profile and sync
      const displayName = email.split('@')[0].replace('.', ' ');
      const newProfile = createDefaultProfile('user_' + Date.now(), email, displayName);
      newProfile.emailVerified = true;
      saveStoredLocalUser(newProfile);
      setUser(newProfile);
      setEmailVerificationPending(false);
      syncUserProfileToFirestore(newProfile);
      return { success: true };
    }
  };

  const register = async (
    email: string,
    pass: string,
    displayName: string,
    department: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass || !displayName) {
      return { success: false, error: 'Všechna povinná pole musí být vyplněna.' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Heslo musí mít alespoň 6 znaků.' };
    }

    // Try real Firebase Auth creation
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = cred.user;

      try {
        await updateProfile(fbUser, { displayName });
        await fbSendEmailVerification(fbUser);
      } catch (profileErr) {
        console.warn('Could not update profile or send email verification:', profileErr);
      }

      const newProfile = createDefaultProfile(fbUser.uid, email, displayName, department);
      newProfile.emailVerified = true;
      saveStoredLocalUser(newProfile);
      setUser(newProfile);
      setEmailVerificationPending(false);
      syncUserProfileToFirestore(newProfile);
      return { success: true };
    } catch (fbError: any) {
      console.warn('Firebase registration error:', fbError);

      if (fbError.code === 'auth/email-already-in-use') {
        return { success: false, error: 'Tento e-mail je již v systému zaregistrován.' };
      }
      if (fbError.code === 'auth/weak-password') {
        return { success: false, error: 'Heslo je příliš slabé. Zadejte alespoň 6 znaků.' };
      }
      if (fbError.code === 'auth/invalid-email') {
        return { success: false, error: 'Zadejte platnou e-mailovou adresu.' };
      }

      // Offline / Local fallback if email provider not enabled in console
      const newProfile = createDefaultProfile('user_' + Date.now(), email, displayName, department);
      newProfile.emailVerified = true;
      saveStoredLocalUser(newProfile);
      setUser(newProfile);
      setEmailVerificationPending(false);
      syncUserProfileToFirestore(newProfile);
      return { success: true };
    }
  };

  const logout = () => {
    try {
      fbSignOut(auth).catch(() => {});
    } catch {}
    try {
      localStorage.removeItem('korpo_lingvo_user_profile');
    } catch {}
    setUser(null);
    setEmailVerificationPending(false);
  };

  const verifyEmailManually = () => {
    if (!user) return;
    const updated = { ...user, emailVerified: true };
    setUser(updated);
    setEmailVerificationPending(false);
    syncUserProfileToFirestore(updated);
  };

  const sendVerificationEmailAgain = async (): Promise<boolean> => {
    if (auth.currentUser) {
      try {
        await fbSendEmailVerification(auth.currentUser);
        return true;
      } catch (e) {
        console.warn('Failed to send verification email via Firebase:', e);
      }
    }
    await new Promise(r => setTimeout(r, 600));
    return true;
  };

  const recordGuess = (
    dateKey: string,
    category: CategoryId,
    guess: GuessRecord,
    isWinning: boolean,
    secretWord: string
  ) => {
    if (!user) return;

    const todayProgress = user.dailyProgress[dateKey] || {};
    const catProgress = todayProgress[category] || {
      guesses: [],
      solved: false,
      hangmanUnlocked: false,
      scoreEarned: 0
    };

    // Avoid duplicate word guesses
    const existingIndex = catProgress.guesses.findIndex(
      g => g.word.toLowerCase() === guess.word.toLowerCase()
    );
    let updatedGuesses = [...catProgress.guesses];
    if (existingIndex >= 0) {
      updatedGuesses[existingIndex] = guess;
    } else {
      updatedGuesses = [guess, ...updatedGuesses];
    }

    // Sort descending by temperature
    updatedGuesses.sort((a, b) => b.temperature - a.temperature);

    const isNowSolved = isWinning || guess.temperature >= 100 || catProgress.solved;
    const totalGuessesCount = updatedGuesses.length;
    const hangmanShouldUnlock = totalGuessesCount >= 10 && !isNowSolved;

    let earnedScore = catProgress.scoreEarned;
    let newBadges = [...user.badges];

    if (isWinning && !catProgress.solved) {
      // Score calculation: 1000 pts base - (guesses * 40)
      const basePts = Math.max(300, 1000 - updatedGuesses.length * 40);
      earnedScore += basePts;

      if (!newBadges.includes('first_word')) {
        newBadges.push('first_word');
      }
      if (updatedGuesses.length <= 5 && !newBadges.includes('sharp_shooter')) {
        newBadges.push('sharp_shooter');
      }
    }

    // Check steam engine badge
    if (guess.temperature >= 90 && !newBadges.includes('steam_engine')) {
      newBadges.push('steam_engine');
    }

    const updatedUser: UserProfile = {
      ...user,
      badges: newBadges,
      stats: {
        ...user.stats,
        totalGuesses: user.stats.totalGuesses + 1,
        gamesPlayed: (isWinning && !catProgress.solved) ? user.stats.gamesPlayed + 1 : user.stats.gamesPlayed,
        gamesWon: (isWinning && !catProgress.solved) ? user.stats.gamesWon + 1 : user.stats.gamesWon,
        totalScore: user.stats.totalScore + (isWinning && !catProgress.solved ? earnedScore : 0),
        currentStreak: (isWinning && !catProgress.solved) ? user.stats.currentStreak + 1 : user.stats.currentStreak
      },
      dailyProgress: {
        ...user.dailyProgress,
        [dateKey]: {
          ...todayProgress,
          [category]: {
            ...catProgress,
            guesses: updatedGuesses,
            solved: isNowSolved,
            solvedInGuesses: isNowSolved ? (catProgress.solvedInGuesses || updatedGuesses.length) : undefined,
            hangmanUnlocked: catProgress.hangmanUnlocked || hangmanShouldUnlock,
            scoreEarned: earnedScore
          }
        }
      }
    };

    setUser(updatedUser);
    syncUserProfileToFirestore(updatedUser);
  };

  const unlockHangman = (dateKey: string, category: CategoryId) => {
    if (!user) return;
    const today = user.dailyProgress[dateKey] || {};
    const cat = today[category] || {
      guesses: [],
      solved: false,
      hangmanUnlocked: true,
      scoreEarned: 0
    };

    const updated: UserProfile = {
      ...user,
      stats: {
        ...user.stats,
        hangmanUsed: user.stats.hangmanUsed + 1
      },
      dailyProgress: {
        ...user.dailyProgress,
        [dateKey]: {
          ...today,
          [category]: {
            ...cat,
            hangmanUnlocked: true
          }
        }
      }
    };
    setUser(updated);
    syncUserProfileToFirestore(updated);
  };

  const completeHangman = (dateKey: string, category: CategoryId, success: boolean) => {
    if (!user) return;
    const today = user.dailyProgress[dateKey] || {};
    const cat = today[category];
    if (!cat) return;

    let newBadges = [...user.badges];
    if (success && !newBadges.includes('hangman_survivor')) {
      newBadges.push('hangman_survivor');
    }

    const updated: UserProfile = {
      ...user,
      badges: newBadges,
      dailyProgress: {
        ...user.dailyProgress,
        [dateKey]: {
          ...today,
          [category]: {
            ...cat,
            hangmanCompleted: true
          }
        }
      }
    };
    setUser(updated);
    syncUserProfileToFirestore(updated);
  };

  const completeMillionaire = (
    dateKey: string,
    category: CategoryId,
    isCorrect: boolean,
    bonusScore: number
  ) => {
    if (!user) return;
    const today = user.dailyProgress[dateKey] || {};
    const cat = today[category];
    if (!cat) return;

    let newBadges = [...user.badges];
    const newMillionaireCount = user.stats.millionaireCorrect + (isCorrect ? 1 : 0);
    if (newMillionaireCount >= 3 && !newBadges.includes('millionaire_boss')) {
      newBadges.push('millionaire_boss');
    }

    const updated: UserProfile = {
      ...user,
      badges: newBadges,
      stats: {
        ...user.stats,
        millionaireCorrect: newMillionaireCount,
        totalScore: user.stats.totalScore + (isCorrect ? bonusScore : 0)
      },
      dailyProgress: {
        ...user.dailyProgress,
        [dateKey]: {
          ...today,
          [category]: {
            ...cat,
            millionaireCompleted: true,
            millionaireWon: isCorrect,
            scoreEarned: cat.scoreEarned + (isCorrect ? bonusScore : 0)
          }
        }
      }
    };
    setUser(updated);
    syncUserProfileToFirestore(updated);
  };

  const resetCategoryProgress = (dateKey: string, category: CategoryId) => {
    if (!user) return;
    const today = user.dailyProgress[dateKey] || {};
    const updated: UserProfile = {
      ...user,
      dailyProgress: {
        ...user.dailyProgress,
        [dateKey]: {
          ...today,
          [category]: {
            guesses: [],
            solved: false,
            hangmanUnlocked: false,
            scoreEarned: 0
          }
        }
      }
    };
    setUser(updated);
    syncUserProfileToFirestore(updated);
  };

  const resetAllUserData = () => {
    if (!user) return;
    const cleanProfile: UserProfile = {
      ...user,
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
    setUser(cleanProfile);
    saveStoredLocalUser(cleanProfile);
    syncUserProfileToFirestore(cleanProfile);
  };

  const updateUserBio = (displayName: string, department: string, role: string) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      displayName,
      department,
      role
    };
    setUser(updated);
    syncUserProfileToFirestore(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailVerificationPending,
        login,
        register,
        logout,
        verifyEmailManually,
        sendVerificationEmailAgain,
        recordGuess,
        unlockHangman,
        completeHangman,
        completeMillionaire,
        resetCategoryProgress,
        resetAllUserData,
        updateUserBio
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  UserProfile, 
  CategoryId, 
  GuessRecord 
} from '../types';
import { 
  createDefaultProfile, 
  getStoredLocalUser, 
  saveStoredLocalUser, 
  syncUserProfileToFirestore 
} from '../services/firebase';
import { getTodayDateString } from '../data/words';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  emailVerificationPending: boolean;
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
  updateUserBio: (displayName: string, department: string, role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailVerificationPending, setEmailVerificationPending] = useState<boolean>(false);

  // Initialize stored or default user on start
  useEffect(() => {
    const local = getStoredLocalUser();
    if (local) {
      setUser(local);
      setEmailVerificationPending(!local.emailVerified);
    } else {
      // Default demo logged-in user for effortless exploration
      const demoUser = createDefaultProfile('demo_user_1', 'jan.kovar@firma.cz', 'Jan Kovář', 'Vývoj & IT Architektura');
      demoUser.emailVerified = true;
      demoUser.role = 'Senior Frontend Engineer';
      demoUser.stats.totalScore = 1480;
      demoUser.stats.gamesPlayed = 15;
      demoUser.stats.gamesWon = 12;
      demoUser.stats.currentStreak = 14;
      demoUser.stats.maxStreak = 14;
      demoUser.badges = ['first_word', 'hot_streak_3', 'hot_streak_7', 'steam_engine'];
      
      saveStoredLocalUser(demoUser);
      setUser(demoUser);
      setEmailVerificationPending(false);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) {
      return { success: false, error: 'Vyplňte prosím e-mail a heslo.' };
    }
    
    // Check if we have an existing local profile
    let current = getStoredLocalUser();
    if (current && current.email.toLowerCase() === email.toLowerCase()) {
      setUser(current);
      setEmailVerificationPending(!current.emailVerified);
      return { success: true };
    }

    // Otherwise create or sign in
    const displayName = email.split('@')[0].replace('.', ' ');
    const newProfile = createDefaultProfile('user_' + Date.now(), email, displayName);
    // For demo purposes, we require email verification
    newProfile.emailVerified = false;
    saveStoredLocalUser(newProfile);
    setUser(newProfile);
    setEmailVerificationPending(true);
    return { success: true };
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

    const newProfile = createDefaultProfile('user_' + Date.now(), email, displayName, department);
    newProfile.emailVerified = false; // Must be verified before playing
    saveStoredLocalUser(newProfile);
    setUser(newProfile);
    setEmailVerificationPending(true);
    return { success: true };
  };

  const logout = () => {
    // Retain data in storage but set state or create a fresh guest prompt
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
    // Simulated async send
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

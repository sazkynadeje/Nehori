export type CategoryId = 'general_en' | 'work_en' | 'work_terminology';

export interface CategoryInfo {
  id: CategoryId;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  color: string;
  description: string;
}

export interface GuessRecord {
  id: string;
  word: string;
  temperature: number; // 0 to 100
  similarityReason?: string;
  timestamp: number;
}

export interface MillionaireQuestion {
  question: string;
  options: [string, string, string, string]; // [A, B, C, D]
  correctAnswerIndex: number; // 0, 1, 2, 3
  explanation: string;
  practicalContext: string;
}

export interface DailyWordData {
  dateKey: string; // YYYY-MM-DD
  categoryId: CategoryId;
  secretWord: string; // Hidden target word
  secretWordNormalized: string;
  hintDefinition: string; // For Hangman clue
  hangmanWord: string; // The phrase or keyword to reveal in hangman
  millionaire: MillionaireQuestion;
  difficulty: 'Snadná' | 'Střední' | 'Pokročilá';
  selectedBy?: string; // Name of active user who selected it
  selectedByUid?: string;
  selectedByDepartment?: string;
  selectedAt?: number;
}

export interface WordCandidate {
  id: string;
  secretWord: string;
  hintDefinition: string;
  hangmanWord: string;
  difficulty: 'Snadná' | 'Střední' | 'Pokročilá';
  reasonWhyGreat?: string;
  millionaire: MillionaireQuestion;
}

export interface CuratorAssignment {
  targetDateKey: string; // The day they are curating for (e.g. tomorrow)
  activeDateKey: string; // Today, when the selection takes place
  curatorUid: string;
  curatorDisplayName: string;
  curatorDepartment: string;
  isCompleted: boolean;
  chosenWords?: {
    [category in CategoryId]?: DailyWordData;
  };
  submittedAt?: number;
}

export interface DayHistoryRecord {
  dateKey: string;
  formattedDate: string;
  curatorName: string;
  curatorDepartment: string;
  words: {
    [category in CategoryId]?: {
      secretWord: string;
      hintDefinition: string;
      difficulty: string;
      solvedByUser?: boolean;
      userGuessesCount?: number;
      userScore?: number;
    };
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  totalGuesses: number;
  millionaireCorrect: number;
  hangmanUsed: number;
  totalScore: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  department: string;
  role: string;
  avatarSeed: string;
  emailVerified: boolean;
  createdAt: number;
  stats: UserStats;
  badges: string[]; // badge IDs
  isAdmin?: boolean;
  dailyProgress: {
    [dateKey: string]: {
      [category in CategoryId]?: {
        guesses: GuessRecord[];
        solved: boolean;
        solvedInGuesses?: number;
        hangmanUnlocked: boolean;
        hangmanCompleted?: boolean;
        millionaireCompleted?: boolean;
        millionaireWon?: boolean;
        scoreEarned: number;
      };
    };
  };
}

export interface ColleagueRank {
  uid: string;
  displayName: string;
  department: string;
  role: string;
  avatarSeed: string;
  totalScore: number;
  currentStreak: number;
  gamesWon: number;
  successRate: number;
  badgesCount: number;
  lastActive: string;
}

export interface Question {
  id: string;
  day: string; // e.g. "Day 01"
  day_title: string; // e.g. "LLM Foundation"
  topic: string; // e.g. "Transformer & Decoder-only Architecture"
  question: string;
  options: string[]; // 4 options
  answer: 'A' | 'B' | 'C' | 'D' | string;
  hint: string;
  'A explanation'?: string;
  'B explanation'?: string;
  'C explanation'?: string;
  'D explanation'?: string;
  explanation: string;
}

export interface DaySummary {
  dayId: string; // "Day 01"
  dayNum: number; // 1
  title: string;
  topics: string[];
  totalQuestions: number;
  completedCount: number;
  correctCount: number;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedOption: string; // "A" | "B" | "C" | "D"
  isCorrect: boolean;
  timestamp: number;
}

export interface ExamQuestionState {
  question: Question;
  selectedOption?: string;
  isFlagged?: boolean;
}

export interface ExamResult {
  id: string;
  date: string;
  timestamp: number;
  score: number; // out of 100
  totalQuestions: number; // 100
  timeSpentSeconds: number;
  dayPerformance: {
    [day: string]: {
      total: number;
      correct: number;
      percentage: number;
      title: string;
    };
  };
  answers: {
    questionId: string;
    selectedOption?: string;
    correctOption: string;
    isCorrect: boolean;
    day: string;
    topic: string;
  }[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'streak' | 'day' | 'exam' | 'mastery' | 'community';
  icon: string;
  unlockedAt?: number;
  maxProgress: number;
  currentProgress: number;
  isUnlocked: boolean;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  title: string;
  avatar: string;
  totalScore: number;
  examHighScore: number;
  badgesCount: number;
  streakDays: number;
  isCurrentUser?: boolean;
}

export interface CustomPracticeConfig {
  selectedDays: string[];
  selectedTopics: string[];
  questionCount: number; // 10, 12, 15
  instantFeedback: boolean;
}

export type AppMode =
  | 'day_practice'
  | 'custom_practice'
  | 'mistakes_review'
  | 'exam'
  | 'question_bank'
  | 'analytics'
  | 'leaderboard';

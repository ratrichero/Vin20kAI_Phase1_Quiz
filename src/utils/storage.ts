import { ExamResult } from '../types/quiz';

const BOOKMARKS_KEY = 'vin20k_bookmarks';
const PRACTICE_ANSWERS_KEY = 'vin20k_practice_answers';
const EXAM_HISTORY_KEY = 'vin20k_exam_history';
const ACTIVE_EXAM_KEY = 'vin20k_active_exam';
const SETTINGS_KEY = 'vin20k_user_settings';

export interface PracticeHistoryMap {
  [questionId: string]: {
    selectedOption: string;
    isCorrect: boolean;
    updatedAt: number;
  };
}

export interface AppSettings {
  instantFeedback: boolean;
  soundEnabled: boolean;
  compactGrid: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  instantFeedback: true,
  soundEnabled: true,
  compactGrid: false,
};

export const getBookmarks = (): string[] => {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleBookmark = (questionId: string): string[] => {
  try {
    const current = getBookmarks();
    const next = current.includes(questionId)
      ? current.filter((id) => id !== questionId)
      : [...current, questionId];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
};

export const getPracticeHistory = (): PracticeHistoryMap => {
  try {
    const raw = localStorage.getItem(PRACTICE_ANSWERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const recordPracticeAnswer = (
  questionId: string,
  selectedOption: string,
  isCorrect: boolean
): PracticeHistoryMap => {
  try {
    const current = getPracticeHistory();
    current[questionId] = {
      selectedOption,
      isCorrect,
      updatedAt: Date.now(),
    };
    localStorage.setItem(PRACTICE_ANSWERS_KEY, JSON.stringify(current));
    return current;
  } catch {
    return {};
  }
};

export const clearPracticeHistoryForDay = (questionIds: string[]): PracticeHistoryMap => {
  try {
    const current = getPracticeHistory();
    questionIds.forEach((id) => {
      delete current[id];
    });
    localStorage.setItem(PRACTICE_ANSWERS_KEY, JSON.stringify(current));
    return { ...current };
  } catch {
    return {};
  }
};

export const markMistakeResolved = (
  questionId: string,
  correctOption: string
): PracticeHistoryMap => {
  return recordPracticeAnswer(questionId, correctOption, true);
};

export const getExamHistory = (): ExamResult[] => {
  try {
    const raw = localStorage.getItem(EXAM_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveExamResult = (result: ExamResult): ExamResult[] => {
  try {
    const current = getExamHistory();
    const next = [result, ...current].slice(0, 30); // keep last 30
    localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(next));
    // Clear active exam
    localStorage.removeItem(ACTIVE_EXAM_KEY);
    return next;
  } catch {
    return [];
  }
};

export const getActiveExamSession = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_EXAM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveActiveExamSession = (sessionData: unknown) => {
  try {
    localStorage.setItem(ACTIVE_EXAM_KEY, JSON.stringify(sessionData));
  } catch {
    // ignore
  }
};

export const clearActiveExamSession = () => {
  try {
    localStorage.removeItem(ACTIVE_EXAM_KEY);
  } catch {
    // ignore
  }
};

export const getAppSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveAppSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
};

export const resetAllProgress = () => {
  try {
    localStorage.removeItem(PRACTICE_ANSWERS_KEY);
    localStorage.removeItem(BOOKMARKS_KEY);
    localStorage.removeItem(EXAM_HISTORY_KEY);
    localStorage.removeItem(ACTIVE_EXAM_KEY);
  } catch {
    // ignore
  }
};

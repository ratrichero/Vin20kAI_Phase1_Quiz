import { Badge, LeaderboardUser, ExamResult, Question } from '../types/quiz';
import { buildQuestionDayIndex, isCoreDay } from '../data/quizData';
import { PracticeHistoryMap } from './storage';

const BADGES_KEY = 'vin20k_badges';
const STREAK_KEY = 'vin20k_streak_data';
const USER_PROFILE_KEY = 'vin20k_user_profile';

export interface UserProfile {
  name: string;
  title: string;
  avatar: string;
}

export interface StreakData {
  dates: string[]; // ['2026-10-18', '2026-10-19', '2026-10-20']
  currentStreak: number;
  longestStreak: number;
}

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge_day_complete',
    name: 'Chinh Phục 1 Day',
    description: 'Hoàn thành trọn vẹn toàn bộ câu hỏi của ít nhất 1 Day hoặc 1 bộ chuyên đề bổ sung.',
    category: 'day',
    icon: 'BookOpen',
    maxProgress: 1,
    currentProgress: 0,
    isUnlocked: false,
  },
  {
    id: 'badge_exam_high_score',
    name: 'Kỷ Lục Gia Bài Thi',
    description: 'Đạt từ 85 điểm trở lên trong kỳ kiểm tra tổng hợp 100 câu.',
    category: 'exam',
    icon: 'Award',
    maxProgress: 85,
    currentProgress: 0,
    isUnlocked: false,
  },
  {
    id: 'badge_exam_pass',
    name: 'Chứng Chỉ AI Vin20K',
    description: 'Vượt qua kỳ kiểm tra tổng hợp 100 câu với số điểm đạt chuẩn (≥ 70 điểm).',
    category: 'exam',
    icon: 'CheckCircle2',
    maxProgress: 70,
    currentProgress: 0,
    isUnlocked: false,
  },
  {
    id: 'badge_streak_3',
    name: 'Khởi Đầu Kiên Trì',
    description: 'Duy trì chuỗi học tập và luyện quiz liên tục 3 ngày.',
    category: 'streak',
    icon: 'Flame',
    maxProgress: 3,
    currentProgress: 1,
    isUnlocked: false,
  },
  {
    id: 'badge_streak_7',
    name: 'Kỷ Luật Thép',
    description: 'Duy trì chuỗi học tập và luyện quiz liên tục 7 ngày.',
    category: 'streak',
    icon: 'Zap',
    maxProgress: 7,
    currentProgress: 1,
    isUnlocked: false,
  },
  {
    id: 'badge_star_collector',
    name: 'Thợ Săn Tri Thức',
    description: 'Đánh dấu lưu trữ từ 10 câu hỏi quan trọng trở lên để ôn tập.',
    category: 'mastery',
    icon: 'Star',
    maxProgress: 10,
    currentProgress: 0,
    isUnlocked: false,
  },
  {
    id: 'badge_explorer_15',
    name: 'Nhà Thám Hiểm Toàn Năng',
    description: 'Luyện tập câu hỏi ở tất cả 15 Day cốt lõi trong chương trình AI Vin20K.',
    category: 'day',
    icon: 'Compass',
    maxProgress: 15,
    currentProgress: 0,
    isUnlocked: false,
  },
  {
    id: 'badge_custom_master',
    name: 'Kiến Trúc Sư Tùy Biến',
    description: 'Hoàn thành ít nhất một bài luyện tập chuyên đề tùy chỉnh đạt 100% điểm.',
    category: 'mastery',
    icon: 'Sliders',
    maxProgress: 1,
    currentProgress: 0,
    isUnlocked: false,
  },
  {
    id: 'badge_mastery_100',
    name: 'Cột Mốc Thế Kỷ',
    description: 'Trả lời đúng tích lũy từ 100 câu hỏi trở lên trong toàn hệ thống.',
    category: 'mastery',
    icon: 'Target',
    maxProgress: 100,
    currentProgress: 0,
    isUnlocked: false,
  },
  {
    id: 'badge_mastery_500',
    name: 'Bậc Thầy AI Vin20K',
    description: 'Trả lời đúng tích lũy từ 500 câu hỏi trở lên trong toàn hệ thống 1000 câu.',
    category: 'mastery',
    icon: 'Crown',
    maxProgress: 500,
    currentProgress: 0,
    isUnlocked: false,
  },
  {
    id: 'badge_fix_mistakes',
    name: 'Khắc Phục Điểm Yếu',
    description: 'Sửa đúng và khắc phục thành công ít nhất 5 câu hỏi trong chế độ Ôn câu sai.',
    category: 'mastery',
    icon: 'RotateCcw',
    maxProgress: 5,
    currentProgress: 0,
    isUnlocked: false,
  },
];

export const getStoredBadges = (): Badge[] => {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    if (!raw) return INITIAL_BADGES;
    const stored = JSON.parse(raw) as Badge[];
    // Keep progress/unlock state from storage, but always use the latest
    // definitions (name, description, icon, maxProgress) from INITIAL_BADGES.
    return INITIAL_BADGES.map((b) => {
      const found = stored.find((s) => s.id === b.id);
      return found
        ? {
            ...b,
            currentProgress: found.currentProgress,
            isUnlocked: found.isUnlocked,
            unlockedAt: found.unlockedAt,
          }
        : b;
    });
  } catch {
    return INITIAL_BADGES;
  }
};

export const saveBadges = (badges: Badge[]) => {
  try {
    localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  } catch {
    // ignore
  }
};

// Streak tracking
export const getStreakData = (): StreakData => {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      const today = new Date().toISOString().slice(0, 10);
      const initial: StreakData = { dates: [today], currentStreak: 1, longestStreak: 1 };
      localStorage.setItem(STREAK_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return { dates: [new Date().toISOString().slice(0, 10)], currentStreak: 1, longestStreak: 1 };
  }
};

export const recordDailyActivity = (): StreakData => {
  const current = getStreakData();
  const today = new Date().toISOString().slice(0, 10);

  if (!current.dates.includes(today)) {
    const newDates = [...current.dates, today].sort();
    // Compute current consecutive streak
    let streak = 1;
    const todayMs = new Date(today).getTime();

    // Check backwards
    let checkDate = new Date(todayMs);
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const str = checkDate.toISOString().slice(0, 10);
      if (newDates.includes(str)) {
        streak++;
      } else {
        break;
      }
    }

    const longest = Math.max(current.longestStreak, streak);
    const updated: StreakData = {
      dates: newDates,
      currentStreak: streak,
      longestStreak: longest,
    };
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  return current;
};

// User Profile
const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Học viên AI Vin20K',
  title: 'AI Product Specialist',
  avatar: '👨‍💻',
};

export const getUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    return raw ? { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) } : DEFAULT_USER_PROFILE;
  } catch {
    return DEFAULT_USER_PROFILE;
  }
};

export const saveUserProfile = (profile: UserProfile): UserProfile => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
  return profile;
};

// Evaluate and update all achievements based on current app state
export const evaluateAchievements = (
  practiceHistory: PracticeHistoryMap,
  bookmarks: string[],
  examHistory: ExamResult[],
  customPracticeCompletedWithFullScore = false,
  questions: Question[] = []
): { badges: Badge[]; newlyUnlocked: Badge[] } => {
  const badges = getStoredBadges();
  const streak = getStreakData();
  const newlyUnlocked: Badge[] = [];

  // 1. Total correct count
  const totalCorrect = Object.values(practiceHistory).filter((v) => v.isCorrect).length;

  // 2. Questions answered per set (15 core Days + supplemental sets)
  const questionDayIndex = buildQuestionDayIndex(questions);
  const setTotals: { [dayId: string]: number } = {};
  questions.forEach((q) => {
    setTotals[q.day] = (setTotals[q.day] || 0) + 1;
  });

  const setAnsweredCounts: { [dayId: string]: number } = {};
  Object.keys(practiceHistory).forEach((qId) => {
    let dayId = questionDayIndex.get(qId);
    if (!dayId) {
      // Fallback for history recorded before the dataset finished loading
      const match = qId.match(/^D(\d+)/i);
      dayId = match ? `Day ${match[1].padStart(2, '0')}` : undefined;
    }
    if (!dayId) return;
    setAnsweredCounts[dayId] = (setAnsweredCounts[dayId] || 0) + 1;
  });

  const completedDaysCount = Object.entries(setAnsweredCounts).filter(
    ([dayId, answered]) => answered >= (setTotals[dayId] ?? Number.POSITIVE_INFINITY)
  ).length;
  const daysPracticedCount = Object.keys(setAnsweredCounts).filter(isCoreDay).length;

  // 3. Exam high score
  const highestExamScore = examHistory.reduce((max, ex) => Math.max(max, ex.score), 0);

  // Update badge statuses
  const updatedBadges = badges.map((badge) => {
    let progress = badge.currentProgress;
    let unlocked = badge.isUnlocked;

    switch (badge.id) {
      case 'badge_day_complete':
        progress = completedDaysCount;
        unlocked = completedDaysCount >= 1;
        break;

      case 'badge_exam_high_score':
        progress = highestExamScore;
        unlocked = highestExamScore >= 85;
        break;

      case 'badge_exam_pass':
        progress = highestExamScore;
        unlocked = highestExamScore >= 70;
        break;

      case 'badge_streak_3':
        progress = streak.currentStreak;
        unlocked = streak.currentStreak >= 3;
        break;

      case 'badge_streak_7':
        progress = streak.currentStreak;
        unlocked = streak.currentStreak >= 7;
        break;

      case 'badge_star_collector':
        progress = bookmarks.length;
        unlocked = bookmarks.length >= 10;
        break;

      case 'badge_explorer_15':
        progress = daysPracticedCount;
        unlocked = daysPracticedCount >= 15;
        break;

      case 'badge_custom_master':
        if (customPracticeCompletedWithFullScore) {
          progress = 1;
          unlocked = true;
        }
        break;

      case 'badge_mastery_100':
        progress = totalCorrect;
        unlocked = totalCorrect >= 100;
        break;

      case 'badge_mastery_500':
        progress = totalCorrect;
        unlocked = totalCorrect >= 500;
        break;

      case 'badge_fix_mistakes':
        progress = Math.min(5, Math.floor(totalCorrect / 10));
        unlocked = totalCorrect >= 50;
        break;

      default:
        break;
    }

    if (unlocked && !badge.isUnlocked) {
      newlyUnlocked.push({
        ...badge,
        currentProgress: progress,
        isUnlocked: true,
        unlockedAt: Date.now(),
      });
    }

    return {
      ...badge,
      currentProgress: Math.min(progress, badge.maxProgress),
      isUnlocked: unlocked,
      unlockedAt: unlocked ? badge.unlockedAt || Date.now() : undefined,
    };
  });

  saveBadges(updatedBadges);
  return { badges: updatedBadges, newlyUnlocked };
};

// Realistic Cohort Leaderboard generator
export const getCohortLeaderboard = (
  userProfile: UserProfile,
  totalUserCorrect: number,
  examHighScore: number,
  badgesCount: number,
  currentStreak: number
): LeaderboardUser[] => {
  // Total XP calculation formula: Correct questions * 10 + Exam high score * 25 + Badges * 100 + Streak * 20
  const userTotalScore =
    totalUserCorrect * 10 + examHighScore * 25 + badgesCount * 100 + currentStreak * 20;

  const simulatedCohort: LeaderboardUser[] = [
    {
      id: 'vin_01',
      name: 'Trần Minh Hoàng',
      title: 'Principal AI Architect',
      avatar: '🚀',
      totalScore: 9850,
      examHighScore: 96,
      badgesCount: 9,
      streakDays: 14,
    },
    {
      id: 'vin_02',
      name: 'Lê Thu Trang',
      title: 'Senior LLM Engineer',
      avatar: '👩‍💻',
      totalScore: 9120,
      examHighScore: 92,
      badgesCount: 8,
      streakDays: 12,
    },
    {
      id: 'vin_03',
      name: 'Nguyễn Văn Tuấn',
      title: 'Lead AI Product Manager',
      avatar: '⚡',
      totalScore: 8450,
      examHighScore: 89,
      badgesCount: 7,
      streakDays: 9,
    },
    {
      id: 'vin_04',
      name: 'Phạm Đức Dũng',
      title: 'MLOps & Systems Lead',
      avatar: '🛡️',
      totalScore: 7800,
      examHighScore: 86,
      badgesCount: 7,
      streakDays: 8,
    },
    {
      id: 'vin_05',
      name: 'Vũ Hải Nam',
      title: 'Agentic Workflow Engineer',
      avatar: '🤖',
      totalScore: 7100,
      examHighScore: 84,
      badgesCount: 6,
      streakDays: 7,
    },
    {
      id: 'vin_06',
      name: 'Đỗ Bích Ngọc',
      title: 'Data Infrastructure Specialist',
      avatar: '📊',
      totalScore: 6420,
      examHighScore: 81,
      badgesCount: 5,
      streakDays: 6,
    },
    {
      id: 'vin_07',
      name: 'Bùi Quang Khải',
      title: 'AI Solutions Architect',
      avatar: '🧠',
      totalScore: 5750,
      examHighScore: 78,
      badgesCount: 5,
      streakDays: 5,
    },
    {
      id: 'vin_08',
      name: 'Hoàng Kim Chi',
      title: 'AI Product Specialist',
      avatar: '✨',
      totalScore: 4900,
      examHighScore: 75,
      badgesCount: 4,
      streakDays: 4,
    },
    {
      id: 'vin_09',
      name: 'Đặng Quốc Anh',
      title: 'RAG Systems Developer',
      avatar: '🔍',
      totalScore: 4100,
      examHighScore: 72,
      badgesCount: 3,
      streakDays: 3,
    },
    {
      id: 'vin_10',
      name: 'Ngô Phương Thảo',
      title: 'Software & AI Engineer',
      avatar: '💡',
      totalScore: 3400,
      examHighScore: 68,
      badgesCount: 2,
      streakDays: 2,
    },
  ];

  const currentUserEntry: LeaderboardUser = {
    id: 'current_user',
    name: userProfile.name,
    title: userProfile.title,
    avatar: userProfile.avatar,
    totalScore: userTotalScore,
    examHighScore,
    badgesCount,
    streakDays: currentStreak,
    isCurrentUser: true,
  };

  const combined = [...simulatedCohort, currentUserEntry];
  // Sort by totalScore descending
  combined.sort((a, b) => b.totalScore - a.totalScore);

  return combined;
};

import { Question, DaySummary } from '../types/quiz';

// Master dataset: 15 core Days (750 questions) + 5 supplemental sets (250 questions).
const QUIZ_ASSET_URL = '/assets/aistudio/Master_Quiz_1000_Questions_v5.json';
const QUIZ_ASSET_FALLBACK_URL = './assets/aistudio/Master_Quiz_1000_Questions_v5.json';

const EXAM_QUESTION_COUNT = 100;

let cachedQuestions: Question[] | null = null;
let loadPromise: Promise<Question[]> | null = null;

export const loadAllQuestions = async (): Promise<Question[]> => {
  if (cachedQuestions) {
    return cachedQuestions;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      const res = await fetch(QUIZ_ASSET_URL, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Failed to fetch quiz data: ${res.statusText}`);
      }
      const data: Question[] = await res.json();
      cachedQuestions = data;
      return data;
    } catch (err) {
      console.error('Error loading quiz dataset:', err);
      // Fallback try with ./assets prefix if deployed
      try {
        const fallbackRes = await fetch(QUIZ_ASSET_FALLBACK_URL, {
          cache: 'no-store',
        });
        const fallbackData = await fallbackRes.json();
        cachedQuestions = fallbackData;
        return fallbackData;
      } catch (innerErr) {
        console.error('Fallback fetch also failed:', innerErr);
        loadPromise = null;
        throw err;
      }
    }
  })();

  return loadPromise;
};

/**
 * Core curriculum sets are named "Day 01" .. "Day 15".
 * Everything else (e.g. "Quantitative", "Specialized 01") is a supplemental set.
 */
export const isCoreDay = (dayId: string): boolean => /^Day\s+\d+$/i.test(dayId.trim());

export const getCoreDayQuestions = (questions: Question[]): Question[] =>
  questions.filter((q) => isCoreDay(q.day));

export const getSupplementalQuestions = (questions: Question[]): Question[] =>
  questions.filter((q) => !isCoreDay(q.day));

export const getDayList = (questions: Question[]): DaySummary[] => {
  const map: { [day: string]: { title: string; topics: Set<string>; total: number; num: number } } = {};

  questions.forEach((q) => {
    const day = q.day;
    if (!map[day]) {
      const match = day.match(/^Day\s+(\d+)/i);
      const num = match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
      map[day] = {
        title: q.day_title,
        topics: new Set<string>(),
        total: 0,
        num,
      };
    }
    map[day].total += 1;
    if (q.topic) {
      map[day].topics.add(q.topic);
    }
  });

  // Core Days first (numeric order), then supplemental sets (natural order).
  const sortedDays = Object.keys(map).sort((a, b) => {
    const aCore = isCoreDay(a);
    const bCore = isCoreDay(b);
    if (aCore !== bCore) return aCore ? -1 : 1;
    if (aCore && bCore) return map[a].num - map[b].num;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  return sortedDays.map((dayKey, index) => {
    const item = map[dayKey];
    return {
      dayId: dayKey,
      dayNum: index + 1,
      title: item.title,
      topics: Array.from(item.topics),
      totalQuestions: item.total,
      completedCount: 0,
      correctCount: 0,
      isCore: isCoreDay(dayKey),
    };
  });
};

export const getQuestionsForDay = (questions: Question[], dayId: string): Question[] => {
  return questions.filter((q) => q.day.toLowerCase() === dayId.toLowerCase());
};

/** Maps every question id to the set (Day / supplemental) it belongs to. */
export const buildQuestionDayIndex = (questions: Question[]): Map<string, string> => {
  const index = new Map<string, string>();
  questions.forEach((q) => index.set(q.id, q.day));
  return index;
};

/**
 * Systematically samples 100 questions across the 15 core Days.
 * Balances representation so every Day has ~6-7 questions and various topics.
 * Supplemental sets are practice-only and stay out of the certification exam.
 */
export const generateExamQuestions = (allQuestions: Question[]): Question[] => {
  const coreQuestions = getCoreDayQuestions(allQuestions);
  const examPool = coreQuestions.length > 0 ? coreQuestions : allQuestions;
  const days = getDayList(examPool).filter((day) => getQuestionsForDay(examPool, day.dayId).length > 0);

  if (days.length === 0) return [];

  const targetCount = Math.min(EXAM_QUESTION_COUNT, examPool.length);
  const baseQuota = Math.floor(targetCount / days.length);
  const extraQuota = targetCount % days.length;

  const quotaPerDay: { [dayId: string]: number } = {};

  // Shuffle which days receive one of the remainder questions for variety
  const dayIndices = days.map((_, idx) => idx);
  for (let i = dayIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dayIndices[i], dayIndices[j]] = [dayIndices[j], dayIndices[i]];
  }

  days.forEach((day, index) => {
    const originalPos = dayIndices.indexOf(index);
    quotaPerDay[day.dayId] = baseQuota + (originalPos < extraQuota ? 1 : 0);
  });

  const selectedQuestions: Question[] = [];

  days.forEach((day) => {
    const dayQs = getQuestionsForDay(examPool, day.dayId);
    const quota = Math.min(quotaPerDay[day.dayId] ?? baseQuota, dayQs.length);

    // Group by topic to sample diversely
    const byTopic: { [topic: string]: Question[] } = {};
    dayQs.forEach((q) => {
      const t = q.topic || 'General';
      if (!byTopic[t]) byTopic[t] = [];
      byTopic[t].push(q);
    });

    const topicKeys = Object.keys(byTopic);
    const chosenFromDay: Question[] = [];

    // First, pick 1 question from each topic in round-robin until quota is met
    let tIdx = topicKeys.length > 0 ? Math.floor(Math.random() * topicKeys.length) : 0;
    while (chosenFromDay.length < quota && chosenFromDay.length < dayQs.length) {
      const topic = topicKeys[tIdx % topicKeys.length];
      const availableInTopic = byTopic[topic].filter((q) => !chosenFromDay.some((c) => c.id === q.id));
      if (availableInTopic.length > 0) {
        const randQ = availableInTopic[Math.floor(Math.random() * availableInTopic.length)];
        chosenFromDay.push(randQ);
      }
      tIdx++;
    }

    selectedQuestions.push(...chosenFromDay);
  });

  // Ensure exactly the target number of questions
  if (selectedQuestions.length > targetCount) {
    selectedQuestions.length = targetCount;
  } else if (selectedQuestions.length < targetCount) {
    // Fill remaining from unselected questions
    const selectedIds = new Set(selectedQuestions.map((q) => q.id));
    const remaining = examPool.filter((q) => !selectedIds.has(q.id));
    while (selectedQuestions.length < targetCount && remaining.length > 0) {
      const randIdx = Math.floor(Math.random() * remaining.length);
      selectedQuestions.push(remaining.splice(randIdx, 1)[0]);
    }
  }

  // Randomize the order for a real exam feel
  for (let i = selectedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
  }

  return selectedQuestions;
};

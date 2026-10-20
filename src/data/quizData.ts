import { Question, DaySummary } from '../types/quiz';

// Fallback in case fetch needs relative path or during dev
const QUIZ_ASSET_URL = '/assets/aistudio/Master_Quiz_750_Questions__1__91ce19a6.json';

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
      const res = await fetch(QUIZ_ASSET_URL);
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
        const fallbackRes = await fetch('./assets/aistudio/Master_Quiz_750_Questions__1__91ce19a6.json');
        const fallbackData = await fallbackRes.json();
        cachedQuestions = fallbackData;
        return fallbackData;
      } catch (innerErr) {
        console.error('Fallback fetch also failed:', innerErr);
        throw err;
      }
    }
  })();

  return loadPromise;
};

export const getDayList = (questions: Question[]): DaySummary[] => {
  const map: { [day: string]: { title: string; topics: Set<string>; total: number; num: number } } = {};

  questions.forEach((q) => {
    const day = q.day;
    if (!map[day]) {
      const match = day.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 1;
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

  const sortedDays = Object.keys(map).sort((a, b) => map[a].num - map[b].num);

  return sortedDays.map((dayKey) => {
    const item = map[dayKey];
    return {
      dayId: dayKey,
      dayNum: item.num,
      title: item.title,
      topics: Array.from(item.topics),
      totalQuestions: item.total,
      completedCount: 0,
      correctCount: 0,
    };
  });
};

export const getQuestionsForDay = (questions: Question[], dayId: string): Question[] => {
  return questions.filter((q) => q.day.toLowerCase() === dayId.toLowerCase());
};

/**
 * Systematically samples 100 questions across all 15 Days.
 * Balances representation so every Day has ~6-7 questions and various topics.
 */
export const generateExamQuestions = (allQuestions: Question[]): Question[] => {
  const days = getDayList(allQuestions);
  const totalDays = days.length; // 15 days

  // Target count per day: 100 / 15 = 6 with remainder 10
  // So 10 days will have 7 questions, 5 days will have 6 questions (10*7 + 5*6 = 100)
  const quotaPerDay: { [dayId: string]: number } = {};
  
  // Shuffle which days get 7 vs 6 questions for variety in each attempt
  const dayIndices = days.map((_, idx) => idx);
  for (let i = dayIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dayIndices[i], dayIndices[j]] = [dayIndices[j], dayIndices[i]];
  }

  days.forEach((day, index) => {
    const originalPos = dayIndices.indexOf(index);
    quotaPerDay[day.dayId] = originalPos < 10 ? 7 : 6;
  });

  const selectedQuestions: Question[] = [];

  days.forEach((day) => {
    const dayQs = getQuestionsForDay(allQuestions, day.dayId);
    const quota = quotaPerDay[day.dayId] || 6;

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
    let tIdx = Math.floor(Math.random() * topicKeys.length);
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

  // Ensure exactly 100 questions
  if (selectedQuestions.length > 100) {
    selectedQuestions.length = 100;
  } else if (selectedQuestions.length < 100) {
    // Fill remaining from unselected questions
    const selectedIds = new Set(selectedQuestions.map((q) => q.id));
    const remaining = allQuestions.filter((q) => !selectedIds.has(q.id));
    while (selectedQuestions.length < 100 && remaining.length > 0) {
      const randIdx = Math.floor(Math.random() * remaining.length);
      selectedQuestions.push(remaining.splice(randIdx, 1)[0]);
    }
  }

  // Shuffle the final 100 questions or keep them semi-ordered
  // Randomizing the order gives a real exam feel
  for (let i = selectedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
  }

  return selectedQuestions;
};

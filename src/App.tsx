/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Question, DaySummary, AppMode, ExamResult, Badge } from './types/quiz';
import { loadAllQuestions, getDayList, getQuestionsForDay } from './data/quizData';
import {
  getBookmarks,
  getPracticeHistory,
  getExamHistory,
  PracticeHistoryMap,
} from './utils/storage';
import {
  getStoredBadges,
  getStreakData,
  recordDailyActivity,
  getUserProfile,
  evaluateAchievements,
  UserProfile,
  StreakData,
} from './utils/achievements';
import { Navbar } from './components/Navbar';
import { DaySelector } from './components/DaySelector';
import { DayPractice } from './components/DayPractice';
import { CustomPractice } from './components/CustomPractice';
import { MistakesReview } from './components/MistakesReview';
import { LeaderboardAndBadges } from './components/LeaderboardAndBadges';
import { ExamMode } from './components/ExamMode';
import { ExamResultView } from './components/ExamResultView';
import { QuestionBank } from './components/QuestionBank';
import { AnalyticsView } from './components/AnalyticsView';
import { Loader2, AlertCircle, Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [days, setDays] = useState<DaySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // App Navigation State
  const [currentMode, setCurrentMode] = useState<AppMode>('day_practice');
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [reviewingExam, setReviewingExam] = useState<ExamResult | null>(null);

  // User persistent data
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistoryMap>({});
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streak, setStreak] = useState<StreakData>({ dates: [], currentStreak: 1, longestStreak: 1 });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Học viên AI Vin20K',
    title: 'AI Product Specialist',
    avatar: '👨‍💻',
  });

  // Badge unlock notification toast
  const [newBadgeNotification, setNewBadgeNotification] = useState<Badge | null>(null);

  // Load quiz dataset & storage on mount
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const data = await loadAllQuestions();
        setQuestions(data);
        const daySummaries = getDayList(data);
        setDays(daySummaries);
        setBookmarks(getBookmarks());

        const history = getPracticeHistory();
        setPracticeHistory(history);

        const currentStreak = recordDailyActivity();
        setStreak(currentStreak);

        const profile = getUserProfile();
        setUserProfile(profile);

        const currentExams = getExamHistory();
        const { badges: evaluatedBadges } = evaluateAchievements(history, getBookmarks(), currentExams);
        setBadges(evaluatedBadges);
      } catch (err) {
        console.error('Initialization error:', err);
        setLoadError(
          'Không thể tải dữ liệu câu hỏi. Vui lòng kiểm tra file quiz data hoặc tải lại trang.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const totalAnsweredCount = Object.keys(practiceHistory).length;
  const totalCorrectCount = Object.values(practiceHistory).filter((v) => v.isCorrect).length;
  const wrongQuestionsCount = Object.values(practiceHistory).filter((v) => !v.isCorrect).length;
  const examHistory = getExamHistory();
  const highestExamScore = examHistory.reduce((max, ex) => Math.max(max, ex.score), 0);

  // Evaluate achievements whenever practiceHistory, bookmarks, or exams change
  const triggerAchievementCheck = useCallback(
    (customFullScore = false) => {
      const exams = getExamHistory();
      const { badges: updatedBadges, newlyUnlocked } = evaluateAchievements(
        practiceHistory,
        bookmarks,
        exams,
        customFullScore
      );
      setBadges(updatedBadges);

      if (newlyUnlocked.length > 0) {
        const latestBadge = newlyUnlocked[0];
        setNewBadgeNotification(latestBadge);
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.2 },
          });
        } catch {
          // ignore
        }
      }
    },
    [practiceHistory, bookmarks]
  );

  const handleUpdateHistory = (newHistory: PracticeHistoryMap) => {
    setPracticeHistory(newHistory);
    triggerAchievementCheck();
  };

  const handleUpdateBookmarks = (newBookmarks: string[]) => {
    setBookmarks(newBookmarks);
    triggerAchievementCheck();
  };

  const handleSelectDay = (dayId: string) => {
    setSelectedDayId(dayId);
    setCurrentMode('day_practice');
    setReviewingExam(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDayList = () => {
    setSelectedDayId(null);
    setReviewingExam(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExam = () => {
    setSelectedDayId(null);
    setReviewingExam(null);
    setCurrentMode('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCustomPractice = () => {
    setSelectedDayId(null);
    setReviewingExam(null);
    setCurrentMode('custom_practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartMistakesReview = () => {
    setSelectedDayId(null);
    setReviewingExam(null);
    setCurrentMode('mistakes_review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLeaderboard = () => {
    setSelectedDayId(null);
    setReviewingExam(null);
    setCurrentMode('leaderboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuestionBank = () => {
    setSelectedDayId(null);
    setReviewingExam(null);
    setCurrentMode('question_bank');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewExamResult = (exam: ExamResult) => {
    setReviewingExam(exam);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">AI Vin20K Master Quiz</h2>
          <p className="text-sm text-slate-400">Đang khởi tạo 750 câu hỏi cho 15 ngày học...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-white">Lỗi tải dữ liệu</h2>
          <p className="text-sm text-slate-400">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // Active question set when in Day Practice mode
  const currentDayQuestions = selectedDayId ? getQuestionsForDay(questions, selectedDayId) : [];
  const currentDayMeta = days.find((d) => d.dayId === selectedDayId);
  const unlockedBadgesCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification for Newly Unlocked Badge */}
      {newBadgeNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 border border-amber-500/60 rounded-2xl p-4 shadow-2xl flex items-start gap-3.5 animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Huy hiệu mới đã mở khóa!
            </div>
            <div className="text-sm font-bold text-white">{newBadgeNotification.name}</div>
            <p className="text-xs text-slate-300 leading-snug">{newBadgeNotification.description}</p>
          </div>
          <button
            onClick={() => setNewBadgeNotification(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setReviewingExam(null);
          if (mode !== 'day_practice') {
            setSelectedDayId(null);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedDayId={selectedDayId}
        onBackToDaySelector={handleBackToDayList}
        totalAnsweredCount={totalAnsweredCount}
        totalBookmarksCount={bookmarks.length}
        badgesCount={unlockedBadgesCount}
        wrongQuestionsCount={wrongQuestionsCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {/* If user is reviewing a past exam result */}
        {reviewingExam ? (
          <ExamResultView
            result={reviewingExam}
            bookmarks={bookmarks}
            onUpdateBookmarks={handleUpdateBookmarks}
            onRetakeExam={handleStartExam}
            onBackToOverview={() => {
              setReviewingExam(null);
              setCurrentMode('analytics');
            }}
          />
        ) : (
          <>
            {/* Mode 1: Day Practice */}
            {currentMode === 'day_practice' && (
              <>
                {selectedDayId && currentDayMeta ? (
                  <DayPractice
                    dayId={selectedDayId}
                    dayTitle={currentDayMeta.title}
                    questions={currentDayQuestions}
                    practiceHistory={practiceHistory}
                    bookmarks={bookmarks}
                    onBack={handleBackToDayList}
                    onUpdateHistory={handleUpdateHistory}
                    onUpdateBookmarks={handleUpdateBookmarks}
                    onSelectNextDay={handleSelectDay}
                  />
                ) : (
                  <DaySelector
                    days={days}
                    practiceHistory={practiceHistory}
                    onSelectDay={handleSelectDay}
                    onStartExam={handleStartExam}
                    onOpenQuestionBank={handleOpenQuestionBank}
                    onStartCustomPractice={handleStartCustomPractice}
                    onOpenLeaderboard={handleOpenLeaderboard}
                    onStartMistakesReview={handleStartMistakesReview}
                  />
                )}
              </>
            )}

            {/* Mode 2: Custom Practice (10 - 15 questions by specific topics/skills) */}
            {currentMode === 'custom_practice' && (
              <CustomPractice
                questions={questions}
                practiceHistory={practiceHistory}
                bookmarks={bookmarks}
                onUpdateHistory={handleUpdateHistory}
                onUpdateBookmarks={handleUpdateBookmarks}
                onBackToOverview={handleBackToDayList}
                onCompletedWithFullScore={() => triggerAchievementCheck(true)}
              />
            )}

            {/* Mode: Mistakes Review (Chế độ Ôn tập câu hỏi sai) */}
            {currentMode === 'mistakes_review' && (
              <MistakesReview
                questions={questions}
                practiceHistory={practiceHistory}
                bookmarks={bookmarks}
                onUpdateHistory={handleUpdateHistory}
                onUpdateBookmarks={handleUpdateBookmarks}
                onBackToOverview={handleBackToDayList}
                onStartExam={handleStartExam}
              />
            )}

            {/* Mode 3: Exam Mode (100 Questions / 100 Minutes) */}
            {currentMode === 'exam' && (
              <ExamMode
                allQuestions={questions}
                bookmarks={bookmarks}
                onUpdateBookmarks={handleUpdateBookmarks}
                onBackToOverview={handleBackToDayList}
              />
            )}

            {/* Mode 4: Leaderboard & Badges */}
            {currentMode === 'leaderboard' && (
              <LeaderboardAndBadges
                badges={badges}
                streak={streak}
                userProfile={userProfile}
                totalUserCorrect={totalCorrectCount}
                examHighScore={highestExamScore}
                onUpdateProfile={setUserProfile}
                onStartExam={handleStartExam}
              />
            )}

            {/* Mode 5: Question Bank & Search */}
            {currentMode === 'question_bank' && (
              <QuestionBank
                questions={questions}
                bookmarks={bookmarks}
                onUpdateBookmarks={handleUpdateBookmarks}
                onPracticeDay={handleSelectDay}
              />
            )}

            {/* Mode 6: Analytics & History */}
            {currentMode === 'analytics' && (
              <AnalyticsView
                questions={questions}
                days={days}
                practiceHistory={practiceHistory}
                bookmarks={bookmarks}
                onUpdateBookmarks={handleUpdateBookmarks}
                onSelectDay={handleSelectDay}
                onReviewExam={handleReviewExamResult}
                onStartExam={handleStartExam}
                onStartMistakesReview={handleStartMistakesReview}
                onRefreshData={() => {
                  setPracticeHistory({});
                  setBookmarks([]);
                  triggerAchievementCheck();
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AI Vin20K Master Quiz</span>
            <span>·</span>
            <span>750 câu hỏi luyện thi chuẩn Production cho 15 ngày học</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>LLM Foundation</span>
            <span>·</span>
            <span>Agentic Systems</span>
            <span>·</span>
            <span>Production Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

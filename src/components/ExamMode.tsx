import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question, ExamResult } from '../types/quiz';
import { generateExamQuestions, getDayList } from '../data/quizData';
import {
  saveExamResult,
  getActiveExamSession,
  saveActiveExamSession,
  clearActiveExamSession,
} from '../utils/storage';
import { playClickSound, playCorrectSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ExamResultView } from './ExamResultView';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Pause,
  Award,
  Layers,
  BookOpen,
} from 'lucide-react';

interface ExamModeProps {
  allQuestions: Question[];
  bookmarks: string[];
  onUpdateBookmarks: (bms: string[]) => void;
  onBackToOverview: () => void;
}

const TOTAL_TIME_SECONDS = 100 * 60; // 100 minutes = 6000 seconds

export const ExamMode: React.FC<ExamModeProps> = ({
  allQuestions,
  bookmarks,
  onUpdateBookmarks,
  onBackToOverview,
}) => {
  const [examState, setExamState] = useState<'intro' | 'active' | 'paused' | 'submitted'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(TOTAL_TIME_SECONDS);
  const [filterMatrix, setFilterMatrix] = useState<'all' | 'unanswered' | 'flagged'>('all');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  const timerRef = useRef<number | null>(null);

  // Check for active saved session on mount
  const hasSavedSession = Boolean(getActiveExamSession());

  const startNewExam = () => {
    playClickSound();
    clearActiveExamSession();
    const selected = generateExamQuestions(allQuestions);
    setQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedIds([]);
    setTimeRemaining(TOTAL_TIME_SECONDS);
    setExamResult(null);
    setExamState('active');
  };

  const resumeSavedExam = () => {
    playClickSound();
    const saved = getActiveExamSession();
    if (saved && saved.questions && saved.questions.length > 0) {
      setQuestions(saved.questions);
      setCurrentIndex(saved.currentIndex || 0);
      setAnswers(saved.answers || {});
      setFlaggedIds(saved.flaggedIds || []);
      setTimeRemaining(saved.timeRemaining || TOTAL_TIME_SECONDS);
      setExamState('active');
    } else {
      startNewExam();
    }
  };

  // Timer countdown
  useEffect(() => {
    if (examState === 'active') {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleForceSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState]);

  // Persist session to localStorage every 5 seconds or on answer
  useEffect(() => {
    if (examState === 'active' && questions.length > 0) {
      saveActiveExamSession({
        questions,
        currentIndex,
        answers,
        flaggedIds,
        timeRemaining,
        savedAt: Date.now(),
      });
    }
  }, [examState, questions, currentIndex, answers, flaggedIds, timeRemaining]);

  const handleSelectOption = (optKey: string) => {
    playClickSound();
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optKey,
    }));
  };

  const handleToggleFlag = () => {
    playClickSound();
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setFlaggedIds((prev) =>
      prev.includes(currentQ.id) ? prev.filter((id) => id !== currentQ.id) : [...prev, currentQ.id]
    );
  };

  const handleNext = () => {
    playClickSound();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleForceSubmit = useCallback(() => {
    // Grade exam
    let score = 0;
    const dayPerformance: ExamResult['dayPerformance'] = {};

    const daysList = getDayList(allQuestions);
    daysList.forEach((d) => {
      dayPerformance[d.dayId] = {
        total: 0,
        correct: 0,
        percentage: 0,
        title: d.title,
      };
    });

    const detailedAnswers = questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected?.toUpperCase() === q.answer.toUpperCase();
      if (isCorrect) score += 1;

      if (!dayPerformance[q.day]) {
        dayPerformance[q.day] = {
          total: 0,
          correct: 0,
          percentage: 0,
          title: q.day_title,
        };
      }
      dayPerformance[q.day].total += 1;
      if (isCorrect) {
        dayPerformance[q.day].correct += 1;
      }

      return {
        questionId: q.id,
        selectedOption: selected,
        correctOption: q.answer,
        isCorrect,
        day: q.day,
        topic: q.topic,
      };
    });

    // Compute day percentages
    Object.keys(dayPerformance).forEach((dayKey) => {
      const item = dayPerformance[dayKey];
      item.percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    });

    const timeSpentSeconds = TOTAL_TIME_SECONDS - timeRemaining;

    const result: ExamResult = {
      id: `EXAM_${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
      score,
      totalQuestions: questions.length,
      timeSpentSeconds,
      dayPerformance,
      answers: detailedAnswers,
    };

    saveExamResult(result);
    setExamResult(result);
    setExamState('submitted');
    clearActiveExamSession();

    if (score >= 70) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    }
  }, [allQuestions, questions, answers, timeRemaining]);

  const currentQ = questions[currentIndex];
  const isFlagged = currentQ ? flaggedIds.includes(currentQ.id) : false;
  const currentSelectedOpt = currentQ ? answers[currentQ.id] : undefined;
  const answeredTotal = Object.keys(answers).length;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimerLow = timeRemaining < 15 * 60; // under 15 mins
  const isTimerCritical = timeRemaining < 5 * 60; // under 5 mins

  // Filter matrix questions
  const displayedIndices = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => {
      if (filterMatrix === 'unanswered') return !answers[q.id];
      if (filterMatrix === 'flagged') return flaggedIds.includes(q.id);
      return true;
    })
    .map(({ idx }) => idx);

  // 1. Intro Screen
  if (examState === 'intro') {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-3 sm:space-y-8 sm:py-6">
        <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:space-y-6 sm:p-8">
          <div className="space-y-3 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Clock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Kiểm Tra Tổng Hợp Kiến Thức AI Vin20K
            </h1>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Đề thi tổng hợp tiêu chuẩn mô phỏng kỳ kiểm tra năng lực kỹ sư AI: 100 câu trắc nghiệm được lấy ngẫu nhiên và phân bổ đều qua 15 ngày học.
            </p>
          </div>

          {/* Exam Rules Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <div className="text-xs text-slate-400">Số lượng câu</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">100 câu</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <div className="text-xs text-slate-400">Thời gian</div>
              <div className="text-xl font-bold text-indigo-400 font-mono mt-0.5">100 phút</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <div className="text-xs text-slate-400">Tiêu chuẩn đạt</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">$\ge 70$ điểm</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <div className="text-xs text-slate-400">Phạm vi</div>
              <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">Day 01 - 15</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4.5 space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Quy chế và lưu ý phòng thi:</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400 text-xs">
              <li>Mỗi câu hỏi có 4 lựa chọn (A, B, C, D) và chỉ có 1 đáp án chính xác nhất.</li>
              <li>Trong lúc thi, đáp án và giải thích sẽ được ẩn hoàn toàn để đảm bảo tính khách quan.</li>
              <li>Bạn có thể đặt cờ (Flag) cho những câu phân vân để quay lại kiểm tra trước khi nộp bài.</li>
              <li>Hệ thống tự động lưu bài làm theo thời gian thực; nếu lỡ tải lại trang, bài thi vẫn được bảo toàn.</li>
              <li>Hết 100 phút, hệ thống sẽ tự động thu bài và xuất báo cáo kết quả kèm giải thích chi tiết.</li>
            </ul>
          </div>

          {/* Start Buttons */}
          <div className="space-y-3 pt-2">
            {hasSavedSession && (
              <button
                onClick={resumeSavedExam}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tiếp tục bài thi đang làm dở dang</span>
              </button>
            )}

            <button
              onClick={startNewExam}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>{hasSavedSession ? 'Bắt đầu đề thi mới từ đầu' : 'Bắt đầu tính giờ thi ngay (100 phút)'}</span>
            </button>

            <button
              onClick={onBackToOverview}
              className="w-full py-2.5 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Quay lại ôn tập theo Day
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Submitted Result Screen
  if (examState === 'submitted' && examResult) {
    return (
      <ExamResultView
        result={examResult}
        bookmarks={bookmarks}
        onUpdateBookmarks={onUpdateBookmarks}
        onRetakeExam={startNewExam}
        onBackToOverview={onBackToOverview}
      />
    );
  }

  // 3. Active Exam Screen
  return (
    <div className="space-y-6 pb-20">
      {/* Sticky Exam Monitor Header */}
      <div className="sticky top-32 z-30 flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/95 p-2.5 shadow-lg backdrop-blur-md xl:top-16 sm:gap-4 sm:p-3.5">
        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm sm:text-base border transition-colors ${
              isTimerCritical
                ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                : isTimerLow
                ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                : 'bg-slate-950 text-indigo-300 border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeRemaining)}</span>
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-slate-300 font-mono hidden sm:block">
            <span>Đã làm: </span>
            <strong className="text-indigo-400">{answeredTotal}</strong>/100
            {flaggedIds.length > 0 && (
              <span className="text-amber-400 ml-2">({flaggedIds.length} cờ)</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExamState(examState === 'active' ? 'paused' : 'active')}
            className="flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 sm:px-3"
            aria-label={examState === 'paused' ? 'Tiếp tục làm bài thi' : 'Tạm dừng làm bài thi'}
            title="Tạm dừng làm bài thi"
          >
            {examState === 'paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{examState === 'paused' ? 'Tiếp tục' : 'Tạm dừng'}</span>
          </button>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="min-h-10 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 sm:px-4"
          >
            <span className="sm:hidden">Nộp bài</span>
            <span className="hidden sm:inline">Nộp bài thi</span>
          </button>
        </div>
      </div>

      {/* Paused Overlay */}
      {examState === 'paused' && (
        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-5 text-center shadow-2xl sm:p-8">
          <Pause className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Bài thi đang tạm dừng</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Đồng hồ đếm ngược đã được tạm dừng. Nội dung câu hỏi được che để đảm bảo tính công bằng.
          </p>
          <button
            onClick={() => setExamState('active')}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md transition-all"
          >
            Tiếp tục làm bài
          </button>
        </div>
      )}

      {/* Exam Main Area */}
      {examState === 'active' && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Active Question Card */}
          <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:space-y-6 sm:p-6 lg:col-span-8 lg:p-8">
            {/* Question Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 text-xs text-slate-400">
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-mono text-indigo-400 font-bold">
                  Câu {currentIndex + 1} / 100
                </span>
                <span>·</span>
                <span className="text-slate-300 font-medium">{currentQ.day}</span>
                <span>·</span>
                <span className="text-slate-400">{currentQ.topic}</span>
              </div>

              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                  isFlagged
                    ? 'bg-amber-950/60 text-amber-300 border-amber-600/60 font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                }`}
                title="Đặt cờ để kiểm tra lại câu hỏi này sau"
              >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isFlagged ? 'Đã đặt cờ' : 'Đặt cờ xem lại'}</span>
              </button>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <h3 className="break-words text-base font-bold leading-relaxed tracking-tight text-white sm:text-xl">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((optionText, optIndex) => {
                const optKey = ['A', 'B', 'C', 'D'][optIndex] || optionText.charAt(0);
                const isSelected = currentSelectedOpt === optKey;

                return (
                  <button
                    key={optIndex}
                    onClick={() => handleSelectOption(optKey)}
                    className={`flex min-h-11 w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 active:scale-[0.99] sm:gap-3.5 sm:p-4 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-indigo-100 shadow-md shadow-indigo-950/30'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {optKey}
                    </span>

                    <span className="min-w-0 flex-1 break-words pt-0.5 text-sm leading-relaxed sm:text-base">
                      {optionText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-800 pt-5 sm:gap-4 sm:pt-6">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`flex min-h-11 items-center gap-1 rounded-xl border px-2.5 py-2 text-[11px] font-medium transition-colors sm:gap-1.5 sm:px-4 sm:text-sm ${
                  currentIndex === 0
                    ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <div className="text-xs text-slate-500 font-mono hidden sm:inline">
                {currentSelectedOpt ? (
                  <span className="text-emerald-400">Đã chọn phương án {currentSelectedOpt}</span>
                ) : (
                  <span className="text-amber-400">Chưa chọn phương án</span>
                )}
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className={`flex min-h-11 items-center gap-1 rounded-xl px-2.5 py-2 text-[11px] font-semibold transition-colors sm:gap-1.5 sm:px-5 sm:text-sm ${
                  currentIndex === questions.length - 1
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95'
                }`}
              >
                <span>Câu sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: 100 Questions Matrix Drawer */}
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:p-4 xl:col-span-4 xl:p-5 lg:col-span-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Bảng 100 câu hỏi</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                {answeredTotal}/100 đã làm
              </span>
            </div>

            {/* Matrix Filters */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg text-[11px] font-medium text-center">
              <button
                onClick={() => setFilterMatrix('all')}
                className={`py-1 rounded ${
                  filterMatrix === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất cả (100)
              </button>
              <button
                onClick={() => setFilterMatrix('unanswered')}
                className={`py-1 rounded ${
                  filterMatrix === 'unanswered' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Chưa làm ({100 - answeredTotal})
              </button>
              <button
                onClick={() => setFilterMatrix('flagged')}
                className={`py-1 rounded ${
                  filterMatrix === 'flagged' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Đặt cờ ({flaggedIds.length})
              </button>
            </div>

            {/* Matrix Button Grid */}
            <div className="grid max-h-[380px] grid-cols-6 gap-1.5 overflow-y-auto pr-1 min-[480px]:grid-cols-8 sm:grid-cols-10 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
              {questions.map((q, idx) => {
                const isSelected = Boolean(answers[q.id]);
                const isCurr = idx === currentIndex;
                const isFlaggedQuestion = flaggedIds.includes(q.id);

                let btnStyle = 'bg-slate-800/80 text-slate-400 hover:bg-slate-700';
                if (isSelected) {
                  btnStyle = 'bg-indigo-600 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      playClickSound();
                      setCurrentIndex(idx);
                    }}
                    className={`relative flex h-10 items-center justify-center rounded text-[11px] font-mono transition-all ${btnStyle} ${
                      isCurr ? 'ring-2 ring-emerald-400 scale-105 z-10' : ''
                    }`}
                    title={`Câu ${idx + 1}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlaggedQuestion && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block" />
                <span>Đã làm</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block" />
                <span>Chưa làm</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>Đặt cờ</span>
              </span>
            </div>

            {/* Submit CTA */}
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              Nộp bài thi ngay
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-4">
          <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md space-y-4 overflow-y-auto overscroll-contain rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:space-y-5 sm:p-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Xác nhận nộp bài thi?</h3>
              <p className="text-slate-300 text-xs sm:text-sm">
                Sau khi nộp bài, hệ thống sẽ tính điểm ngay và mở khóa toàn bộ gợi ý, đáp án và giải thích chi tiết.
              </p>
            </div>

            {/* Status Checklist */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Số câu đã trả lời:</span>
                <strong className="font-mono text-emerald-400">{answeredTotal} / 100</strong>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Số câu còn bỏ trống:</span>
                <strong className="font-mono text-amber-400">{100 - answeredTotal} câu</strong>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Số câu đang đặt cờ xem lại:</span>
                <strong className="font-mono text-indigo-400">{flaggedIds.length} câu</strong>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Thời gian còn lại:</span>
                <strong className="font-mono text-white">{formatTimer(timeRemaining)}</strong>
              </div>
            </div>

            {100 - answeredTotal > 0 && (
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Bạn vẫn còn <strong>{100 - answeredTotal}</strong> câu chưa chọn đáp án. Các câu bỏ trống sẽ bị tính 0 điểm.
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Tiếp tục làm bài
              </button>

              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleForceSubmit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

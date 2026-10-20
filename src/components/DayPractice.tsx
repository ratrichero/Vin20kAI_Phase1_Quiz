import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Question } from '../types/quiz';
import { PracticeHistoryMap, toggleBookmark, recordPracticeAnswer, clearPracticeHistoryForDay } from '../utils/storage';
import { playCorrectSound, playIncorrectSound, playClickSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Star,
  RotateCcw,
  Volume2,
  VolumeX,
  Lightbulb,
  Award,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';

interface DayPracticeProps {
  dayId: string;
  dayTitle: string;
  questions: Question[];
  practiceHistory: PracticeHistoryMap;
  bookmarks: string[];
  onBack: () => void;
  onUpdateHistory: (history: PracticeHistoryMap) => void;
  onUpdateBookmarks: (bookmarks: string[]) => void;
  onSelectNextDay?: (nextDayId: string) => void;
}

export const DayPractice: React.FC<DayPracticeProps> = ({
  dayId,
  dayTitle,
  questions,
  practiceHistory,
  bookmarks,
  onBack,
  onUpdateHistory,
  onUpdateBookmarks,
  onSelectNextDay,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [filterWrongOnly, setFilterWrongOnly] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];

  // Answer for current question from history
  const savedRecord = currentQ ? practiceHistory[currentQ.id] : undefined;
  const isBookmarked = currentQ ? bookmarks.includes(currentQ.id) : false;

  // Track answers inside current session
  const [sessionAnswers, setSessionAnswers] = useState<{ [qId: string]: string }>({});

  useEffect(() => {
    // Populate session answers from persistent history
    const initial: { [qId: string]: string } = {};
    questions.forEach((q) => {
      if (practiceHistory[q.id]) {
        initial[q.id] = practiceHistory[q.id].selectedOption;
      }
    });
    setSessionAnswers(initial);
  }, [questions, practiceHistory]);

  // Reset hint/explanation when question changes
  useEffect(() => {
    setShowHint(false);
    // If already answered, reveal explanation by default
    setShowExplanation(Boolean(savedRecord));
  }, [currentIndex, savedRecord]);

  // Filter questions if "filterWrongOnly" is enabled
  const displayedQuestionIndices = useMemo(() => {
    if (!filterWrongOnly) {
      return questions.map((_, idx) => idx);
    }
    return questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => practiceHistory[q.id] && !practiceHistory[q.id].isCorrect)
      .map(({ idx }) => idx);
  }, [questions, filterWrongOnly, practiceHistory]);

  const handleSelectOption = useCallback(
    (optionKey: string) => {
      if (!currentQ) return;
      if (soundEnabled) playClickSound();

      const isCorrect = optionKey.toUpperCase() === currentQ.answer.toUpperCase();

      if (soundEnabled && instantFeedback) {
        if (isCorrect) playCorrectSound();
        else playIncorrectSound();
      }

      const updatedHistory = recordPracticeAnswer(currentQ.id, optionKey, isCorrect);
      onUpdateHistory(updatedHistory);

      setSessionAnswers((prev) => ({
        ...prev,
        [currentQ.id]: optionKey,
      }));

      if (instantFeedback) {
        setShowExplanation(true);
      }
    },
    [currentQ, soundEnabled, instantFeedback, onUpdateHistory]
  );

  const handleToggleBookmark = () => {
    if (!currentQ) return;
    if (soundEnabled) playClickSound();
    const nextBookmarks = toggleBookmark(currentQ.id);
    onUpdateBookmarks(nextBookmarks);
  };

  const handleResetDay = () => {
    if (!window.confirm('Bạn có chắc muốn làm lại toàn bộ 50 câu hỏi của Day này?')) return;
    const qIds = questions.map((q) => q.id);
    const updated = clearPracticeHistoryForDay(qIds);
    onUpdateHistory(updated);
    setSessionAnswers({});
    setCurrentIndex(0);
    setShowSummaryModal(false);
  };

  const handleNext = () => {
    if (soundEnabled) playClickSound();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummaryModal(true);
      triggerConfettiIfGood();
    }
  };

  const handlePrev = () => {
    if (soundEnabled) playClickSound();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Stats for current Day
  const answeredCount = questions.filter((q) => practiceHistory[q.id]).length;
  const correctCount = questions.filter((q) => practiceHistory[q.id]?.isCorrect).length;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const triggerConfettiIfGood = () => {
    if (accuracy >= 80) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectOption(key);
      } else if (key === '1') {
        handleSelectOption('A');
      } else if (key === '2') {
        handleSelectOption('B');
      } else if (key === '3') {
        handleSelectOption('C');
      } else if (key === '4') {
        handleSelectOption('D');
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (key === 'H') {
        setShowHint((prev) => !prev);
      } else if (key === 'B') {
        handleToggleBookmark();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectOption, handleNext, handlePrev]);

  // Extract next Day ID (e.g. Day 01 -> Day 02)
  const nextDayId = useMemo(() => {
    const match = dayId.match(/\d+/);
    if (!match) return null;
    const num = parseInt(match[0], 10);
    if (num < 15) {
      return `Day ${(num + 1).toString().padStart(2, '0')}`;
    }
    return null;
  }, [dayId]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-16 sm:space-y-6 sm:pb-20">
      {/* Top Header Controls */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onBack}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            title="Quay lại danh sách Day"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 rounded border border-indigo-800/50 bg-indigo-950 px-2 py-0.5 font-mono text-xs font-bold text-indigo-300">
                {dayId}
              </span>
              <h2 className="min-w-0 truncate text-base font-bold tracking-tight text-white sm:text-lg">{dayTitle}</h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Câu {currentIndex + 1} / {questions.length} · Đã làm {answeredCount}/50 ({accuracy}% đúng)
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setInstantFeedback((prev) => !prev)}
            className={`flex min-h-10 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition-colors sm:px-3 sm:text-xs ${
              instantFeedback
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Bật/tắt hiện đáp án và giải thích ngay khi chọn"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="sm:hidden">Đáp án: {instantFeedback ? 'Bật' : 'Tắt'}</span>
            <span className="hidden sm:inline">Xem đáp án ngay: {instantFeedback ? 'Bật' : 'Tắt'}</span>
          </button>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition-colors hover:text-white"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleToggleBookmark}
            className={`flex min-h-10 min-w-10 items-center justify-center rounded-lg border p-1.5 transition-colors ${
              isBookmarked
                ? 'bg-amber-950/50 text-amber-400 border-amber-600/50'
                : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
            }`}
            title={isBookmarked ? 'Bỏ lưu câu hỏi' : 'Lưu câu hỏi để ôn tập sau'}
          >
            <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => setShowSummaryModal(true)}
            className="flex min-h-10 items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-600/30 px-3 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-600/40"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Tổng kết</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card and Options */}
      {currentQ && (
        <div className="relative space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:space-y-6 sm:p-6 lg:p-8">
          {/* Question Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex min-w-0 items-center gap-2 text-slate-400">
              <span className="shrink-0 font-mono font-semibold text-indigo-400">{currentQ.id}</span>
              <span aria-hidden="true">·</span>
              <span className="min-w-0 break-words font-medium text-slate-300">{currentQ.topic}</span>
            </div>

            <div className="flex items-center gap-2">
              {savedRecord && (
                <span
                  className={`flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded ${
                    savedRecord.isCorrect
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                      : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                  }`}
                >
                  {savedRecord.isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{savedRecord.isCorrect ? 'Đã trả lời đúng' : 'Đã trả lời sai'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-2">
            <h3 className="break-words text-base font-bold leading-relaxed tracking-tight text-white sm:text-xl">
              {currentQ.question}
            </h3>
          </div>

          {/* Options Grid (A, B, C, D) */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((optionText, optIndex) => {
              // Extract option key (A, B, C, D)
              const optKey = ['A', 'B', 'C', 'D'][optIndex] || optionText.charAt(0);
              const isSelected = savedRecord?.selectedOption === optKey;
              const isCorrectOption = optKey.toUpperCase() === currentQ.answer.toUpperCase();

              // Styling depending on answered state
              let cardClasses =
                'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700 text-slate-200';
              let badgeClasses = 'bg-slate-800 text-slate-300 border-slate-700';

              if (savedRecord) {
                if (isCorrectOption) {
                  cardClasses = 'border-emerald-500/60 bg-emerald-950/30 text-emerald-100 shadow-md shadow-emerald-950/20';
                  badgeClasses = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                } else if (isSelected && !savedRecord.isCorrect) {
                  cardClasses = 'border-rose-500/60 bg-rose-950/30 text-rose-100 shadow-md shadow-rose-950/20';
                  badgeClasses = 'bg-rose-600 text-white border-rose-500 font-bold';
                } else {
                  cardClasses = 'border-slate-800/70 bg-slate-900/30 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={optIndex}
                  onClick={() => handleSelectOption(optKey)}
                  className={`group flex min-h-11 w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 active:scale-[0.99] sm:gap-3.5 sm:p-4 ${cardClasses}`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-mono shrink-0 transition-colors ${badgeClasses}`}
                  >
                    {optKey}
                  </span>

                  <span className="min-w-0 flex-1 break-words pt-0.5 text-sm leading-relaxed sm:text-base">{optionText}</span>

                  {savedRecord && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {savedRecord && isSelected && !savedRecord.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint & Explanation Controls */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (soundEnabled) playClickSound();
                setShowHint((prev) => !prev);
              }}
              className={`flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors sm:text-xs ${
                showHint
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="sm:hidden">{showHint ? 'Ẩn gợi ý' : 'Gợi ý'}</span>
              <span className="hidden sm:inline">{showHint ? 'Ẩn gợi ý xem lại' : 'Hiện gợi ý xem lại (Phím H)'}</span>
            </button>

            <button
              onClick={() => {
                if (soundEnabled) playClickSound();
                setShowExplanation((prev) => !prev);
              }}
              className={`flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium transition-colors sm:text-xs ${
                showExplanation
                  ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span className="sm:hidden">{showExplanation ? 'Ẩn giải thích' : 'Giải thích'}</span>
              <span className="hidden sm:inline">{showExplanation ? 'Ẩn giải thích chi tiết' : 'Xem giải thích chi tiết'}</span>
            </button>
          </div>

          {/* Hint Box */}
          {showHint && currentQ.hint && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-200 text-sm leading-relaxed space-y-1 animate-fadeIn">
              <div className="flex items-center gap-2 font-semibold text-amber-300 text-xs uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Gợi ý tư duy</span>
              </div>
              <p className="text-amber-100/90 text-sm">{currentQ.hint}</p>
            </div>
          )}

          {/* Explanation Box */}
          {showExplanation && currentQ.explanation && (
            <div className="space-y-2 rounded-xl border border-indigo-600/30 bg-indigo-950/30 p-3 text-sm leading-relaxed text-indigo-100 animate-fadeIn sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-indigo-300 text-xs uppercase tracking-wider">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đáp án chuẩn xác: Lựa chọn {currentQ.answer}</span>
                </div>
                <span className="text-[11px] font-mono text-indigo-400">{currentQ.topic}</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-800 pt-4 sm:gap-4">
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

            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              Phím tắt: [1-4 / A-D] Chọn · [H] Gợi ý · [←/→] Chuyển câu
            </div>

            <button
              onClick={handleNext}
              className="flex min-h-11 items-center gap-1 rounded-xl bg-indigo-600 px-2.5 py-2 text-[11px] font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 sm:gap-1.5 sm:px-5 sm:text-sm"
            >
              <span>{currentIndex === questions.length - 1 ? 'Xem kết quả Day' : 'Câu tiếp theo'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Question Quick Jump Matrix (1 to 50) */}
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Mục lục 50 câu hỏi ({dayId})</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Đúng ({correctCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Sai ({answeredCount - correctCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
              <span>Chưa làm ({questions.length - answeredCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Đã lưu</span>
            </span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-6 gap-1.5 pt-1 min-[480px]:grid-cols-8 sm:grid-cols-10 lg:grid-cols-15 2xl:grid-cols-25">
          {questions.map((q, qIdx) => {
            const record = practiceHistory[q.id];
            const isCurr = qIdx === currentIndex;
            const isStarred = bookmarks.includes(q.id);

            let bg = 'bg-slate-800 text-slate-400 hover:bg-slate-700';
            if (record) {
              bg = record.isCorrect
                ? 'bg-emerald-600/40 text-emerald-200 border border-emerald-500/50 font-bold'
                : 'bg-rose-600/40 text-rose-200 border border-rose-500/50 font-bold';
            }

            return (
              <button
                key={q.id}
                onClick={() => {
                  if (soundEnabled) playClickSound();
                  setCurrentIndex(qIdx);
                }}
                className={`relative flex h-11 items-center justify-center rounded-lg font-mono text-xs transition-all 2xl:h-9 ${bg} ${
                  isCurr ? 'ring-2 ring-indigo-400 font-extrabold scale-105 z-10' : ''
                }`}
                title={`Câu ${qIdx + 1}: ${q.topic}`}
              >
                <span>{qIdx + 1}</span>
                {isStarred && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-4">
          <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-lg space-y-5 overflow-y-auto overscroll-contain rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl animate-scaleUp sm:max-h-[calc(100dvh-2rem)] sm:space-y-6 sm:p-7">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Tổng kết {dayId}</h3>
              <p className="text-sm text-slate-300">{dayTitle}</p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-800/70 rounded-xl p-3">
                <div className="text-2xl font-bold font-mono text-white">{answeredCount}/50</div>
                <div className="text-xs text-slate-400 mt-0.5">Đã hoàn thành</div>
              </div>

              <div className="bg-slate-800/70 rounded-xl p-3">
                <div className="text-2xl font-bold font-mono text-emerald-400">{correctCount}</div>
                <div className="text-xs text-slate-400 mt-0.5">Số câu đúng</div>
              </div>

              <div className="bg-slate-800/70 rounded-xl p-3">
                <div className="text-2xl font-bold font-mono text-indigo-400">{accuracy}%</div>
                <div className="text-xs text-slate-400 mt-0.5">Tỷ lệ chính xác</div>
              </div>
            </div>

            {/* Feedback message */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 text-center">
              {accuracy >= 80 ? (
                <span className="text-emerald-400 font-medium">
                  Xuất sắc! Bạn đã làm chủ rất tốt nội dung của {dayTitle}. Sẵn sàng cho kỳ thi tổng hợp!
                </span>
              ) : accuracy >= 60 ? (
                <span className="text-amber-400 font-medium">
                  Khá tốt! Nên xem lại gợi ý và giải thích của các câu làm sai để củng cố các khái niệm kiến trúc then chốt.
                </span>
              ) : (
                <span className="text-rose-400 font-medium">
                  Cần ôn luyện thêm: Hãy đọc kỹ giải thích chi tiết của từng câu hỏi để nắm rõ các trade-offs trong thiết kế LLM / Agent.
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              {nextDayId && onSelectNextDay && (
                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    onSelectNextDay(nextDayId);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>Chuyển sang học {nextDayId}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    // Filter to first wrong question if any
                    const firstWrongIdx = questions.findIndex(
                      (q) => practiceHistory[q.id] && !practiceHistory[q.id].isCorrect
                    );
                    if (firstWrongIdx !== -1) {
                      setCurrentIndex(firstWrongIdx);
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  Xem lại các câu sai
                </button>

                <button
                  onClick={handleResetDay}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-medium border border-slate-700 hover:border-rose-700/50 transition-colors flex items-center gap-1"
                  title="Làm lại từ đầu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm lại</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  onBack();
                }}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Quay lại danh sách 15 Day
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

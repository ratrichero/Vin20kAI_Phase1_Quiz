import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Question } from '../types/quiz';
import { PracticeHistoryMap, toggleBookmark, markMistakeResolved, recordPracticeAnswer } from '../utils/storage';
import { playClickSound, playCorrectSound, playIncorrectSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  BookOpen,
  Filter,
  Layers,
  Sparkles,
  Trophy,
  AlertCircle,
  Check,
  Zap,
} from 'lucide-react';

interface MistakesReviewProps {
  questions: Question[];
  practiceHistory: PracticeHistoryMap;
  bookmarks: string[];
  onUpdateHistory: (history: PracticeHistoryMap) => void;
  onUpdateBookmarks: (bms: string[]) => void;
  onBackToOverview: () => void;
  onStartExam: () => void;
}

export const MistakesReview: React.FC<MistakesReviewProps> = ({
  questions,
  practiceHistory,
  bookmarks,
  onUpdateHistory,
  onUpdateBookmarks,
  onBackToOverview,
  onStartExam,
}) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionResolvedIds, setSessionResolvedIds] = useState<string[]>([]);
  const [selectedOptionInSession, setSelectedOptionInSession] = useState<{ [qId: string]: string }>({});

  // Collect all questions that were answered incorrectly in history
  const allMistakeQuestions = useMemo(() => {
    return questions.filter((q) => {
      const rec = practiceHistory[q.id];
      return rec && !rec.isCorrect;
    });
  }, [questions, practiceHistory]);

  // Extract available days that contain mistakes
  const daysWithMistakes = useMemo(() => {
    const set = new Set<string>();
    allMistakeQuestions.forEach((q) => set.add(q.day));
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
  }, [allMistakeQuestions]);

  // Filtered by selected day
  const filteredMistakes = useMemo(() => {
    if (selectedDayFilter === 'all') return allMistakeQuestions;
    return allMistakeQuestions.filter((q) => q.day === selectedDayFilter);
  }, [allMistakeQuestions, selectedDayFilter]);

  // Adjust currentIndex if it goes out of bounds
  useEffect(() => {
    if (currentIndex >= filteredMistakes.length && filteredMistakes.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredMistakes, currentIndex]);

  const currentQ = filteredMistakes[currentIndex];
  const previousRecord = currentQ ? practiceHistory[currentQ.id] : undefined;
  const currentSessionAnswer = currentQ ? selectedOptionInSession[currentQ.id] : undefined;
  const isResolvedInSession = currentQ ? sessionResolvedIds.includes(currentQ.id) : false;
  const isBookmarked = currentQ ? bookmarks.includes(currentQ.id) : false;

  const handleSelectOption = (optKey: string) => {
    if (!currentQ) return;
    const isCorrect = optKey.toUpperCase() === currentQ.answer.toUpperCase();

    setSelectedOptionInSession((prev) => ({
      ...prev,
      [currentQ.id]: optKey,
    }));

    if (isCorrect) {
      playCorrectSound();
      setShowExplanation(true);
      // Mark as resolved in session
      if (!sessionResolvedIds.includes(currentQ.id)) {
        setSessionResolvedIds((prev) => [...prev, currentQ.id]);
      }
      // Update persistent history
      const updated = markMistakeResolved(currentQ.id, optKey);
      onUpdateHistory(updated);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } else {
      playIncorrectSound();
      setShowExplanation(true);
      const updated = recordPracticeAnswer(currentQ.id, optKey, false);
      onUpdateHistory(updated);
    }
  };

  const handleNext = () => {
    playClickSound();
    if (currentIndex < filteredMistakes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowHint(false);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowHint(false);
      setShowExplanation(false);
    }
  };

  const handleToggleBookmark = () => {
    if (!currentQ) return;
    playClickSound();
    const next = toggleBookmark(currentQ.id);
    onUpdateBookmarks(next);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectOption, handleNext, handlePrev]);

  // EMPTY STATE: No mistakes found!
  if (allMistakeQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-8 pb-20">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-10 text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-600/30">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tuyệt vời! Không có câu hỏi nào bị sai
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Bạn chưa có câu hỏi nào trả lời sai hoặc đã khắc phục thành công tất cả điểm yếu. Toàn bộ kiến thức của bạn đang ở trạng thái chuẩn xác nhất!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onBackToOverview}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all"
            >
              Luyện tiếp các Day khác
            </button>

            <button
              onClick={onStartExam}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              Thử sức bài thi 100 câu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-rose-900/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBackToOverview}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Quay lại danh mục"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Chế độ Củng Cố Điểm Yếu</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-0.5">
              Ôn tập các câu hỏi từng trả lời sai ({filteredMistakes.length} câu)
            </h2>
          </div>
        </div>

        {/* Filter Day Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Lọc theo:</span>
          <select
            value={selectedDayFilter}
            onChange={(e) => {
              setSelectedDayFilter(e.target.value);
              setCurrentIndex(0);
              setShowHint(false);
              setShowExplanation(false);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
          >
            <option value="all">Tất cả các Day có câu sai ({allMistakeQuestions.length})</option>
            {daysWithMistakes.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Session Progress Strip */}
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span>Đang ôn câu:</span>
          <strong className="text-white font-mono">
            {currentIndex + 1} / {filteredMistakes.length}
          </strong>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span>Đã khắc phục:</span>
          <strong className="text-emerald-400">
            {sessionResolvedIds.length} / {filteredMistakes.length}
          </strong>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / filteredMistakes.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative">
          {/* Top Row: Meta info & Past Error Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/50">
                {currentQ.id}
              </span>
              <span className="text-slate-300 font-semibold">{currentQ.day}: {currentQ.day_title}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline text-slate-400">{currentQ.topic}</span>
            </div>

            <div className="flex items-center gap-3">
              {previousRecord && (
                <span className="text-[11px] text-amber-300/90 font-mono bg-amber-950/40 border border-amber-700/40 px-2 py-0.5 rounded">
                  Lần trước chọn: {previousRecord.selectedOption} (Sai)
                </span>
              )}

              <button
                onClick={handleToggleBookmark}
                className={`p-1 rounded text-slate-400 hover:text-amber-400 transition-colors ${
                  isBookmarked ? 'text-amber-400' : ''
                }`}
                title="Lưu câu hỏi"
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed tracking-tight">
              {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-1">
            {currentQ.options.map((optionText, optIndex) => {
              const optKey = ['A', 'B', 'C', 'D'][optIndex];
              const isSelectedInSession = currentSessionAnswer === optKey;
              const isCorrectOption = optKey === currentQ.answer;

              let cardClasses =
                'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 text-slate-200';
              let badgeClasses = 'bg-slate-800 text-slate-400 border-slate-700';

              if (currentSessionAnswer) {
                if (isCorrectOption) {
                  cardClasses =
                    'border-emerald-500/70 bg-emerald-950/40 text-emerald-100 shadow-md shadow-emerald-950/20';
                  badgeClasses = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                } else if (isSelectedInSession && !isCorrectOption) {
                  cardClasses =
                    'border-rose-500/70 bg-rose-950/40 text-rose-100 shadow-md shadow-rose-950/20';
                  badgeClasses = 'bg-rose-600 text-white border-rose-500 font-bold';
                } else {
                  cardClasses = 'border-slate-800/60 bg-slate-900/20 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={optIndex}
                  onClick={() => handleSelectOption(optKey)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 cursor-pointer active:scale-[0.99] ${cardClasses}`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${badgeClasses}`}
                  >
                    {optKey}
                  </span>

                  <span className="text-sm sm:text-base leading-relaxed pt-0.5 flex-1">
                    {optionText}
                  </span>

                  {currentSessionAnswer && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {currentSessionAnswer && isSelectedInSession && !isCorrectOption && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback banner if solved */}
          {isResolvedInSession && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-emerald-300 font-bold block">Đã khắc phục thành công!</strong>
                <span>Bạn đã trả lời chuẩn xác. Câu hỏi này đã được xóa khỏi danh sách điểm yếu của bạn.</span>
              </div>
            </div>
          )}

          {/* Hint & Explanation Toggles */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setShowHint((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showHint
                  ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý xem lại (Phím H)'}</span>
            </button>

            <button
              onClick={() => setShowExplanation((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showExplanation
                  ? 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>{showExplanation ? 'Ẩn giải thích' : 'Xem giải thích chi tiết'}</span>
            </button>
          </div>

          {/* Hint alert */}
          {showHint && currentQ.hint && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-100 text-xs sm:text-sm leading-relaxed space-y-1 animate-fadeIn">
              <strong className="text-amber-300 block font-semibold text-xs uppercase tracking-wider">
                Gợi ý tư duy:
              </strong>
              <p>{currentQ.hint}</p>
            </div>
          )}

          {/* Detailed Explanation */}
          {showExplanation && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs leading-relaxed animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Đáp án chuẩn xác là phương án: {currentQ.answer}</span>
              </div>
              <p className="text-slate-200 text-xs sm:text-sm">{currentQ.explanation}</p>
            </div>
          )}

          {/* Bottom Nav */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors ${
                currentIndex === 0
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </button>

            <div className="text-xs text-slate-500 font-mono hidden sm:inline">
              Phím tắt: [1-4 / A-D] Chọn · [H] Gợi ý · [←/→] Chuyển câu
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === filteredMistakes.length - 1}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                currentIndex === filteredMistakes.length - 1
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95'
              }`}
            >
              <span>Câu sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Matrix Quick Navigator for Mistakes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Layers className="w-4 h-4 text-rose-400" />
            <span>Danh sách các câu sai đang ôn ({filteredMistakes.length})</span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Đã sửa xong: <strong className="text-emerald-400">{sessionResolvedIds.length}</strong>
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
          {filteredMistakes.map((q, idx) => {
            const isResolved = sessionResolvedIds.includes(q.id);
            const isCurr = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => {
                  playClickSound();
                  setCurrentIndex(idx);
                  setShowHint(false);
                  setShowExplanation(false);
                }}
                className={`h-8 rounded-lg text-xs font-mono font-semibold flex items-center justify-center transition-all ${
                  isResolved
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60'
                } ${isCurr ? 'ring-2 ring-indigo-400 scale-105 z-10' : ''}`}
                title={`Câu ${idx + 1}: ${q.topic}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

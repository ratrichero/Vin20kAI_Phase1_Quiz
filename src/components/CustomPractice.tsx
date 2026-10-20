import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Question } from '../types/quiz';
import { PracticeHistoryMap, toggleBookmark, recordPracticeAnswer } from '../utils/storage';
import { playClickSound, playCorrectSound, playIncorrectSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  Search,
  Filter,
  Layers,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface CustomPracticeProps {
  questions: Question[];
  practiceHistory: PracticeHistoryMap;
  bookmarks: string[];
  onUpdateHistory: (history: PracticeHistoryMap) => void;
  onUpdateBookmarks: (bms: string[]) => void;
  onBackToOverview: () => void;
  onCompletedWithFullScore?: () => void;
}

export const CustomPractice: React.FC<CustomPracticeProps> = ({
  questions,
  practiceHistory,
  bookmarks,
  onUpdateHistory,
  onUpdateBookmarks,
  onBackToOverview,
  onCompletedWithFullScore,
}) => {
  const [stage, setStage] = useState<'config' | 'practice' | 'result'>('config');

  // Config State
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10); // 10, 12, 15
  const [topicSearch, setTopicSearch] = useState('');
  const [prioritizeMistakes, setPrioritizeMistakes] = useState(false);

  // Practice Session State
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState<{ [qId: string]: string }>({});
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Extract all distinct topics with their Day origin and count
  const allTopicMeta = useMemo(() => {
    const map = new Map<string, { topic: string; day: string; count: number }>();
    questions.forEach((q) => {
      const t = q.topic;
      if (!t) return;
      if (!map.has(t)) {
        map.set(t, { topic: t, day: q.day, count: 0 });
      }
      map.get(t)!.count++;
    });
    return Array.from(map.values()).sort((a, b) => a.topic.localeCompare(b.topic));
  }, [questions]);

  // Filter topics in selector
  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return allTopicMeta;
    const term = topicSearch.toLowerCase();
    return allTopicMeta.filter(
      (m) => m.topic.toLowerCase().includes(term) || m.day.toLowerCase().includes(term)
    );
  }, [allTopicMeta, topicSearch]);

  const handleToggleTopic = (topic: string) => {
    playClickSound();
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSelectAllTopics = () => {
    playClickSound();
    setSelectedTopics(allTopicMeta.map((m) => m.topic));
  };

  const handleClearTopics = () => {
    playClickSound();
    setSelectedTopics([]);
  };

  // Generate the 10-15 questions based on selected topics
  const startCustomPractice = () => {
    playClickSound();
    if (selectedTopics.length === 0) return;

    // Filter candidate questions
    let candidates = questions.filter((q) => selectedTopics.includes(q.topic));

    if (prioritizeMistakes) {
      // Sort questions: wrong answers first, then unattempted, then correct
      candidates.sort((a, b) => {
        const recA = practiceHistory[a.id];
        const recB = practiceHistory[b.id];
        const scoreA = recA ? (recA.isCorrect ? 2 : 0) : 1;
        const scoreB = recB ? (recB.isCorrect ? 2 : 0) : 1;
        return scoreA - scoreB;
      });
    } else {
      // Shuffle candidates
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
    }

    const targetCount = Math.min(questionCount, candidates.length);
    const chosen = candidates.slice(0, targetCount);

    setPracticeQuestions(chosen);
    setCurrentIndex(0);
    setSessionAnswers({});
    setShowHint(false);
    setShowExplanation(false);
    setStage('practice');
  };

  const currentQ = practiceQuestions[currentIndex];
  const selectedOpt = currentQ ? sessionAnswers[currentQ.id] : undefined;
  const isBookmarked = currentQ ? bookmarks.includes(currentQ.id) : false;

  const handleSelectOption = (optKey: string) => {
    if (!currentQ) return;
    const isCorrect = optKey.toUpperCase() === currentQ.answer.toUpperCase();

    if (isCorrect) playCorrectSound();
    else playIncorrectSound();

    setSessionAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optKey,
    }));

    setShowExplanation(true);

    const updated = recordPracticeAnswer(currentQ.id, optKey, isCorrect);
    onUpdateHistory(updated);
  };

  const handleNext = () => {
    playClickSound();
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowHint(false);
      setShowExplanation(false);
    } else {
      // Finish practice
      setStage('result');
      // Calculate score
      let correct = 0;
      practiceQuestions.forEach((q) => {
        if (sessionAnswers[q.id]?.toUpperCase() === q.answer.toUpperCase()) {
          correct++;
        }
      });
      if (correct === practiceQuestions.length && onCompletedWithFullScore) {
        onCompletedWithFullScore();
      }
      if (correct / practiceQuestions.length >= 0.8) {
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
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

  // Keyboard controls
  useEffect(() => {
    if (stage !== 'practice') return;

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
  }, [stage, handleSelectOption, handleNext, handlePrev]);

  // STAGE 1: CONFIGURATION
  if (stage === 'config') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>Chế độ Luyện Tập Theo Chủ Đề Tùy Chỉnh</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tạo bộ đề ôn luyện kỹ năng cụ thể
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Chọn một hoặc nhiều chủ đề công nghệ bạn muốn đào sâu. Hệ thống sẽ trích xuất 10-15 câu hỏi bám sát, phân tích tường tận lý do đúng và lý do sai cho từng phương án.
            </p>
          </div>

          {/* Question Count Selection (10 - 15 questions) */}
          <div className="space-y-3 bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span>Số lượng câu hỏi bài luyện tập:</span>
              <span className="font-mono text-indigo-400">{questionCount} câu hỏi</span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              {[10, 12, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => {
                    playClickSound();
                    setQuestionCount(cnt);
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    questionCount === cnt
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cnt} câu hỏi
                </button>
              ))}
            </div>

            {/* Prioritize Mistake option */}
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                id="prioritizeMistakes"
                checked={prioritizeMistakes}
                onChange={(e) => setPrioritizeMistakes(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <label htmlFor="prioritizeMistakes" className="cursor-pointer select-none">
                Ưu tiên đưa vào các câu hỏi từng trả lời sai hoặc chưa từng làm
              </label>
            </div>
          </div>

          {/* Topics Selector */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <span>Chọn các chủ đề muốn ôn tập:</span>
                <span className="font-mono text-indigo-400 font-normal">
                  ({selectedTopics.length} đã chọn)
                </span>
              </label>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={handleSelectAllTopics}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Chọn tất cả
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={handleClearTopics}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Topic Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Lọc chủ đề theo tên hoặc Day (ví dụ: ReAct, Attention, RAG, Chunking, Gate...)"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Topics List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
              {filteredTopics.map(({ topic, day, count }) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => handleToggleTopic(topic)}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-semibold leading-snug block">{topic}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{day}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'border-slate-700 bg-slate-900 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={startCustomPractice}
              disabled={selectedTopics.length === 0}
              className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                selectedTopics.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Bắt đầu bài luyện ({questionCount} câu hỏi)</span>
            </button>

            <button
              onClick={onBackToOverview}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors py-2"
            >
              Quay lại danh mục chung
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STAGE 2: ACTIVE PRACTICE
  if (stage === 'practice' && currentQ) {
    const isAnswered = Boolean(selectedOpt);
    const isCorrect = selectedOpt?.toUpperCase() === currentQ.answer.toUpperCase();

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStage('config')}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title="Cấu hình lại chủ đề"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="text-xs font-mono text-indigo-400 font-semibold">
                Luyện tập tùy chỉnh: Câu {currentIndex + 1} / {practiceQuestions.length}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                Chủ đề: {currentQ.topic} ({currentQ.day})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-950/60 text-amber-400 border-amber-600/60'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              }`}
              title={isBookmarked ? 'Bỏ lưu' : 'Lưu câu hỏi'}
            >
              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / practiceQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Question Prompt */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-indigo-400 font-bold">{currentQ.id}</span>
              <span>·</span>
              <span className="text-slate-300">{currentQ.topic}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Options with Detailed Breakdown */}
          <div className="space-y-3">
            {currentQ.options.map((optionText, optIndex) => {
              const optKey = ['A', 'B', 'C', 'D'][optIndex];
              const isSelected = selectedOpt === optKey;
              const isCorrectOption = optKey === currentQ.answer;

              let cardClasses =
                'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 text-slate-200';
              let badgeClasses = 'bg-slate-800 text-slate-400 border-slate-700';

              if (isAnswered) {
                if (isCorrectOption) {
                  cardClasses =
                    'border-emerald-500/70 bg-emerald-950/40 text-emerald-100 shadow-md shadow-emerald-950/20';
                  badgeClasses = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                } else if (isSelected && !isCorrect) {
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

                  {isAnswered && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Hint & Explanation Toggles */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
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
              <span>{showExplanation ? 'Ẩn phân tích đáp án' : 'Xem phân tích chi tiết đúng/sai'}</span>
            </button>
          </div>

          {/* Hint alert */}
          {showHint && currentQ.hint && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-100 text-xs sm:text-sm leading-relaxed space-y-1">
              <strong className="text-amber-300 block font-semibold text-xs uppercase tracking-wider">
                Gợi ý chuyên đề:
              </strong>
              <p>{currentQ.hint}</p>
            </div>
          )}

          {/* Detailed Explanation for Right and Wrong Answers */}
          {showExplanation && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Giải thích chi tiết cho chủ đề: {currentQ.topic}</span>
              </div>

              {/* Correct answer reasoning */}
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-emerald-200">
                <strong className="text-emerald-300 block font-semibold mb-0.5">
                  Tại sao phương án {currentQ.answer} là chuẩn xác nhất:
                </strong>
                <p className="text-slate-200">{currentQ.explanation}</p>
              </div>

              {/* Analysis of distractor / wrong options */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 space-y-1.5">
                <strong className="text-slate-200 block font-semibold">
                  Phân tích các phương án còn lại (Anti-patterns & Distractors):
                </strong>
                <p className="text-slate-400 text-xs">
                  Các phương án khác đưa ra góc nhìn bổ trợ hoặc giả định không tối ưu trong điều kiện triển khai thực tế. Trong môi trường Production, kiến trúc sư cần ưu tiên lựa chọn phương án {currentQ.answer} để đảm bảo tính ổn định, tối ưu chi phí và độ chính xác của hệ thống AI.
                </p>
              </div>
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

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 active:scale-95"
            >
              <span>{currentIndex === practiceQuestions.length - 1 ? 'Hoàn thành bài tập' : 'Câu tiếp theo'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Matrix Navigator (10 - 15 questions) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Danh mục câu hỏi:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {practiceQuestions.map((q, idx) => {
              const ans = sessionAnswers[q.id];
              const isCurr = idx === currentIndex;
              let bg = 'bg-slate-800 text-slate-400';
              if (ans) {
                bg =
                  ans.toUpperCase() === q.answer.toUpperCase()
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-rose-600 text-white font-bold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    playClickSound();
                    setCurrentIndex(idx);
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold flex items-center justify-center transition-all ${bg} ${
                    isCurr ? 'ring-2 ring-indigo-400 scale-105 z-10' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // STAGE 3: RESULT
  let correctCount = 0;
  practiceQuestions.forEach((q) => {
    if (sessionAnswers[q.id]?.toUpperCase() === q.answer.toUpperCase()) {
      correctCount++;
    }
  });
  const percent = Math.round((correctCount / practiceQuestions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 pb-20">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center mx-auto text-white shadow-lg shadow-indigo-600/30">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white">Kết Quả Luyện Tập Tùy Chỉnh</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {selectedTopics.length} chủ đề đã chọn · {practiceQuestions.length} câu hỏi
          </p>
        </div>

        {/* Score metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Số câu đúng</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              {correctCount} / {practiceQuestions.length}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Độ chính xác</div>
            <div className="text-2xl font-bold font-mono text-indigo-400 mt-0.5">{percent}%</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Đánh giá</div>
            <div className="text-sm font-bold text-white mt-1.5">
              {percent === 100 ? 'Tuyệt đối!' : percent >= 80 ? 'Rất tốt' : 'Cần ôn thêm'}
            </div>
          </div>
        </div>

        {/* Review list */}
        <div className="text-left space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Chi tiết từng câu trong bài:
          </h4>
          <div className="space-y-2">
            {practiceQuestions.map((q, idx) => {
              const ans = sessionAnswers[q.id];
              const isRight = ans?.toUpperCase() === q.answer.toUpperCase();

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    isRight
                      ? 'bg-slate-950/50 border-slate-800 text-slate-300'
                      : 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono font-bold text-indigo-400 shrink-0">
                      Câu {idx + 1}:
                    </span>
                    <span className="truncate">{q.topic}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono shrink-0">
                    <span>Chọn: <strong>{ans || 'Chưa làm'}</strong></span>
                    <span>|</span>
                    <span className="text-emerald-400">Đáp án: <strong>{q.answer}</strong></span>
                    {isRight ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setStage('config')}
            className="w-full sm:flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Luyện chủ đề khác</span>
          </button>

          <button
            onClick={onBackToOverview}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Về màn hình chính
          </button>
        </div>
      </div>
    </div>
  );
};

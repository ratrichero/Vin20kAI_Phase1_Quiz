import React, { useState, useMemo } from 'react';
import { Question } from '../types/quiz';
import { toggleBookmark } from '../utils/storage';
import { getAllOptionExplanations } from '../utils/questionExplanations';
import { playClickSound } from '../utils/audio';
import { OptionExplanations } from './OptionExplanations';
import {
  Search,
  Filter,
  Star,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Database,
  ArrowRight,
} from 'lucide-react';

interface QuestionBankProps {
  questions: Question[];
  bookmarks: string[];
  onUpdateBookmarks: (bms: string[]) => void;
  onPracticeDay: (dayId: string) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({
  questions,
  bookmarks,
  onUpdateBookmarks,
  onPracticeDay,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // Extract unique days
  const uniqueDays = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.day));
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
  }, [questions]);

  // Extract unique topics for selected day (or all)
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (selectedDay === 'all' || q.day === selectedDay) {
        if (q.topic) set.add(q.topic);
      }
    });
    return Array.from(set).sort();
  }, [questions, selectedDay]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedDay !== 'all' && q.day !== selectedDay) return false;
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
      if (bookmarkedOnly && !bookmarks.includes(q.id)) return false;

      if (searchQuery.trim()) {
        const qLower = searchQuery.toLowerCase();
        const inId = q.id.toLowerCase().includes(qLower);
        const inQuestion = q.question.toLowerCase().includes(qLower);
        const inTopic = q.topic.toLowerCase().includes(qLower);
        const inExplanation = [q.explanation, ...getAllOptionExplanations(q)].some((explanation) =>
          explanation.toLowerCase().includes(qLower),
        );
        const inOptions = q.options.some((opt) => opt.toLowerCase().includes(qLower));

        if (!inId && !inQuestion && !inTopic && !inExplanation && !inOptions) {
          return false;
        }
      }

      return true;
    });
  }, [questions, selectedDay, selectedTopic, bookmarkedOnly, searchQuery, bookmarks]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, currentPage]);

  const handleToggleBookmark = (qId: string) => {
    playClickSound();
    const next = toggleBookmark(qId);
    onUpdateBookmarks(next);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            <span>Kho Tri Thức Toàn Diện</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Ngân hàng 750 câu hỏi AI Vin20K
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Tra cứu theo từ khóa, lọc theo Day & Topic, xem trước gợi ý và giải thích chi tiết
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 self-start sm:self-auto">
          Tìm thấy <strong className="text-indigo-400">{filteredQuestions.length}</strong> / 750 câu
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm kiếm nội dung câu hỏi, chủ đề, keyword (ví dụ: Self-Attention, MCP, RAGAS, Cache...)"
            className="min-h-11 w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-base text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Dropdowns & Toggle Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
          {/* Day Selector */}
          <div className="sm:col-span-4">
            <select
              value={selectedDay}
              onChange={(e) => {
                setSelectedDay(e.target.value);
                setSelectedTopic('all');
                setCurrentPage(1);
              }}
              className="min-h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-base text-slate-200 focus:border-indigo-500 focus:outline-none sm:text-xs"
            >
              <option value="all">Tất cả các Day (01 - 15)</option>
              {uniqueDays.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Selector */}
          <div className="sm:col-span-5">
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentPage(1);
              }}
              className="min-h-11 w-full min-w-0 truncate rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-base text-slate-200 focus:border-indigo-500 focus:outline-none sm:text-xs"
            >
              <option value="all">Tất cả các chủ đề ({availableTopics.length})</option>
              {availableTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Bookmarked only toggle */}
          <div className="sm:col-span-3 flex items-center justify-end">
            <button
              onClick={() => {
                setBookmarkedOnly((prev) => !prev);
                setCurrentPage(1);
              }}
              className={`flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                bookmarkedOnly
                  ? 'bg-amber-950/60 text-amber-300 border-amber-600/50'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Đã lưu ({bookmarks.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {paginatedQuestions.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">Không tìm thấy câu hỏi phù hợp</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc Day khác.
            </p>
          </div>
        ) : (
          paginatedQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            const isStarred = bookmarks.includes(q.id);

            return (
              <div
                key={q.id}
                className="space-y-3.5 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-md transition-all hover:border-slate-700 sm:p-5"
              >
                {/* Question Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="shrink-0 font-mono font-bold text-indigo-400">{q.id}</span>
                    <span aria-hidden="true">·</span>
                    <span className="min-w-0 break-words font-semibold text-slate-300">{q.day}: {q.day_title}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline text-slate-400">{q.topic}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPracticeDay(q.day)}
                      className="flex min-h-10 items-center gap-1 whitespace-nowrap text-[11px] font-medium text-indigo-400 transition-colors hover:text-indigo-300 sm:mr-1"
                      title={`Mở làm toàn bộ 50 câu của ${q.day}`}
                    >
                      <span>Luyện {q.day}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`flex min-h-10 min-w-10 items-center justify-center rounded text-slate-500 transition-colors hover:text-amber-400 ${
                        isStarred ? 'text-amber-400' : ''
                      }`}
                      title={isStarred ? 'Bỏ lưu' : 'Lưu câu hỏi'}
                    >
                      <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Prompt */}
                <h4 className="break-words text-base font-bold leading-relaxed text-white sm:text-lg">{q.question}</h4>

                {/* Options Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, i) => {
                    const optKey = ['A', 'B', 'C', 'D'][i];
                    const isCorrect = isExpanded && optKey === q.answer;

                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border transition-colors flex items-start gap-2 ${
                          isCorrect
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                            : 'bg-slate-950/50 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {optKey}
                        </span>
                        <span className="min-w-0 flex-1 break-words leading-snug">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Accordion Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-2 text-xs">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="flex min-h-10 items-center gap-1.5 font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                  >
                    <span>{isExpanded ? 'Ẩn giải thích & đáp án' : 'Xem đáp án & giải thích chi tiết'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="hidden text-[11px] font-mono text-slate-500 sm:inline">Chủ đề: {q.topic}</span>
                </div>

                {/* Expanded Box */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 text-xs leading-relaxed animate-fadeIn">
                    {/* Hint */}
                    {q.hint && (
                      <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/30 text-amber-200 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300 block mb-0.5">Gợi ý ôn tập:</strong>
                          <span>{q.hint}</span>
                        </div>
                      </div>
                    )}

                    {/* Per-option explanations */}
                    <OptionExplanations question={q} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs text-slate-400">
          <div>
            Trang <strong className="text-white">{currentPage}</strong> / {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`min-h-10 rounded-lg border px-2.5 py-1.5 font-medium transition-colors sm:px-3 ${
                currentPage === 1
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200'
              }`}
            >
              Trang trước
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`min-h-10 rounded-lg border px-2.5 py-1.5 font-medium transition-colors sm:px-3 ${
                currentPage === totalPages
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200'
              }`}
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

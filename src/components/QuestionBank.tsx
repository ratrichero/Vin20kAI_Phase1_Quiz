import React, { useState, useMemo } from 'react';
import { Question } from '../types/quiz';
import { toggleBookmark } from '../utils/storage';
import { playClickSound } from '../utils/audio';
import {
  Search,
  Filter,
  Star,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
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
        const inExplanation = q.explanation.toLowerCase().includes(qLower);
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
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
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
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
              className={`w-full py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
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
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5 hover:border-slate-700 transition-all shadow-md"
              >
                {/* Question Top Row */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-400">{q.id}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-300">{q.day}: {q.day_title}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline text-slate-400">{q.topic}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPracticeDay(q.day)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium mr-1"
                      title={`Mở làm toàn bộ 50 câu của ${q.day}`}
                    >
                      <span>Luyện {q.day}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`p-1 rounded text-slate-500 hover:text-amber-400 transition-colors ${
                        isStarred ? 'text-amber-400' : ''
                      }`}
                      title={isStarred ? 'Bỏ lưu' : 'Lưu câu hỏi'}
                    >
                      <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Prompt */}
                <h4 className="text-base font-bold text-white leading-relaxed">{q.question}</h4>

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
                        <span className="leading-snug">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Accordion Toggle */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="flex items-center gap-1.5 font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>{isExpanded ? 'Ẩn giải thích & đáp án' : 'Xem đáp án & giải thích chi tiết'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[11px] text-slate-500 font-mono">Chủ đề: {q.topic}</span>
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

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-600/30 text-slate-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Đáp án đúng: Phương án {q.answer}</span>
                        </div>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
          <div>
            Trang <strong className="text-white">{currentPage}</strong> / {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg border font-medium ${
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
              className={`px-3 py-1.5 rounded-lg border font-medium ${
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

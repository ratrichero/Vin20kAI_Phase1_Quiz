import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  HelpCircle,
  Share2,
  Check,
  RotateCcw,
  BookMarked,
  Filter,
  X,
} from 'lucide-react';
import { COURSE_LESSONS, CourseLesson, fetchCourseMarkdown } from '../data/courseData';
import { MarkdownViewer } from './MarkdownViewer';

interface CourseViewProps {
  initialDayNum?: number | null;
  onSelectPracticeDay: (dayId: string) => void;
}

const STORAGE_KEY_READ_DAYS = 'aicb_read_course_days';

export const CourseView: React.FC<CourseViewProps> = ({
  initialDayNum = null,
  onSelectPracticeDay,
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDayNum);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [isLoadingMarkdown, setIsLoadingMarkdown] = useState<boolean>(false);
  const [markdownError, setMarkdownError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [readDays, setReadDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_READ_DAYS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sync initialDayNum when it changes from outside
  useEffect(() => {
    if (initialDayNum !== undefined) {
      setSelectedDay(initialDayNum);
    }
  }, [initialDayNum]);

  // Sync readDays to localStorage
  const toggleMarkAsRead = (dayNum: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReadDays((prev) => {
      const next = prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum];
      try {
        localStorage.setItem(STORAGE_KEY_READ_DAYS, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Reset read history
  const handleResetReadDays = () => {
    if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ tiến độ đọc bài giảng?')) {
      setReadDays([]);
      try {
        localStorage.removeItem(STORAGE_KEY_READ_DAYS);
      } catch {
        // ignore
      }
    }
  };

  // Load markdown when selectedDay changes
  useEffect(() => {
    if (!selectedDay) {
      setMarkdownContent('');
      return;
    }

    let isMounted = true;
    setIsLoadingMarkdown(true);
    setMarkdownError(null);

    fetchCourseMarkdown(selectedDay)
      .then((text) => {
        if (isMounted) {
          setMarkdownContent(text);
          setIsLoadingMarkdown(false);
          // Auto mark as read after opening
          setReadDays((prev) => {
            if (!prev.includes(selectedDay)) {
              const next = [...prev, selectedDay];
              try {
                localStorage.setItem(STORAGE_KEY_READ_DAYS, JSON.stringify(next));
              } catch {
                // ignore
              }
              return next;
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setMarkdownError(err.message || 'Không thể tải tệp bài giảng.');
          setIsLoadingMarkdown(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDay]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return COURSE_LESSONS.filter((lesson) => {
      // Phase & Read status filter
      if (selectedPhaseFilter === 'phase1' && lesson.dayNum > 5) return false;
      if (selectedPhaseFilter === 'phase2' && (lesson.dayNum < 6 || lesson.dayNum > 10)) return false;
      if (selectedPhaseFilter === 'phase3' && lesson.dayNum < 11) return false;
      if (selectedPhaseFilter === 'read' && !readDays.includes(lesson.dayNum)) return false;
      if (selectedPhaseFilter === 'unread' && readDays.includes(lesson.dayNum)) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = lesson.title.toLowerCase().includes(q);
        const matchDay = lesson.dayId.toLowerCase().includes(q);
        const matchIdea = lesson.keyIdea.toLowerCase().includes(q);
        const matchSection = lesson.sections.some((s) => s.toLowerCase().includes(q));
        return matchTitle || matchDay || matchIdea || matchSection;
      }

      return true;
    });
  }, [searchQuery, selectedPhaseFilter, readDays]);

  const currentLesson: CourseLesson | undefined = useMemo(() => {
    return COURSE_LESSONS.find((l) => l.dayNum === selectedDay);
  }, [selectedDay]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Scroll to section helper
  const scrollToSection = (idx: number) => {
    const el = document.getElementById(`section-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: DETAIL READER (When a Day is selected)
  // -------------------------------------------------------------
  if (selectedDay && currentLesson) {
    const isRead = readDays.includes(selectedDay);
    const prevDay = selectedDay > 1 ? selectedDay - 1 : null;
    const nextDay = selectedDay < 15 ? selectedDay + 1 : null;

    return (
      <div className="space-y-6 animate-fadeIn pb-16">
        {/* Top Sticky Header */}
        <div className="sticky top-14 z-30 -mx-3 sm:-mx-6 px-3 sm:px-6 py-3 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedDay(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Tất cả bài giảng</span>
            </button>

            <span className="text-slate-600 hidden sm:inline">/</span>

            <span className="rounded-md bg-indigo-600/20 border border-indigo-500/30 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-300">
              {currentLesson.dayId}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mark as read button */}
            <button
              onClick={() => toggleMarkAsRead(selectedDay)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isRead
                  ? 'border-emerald-600/40 bg-emerald-950/40 text-emerald-300'
                  : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${isRead ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{isRead ? 'Đã hoàn thành' : 'Đánh dấu đã đọc'}</span>
            </button>

            {/* Jump to Quiz CTA */}
            <button
              onClick={() => onSelectPracticeDay(currentLesson.dayId)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Luyện 100 câu {currentLesson.dayId}</span>
            </button>
          </div>
        </div>

        {/* Reader Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Article Content */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-sm">
              {isLoadingMarkdown ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  <p className="text-xs text-slate-400">Đang nạp bài giảng {currentLesson.dayId} từ tệp Markdown...</p>
                </div>
              ) : markdownError ? (
                <div className="rounded-2xl border border-rose-800/40 bg-rose-950/20 p-6 text-center space-y-3">
                  <p className="text-sm text-rose-300">{markdownError}</p>
                  <button
                    onClick={() => {
                      setIsLoadingMarkdown(true);
                      fetchCourseMarkdown(selectedDay).then((text) => {
                        setMarkdownContent(text);
                        setIsLoadingMarkdown(false);
                      });
                    }}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Thử tải lại
                  </button>
                </div>
              ) : (
                <MarkdownViewer content={markdownContent} />
              )}

              {/* Bottom Pagination / Quiz Prompt */}
              <div className="mt-12 border-t border-slate-800 pt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    {prevDay ? (
                      <button
                        onClick={() => {
                          setSelectedDay(prevDay);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-indigo-500/50 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 text-indigo-400" />
                        <span>Bài trước: Day {String(prevDay).padStart(2, '0')}</span>
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>

                  <button
                    onClick={() => onSelectPracticeDay(currentLesson.dayId)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95"
                  >
                    <span>Làm bài tập trắc nghiệm {currentLesson.dayId}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div>
                    {nextDay ? (
                      <button
                        onClick={() => {
                          setSelectedDay(nextDay);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-indigo-500/50 hover:text-white transition-colors"
                      >
                        <span>Bài tiếp: Day {String(nextDay).padStart(2, '0')}</span>
                        <ChevronRight className="h-4 w-4 text-indigo-400" />
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <div className="sticky top-32 space-y-5">
              {/* Table of Contents */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg backdrop-blur-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Mục lục bài giảng</span>
                </h3>
                <ul className="space-y-1 text-xs text-slate-300">
                  {currentLesson.sections.map((sec, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => scrollToSection(idx)}
                        className="w-full text-left flex items-start gap-2 py-1 px-1.5 rounded-lg hover:bg-slate-800/60 hover:text-indigo-300 transition-colors group"
                      >
                        <span className="text-indigo-400 font-mono text-[11px] shrink-0 mt-0.5 group-hover:text-indigo-300">
                          {(idx + 1).toString().padStart(2, '0')}.
                        </span>
                        <span className="leading-snug line-clamp-1">{sec.replace(/^\d+\.\s*/, '')}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practice CTA Card */}
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-4 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wide">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Thực hành trắc nghiệm</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Củng cố lý thuyết của {currentLesson.dayId} với bộ 100 câu hỏi chất lượng cao có giải thích chi tiết từng phương án.
                </p>
                <button
                  onClick={() => onSelectPracticeDay(currentLesson.dayId)}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Luyện tập 100 câu ngay</span>
                </button>
              </div>

              {/* Share / Bookmark Note */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Ước tính: ~5-7 phút đọc</span>
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép link</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3 w-3" />
                      <span>Chia sẻ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: 15-DAY COURSE OVERVIEW (Cards Grid)
  // -------------------------------------------------------------
  const readPercentage = Math.round((readDays.length / COURSE_LESSONS.length) * 100);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-950/80 px-3 py-1 text-xs font-bold text-indigo-300 shadow-sm">
              <GraduationCap className="h-4 w-4 text-indigo-400" />
              <span>Chương trình AICB-P1 — 15 Ngày Bài Giảng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Kho Bài Giảng & Lý Thuyết Cô Đọng
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tổng hợp bài giảng từ 15 Slide chính thức: quy trình, sơ đồ kiến trúc, checklist, công thức định lượng và từ khóa trọng tâm để ôn tập và thi chứng chỉ AI Vin20K.
            </p>
          </div>

          {/* Progress Card */}
          <div className="shrink-0 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 min-w-[240px] shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
              <span className="flex items-center gap-1.5">
                <BookMarked className="h-3.5 w-3.5 text-indigo-400" />
                <span>Tiến độ đọc bài giảng</span>
              </span>
              <span className="font-mono text-indigo-400 font-bold">{readDays.length}/15 bài</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 shadow-sm"
                style={{ width: `${readPercentage}%` }}
              />
            </div>
            <div className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{readPercentage}% hoàn thành</span>
              {readDays.length > 0 && (
                <button
                  onClick={handleResetReadDays}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
                  title="Đặt lại tiến độ đọc"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedPhaseFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedPhaseFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            Tất cả (15 Day)
          </button>
          <button
            onClick={() => setSelectedPhaseFilter('phase1')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedPhaseFilter === 'phase1'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            GĐ 1: Nền tảng (01–05)
          </button>
          <button
            onClick={() => setSelectedPhaseFilter('phase2')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedPhaseFilter === 'phase2'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            GĐ 2: Hệ thống & Data (06–10)
          </button>
          <button
            onClick={() => setSelectedPhaseFilter('phase3')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedPhaseFilter === 'phase3'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            GĐ 3: Production & Eval (11–15)
          </button>
          <button
            onClick={() => setSelectedPhaseFilter('read')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedPhaseFilter === 'read'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            Đã đọc ({readDays.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bài giảng, chủ đề, từ khóa..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2 pl-10 pr-9 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const isRead = readDays.includes(lesson.dayNum);

          return (
            <div
              key={lesson.dayNum}
              className="group flex flex-col justify-between rounded-3xl border border-slate-800/90 bg-slate-900/70 p-6 shadow-xl hover:border-indigo-500/50 hover:bg-slate-850/80 hover:shadow-indigo-500/10 hover:shadow-2xl transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Card Top: Badges and Quick Read Check */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 px-3 py-1 font-mono text-xs font-bold text-white shadow-md shadow-indigo-600/30">
                      {lesson.dayId}
                    </span>
                    <span className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                      {lesson.phaseShort}
                    </span>
                  </div>

                  {/* Toggle Read Button */}
                  <button
                    onClick={(e) => toggleMarkAsRead(lesson.dayNum, e)}
                    title={isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                    className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                      isRead
                        ? 'border-emerald-700/60 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
                        : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isRead ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span>{isRead ? 'Đã đọc' : 'Chưa đọc'}</span>
                  </button>
                </div>

                {/* Card Title */}
                <h2
                  onClick={() => {
                    setSelectedDay(lesson.dayNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="cursor-pointer text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2"
                >
                  {lesson.title}
                </h2>

                {/* Key Idea Quote Box */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3.5 text-xs text-amber-200/90 leading-relaxed italic shadow-inner">
                  <span className="font-semibold not-italic text-amber-300">Ý chính: </span>
                  {lesson.keyIdea}
                </div>

                {/* Sections overview */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Nội dung cốt lõi</span>
                    <span className="flex items-center gap-1 font-normal lowercase text-slate-500">
                      <Clock className="h-3 w-3" />
                      ~5-7 phút
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {lesson.sections.slice(0, 3).map((sec, sIdx) => (
                      <li key={sIdx} className="flex items-center gap-2 truncate">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                        <span className="truncate">{sec.replace(/^\d+\.\s*/, '')}</span>
                      </li>
                    ))}
                    {lesson.sections.length > 3 && (
                      <li className="text-[11px] text-slate-500 pl-3.5">
                        + {lesson.sections.length - 3} mục chuyên sâu khác
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2.5">
                <button
                  onClick={() => {
                    setSelectedDay(lesson.dayNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Xem bài giảng</span>
                </button>

                <button
                  onClick={() => onSelectPracticeDay(lesson.dayId)}
                  title={`Luyện tập 100 câu trắc nghiệm cho ${lesson.dayId}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 px-3.5 py-2.5 text-xs font-bold text-indigo-300 transition-colors active:scale-95"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Luyện thi</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Không tìm thấy bài giảng</h3>
            <p className="text-xs sm:text-sm text-slate-400">Không có bài giảng nào khớp với từ khóa hoặc bộ lọc đã chọn.</p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPhaseFilter('all');
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Xóa bộ lọc tìm kiếm
          </button>
        </div>
      )}
    </div>
  );
};

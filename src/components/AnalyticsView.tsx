import React, { useState } from 'react';
import { Question, ExamResult, DaySummary } from '../types/quiz';
import { buildQuestionDayIndex } from '../data/quizData';
import { PracticeHistoryMap, getExamHistory, resetAllProgress, toggleBookmark } from '../utils/storage';
import { playClickSound } from '../utils/audio';
import { OptionExplanations } from './OptionExplanations';
import {
  BarChart3,
  Award,
  Clock,
  Star,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Trash2,
} from 'lucide-react';

interface AnalyticsViewProps {
  questions: Question[];
  days: DaySummary[];
  practiceHistory: PracticeHistoryMap;
  bookmarks: string[];
  onUpdateBookmarks: (bms: string[]) => void;
  onSelectDay: (dayId: string) => void;
  onReviewExam: (exam: ExamResult) => void;
  onStartExam: () => void;
  onRefreshData: () => void;
  onStartMistakesReview: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  questions,
  days,
  practiceHistory,
  bookmarks,
  onUpdateBookmarks,
  onSelectDay,
  onReviewExam,
  onStartExam,
  onRefreshData,
  onStartMistakesReview,
}) => {
  const [examHistory, setExamHistory] = useState<ExamResult[]>(() => getExamHistory());
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks' | 'exams'>('overview');

  // Compute stats
  let totalAnswered = 0;
  let totalCorrect = 0;

  const dayStats: { [dayId: string]: { answered: number; correct: number; total: number; title: string } } = {};
  const questionDayIndex = buildQuestionDayIndex(questions);

  days.forEach((d) => {
    dayStats[d.dayId] = { answered: 0, correct: 0, total: d.totalQuestions, title: d.title };
  });

  Object.entries(practiceHistory).forEach(([qId, val]) => {
    const dayKey = questionDayIndex.get(qId);
    if (!dayKey || !dayStats[dayKey]) return;

    dayStats[dayKey].answered += 1;
    totalAnswered += 1;
    if (val.isCorrect) {
      dayStats[dayKey].correct += 1;
      totalCorrect += 1;
    }
  });

  const coreDays = days.filter((day) => day.isCore);
  const supplementalSets = days.filter((day) => !day.isCore);
  const totalQuestionCount = questions.length;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const progressPercent =
    totalQuestionCount > 0 ? Math.min(100, Math.round((totalAnswered / totalQuestionCount) * 100)) : 0;

  // Bookmarked questions
  const bookmarkedQuestions = questions.filter((q) => bookmarks.includes(q.id));

  const handleReset = () => {
    if (window.confirm('CẢNH BÁO: Thao tác này sẽ xóa toàn bộ tiến độ làm bài, lịch sử thi và các câu hỏi đã lưu. Bạn có chắc chắn muốn đặt lại từ đầu?')) {
      resetAllProgress();
      onUpdateBookmarks([]);
      setExamHistory([]);
      onRefreshData();
    }
  };

  const handleToggleBookmark = (qId: string) => {
    playClickSound();
    const next = toggleBookmark(qId);
    onUpdateBookmarks(next);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Thống Kê Năng Lực Học Tập</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Bảng theo dõi tiến độ & Lịch sử thi AI Vin20K
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Tổng hợp tiến độ 15 Day cốt lõi và 5 bộ chuyên đề bổ sung, cùng lịch sử thi thử 100 câu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Đặt lại toàn bộ tiến độ</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mobile-nav-scroll flex items-center gap-2 overflow-x-auto border-b border-slate-800 text-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex min-h-11 shrink-0 items-center whitespace-nowrap border-b-2 px-3 pb-3 font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Tổng quan tiến độ
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 pb-3 font-semibold transition-colors ${
            activeTab === 'bookmarks'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Câu hỏi đã lưu</span>
          <span className="font-mono text-xs bg-slate-800 px-1.5 py-0.2 rounded-full text-amber-400">
            {bookmarks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 pb-3 font-semibold transition-colors ${
            activeTab === 'exams'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Lịch sử thi thử 100 câu</span>
          <span className="font-mono text-xs bg-slate-800 px-1.5 py-0.2 rounded-full text-indigo-400">
            {examHistory.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 sm:p-5">
              <span className="text-xs text-slate-400 font-medium">Đã trả lời</span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {totalAnswered} <span className="text-sm font-normal text-slate-500">/ {totalQuestionCount}</span>
              </div>
              <div className="text-[11px] text-indigo-400 font-mono mt-1">{progressPercent}% kho câu hỏi</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 sm:p-5">
              <span className="text-xs text-slate-400 font-medium">Số câu trả lời đúng</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{totalCorrect}</div>
              <div className="text-[11px] text-slate-400 mt-1">Đạt tiêu chuẩn sản xuất</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 sm:p-5">
              <span className="text-xs text-slate-400 font-medium">Độ chính xác trung bình</span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">
                {overallAccuracy}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {overallAccuracy >= 80 ? 'Nắm chắc lý thuyết' : 'Cần củng cố thêm'}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 sm:p-5">
              <span className="text-xs text-slate-400 font-medium">Số lượt thi thử</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {examHistory.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">100 câu / 100 phút</div>
            </div>
          </div>

          {/* Wrong Questions Callout if any */}
          {totalAnswered - totalCorrect > 0 && (
            <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-rose-950/20 border border-rose-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Bạn có {totalAnswered - totalCorrect} câu hỏi từng trả lời sai
                  </h4>
                  <p className="text-xs text-slate-400">
                    Chế độ ôn tập câu sai sẽ giúp bạn làm lại và củng cố vững chắc các điểm yếu kiến trúc cốt lõi.
                  </p>
                </div>
              </div>

              <button
                onClick={onStartMistakesReview}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all shrink-0 whitespace-nowrap active:scale-95"
              >
                Ôn tập câu sai ngay
              </button>
            </div>
          )}

          {/* Progress Matrix: core Days + supplemental sets */}
          {([
            {
              key: 'core',
              heading: `Tiến độ & Độ chính xác ${coreDays.length} Day cốt lõi`,
              caption: 'Nhấp vào từng Day để vào luyện tập ngay',
              sets: coreDays,
            },
            {
              key: 'supplemental',
              heading: `Tiến độ ${supplementalSets.length} bộ chuyên đề bổ sung`,
              caption: 'Luyện tự do ngoài lộ trình 15 Day, không tính vào đề thi thử 100 câu',
              sets: supplementalSets,
            },
          ] as const)
            .filter((section) => section.sets.length > 0)
            .map((section) => (
              <div
                key={section.key}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {section.heading}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{section.caption}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {section.sets.map((day) => {
                    const stat = dayStats[day.dayId] || {
                      answered: 0,
                      correct: 0,
                      total: day.totalQuestions,
                      title: day.title,
                    };
                    const total = stat.total || day.totalQuestions || 1;
                    const dayAccuracy = stat.answered > 0 ? Math.round((stat.correct / stat.answered) * 100) : 0;
                    const percent = Math.min(100, Math.round((stat.answered / total) * 100));
                    const isCompleted = stat.answered >= total;
                    const isSupplemental = !day.isCore;

                    return (
                      <div
                        key={day.dayId}
                        onClick={() => onSelectDay(day.dayId)}
                        className={`p-4 rounded-xl bg-slate-950/60 border cursor-pointer transition-all space-y-2.5 group ${
                          isSupplemental
                            ? 'border-cyan-900/50 hover:border-cyan-500/50'
                            : 'border-slate-800/80 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`font-mono font-bold ${
                              isSupplemental ? 'text-cyan-300' : 'text-indigo-300'
                            }`}
                          >
                            {day.dayId}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {stat.answered}/{total} câu ({dayAccuracy}% đúng)
                          </span>
                        </div>

                        <h4
                          className={`text-sm font-semibold text-white transition-colors line-clamp-2 ${
                            isSupplemental ? 'group-hover:text-cyan-300' : 'group-hover:text-indigo-300'
                          }`}
                        >
                          {day.title}
                        </h4>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500'
                                : isSupplemental
                                  ? 'bg-cyan-500'
                                  : 'bg-indigo-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* TAB 2: BOOKMARKED QUESTIONS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Danh sách câu hỏi đã lưu ({bookmarkedQuestions.length})</h3>
              <p className="text-xs text-slate-400 mt-0.5">Các câu hỏi trọng tâm bạn đã đánh dấu để ôn tập kỹ</p>
            </div>
          </div>

          {bookmarkedQuestions.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-3">
              <Star className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">Chưa có câu hỏi nào được lưu</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Trong quá trình luyện tập hoặc thi thử, bạn có thể nhấn vào biểu tượng ngôi sao để lưu lại những câu cần xem lại.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400 font-bold">{q.id}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-300">{q.day}: {q.day_title}</span>
                      <span>·</span>
                      <span>{q.topic}</span>
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className="p-1 rounded text-amber-400 hover:text-slate-400 transition-colors"
                      title="Bỏ lưu câu này"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">{q.question}</h4>

                  <OptionExplanations question={q} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXAM HISTORY */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Lịch sử bài thi thử 100 câu</h3>
              <p className="text-xs text-slate-400 mt-0.5">Các kết quả thi mô phỏng gần đây</p>
            </div>

            <button
              onClick={onStartExam}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Vào thi đề mới</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {examHistory.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-3">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">Bạn chưa thực hiện bài thi thử nào</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Hãy bắt đầu thử sức với bài kiểm tra 100 câu trong 100 phút để đánh giá toàn diện kiến thức khóa học!
              </p>
              <button
                onClick={onStartExam}
                className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                Bắt đầu bài thi ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {examHistory.map((ex) => {
                const pct = Math.round((ex.score / ex.totalQuestions) * 100);
                const isPass = pct >= 70;
                const isHonor = pct >= 85;

                const mins = Math.floor(ex.timeSpentSeconds / 60);
                const secs = ex.timeSpentSeconds % 60;

                return (
                  <div
                    key={ex.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                            isHonor
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : isPass
                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {isHonor ? 'Xuất sắc' : isPass ? 'Đạt chuẩn' : 'Chưa đạt'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{ex.date}</span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>Thời gian: {mins}p {secs}s</span>
                        <span>·</span>
                        <span>100 câu hỏi ngẫu nhiên</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right font-mono">
                        <div className="text-2xl font-black text-white">
                          <span className={isPass ? 'text-emerald-400' : 'text-rose-400'}>
                            {ex.score}
                          </span>
                          <span className="text-slate-500 text-sm">/100</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{pct}%</div>
                      </div>

                      <button
                        onClick={() => onReviewExam(ex)}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

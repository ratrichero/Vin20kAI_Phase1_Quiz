import React from 'react';
import { DaySummary } from '../types/quiz';
import { PracticeHistoryMap } from '../utils/storage';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Zap,
  Target,
  Award,
  PlayCircle,
  Sliders,
  Trophy,
  RotateCcw,
} from 'lucide-react';

interface DaySelectorProps {
  days: DaySummary[];
  practiceHistory: PracticeHistoryMap;
  onSelectDay: (dayId: string) => void;
  onStartExam: () => void;
  onOpenQuestionBank: () => void;
  onStartCustomPractice: () => void;
  onOpenLeaderboard: () => void;
  onStartMistakesReview: () => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  practiceHistory,
  onSelectDay,
  onStartExam,
  onOpenQuestionBank,
  onStartCustomPractice,
  onOpenLeaderboard,
  onStartMistakesReview,
}) => {
  // Compute total answered and total correct
  let totalAnswered = 0;
  let totalCorrect = 0;

  const dayProgressMap: { [dayId: string]: { answered: number; correct: number } } = {};

  days.forEach((day) => {
    dayProgressMap[day.dayId] = { answered: 0, correct: 0 };
  });

  Object.entries(practiceHistory).forEach(([qId, val]) => {
    const match = qId.match(/^D(\d+)/i);
    if (match) {
      const dayKey = `Day ${match[1].padStart(2, '0')}`;
      if (dayProgressMap[dayKey]) {
        dayProgressMap[dayKey].answered += 1;
        totalAnswered += 1;
        if (val.isCorrect) {
          dayProgressMap[dayKey].correct += 1;
          totalCorrect += 1;
        }
      }
    }
  });

  const totalWrong = totalAnswered - totalCorrect;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const overallPercentage = Math.round((totalAnswered / 750) * 100);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 p-4 shadow-xl sm:p-6 lg:p-8">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -top-20 w-60 h-60 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="min-w-0 space-y-4 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-400 sm:text-xs">
              <Zap className="h-3.5 w-3.5 shrink-0" />
              <span>Khóa học AI Vin20K · Chuẩn Luyện Thi & Thực Chiến</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Hệ thống ôn luyện & Thi thử toàn diện
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Nắm vững kiến thức 15 chuyên đề công nghệ LLM, Agentic Design Pattern, Context Engineering, RAG & Vector DB, Multi-Agent MCP, Guardrails và Production Architecture với đầy đủ gợi ý và giải thích chi tiết.
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <button
                onClick={onStartExam}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] hover:bg-indigo-500 active:scale-95 sm:w-auto sm:px-5"
              >
                <Target className="h-4 w-4 shrink-0" />
                <span className="sm:hidden">Thi thử tổng hợp</span>
                <span className="hidden sm:inline">Thi thử tổng hợp (100 câu / 100 phút)</span>
              </button>

              {totalWrong > 0 && (
                <button
                  onClick={onStartMistakesReview}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-700/50 bg-rose-950/70 px-4 py-2.5 text-sm font-semibold text-rose-200 shadow-md shadow-rose-950/20 transition-all hover:scale-[1.02] hover:bg-rose-900/80 active:scale-95 sm:w-auto"
                >
                  <RotateCcw className="w-4 h-4 text-rose-400" />
                  <span>Ôn lại {totalWrong} câu sai</span>
                </button>
              )}

              <button
                onClick={onStartCustomPractice}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-violet-700/50 bg-violet-950/70 px-4 py-2.5 text-sm font-semibold text-violet-200 transition-all hover:scale-[1.02] hover:bg-violet-900/80 active:scale-95 sm:w-auto"
              >
                <Sliders className="w-4 h-4 text-violet-400" />
                <span>Luyện theo chủ đề (10-15 câu)</span>
              </button>

              <button
                onClick={onOpenLeaderboard}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 sm:w-auto"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Bảng xếp hạng</span>
              </button>
            </div>
          </div>

          {/* Quick Progress Summary Card */}
          <div className="lg:col-span-4 bg-slate-900/80 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Tổng quan tiến độ</span>
              <span className="font-mono tabular-nums text-indigo-400">{overallPercentage}% hoàn thành</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1 text-center">
              <div className="bg-slate-800/60 rounded-lg p-2.5">
                <div className="text-lg font-bold text-white tabular-nums font-mono">{totalAnswered}</div>
                <div className="text-[11px] text-slate-400">Đã luyện / 750</div>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-2.5">
                <div className="text-lg font-bold text-emerald-400 tabular-nums font-mono">{totalCorrect}</div>
                <div className="text-[11px] text-slate-400">Câu đúng</div>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-2.5">
                <div className="text-lg font-bold text-indigo-400 tabular-nums font-mono">{overallAccuracy}%</div>
                <div className="text-[11px] text-slate-400">Độ chính xác</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight Banners */}
      <div className={`grid grid-cols-1 ${totalWrong > 0 ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        {totalWrong > 0 && (
          <button
            type="button"
            onClick={onStartMistakesReview}
            className="group flex w-full items-start gap-4 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-slate-900 to-rose-950/40 p-4 text-left transition-all hover:border-rose-500/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:p-5"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                  Ôn Tập {totalWrong} Câu Sai
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tập trung luyện lại các câu hỏi từng trả lời sai, xóa tan các anti-patterns và củng cố vững chắc điểm yếu.
              </p>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={onStartCustomPractice}
          className="group flex w-full items-start gap-4 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-slate-900 to-violet-950/30 p-4 text-left transition-all hover:border-violet-500/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:p-5"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 group-hover:scale-105 transition-transform">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
              Chế độ Luyện Tùy Chỉnh (10 - 15 câu)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tự do lọc các chủ đề mong muốn (ReAct, RAG, Chunking, Multi-Agent MCP...). Có phân tích chi tiết lý do đúng/sai cho từng phương án.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="group flex w-full items-start gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900 to-amber-950/30 p-4 text-left transition-all hover:border-amber-500/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:p-5"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              Bảng Xếp Hạng & Huy Hiệu
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Thu thập các danh hiệu & huy hiệu độc quyền, duy trì chuỗi ngày học liên tục và so tài điểm số với các học viên trong khóa AI Vin20K.
            </p>
          </div>
        </button>
      </div>

      {/* Days Grid Section */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white tracking-tight">15 Chuyên đề học tập theo Day</h2>
            <p className="text-xs sm:text-sm text-slate-400">Mỗi Day gồm 50 câu hỏi luyện thi bám sát nội dung bài giảng và thực tế triển khai</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>50 câu / Day</span>
            <span>·</span>
            <span>Gợi ý & Giải thích rõ ràng</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => {
            const stats = dayProgressMap[day.dayId] || { answered: 0, correct: 0 };
            const isCompleted = stats.answered >= 50;
            const accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;
            const progressPercent = Math.round((stats.answered / 50) * 100);

            return (
              <button
                type="button"
                key={day.dayId}
                onClick={() => onSelectDay(day.dayId)}
                aria-label={`Mở bài luyện ${day.dayId}: ${day.title}`}
                className="group relative flex min-h-11 w-full min-w-0 flex-col justify-between rounded-xl border border-slate-800/90 bg-slate-900/70 p-4 text-left transition-all duration-200 hover:border-indigo-500/50 hover:bg-slate-900/95 hover:shadow-lg hover:shadow-indigo-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:p-5"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                      {day.dayId}
                    </span>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã hoàn thành</span>
                      </span>
                    ) : stats.answered > 0 ? (
                      <span className="text-[11px] text-amber-400 font-mono">
                        {stats.answered}/50 câu ({accuracy}% đúng)
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">50 câu hỏi</span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {day.title}
                    </h3>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Topics Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {day.topics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-slate-400 bg-slate-800/60 rounded px-2 py-0.5 truncate max-w-[200px]"
                        title={topic}
                      >
                        {topic}
                      </span>
                    ))}
                    {day.topics.length > 3 && (
                      <span className="text-[11px] text-slate-500 px-1 py-0.5">
                        +{day.topics.length - 3} chủ đề
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Luyện 50 câu</span>
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    <span>{stats.answered > 0 ? 'Tiếp tục luyện' : 'Bắt đầu ngay'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Info Callout for 100-Question Exam Mode */}
      <section className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 p-4 sm:flex-row sm:items-center sm:p-6">
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Chế độ kiểm tra tổng hợp kiến thức (100 câu / 100 phút)</h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Mô phỏng chuẩn kỳ thi thật: 100 câu hỏi tuyển chọn ngẫu nhiên đồng đều từ 15 ngày học, có tính giờ đếm ngược, tính điểm và báo cáo phân tích năng lực chi tiết.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartExam}
          className="flex min-h-11 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 sm:w-auto sm:text-sm"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Bắt đầu thi thử ngay</span>
        </button>
      </section>
    </div>
  );
};

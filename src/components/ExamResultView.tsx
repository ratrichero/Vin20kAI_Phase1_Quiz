import React, { useState, useMemo } from 'react';
import { ExamResult } from '../types/quiz';
import { toggleBookmark } from '../utils/storage';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Filter,
  Star,
  ChevronDown,
  ChevronUp,
  BarChart2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface ExamResultViewProps {
  result: ExamResult;
  bookmarks: string[];
  onUpdateBookmarks: (bms: string[]) => void;
  onRetakeExam: () => void;
  onBackToOverview: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  result,
  bookmarks,
  onUpdateBookmarks,
  onRetakeExam,
  onBackToOverview,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'wrong' | 'correct'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const isPass = percentage >= 70;
  const isHonor = percentage >= 85;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs.toString().padStart(2, '0')} giây`;
  };

  const filteredAnswers = useMemo(() => {
    if (filterType === 'wrong') {
      return result.answers.filter((a) => !a.isCorrect);
    }
    if (filterType === 'correct') {
      return result.answers.filter((a) => a.isCorrect);
    }
    return result.answers;
  }, [result.answers, filterType]);

  const handleToggleBookmark = (qId: string) => {
    const next = toggleBookmark(qId);
    onUpdateBookmarks(next);
  };

  // Sort day performance by day number
  const sortedDayStats = useMemo(() => {
    return Object.entries(result.dayPerformance).sort(([dayA], [dayB]) => {
      const numA = parseInt(dayA.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(dayB.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
  }, [result.dayPerformance]);

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Top Banner Result Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isHonor
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : isPass
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                    : 'bg-rose-950 text-rose-300 border border-rose-700'
                }`}
              >
                {isHonor ? 'Xuất sắc (Honor Pass)' : isPass ? 'Đạt chuẩn chứng chỉ' : 'Cần ôn luyện thêm'}
              </span>
              <span className="text-xs text-slate-400 font-mono">{result.date}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Báo cáo kết quả kiểm tra tổng hợp kiến thức
            </h2>

            <p className="text-slate-300 text-sm max-w-xl">
              Bài thi tổng hợp 100 câu hỏi phân bổ toàn diện qua 15 ngày học của chương trình AI Vin20K. Dưới đây là phân tích chi tiết năng lực và các chủ đề cần củng cố.
            </p>

            <div className="flex items-center justify-center md:justify-start gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Thời gian: {formatTime(result.timeSpentSeconds)} / 100 phút</span>
              </span>
            </div>
          </div>

          {/* Big Score Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center min-w-[200px] shadow-lg shrink-0">
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
              <span className={isHonor ? 'text-emerald-400' : isPass ? 'text-indigo-400' : 'text-rose-400'}>
                {result.score}
              </span>
              <span className="text-slate-500 text-2xl font-normal">/100</span>
            </div>
            <div className="text-sm font-semibold text-slate-300 mt-1">Điểm số: {percentage}%</div>
            <div className="text-xs text-slate-500 mt-0.5">Tiêu chuẩn đạt: $\ge 70\%$</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-6 mt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBackToOverview}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Về danh mục 15 Day</span>
          </button>

          <button
            onClick={onRetakeExam}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm đề thi mới (100 câu khác)</span>
          </button>
        </div>
      </div>

      {/* Day by Day Mastery Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Thống kê năng lực theo từng Day (01 - 15)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Phân tích tỷ lệ đúng từng chuyên đề</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {sortedDayStats.map(([dayId, stats]) => {
            const isGood = stats.percentage >= 70;
            return (
              <div
                key={dayId}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-300">{dayId}: {stats.title}</span>
                  <span
                    className={`font-mono font-bold ${
                      isGood ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {stats.correct}/{stats.total} ({stats.percentage}%)
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isGood ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Questions Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Xem lại toàn bộ 100 câu hỏi & Giải thích chi tiết</h3>
            <p className="text-xs text-slate-400 mt-0.5">Nhấp vào từng câu để mở rộng gợi ý và giải thích chuyên sâu</p>
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả (100)
            </button>
            <button
              onClick={() => setFilterType('wrong')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'wrong'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Câu sai ({100 - result.score})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterType === 'correct'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Câu đúng ({result.score})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3.5">
          {filteredAnswers.map((item, index) => {
            const isExpanded = expandedQuestionId === item.questionId;
            const isBookmarked = bookmarks.includes(item.questionId);

            return (
              <div
                key={item.questionId}
                className={`border rounded-xl transition-all ${
                  item.isCorrect
                    ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    : 'border-rose-900/40 bg-rose-950/10 hover:border-rose-800/60'
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() =>
                    setExpandedQuestionId(isExpanded ? null : item.questionId)
                  }
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-md text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                        item.isCorrect
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                    </span>

                    <span className="font-mono text-xs text-indigo-400 font-semibold shrink-0">
                      {item.questionId}
                    </span>

                    <span className="text-xs text-slate-400 font-mono hidden md:inline">
                      {item.day} · {item.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-300">
                      Bạn chọn:{' '}
                      <strong className={item.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                        {item.selectedOption || 'Bỏ trống'}
                      </strong>{' '}
                      | Chuẩn: <strong className="text-emerald-400">{item.correctOption}</strong>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark(item.questionId);
                      }}
                      className={`p-1 rounded text-slate-400 hover:text-amber-400 transition-colors ${
                        isBookmarked ? 'text-amber-400' : ''
                      }`}
                      title="Lưu câu hỏi"
                    >
                      <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                    </button>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 space-y-3 text-xs leading-relaxed">
                    <div className="text-slate-300 text-sm font-medium">
                      Liên quan đến chuyên đề: <span className="text-indigo-300">{item.day} - {item.topic}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-700/40 text-indigo-200">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-[11px] uppercase tracking-wider mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đáp án chuẩn xác là phương án {item.correctOption}</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">
                        Theo nội dung bài giảng {item.day}, phương án {item.correctOption} tuân thủ đúng nguyên lý vận hành chuẩn, tối ưu hóa các trade-offs cốt lõi (Latency - Cost - Quality) và đáp ứng yêu cầu Production-ready.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

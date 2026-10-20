import React from 'react';
import { AppMode } from '../types/quiz';
import {
  Sparkles,
  BookOpen,
  Clock,
  Database,
  BarChart3,
  Sliders,
  Trophy,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  selectedDayId: string | null;
  onBackToDaySelector?: () => void;
  totalAnsweredCount: number;
  totalBookmarksCount: number;
  badgesCount?: number;
  wrongQuestionsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  onBackToDaySelector,
  totalAnsweredCount,
  badgesCount = 0,
  wrongQuestionsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <div
          onClick={() => {
            if (onBackToDaySelector) onBackToDaySelector();
            onSelectMode('day_practice');
          }}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-indigo-100" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
            AI Vin20K <span className="text-indigo-400 font-medium">Master Quiz</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => {
              if (onBackToDaySelector) onBackToDaySelector();
              onSelectMode('day_practice');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentMode === 'day_practice'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Theo Day</span>
          </button>

          <button
            onClick={() => onSelectMode('mistakes_review')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentMode === 'mistakes_review'
                ? 'bg-rose-950/40 text-rose-300 border border-rose-700/50'
                : 'text-slate-400 hover:text-rose-300 hover:bg-rose-950/20'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Ôn câu sai</span>
            {wrongQuestionsCount > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-rose-900/80 text-rose-200 border border-rose-700/60 font-bold">
                {wrongQuestionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectMode('custom_practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentMode === 'custom_practice'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Luyện tùy chỉnh</span>
          </button>

          <button
            onClick={() => onSelectMode('exam')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentMode === 'exam'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Thi 100 câu</span>
          </button>

          <button
            onClick={() => onSelectMode('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentMode === 'leaderboard'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Xếp hạng</span>
          </button>

          <button
            onClick={() => onSelectMode('question_bank')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentMode === 'question_bank'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Ngân hàng câu hỏi</span>
          </button>

          <button
            onClick={() => onSelectMode('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentMode === 'analytics'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Thống kê</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {wrongQuestionsCount > 0 && (
            <button
              onClick={() => onSelectMode('mistakes_review')}
              className="flex items-center gap-1 text-xs text-rose-300 font-mono bg-rose-950/50 border border-rose-700/60 px-2.5 py-1.5 rounded-lg hover:bg-rose-900/60 transition-colors"
              title="Có câu hỏi sai cần ôn tập củng cố"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>{wrongQuestionsCount} câu sai</span>
            </button>
          )}

          <button
            onClick={() => onSelectMode('leaderboard')}
            className="hidden sm:flex items-center gap-1.5 text-xs text-amber-300 font-mono bg-amber-950/40 border border-amber-700/50 px-2.5 py-1.5 rounded-lg hover:bg-amber-950/70 transition-colors"
            title="Xem thành tích & bảng xếp hạng"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{badgesCount} Huy hiệu</span>
          </button>

          <button
            onClick={() => onSelectMode('exam')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all whitespace-nowrap shrink-0 active:scale-95"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Vào thi thử</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div className="xl:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800/80 bg-slate-900/95 text-[11px] overflow-x-auto">
        <button
          onClick={() => {
            if (onBackToDaySelector) onBackToDaySelector();
            onSelectMode('day_practice');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
            currentMode === 'day_practice' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Theo Day</span>
        </button>

        <button
          onClick={() => onSelectMode('mistakes_review')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 relative ${
            currentMode === 'mistakes_review' ? 'text-rose-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ôn câu sai</span>
          {wrongQuestionsCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => onSelectMode('custom_practice')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
            currentMode === 'custom_practice' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Tùy chỉnh</span>
        </button>

        <button
          onClick={() => onSelectMode('exam')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
            currentMode === 'exam' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Thi 100 câu</span>
        </button>

        <button
          onClick={() => onSelectMode('leaderboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
            currentMode === 'leaderboard' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Xếp hạng</span>
        </button>

        <button
          onClick={() => onSelectMode('question_bank')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
            currentMode === 'question_bank' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>750 câu</span>
        </button>

        <button
          onClick={() => onSelectMode('analytics')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded shrink-0 ${
            currentMode === 'analytics' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Thống kê</span>
        </button>
      </div>
    </header>
  );
};

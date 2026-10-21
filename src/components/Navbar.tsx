import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { AppMode } from '../types/quiz';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
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

type NavItem = {
  mode: AppMode;
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
  tone: 'indigo' | 'rose' | 'amber';
};

const NAV_ITEMS: NavItem[] = [
  { mode: 'day_practice', label: 'Theo Day', mobileLabel: 'Theo Day', icon: BookOpen, tone: 'indigo' },
  { mode: 'course', label: 'Course', mobileLabel: 'Course', icon: GraduationCap, tone: 'indigo' },
  { mode: 'mistakes_review', label: 'Ôn câu sai', mobileLabel: 'Ôn câu sai', icon: RotateCcw, tone: 'rose' },
  { mode: 'custom_practice', label: 'Luyện tùy chỉnh', mobileLabel: 'Tùy chỉnh', icon: Sliders, tone: 'indigo' },
  { mode: 'exam', label: 'Thi thử', mobileLabel: 'Thi thử', icon: Clock, tone: 'indigo' },
  { mode: 'leaderboard', label: 'Xếp hạng', mobileLabel: 'Xếp hạng', icon: Trophy, tone: 'amber' },
  { mode: 'question_bank', label: 'Ngân hàng', mobileLabel: 'Ngân hàng', icon: Database, tone: 'indigo' },
  { mode: 'analytics', label: 'Thống kê', mobileLabel: 'Thống kê', icon: BarChart3, tone: 'indigo' },
];

const activeToneClasses: Record<NavItem['tone'], string> = {
  indigo: 'bg-indigo-600/15 text-indigo-300 border-indigo-500/30',
  rose: 'bg-rose-950/50 text-rose-300 border-rose-700/50',
  amber: 'bg-amber-950/40 text-amber-300 border-amber-700/40',
};

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  onBackToDaySelector,
  badgesCount = 0,
  wrongQuestionsCount = 0,
}) => {
  const handleSelectMode = (mode: AppMode) => {
    if (mode === 'day_practice') onBackToDaySelector?.();
    onSelectMode(mode);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 2xl:max-w-screen-2xl 2xl:px-8">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
          <button
            type="button"
            onClick={() => handleSelectMode('day_practice')}
            aria-label="AI Vin20K Master Quiz — về trang chủ"
            className="group flex min-w-0 shrink items-center gap-2.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4 text-indigo-100" />
            </span>
            <span className="min-w-0 truncate text-[15px] font-bold tracking-tight text-white transition-colors group-hover:text-indigo-300 sm:text-lg">
              AI Vin20K <span className="hidden font-medium text-indigo-400 sm:inline">Master Quiz</span>
            </span>
          </button>

          <nav aria-label="Điều hướng chính" className="hidden min-w-0 items-center gap-0.5 xl:flex">
            {NAV_ITEMS.map(({ mode, label, icon: Icon, tone }) => {
              const isActive = currentMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSelectMode(mode)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors 2xl:px-2.5 2xl:text-sm ${
                    isActive
                      ? activeToneClasses[tone]
                      : 'border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                  {mode === 'mistakes_review' && wrongQuestionsCount > 0 && (
                    <span className="rounded-full border border-rose-700/60 bg-rose-900/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-200">
                      {wrongQuestionsCount > 99 ? '99+' : wrongQuestionsCount}
                    </span>
                  )}
                  {mode === 'leaderboard' && badgesCount > 0 && (
                    <span className="rounded-full border border-amber-700/50 bg-amber-950/60 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                      {badgesCount > 99 ? '99+' : badgesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => handleSelectMode('exam')}
              aria-label="Vào thi thử"
              className="flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:from-indigo-500 hover:to-violet-500 active:scale-95 sm:px-3.5 xl:hidden 2xl:flex"
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Vào thi thử</span>
              <span className="sm:hidden">Thi thử</span>
            </button>
          </div>
        </div>
      </div>

      <nav aria-label="Điều hướng trên thiết bị nhỏ" className="border-t border-slate-800/80 xl:hidden">
        <div className="mobile-nav-scroll mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-3 py-1.5 sm:px-6">
          {NAV_ITEMS.map(({ mode, mobileLabel, icon: Icon, tone }) => {
            const isActive = currentMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleSelectMode(mode)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isActive
                    ? activeToneClasses[tone]
                    : 'border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{mobileLabel}</span>
                {mode === 'mistakes_review' && wrongQuestionsCount > 0 && (
                  <span className="min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center font-mono text-[10px] font-bold leading-none text-white">
                    {wrongQuestionsCount > 99 ? '99+' : wrongQuestionsCount}
                  </span>
                )}
                {mode === 'leaderboard' && badgesCount > 0 && (
                  <span className="min-w-5 rounded-full bg-amber-700/80 px-1.5 py-0.5 text-center font-mono text-[10px] font-bold leading-none text-amber-100">
                    {badgesCount > 99 ? '99+' : badgesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

import React, { useState, useMemo } from 'react';
import { Badge, LeaderboardUser } from '../types/quiz';
import {
  UserProfile,
  StreakData,
  saveUserProfile,
  getCohortLeaderboard,
} from '../utils/achievements';
import { playClickSound } from '../utils/audio';
import {
  Award,
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  Lock,
  Star,
  Target,
  Crown,
  BookOpen,
  Sliders,
  Compass,
  Edit3,
  Check,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';

interface LeaderboardAndBadgesProps {
  badges: Badge[];
  streak: StreakData;
  userProfile: UserProfile;
  totalUserCorrect: number;
  examHighScore: number;
  onUpdateProfile: (profile: UserProfile) => void;
  onStartExam: () => void;
}

export const LeaderboardAndBadges: React.FC<LeaderboardAndBadgesProps> = ({
  badges,
  streak,
  userProfile,
  totalUserCorrect,
  examHighScore,
  onUpdateProfile,
  onStartExam,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges'>('leaderboard');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'total' | 'exam' | 'streak' | 'badges'>('total');

  // Edit profile dialog
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const [tempTitle, setTempTitle] = useState(userProfile.title);
  const [tempAvatar, setTempAvatar] = useState(userProfile.avatar);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  // Cohort Leaderboard calculation
  const leaderboardUsers = useMemo(() => {
    const list = getCohortLeaderboard(
      userProfile,
      totalUserCorrect,
      examHighScore,
      unlockedCount,
      streak.currentStreak
    );

    // Sort based on current filter
    if (leaderboardFilter === 'exam') {
      return [...list].sort((a, b) => b.examHighScore - a.examHighScore);
    }
    if (leaderboardFilter === 'streak') {
      return [...list].sort((a, b) => b.streakDays - a.streakDays);
    }
    if (leaderboardFilter === 'badges') {
      return [...list].sort((a, b) => b.badgesCount - a.badgesCount);
    }
    // Default: totalScore
    return [...list].sort((a, b) => b.totalScore - a.totalScore);
  }, [userProfile, totalUserCorrect, examHighScore, unlockedCount, streak.currentStreak, leaderboardFilter]);

  const userRankIndex = leaderboardUsers.findIndex((u) => u.isCurrentUser);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : 1;

  const handleSaveProfile = () => {
    playClickSound();
    const updated = saveUserProfile({
      name: tempName.trim() || 'Học viên AI Vin20K',
      title: tempTitle.trim() || 'AI Product Specialist',
      avatar: tempAvatar || '👨‍💻',
    });
    onUpdateProfile(updated);
    setIsEditingProfile(false);
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-indigo-400" />;
      case 'Award':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Star':
        return <Star className="w-5 h-5 text-amber-300" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-teal-400" />;
      case 'Sliders':
        return <Sliders className="w-5 h-5 text-purple-400" />;
      case 'Target':
        return <Target className="w-5 h-5 text-red-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'RotateCcw':
        return <RotateCcw className="w-5 h-5 text-rose-400" />;
      default:
        return <Trophy className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Top Profile Summary Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="text-4xl sm:text-5xl bg-slate-950 border border-slate-800 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 shadow-inner">
            {userProfile.avatar}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">{userProfile.name}</h2>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="p-1 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                title="Đổi tên & avatar"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-indigo-400 font-medium">{userProfile.title}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-400 pt-1">
              <span>Hạng hiện tại:</span>
              <strong className="text-white font-mono font-bold">#{userRank}</strong>
              <span>·</span>
              <span className="flex items-center gap-1 text-orange-400 font-semibold font-mono">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span>Chuỗi {streak.currentStreak} ngày</span>
              </span>
            </div>
          </div>
        </div>

        {/* User Badges & Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-center w-full md:w-auto">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-[90px]">
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
              {unlockedCount} / {badges.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Huy hiệu</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-[90px]">
            <div className="text-lg sm:text-xl font-bold font-mono text-indigo-400">
              {examHighScore > 0 ? `${examHighScore} đ` : 'Chưa thi'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Điểm thi cao nhất</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-w-[90px]">
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-400">
              {totalUserCorrect * 10 + examHighScore * 25 + unlockedCount * 100}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Điểm XP tích lũy</div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-white">Chỉnh sửa hồ sơ học viên</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Tên hiển thị:</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Chức danh / Danh hiệu:</label>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1.5 font-semibold">Chọn biểu tượng đại diện (Avatar):</label>
                <div className="grid grid-cols-6 gap-2 text-2xl">
                  {['👨‍💻', '👩‍💻', '🚀', '🧠', '⚡', '🤖', '🛡️', '💡', '👑', '🔥', '✨', '🎯'].map((av) => (
                    <button
                      key={av}
                      onClick={() => setTempAvatar(av)}
                      className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                        tempAvatar === av
                          ? 'border-indigo-500 bg-indigo-950/60 scale-110'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
              >
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Mode Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 text-sm">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Bảng xếp hạng AI Vin20K</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'badges'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Hệ thống Huy hiệu ({unlockedCount}/{badges.length})</span>
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Header & Sub-filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Top Học Viên Khóa Học AI Vin20K</h3>
              <p className="text-xs text-slate-400">
                Xếp hạng dựa trên năng lực giải đề, điểm thi tổng hợp và tính chuyên cần
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
              <button
                onClick={() => setLeaderboardFilter('total')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  leaderboardFilter === 'total'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tổng điểm XP
              </button>
              <button
                onClick={() => setLeaderboardFilter('exam')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  leaderboardFilter === 'exam'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Điểm thi 100 câu
              </button>
              <button
                onClick={() => setLeaderboardFilter('streak')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  leaderboardFilter === 'streak'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Chuỗi ngày học
              </button>
              <button
                onClick={() => setLeaderboardFilter('badges')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  leaderboardFilter === 'badges'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Huy hiệu
              </button>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px] font-semibold">
                    <th className="py-3 px-4 w-16 text-center">Hạng</th>
                    <th className="py-3 px-4">Học viên</th>
                    <th className="py-3 px-4 text-center">Điểm thi 100 câu</th>
                    <th className="py-3 px-4 text-center">Huy hiệu</th>
                    <th className="py-3 px-4 text-center">Chuỗi học</th>
                    <th className="py-3 px-4 text-right">Tổng điểm XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboardUsers.map((user, idx) => {
                    const rank = idx + 1;
                    const isTop1 = rank === 1;
                    const isTop2 = rank === 2;
                    const isTop3 = rank === 3;

                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors ${
                          user.isCurrentUser
                            ? 'bg-indigo-950/40 border-l-2 border-indigo-500 font-medium'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs">
                              🥇 1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 text-xs">
                              🥈 2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 text-xs">
                              🥉 3
                            </span>
                          ) : (
                            <span className="text-slate-400">#{rank}</span>
                          )}
                        </td>

                        {/* Name & Title */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl sm:text-2xl shrink-0">{user.avatar}</span>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {user.isCurrentUser && (
                                  <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                                    Bạn
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{user.title}</div>
                            </div>
                          </div>
                        </td>

                        {/* Exam High Score */}
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                          {user.examHighScore > 0 ? (
                            <span
                              className={`font-semibold ${
                                user.examHighScore >= 85
                                  ? 'text-emerald-400'
                                  : 'text-indigo-400'
                              }`}
                            >
                              {user.examHighScore} / 100
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </td>

                        {/* Badges count */}
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                          <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{user.badgesCount}</span>
                          </span>
                        </td>

                        {/* Streak */}
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                          <span className="inline-flex items-center gap-1 text-orange-400 font-semibold">
                            <Flame className="w-3.5 h-3.5 fill-orange-400" />
                            <span>{user.streakDays}d</span>
                          </span>
                        </td>

                        {/* Total Score */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-300 tabular-nums">
                          {user.totalScore.toLocaleString()} XP
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACHIEVEMENTS & BADGES */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Bộ sưu tập Huy hiệu & Cột mốc AI Vin20K
              </h3>
              <p className="text-xs text-slate-400">
                Mở khóa các huy hiệu khi hoàn thành xuất sắc các mục tiêu học tập và kiểm tra
              </p>
            </div>

            <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 self-start sm:self-auto">
              Đã mở khóa: <strong className="text-emerald-400">{unlockedCount}</strong> / {badges.length} huy hiệu
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge) => {
              const progressPct = Math.min(
                100,
                Math.round((badge.currentProgress / badge.maxProgress) * 100)
              );

              return (
                <div
                  key={badge.id}
                  className={`border rounded-2xl p-5 space-y-3.5 transition-all ${
                    badge.isUnlocked
                      ? 'bg-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                          badge.isUnlocked
                            ? 'bg-indigo-950/80 border-indigo-500/50 shadow-md shadow-indigo-600/20'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}
                      >
                        {badge.isUnlocked ? (
                          getBadgeIcon(badge.icon)
                        ) : (
                          <Lock className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{badge.name}</h4>
                          {badge.isUnlocked && (
                            <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded-full">
                              Đã đạt
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Tiến độ thực hiện</span>
                      <span>
                        {badge.currentProgress} / {badge.maxProgress}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          badge.isUnlocked ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

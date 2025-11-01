"use client";
import { useEffect, useMemo, useState } from "react";
import React from "react";

type MetaMaskConnectProps = {
  address: string | null;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
};

const MetaMaskConnect: React.FC<MetaMaskConnectProps> = ({ address, onConnect, onDisconnect }) => (
  <button
    onClick={() => address ? onDisconnect() : onConnect("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")}
    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105"
  >
    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
  </button>
);

type CalendarGridProps = {
  ticks: Set<string>;
  onToggleDate: (isoDate: string) => void;
  currentMonth: number;
  currentYear: number;
};

const CalendarGrid: React.FC<CalendarGridProps> = ({ ticks, onToggleDate, currentMonth, currentYear }) => {
  const today = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const getDaysInMonth = (month: number, year: number): number => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number): number => new Date(year, month, 1).getDay();
  
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-3">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          if (!day) return <div key={idx} />;
          
          const date = new Date(currentYear, currentMonth, day);
          const isoDate = date.toISOString().split('T')[0];
          const isChecked = ticks.has(isoDate);
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          
          return (
            <button
              key={idx}
              onClick={() => onToggleDate(isoDate)}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-sm font-medium
                transition-all duration-200 relative group
                ${isChecked 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 scale-100 hover:scale-105' 
                  : isToday
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-400 hover:border-blue-500'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }
              `}
            >
              <span className={isChecked ? 'font-bold' : ''}>{day}</span>
              {isChecked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const loadTicksFor = (address: string): string[] => {
  const stored = localStorage.getItem(`ticks_${address}`);
  return stored ? JSON.parse(stored) as string[] : [];
};

const saveTicksFor = (address: string, ticks: string[]): void => {
  localStorage.setItem(`ticks_${address}`, JSON.stringify(ticks));
};

const calcCurrentStreak = (ticks: Set<string>): number => {
  if (!ticks || ticks.size === 0) return 0;
  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const isoDate = checkDate.toISOString().split('T')[0];
    if (ticks.has(isoDate)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
      checkDate.setHours(0, 0, 0, 0);
    } else {
      break;
    }
  }
  return streak;
};

const calcBestStreak = (ticks: Set<string>): number => {
  if (!ticks || ticks.size === 0) return 0;
  const sorted = Array.from(ticks).sort();
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1]);
    const currDate = new Date(sorted[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / 86400000);
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  return maxStreak;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
};

const getAchievements = (ticks: Set<string>, streak: number, bestStreak: number): Achievement[] => {
  return [
    {
      id: 'first-step',
      title: 'First Step',
      description: 'Complete your first day',
      icon: '🎯',
      unlocked: ticks.size >= 1,
    },
    {
      id: 'week-warrior',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '⚔️',
      unlocked: bestStreak >= 7,
      progress: Math.min(bestStreak, 7),
      total: 7,
    },
    {
      id: 'monthly-master',
      title: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: '👑',
      unlocked: bestStreak >= 30,
      progress: Math.min(bestStreak, 30),
      total: 30,
    },
    {
      id: 'century-club',
      title: 'Century Club',
      description: 'Complete 100 total days',
      icon: '💯',
      unlocked: ticks.size >= 100,
      progress: Math.min(ticks.size, 100),
      total: 100,
    },
    {
      id: 'unstoppable',
      title: 'Unstoppable',
      description: 'Maintain a 100-day streak',
      icon: '🔥',
      unlocked: bestStreak >= 100,
      progress: Math.min(bestStreak, 100),
      total: 100,
    },
    {
      id: 'legend',
      title: 'Legend',
      description: 'Maintain a 365-day streak',
      icon: '🏆',
      unlocked: bestStreak >= 365,
      progress: Math.min(bestStreak, 365),
      total: 365,
    },
  ];
};

export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  const [ticks, setTicks] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    if (address) {
      const loaded = loadTicksFor(address) || [];
      setTicks(new Set(loaded));
    } else {
      setTicks(new Set());
    }
  }, [address]);

  const onToggleDate = (isoDate: string) => {
    if (!address) return;
    const next = new Set(ticks);
    const wasAdding = !next.has(isoDate);
    
    if (next.has(isoDate)) next.delete(isoDate);
    else {
      next.add(isoDate);
      // Check for milestone
      const newStreak = calcCurrentStreak(next);
      if (wasAdding && [7, 30, 50, 100].includes(newStreak)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
    setTicks(next);
    saveTicksFor(address, Array.from(next));
  };

  const streak = useMemo(() => calcCurrentStreak(ticks), [ticks]);
  const bestStreak = useMemo(() => calcBestStreak(ticks), [ticks]);
  const achievements = useMemo(() => getAchievements(ticks, streak, bestStreak), [ticks, streak, bestStreak]);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentYear, currentMonth + delta, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                StreakChain
              </h1>
              <p className="text-slate-600 font-medium">Track your daily habits with blockchain-backed accountability</p>
            </div>
            <MetaMaskConnect
              address={address}
              onConnect={(a) => setAddress(a)}
              onDisconnect={() => setAddress(null)}
            />
          </div>

          {address && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🔥</span>
                    <div className="text-5xl font-black">{streak}</div>
                  </div>
                  <div className="text-orange-100 font-medium">Current Streak</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">👑</span>
                    <div className="text-5xl font-black">{bestStreak}</div>
                  </div>
                  <div className="text-purple-100 font-medium">Best Streak</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">✓</span>
                    <div className="text-5xl font-black">{ticks.size}</div>
                  </div>
                  <div className="text-emerald-100 font-medium">Total Days</div>
                </div>

                <button
                  onClick={() => setShowAchievements(!showAchievements)}
                  className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🏆</span>
                    <div className="text-5xl font-black">{unlockedCount}/{achievements.length}</div>
                  </div>
                  <div className="text-blue-100 font-medium">Achievements</div>
                </button>
              </div>

              {showAchievements && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-4 shadow-xl">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span>🏆</span> Your Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map(achievement => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          achievement.unlocked
                            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-lg'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{achievement.title}</h4>
                            <p className="text-sm text-slate-600">{achievement.description}</p>
                            {!achievement.unlocked && achievement.progress !== undefined && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                  <span>Progress</span>
                                  <span>{achievement.progress}/{achievement.total}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(achievement.progress / achievement.total!) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {achievement.unlocked && (
                              <div className="mt-2 text-xs font-semibold text-green-600">✓ Unlocked!</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </header>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {address ? (
            <main className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600 font-medium">
                    {address!.slice(0, 6)}...{address!.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const payload = { address, ticks: Array.from(ticks) };
                      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `streaks-${address!.slice(0,6)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all text-sm"
                  >
                    📥 Export
                  </button>

                  <button
                    onClick={() => {
                      if (!address || !confirm('Reset all progress?')) return;
                      saveTicksFor(address, []);
                      setTicks(new Set());
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-all text-sm"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ← Prev
                </button>
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={goToToday}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1"
                  >
                    Go to Today
                  </button>
                </div>

                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Next →
                </button>
              </div>

              <CalendarGrid 
                ticks={ticks} 
                onToggleDate={onToggleDate}
                currentMonth={currentMonth}
                currentYear={currentYear}
              />
            </main>
          ) : (
            <div className="py-24 text-center px-8">
              <div className="mb-8">
                <div className="text-7xl mb-4">🔗</div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Connect Your Wallet</h2>
                <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                  Link your MetaMask wallet to start building unstoppable habits. Your progress is saved locally and tied to your unique address.
                </p>
              </div>
              <MetaMaskConnect address={address} onConnect={(a) => setAddress(a)} onDisconnect={() => setAddress(null)} />
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-sm text-slate-500">
          <p>Your data is stored locally and never leaves your device</p>
        </footer>
      </div>
    </div>
  );
}
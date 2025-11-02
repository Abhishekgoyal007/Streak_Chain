"use client";
import { useEffect, useMemo, useState } from "react";
import React from "react";

// ============ TYPES ============
type Habit = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

type HabitData = {
  [habitId: string]: Set<string>;
};

type DayNote = {
  date: string;
  note: string;
  habitId: string;
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

// ============ COMPONENTS ============
const MetaMaskConnect = ({ address, onConnect, onDisconnect }: any) => {
  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    setHasProvider(typeof (window as any).ethereum !== "undefined");
  }, []);

  async function connect() {
    if (!hasProvider) return;
    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) onConnect(accounts[0]);
    } catch (err) {
      console.error("MetaMask connect error", err);
    }
  }

  return (
    <button
      onClick={() => address ? onDisconnect() : connect()}
      className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105"
    >
      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : hasProvider ? "Connect Wallet" : "Install MetaMask"}
    </button>
  );
};

const YearHeatmap = ({ habitData, selectedHabit, habits, onDateClick }: any) => {
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i);
  
  const getMonthDays = (month: number) => {
    const days = [];
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const getIntensity = (date: string) => {
    if (!selectedHabit) return 0;
    const ticks = habitData[selectedHabit.id] || new Set();
    return ticks.has(date) ? 1 : 0;
  };

  return (
    <div className="space-y-2">
      {months.map(month => (
        <div key={month} className="flex items-center gap-2">
          <div className="w-12 text-xs text-slate-500 font-medium">
            {new Date(currentYear, month).toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="flex gap-1 flex-wrap">
            {getMonthDays(month).map(day => {
              const date = new Date(currentYear, month, day);
              const isoDate = date.toISOString().split('T')[0];
              const intensity = getIntensity(isoDate);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={day}
                  onClick={() => onDateClick(isoDate)}
                  className={`w-3 h-3 rounded-sm transition-all hover:scale-125 ${
                    intensity > 0 
                      ? `bg-gradient-to-br ${selectedHabit?.color || 'from-emerald-500 to-teal-600'}`
                      : isToday
                        ? 'bg-blue-200 border border-blue-400'
                        : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                  title={`${date.toLocaleDateString()}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const CalendarGrid = ({ habitData, selectedHabit, currentMonth, currentYear, onToggleDate, notes, onAddNote, darkMode }: any) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const today = new Date();
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
  
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDayClick = (isoDate: string) => {
    onToggleDate(isoDate);
  };

  const handleDayRightClick = (e: React.MouseEvent, isoDate: string) => {
    e.preventDefault();
    setSelectedDate(isoDate);
    const existingNote = notes.find((n: DayNote) => n.date === isoDate && n.habitId === selectedHabit?.id);
    setNoteText(existingNote?.note || '');
    setShowNoteModal(true);
  };

  const saveNote = () => {
    if (selectedDate && noteText.trim()) {
      onAddNote(selectedDate, noteText, selectedHabit?.id);
    }
    setShowNoteModal(false);
    setNoteText('');
    setSelectedDate(null);
  };
  
  const ticks = selectedHabit ? (habitData[selectedHabit.id] || new Set()) : new Set();

  return (
    <>
      <div>
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekDays.map(day => (
            <div key={day} className={`text-center text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
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
            const hasNote = notes.some((n: DayNote) => n.date === isoDate && n.habitId === selectedHabit?.id);
            
            return (
              <button
                key={idx}
                onClick={() => handleDayClick(isoDate)}
                onContextMenu={(e) => handleDayRightClick(e, isoDate)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium
                  transition-all duration-200 relative group
                  ${isChecked 
                    ? `bg-gradient-to-br ${selectedHabit?.color || 'from-emerald-500 to-teal-600'} text-white shadow-lg hover:shadow-xl scale-100 hover:scale-105` 
                    : isToday
                      ? `${darkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} ${darkMode ? 'text-blue-300' : 'text-blue-700'} border-2 ${darkMode ? 'border-blue-500' : 'border-blue-400'}`
                      : `${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-700'} hover:bg-slate-${darkMode ? '600' : '100'} border ${darkMode ? 'border-slate-600' : 'border-slate-200'}`
                  }
                `}
                title="Left click to toggle, right click to add note"
              >
                <span className={isChecked ? 'font-bold' : ''}>{day}</span>
                {isChecked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                )}
                {hasNote && (
                  <div className="absolute top-1 right-1">
                    <span className="text-xs">📝</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNoteModal(false)}>
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Add Note for {selectedDate}</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="What did you accomplish today?"
              className={`w-full h-32 p-3 rounded-lg border-2 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-200'} focus:outline-none focus:border-blue-500`}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={saveNote}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600"
              >
                Save Note
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className={`flex-1 px-4 py-2 ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'} rounded-lg font-medium`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AnalyticsDashboard = ({ habitData, selectedHabit, darkMode }: any) => {
  const ticks = selectedHabit ? (habitData[selectedHabit.id] || new Set()) : new Set();
  const tickArray: string[] = Array.from(ticks);

  const dayOfWeekStats = useMemo(() => {
    const stats = [0, 0, 0, 0, 0, 0, 0];
    tickArray.forEach((dateStr: string) => {
      const day = new Date(dateStr).getDay();
      stats[day]++;
    });
    const max = Math.max(...stats, 1);
    return stats.map(count => ({ count, percentage: (count / max) * 100 }));
  }, [tickArray]);

  const monthlyStats = useMemo(() => {
    const stats = Array(12).fill(0);
    tickArray.forEach((dateStr: string) => {
      const month = new Date(dateStr).getMonth();
      stats[month]++;
    });
    return stats;
  }, [tickArray]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>📊 Best Days of Week</h3>
        <div className="space-y-2">
          {days.map((day, idx) => (
            <div key={day} className="flex items-center gap-3">
              <div className={`w-12 text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{day}</div>
              <div className={`flex-1 h-8 rounded-lg overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <div
                  className={`h-full bg-gradient-to-r ${selectedHabit?.color || 'from-emerald-500 to-teal-600'} transition-all`}
                  style={{ width: `${dayOfWeekStats[idx].percentage}%` }}
                />
              </div>
              <div className={`w-12 text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{dayOfWeekStats[idx].count}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>📅 Monthly Progress</h3>
        <div className="grid grid-cols-6 gap-3">
          {months.map((month, idx) => (
            <div key={month} className={`text-center p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-1`}>{month}</div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{monthlyStats[idx]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ UTILITY FUNCTIONS ============
const loadData = (address: string, key: string) => {
  const stored = localStorage.getItem(`${key}_${address}`);
  return stored ? JSON.parse(stored) : null;
};

const saveData = (address: string, key: string, data: any) => {
  localStorage.setItem(`${key}_${address}`, JSON.stringify(data));
};

const calcCurrentStreak = (ticks: Set<string>) => {
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

const calcBestStreak = (ticks: Set<string>) => {
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

const getAchievements = (ticks: Set<string>, streak: number, bestStreak: number): Achievement[] => {
  return [
    { id: 'first-step', title: 'First Step', description: 'Complete your first day', icon: '🎯', unlocked: ticks.size >= 1 },
    { id: 'week-warrior', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚔️', unlocked: bestStreak >= 7, progress: Math.min(bestStreak, 7), total: 7 },
    { id: 'monthly-master', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '👑', unlocked: bestStreak >= 30, progress: Math.min(bestStreak, 30), total: 30 },
    { id: 'century-club', title: 'Century Club', description: 'Complete 100 total days', icon: '💯', unlocked: ticks.size >= 100, progress: Math.min(ticks.size, 100), total: 100 },
    { id: 'unstoppable', title: 'Unstoppable', description: 'Maintain a 100-day streak', icon: '🔥', unlocked: bestStreak >= 100, progress: Math.min(bestStreak, 100), total: 100 },
    { id: 'legend', title: 'Legend', description: 'Maintain a 365-day streak', icon: '🏆', unlocked: bestStreak >= 365, progress: Math.min(bestStreak, 365), total: 365 },
  ];
};

const DEFAULT_HABITS: Habit[] = [
  { id: 'exercise', name: 'Exercise', color: 'from-red-500 to-orange-500', icon: '💪' },
  { id: 'reading', name: 'Reading', color: 'from-blue-500 to-indigo-500', icon: '📚' },
  { id: 'meditation', name: 'Meditation', color: 'from-purple-500 to-pink-500', icon: '🧘' },
  { id: 'coding', name: 'Coding', color: 'from-green-500 to-teal-500', icon: '💻' },
];

// ============ MAIN COMPONENT ============
export default function Home() {
  const [address, setAddress] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [habitData, setHabitData] = useState<HabitData>({});
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [notes, setNotes] = useState<DayNote[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showAchievements, setShowAchievements] = useState(false);
  const [view, setView] = useState<'calendar' | 'heatmap' | 'analytics'>('calendar');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (address) {
      const loadedHabits = loadData(address, 'habits') || DEFAULT_HABITS;
      const loadedNotes = loadData(address, 'notes') || [];
      const loadedDarkMode = loadData(address, 'darkMode') || false;
      
      setHabits(loadedHabits);
      setNotes(loadedNotes);
      setDarkMode(loadedDarkMode);

      const data: HabitData = {};
      loadedHabits.forEach((habit: Habit) => {
        const ticks = loadData(address, `ticks_${habit.id}`) || [];
        data[habit.id] = new Set(ticks);
      });
      setHabitData(data);
      setSelectedHabit(loadedHabits[0]);
    } else {
      setHabitData({});
      setSelectedHabit(null);
      setNotes([]);
    }
  }, [address]);

  const onToggleDate = (isoDate: string) => {
    if (!address || !selectedHabit) return;
    
    const next = { ...habitData };
    if (!next[selectedHabit.id]) next[selectedHabit.id] = new Set();
    
    const habitTicks = new Set(next[selectedHabit.id]);
    const wasAdding = !habitTicks.has(isoDate);
    
    if (habitTicks.has(isoDate)) habitTicks.delete(isoDate);
    else {
      habitTicks.add(isoDate);
      const newStreak = calcCurrentStreak(habitTicks);
      if (wasAdding && [7, 30, 50, 100].includes(newStreak)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
    
    next[selectedHabit.id] = habitTicks;
    setHabitData(next);
    saveData(address, `ticks_${selectedHabit.id}`, Array.from(habitTicks));
  };

  const onAddNote = (date: string, note: string, habitId: string) => {
    if (!address) return;
    const updated = notes.filter(n => !(n.date === date && n.habitId === habitId));
    updated.push({ date, note, habitId });
    setNotes(updated);
    saveData(address, 'notes', updated);
  };

  const addHabit = () => {
    const name = prompt('Habit name:');
    if (!name || !address) return;
    const colors = ['from-cyan-500 to-blue-500', 'from-yellow-500 to-amber-500', 'from-rose-500 to-pink-500'];
    const icons = ['🎨', '🎵', '✍️', '🏃', '🍎', '💤', '📱'];
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      color: colors[Math.floor(Math.random() * colors.length)],
      icon: icons[Math.floor(Math.random() * icons.length)]
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    saveData(address, 'habits', updated);
  };

  const toggleDarkMode = () => {
    if (!address) return;
    const newMode = !darkMode;
    setDarkMode(newMode);
    saveData(address, 'darkMode', newMode);
  };

  const ticks: Set<string> = selectedHabit ? (habitData[selectedHabit.id] || new Set()) : new Set();
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
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'} py-12 px-4 relative overflow-hidden transition-colors`}>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="absolute animate-fall" style={{ left: `${Math.random() * 100}%`, top: '-10px', animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 2}s` }}>
              {['🎉', '✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall { animation: fall linear forwards; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-5xl font-black ${darkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900'} bg-clip-text text-transparent mb-2`}>
                StreakChain Pro
              </h1>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} font-medium`}>Multi-habit tracker with analytics & insights</p>
            </div>
            <div className="flex gap-3">
              {address && (
                <button onClick={toggleDarkMode} className={`px-4 py-2 rounded-xl font-medium transition-all ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-200 text-slate-700'}`}>
                  {darkMode ? '☀️' : '🌙'}
                </button>
              )}
              <MetaMaskConnect address={address} onConnect={(a: string) => setAddress(a)} onDisconnect={() => setAddress(null)} />
            </div>
          </div>

          {address && selectedHabit && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className={`bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl ${darkMode ? 'shadow-orange-500/10' : 'shadow-orange-500/20'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🔥</span>
                    <div className="text-5xl font-black">{streak}</div>
                  </div>
                  <div className="text-orange-100 font-medium">Current Streak</div>
                </div>

                <div className={`bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl ${darkMode ? 'shadow-purple-500/10' : 'shadow-purple-500/20'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">👑</span>
                    <div className="text-5xl font-black">{bestStreak}</div>
                  </div>
                  <div className="text-purple-100 font-medium">Best Streak</div>
                </div>

                <div className={`bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl ${darkMode ? 'shadow-emerald-500/10' : 'shadow-emerald-500/20'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">✓</span>
                    <div className="text-5xl font-black">{ticks.size}</div>
                  </div>
                  <div className="text-emerald-100 font-medium">Total Days</div>
                </div>

                <button onClick={() => setShowAchievements(!showAchievements)} className={`bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white shadow-xl ${darkMode ? 'shadow-blue-500/10' : 'shadow-blue-500/20'} hover:scale-105 transition-transform`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🏆</span>
                    <div className="text-5xl font-black">{unlockedCount}/{achievements.length}</div>
                  </div>
                  <div className="text-blue-100 font-medium">Achievements</div>
                </button>
              </div>

              {showAchievements && (
                <div className={`${darkMode ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-2xl p-6 mb-4 shadow-xl`}>
                  <h3 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    <span>🏆</span> Your Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map(achievement => (
                      <div key={achievement.id} className={`p-4 rounded-xl border-2 transition-all ${achievement.unlocked ? `${darkMode ? 'bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-yellow-600' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'} shadow-lg` : `${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'} opacity-60`}`}>
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>{achievement.title}</h4>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{achievement.description}</p>
                            {!achievement.unlocked && achievement.progress !== undefined && (
                              <div className="mt-2">
                                <div className={`flex justify-between text-xs mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                  <span>Progress</span>
                                  <span>{achievement.progress}/{achievement.total}</span>
                                </div>
                                <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all" style={{ width: `${(achievement.progress / achievement.total!) * 100}%` }} />
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

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 flex gap-2 overflow-x-auto pb-2">
                  {habits.map(habit => (
                    <button
                      key={habit.id}
                      onClick={() => setSelectedHabit(habit)}
                      className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                        selectedHabit?.id === habit.id
                          ? `bg-gradient-to-r ${habit.color} text-white shadow-lg`
                          : `${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-700 hover:bg-slate-50'} border ${darkMode ? 'border-slate-600' : 'border-slate-200'}`
                      }`}
                    >
                      {habit.icon} {habit.name}
                    </button>
                  ))}
                  <button onClick={addHabit} className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-700 hover:bg-slate-50'} border-2 border-dashed ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}>
                    + Add Habit
                  </button>
                </div>
              </div>
            </>
          )}
        </header>

        <div className={`${darkMode ? 'bg-slate-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-3xl shadow-2xl border ${darkMode ? 'border-slate-700' : 'border-white/20'} overflow-hidden`}>
          {address ? (
            <main className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {address!.slice(0, 6)}...{address!.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex gap-1 p-1 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <button onClick={() => setView('calendar')} className={`px-3 py-1 rounded text-sm font-medium transition-all ${view === 'calendar' ? `${darkMode ? 'bg-slate-600 text-white' : 'bg-white text-slate-900'} shadow` : `${darkMode ? 'text-slate-400' : 'text-slate-600'}`}`}>
                      📅 Calendar
                    </button>
                    <button onClick={() => setView('heatmap')} className={`px-3 py-1 rounded text-sm font-medium transition-all ${view === 'heatmap' ? `${darkMode ? 'bg-slate-600 text-white' : 'bg-white text-slate-900'} shadow` : `${darkMode ? 'text-slate-400' : 'text-slate-600'}`}`}>
                      🔥 Heatmap
                    </button>
                    <button onClick={() => setView('analytics')} className={`px-3 py-1 rounded text-sm font-medium transition-all ${view === 'analytics' ? `${darkMode ? 'bg-slate-600 text-white' : 'bg-white text-slate-900'} shadow` : `${darkMode ? 'text-slate-400' : 'text-slate-600'}`}`}>
                      📊 Analytics
                    </button>
                  </div>
                </div>
              </div>

              {view === 'calendar' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => changeMonth(-1)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                      ← Prev
                    </button>
                    <div className="text-center">
                      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h2>
                      <button onClick={goToToday} className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1">
                        Go to Today
                      </button>
                    </div>
                    <button onClick={() => changeMonth(1)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                      Next →
                    </button>
                  </div>
                  <CalendarGrid 
                    habitData={habitData}
                    selectedHabit={selectedHabit}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onToggleDate={onToggleDate}
                    notes={notes}
                    onAddNote={onAddNote}
                    darkMode={darkMode}
                  />
                </>
              )}

              {view === 'heatmap' && (
                <div>
                  <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    📆 Year at a Glance - {new Date().getFullYear()}
                  </h2>
                  <YearHeatmap 
                    habitData={habitData}
                    selectedHabit={selectedHabit}
                    habits={habits}
                    onDateClick={onToggleDate}
                  />
                </div>
              )}

              {view === 'analytics' && (
                <AnalyticsDashboard 
                  habitData={habitData}
                  selectedHabit={selectedHabit}
                  darkMode={darkMode}
                />
              )}
            </main>
          ) : (
            <div className="py-24 text-center px-8">
              <div className="mb-8">
                <div className="text-7xl mb-4">🔗</div>
                <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Connect Your Wallet</h2>
                <p className={`max-w-md mx-auto leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Link your MetaMask wallet to start building unstoppable habits. Track multiple habits, view analytics, and unlock achievements.
                </p>
              </div>
              <MetaMaskConnect address={address} onConnect={(a: string) => setAddress(a)} onDisconnect={() => setAddress(null)} />
            </div>
          )}
        </div>

        <footer className={`mt-8 text-center text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
          <p>🔒 Your data is stored locally and never leaves your device • Right-click days to add notes</p>
        </footer>
      </div>
    </div>
  );
}
"use client";
import { useMemo, useState } from "react";

type Props = {
  ticks: Set<string>;
  onToggleDate: (isoDate: string) => void;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  return new Date(y, m + 1, 0).getDate();
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarGrid({ ticks, onToggleDate }: Props) {
  const [base, setBase] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => {
    const total = daysInMonth(base);
    const firstDay = startOfMonth(base).getDay(); // 0..6 (Sun..Sat)
    const cells: Array<{ date: Date | null }> = [];

    for (let i = 0; i < firstDay; i++) cells.push({ date: null });

    for (let d = 1; d <= total; d++) cells.push({ date: new Date(base.getFullYear(), base.getMonth(), d) });

    return cells;
  }, [base]);

  function prevMonth() {
    setBase(new Date(base.getFullYear(), base.getMonth() - 1, 1));
  }

  function nextMonth() {
    setBase(new Date(base.getFullYear(), base.getMonth() + 1, 1));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="px-3 py-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50">Prev</button>
        <div className="font-medium text-slate-700">{base.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
        <button onClick={nextMonth} className="px-3 py-2 bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50">Next</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm mb-3 text-slate-500">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-3 justify-items-center">
        {days.map((c, idx) => {
          if (!c.date) return <div key={idx} className="w-14 h-14" />;
          const iso = toISO(c.date);
          const active = ticks.has(iso);
          return (
            <button
              key={iso}
              onClick={() => onToggleDate(iso)}
              className={`w-14 h-14 flex items-center justify-center rounded-lg transition-colors duration-150 border ${active ? 'bg-emerald-500 text-white border-emerald-600 shadow' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
              title={iso}
            >
              <span className="text-sm font-medium">{c.date.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function calcCurrentStreak(ticks: Set<string>): number {
  if (!ticks || ticks.size === 0) return 0;

  let count = 0;
  const today = new Date();
  for (let i = 0; ; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (ticks.has(iso)) count++;
    else break;
  }
  return count;
}

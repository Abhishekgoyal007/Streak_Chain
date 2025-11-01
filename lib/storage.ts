export const PREFIX = 'streakchain:';

export function loadTicksFor(address: string): string[] {
  try {
    const raw = localStorage.getItem(PREFIX + address);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch (err) {
    console.error('loadTicksFor err', err);
    return [];
  }
}

export function saveTicksFor(address: string, dates: string[]) {
  try {
    localStorage.setItem(PREFIX + address, JSON.stringify(dates));
  } catch (err) {
    console.error('saveTicksFor err', err);
  }
}

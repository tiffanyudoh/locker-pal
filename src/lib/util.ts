import type { HomeworkItem } from '../types';

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayMDY(): string {
  return toMdyDate(todayISO());
}

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Normalize stored ISO or MM-DD-YYYY to YYYY-MM-DD for comparisons. */
export function toISODate(value: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const mdy = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1]}-${mdy[2]}`;
  return null;
}

export function toMdyDate(value: string): string {
  const iso = toISODate(value);
  if (!iso) return formatMdyDateDigits(value);
  const [year, month, day] = iso.split('-');
  return `${month}-${day}-${year}`;
}

export function fmtDate(value: string): string {
  return toMdyDate(value);
}

/** Digits only, max MMDDYYYY. */
export function dateDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8);
}

/** Type MMDDYYYY on the keypad; dashes fill in as MM-DD-YYYY. */
export function formatMdyDateDigits(value: string): string {
  const digits = dateDigits(value);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

/** LCD countdown as MM:SS. Ceil so 25:00 holds for the first full second. */
export function formatMmSs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function clockStr(d = new Date()): string {
  let h = d.getHours();
  const m = pad(d.getMinutes());
  const ap = h >= 12 ? 'P' : 'A';
  h = h % 12 || 12;
  return `${h}:${m}${ap}`;
}

export function todaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function starRating(key: string): number {
  return (hashStr(key.toLowerCase().trim()) % 5) + 1;
}

export function isOverdue(item: HomeworkItem, today = todayISO()): boolean {
  if (item.done || item.dueDate.length === 0) return false;
  const due = toISODate(item.dueDate);
  if (!due) return false;
  return due < today;
}

export function scoreGuess(
  guess: string,
  secret: string,
): { rightPlace: number; rightDigit: number } {
  const g = guess.split('');
  const s = secret.split('');
  const usedS = [false, false, false, false];
  const usedG = [false, false, false, false];
  let rightPlace = 0;
  let rightDigit = 0;

  for (let i = 0; i < 4; i += 1) {
    if (g[i] === s[i]) {
      rightPlace += 1;
      usedS[i] = true;
      usedG[i] = true;
    }
  }

  for (let i = 0; i < 4; i += 1) {
    if (usedG[i]) continue;
    for (let j = 0; j < 4; j += 1) {
      if (usedS[j]) continue;
      if (g[i] === s[j]) {
        rightDigit += 1;
        usedS[j] = true;
        break;
      }
    }
  }

  return { rightPlace, rightDigit };
}

export function randomCombo(): string {
  let code = '';
  for (let i = 0; i < 4; i += 1) {
    code += String(Math.floor(Math.random() * 10));
  }
  return code;
}

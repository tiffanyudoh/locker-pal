import type { HomeworkItem } from '../types';

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function fmtDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[1]}/${parts[2]}`;
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
  return item.dueDate < today;
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

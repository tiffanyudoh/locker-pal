import { describe, expect, it } from 'vitest';
import { dateDigits, formatMdyDateDigits, formatMmSs, toISODate, toMdyDate } from './util';

describe('formatMdyDateDigits', () => {
  it('keeps a partial month', () => {
    expect(formatMdyDateDigits('1')).toBe('1');
    expect(formatMdyDateDigits('10')).toBe('10');
  });

  it('inserts dashes as day and year appear', () => {
    expect(formatMdyDateDigits('101')).toBe('10-1');
    expect(formatMdyDateDigits('1014')).toBe('10-14');
    expect(formatMdyDateDigits('10141995')).toBe('10-14-1995');
  });

  it('strips non-digits and caps at 8', () => {
    expect(dateDigits('10-14-1995ab')).toBe('10141995');
    expect(formatMdyDateDigits('10-14-199599')).toBe('10-14-1995');
  });
});

describe('toMdyDate / toISODate', () => {
  it('converts leftover ISO values for display', () => {
    expect(toMdyDate('1995-10-14')).toBe('10-14-1995');
    expect(toISODate('10-14-1995')).toBe('1995-10-14');
  });
});

describe('formatMmSs', () => {
  it('shows 25:00 at a full pomodoro and 00:00 at zero', () => {
    expect(formatMmSs(25 * 60 * 1000)).toBe('25:00');
    expect(formatMmSs(0)).toBe('00:00');
  });

  it('holds the current second until it fully elapses', () => {
    expect(formatMmSs(24 * 60 * 1000 + 1000)).toBe('24:01');
    expect(formatMmSs(24 * 60 * 1000 + 1)).toBe('24:01');
  });
});

import { describe, expect, it } from 'vitest';
import { dateDigits, formatMdyDateDigits, toISODate, toMdyDate } from './util';

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

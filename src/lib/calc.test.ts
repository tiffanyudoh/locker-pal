import { describe, expect, it } from 'vitest';
import { applyOp, format, INITIAL, inputDigit, type CalcState } from './calc';

function press(keys: string, start: CalcState = INITIAL): CalcState {
  let state = start;
  for (const key of keys) {
    if (key === 'C') {
      state = INITIAL;
      continue;
    }
    if (key === '=' || key === 'E') {
      state = applyOp(state, '=');
      continue;
    }
    if (key === '+' || key === '-' || key === '*' || key === '/') {
      state = applyOp(state, key);
      continue;
    }
    if ((key >= '0' && key <= '9') || key === '.') {
      state = inputDigit(state, key);
    }
  }
  return state;
}

describe('inputDigit', () => {
  it('replaces the leading zero', () => {
    expect(press('7').display).toBe('7');
  });

  it('appends digits', () => {
    expect(press('12').display).toBe('12');
  });

  it('starts a decimal from zero', () => {
    expect(press('.').display).toBe('0.');
    expect(press('.5').display).toBe('0.5');
  });

  it('ignores a second decimal point', () => {
    expect(press('1.2.3').display).toBe('1.23');
  });

  it('caps the mantissa at 10 digits', () => {
    expect(press('12345678901').display).toBe('1234567890');
  });

  it('starts a new number after an operator', () => {
    expect(press('8+3').display).toBe('3');
    expect(press('8+3').op).toBe('+');
    expect(press('8+3').acc).toBe(8);
  });
});

describe('applyOp', () => {
  it('adds, subtracts, multiplies, and divides', () => {
    expect(press('6+7=').display).toBe('13');
    expect(press('9-4=').display).toBe('5');
    expect(press('6*7=').display).toBe('42');
    expect(press('8/2=').display).toBe('4');
  });

  it('chains operators without pressing equals', () => {
    expect(press('2+3+4=').display).toBe('9');
  });

  it('lets you change the pending operator while fresh', () => {
    expect(press('8*+2=').display).toBe('10');
  });

  it('repeats the last operation on extra equals', () => {
    expect(press('3+2=').display).toBe('5');
    expect(press('3+2==').display).toBe('7');
    expect(press('3+2===').display).toBe('9');
  });

  it('treats equals with no pending op as a no-op', () => {
    expect(press('12=').display).toBe('12');
  });

  it('shows ERR on divide by zero and stays there until a digit', () => {
    const err = press('1/0=');
    expect(err.display).toBe('ERR');
    expect(press('+', err).display).toBe('ERR');
    expect(press('=', err).display).toBe('ERR');
    expect(press('5', err).display).toBe('5');
  });

  it('clears back to zero', () => {
    expect(press('99+1=C').display).toBe('0');
    expect(press('99+1=C')).toEqual(INITIAL);
  });
});

describe('format', () => {
  it('strips trailing zeros', () => {
    expect(format(2.5)).toBe('2.5');
    expect(format(4)).toBe('4');
  });

  it('avoids negative zero', () => {
    expect(format(-0)).toBe('0');
  });

  it('uses exponential for huge and tiny values', () => {
    expect(format(1e12)).toMatch(/e\+/i);
    expect(format(1e-8)).toMatch(/e-/i);
  });

  it('returns ERR for non-finite numbers', () => {
    expect(format(Number.NaN)).toBe('ERR');
    expect(format(Number.POSITIVE_INFINITY)).toBe('ERR');
  });
});

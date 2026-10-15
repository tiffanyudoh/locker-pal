import { useState } from 'react';
import { LcdChrome } from '../components/LcdWidgets';
import { usePdaKeys } from '../nav/PdaContext';
import type { PdaKey } from '../types';

type CalcState = {
  display: string;
  acc: number | null;
  op: string | null;
  fresh: boolean;
};

const INITIAL: CalcState = { display: '0', acc: null, op: null, fresh: true };

function compute(a: number, op: string, b: number): number {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b === 0 ? Number.NaN : a / b;
  return b;
}

function format(n: number): string {
  if (!Number.isFinite(n)) return 'ERR';
  const raw = String(Number(n.toPrecision(10)));
  return raw.length > 10 ? n.toExponential(4) : raw;
}

function inputDigit(state: CalcState, d: string): CalcState {
  if (state.display === 'ERR') {
    return { display: d === '.' ? '0.' : d, acc: null, op: null, fresh: false };
  }
  if (state.fresh) {
    return { ...state, display: d === '.' ? '0.' : d, fresh: false };
  }
  if (d === '.' && state.display.includes('.')) return state;
  const digits = state.display.replace('.', '').replace('-', '');
  if (digits.length >= 10) return state;
  return {
    ...state,
    display: state.display === '0' && d !== '.' ? d : state.display + d,
  };
}

function applyOp(state: CalcState, nextOp: string): CalcState {
  const n = Number.parseFloat(state.display);
  if (state.display === 'ERR') {
    return { display: '0', acc: null, op: nextOp === '=' ? null : nextOp, fresh: true };
  }
  if (state.acc === null || state.op === null || state.fresh) {
    return { ...state, acc: n, op: nextOp === '=' ? null : nextOp, fresh: true };
  }
  const result = compute(state.acc, state.op, n);
  return {
    display: format(result),
    acc: result,
    op: nextOp === '=' ? null : nextOp,
    fresh: true,
  };
}

export function Calculator() {
  const [state, setState] = useState<CalcState>(INITIAL);

  usePdaKeys((key: PdaKey) => {
    if (key === 'C') {
      setState(INITIAL);
      return;
    }
    if (key === 'OK' || key === '=') {
      setState((current) => applyOp(current, '='));
      return;
    }
    if (key === '+' || key === '-' || key === '*' || key === '/') {
      setState((current) => applyOp(current, key));
      return;
    }
    if ((key >= '0' && key <= '9') || key === '.') {
      setState((current) => inputDigit(current, key));
    }
  });

  return (
    <LcdChrome title="CALC" right={state.op ?? ''}>
      <div className="calc-display">{state.display}</div>
    </LcdChrome>
  );
}

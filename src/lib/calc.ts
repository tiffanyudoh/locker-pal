export type CalcState = {
  display: string;
  acc: number | null;
  op: string | null;
  fresh: boolean;
  repeatOp: string | null;
  repeatVal: number | null;
};

export const INITIAL: CalcState = {
  display: '0',
  acc: null,
  op: null,
  fresh: true,
  repeatOp: null,
  repeatVal: null,
};

const ERR: CalcState = {
  display: 'ERR',
  acc: null,
  op: null,
  fresh: true,
  repeatOp: null,
  repeatVal: null,
};

function compute(a: number, op: string, b: number): number {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') return b === 0 ? Number.NaN : a / b;
  return b;
}

/** Plain decimal for everyday results. Later operations read `acc`, not this string. */
export function format(n: number): string {
  if (!Number.isFinite(n)) return 'ERR';
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e10 || abs < 1e-6)) return n.toExponential(4);

  const signLen = n < 0 ? 1 : 0;
  let text: string;
  if (abs >= 1) {
    const intDigits = Math.floor(Math.log10(abs)) + 1;
    if (intDigits + signLen > 10) return n.toExponential(4);
    const places = intDigits + signLen >= 10 ? 0 : Math.max(0, 9 - signLen - intDigits);
    text = n.toFixed(places);
  } else {
    text = n.toFixed(Math.max(0, 8 - signLen));
  }
  text = text.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  if (text === '-0') return '0';
  if (text.length > 10) return n.toExponential(4);
  return text;
}

export function inputDigit(state: CalcState, d: string): CalcState {
  if (state.display === 'ERR') {
    return {
      display: d === '.' ? '0.' : d,
      acc: null,
      op: null,
      fresh: false,
      repeatOp: null,
      repeatVal: null,
    };
  }
  if (state.fresh) {
    return {
      ...state,
      display: d === '.' ? '0.' : d,
      fresh: false,
      repeatOp: null,
      repeatVal: null,
    };
  }
  if (d === '.' && state.display.includes('.')) return state;
  const digits = state.display.replace('.', '').replace('-', '');
  if (digits.length >= 10) return state;
  return {
    ...state,
    display: state.display === '0' && d !== '.' ? d : state.display + d,
  };
}

function finish(result: number, repeatOp: string, repeatVal: number): CalcState {
  if (!Number.isFinite(result)) return ERR;
  return {
    display: format(result),
    acc: result,
    op: null,
    fresh: true,
    repeatOp,
    repeatVal,
  };
}

export function applyOp(state: CalcState, nextOp: string): CalcState {
  if (state.display === 'ERR') return state;

  if (nextOp === '=') {
    if (state.op && state.acc !== null) {
      const rhs = state.fresh ? state.acc : Number.parseFloat(state.display);
      return finish(compute(state.acc, state.op, rhs), state.op, rhs);
    }
    if (
      state.fresh &&
      state.repeatOp &&
      state.repeatVal !== null &&
      state.acc !== null
    ) {
      return finish(compute(state.acc, state.repeatOp, state.repeatVal), state.repeatOp, state.repeatVal);
    }
    return state;
  }

  if (state.op === null || state.fresh) {
    const left =
      state.fresh && state.acc !== null && Number.isFinite(state.acc)
        ? state.acc
        : Number.parseFloat(state.display);
    return {
      ...state,
      display: format(left),
      acc: left,
      op: nextOp,
      fresh: true,
      repeatOp: null,
      repeatVal: null,
    };
  }

  const result = compute(state.acc ?? 0, state.op, Number.parseFloat(state.display));
  if (!Number.isFinite(result)) return ERR;
  return {
    display: format(result),
    acc: result,
    op: nextOp,
    fresh: true,
    repeatOp: null,
    repeatVal: null,
  };
}

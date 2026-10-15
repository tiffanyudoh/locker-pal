import { useState } from 'react';
import { LcdChrome } from '../components/LcdWidgets';
import { applyOp, INITIAL, inputDigit } from '../lib/calc';
import { usePdaKeys } from '../nav/PdaContext';
import type { PdaKey } from '../types';

export function Calculator() {
  const [state, setState] = useState(INITIAL);

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

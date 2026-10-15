import { useState } from 'react';
import { beepError, beepOk } from '../audio/beeps';
import { usePda, usePdaKeys } from '../nav/PdaContext';
import { usePdaStore } from '../store/PdaStore';
import type { PdaKey } from '../types';
import { LcdChrome } from './LcdWidgets';

export function LockScreen() {
  const { pin } = usePdaStore();
  const { openApp, triggerShake } = usePda();
  const [digits, setDigits] = useState('');
  const [msg, setMsg] = useState('ENTER PIN');

  const submit = (value: string) => {
    if (value === pin) {
      beepOk();
      setMsg('OK!');
      window.setTimeout(() => openApp('home'), 220);
      return;
    }
    beepError();
    triggerShake();
    setDigits('');
    setMsg('WRONG PIN');
  };

  usePdaKeys((key: PdaKey) => {
    if (key === 'C') {
      setDigits('');
      setMsg('ENTER PIN');
      return;
    }
    if (key === 'OK') {
      if (digits.length === 4) submit(digits);
      return;
    }
    if (key < '0' || key > '9') return;
    setMsg('ENTER PIN');
    setDigits((current) => {
      const next = (current + key).slice(0, 4);
      if (next.length === 4) {
        window.setTimeout(() => submit(next), 80);
      }
      return next;
    });
  });

  return (
    <LcdChrome title="LOCK">
      <div className="lock-wrap">
        <div>PASSWORD PLEASE</div>
        <div className="lock-dots" aria-label="PIN digits">
          {'1234'.split('').map((_, i) => (
            <span key={i}>{i < digits.length ? '*' : '-'}</span>
          ))}
        </div>
        <div className="lock-msg">{msg}</div>
      </div>
    </LcdChrome>
  );
}

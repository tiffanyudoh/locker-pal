import { useCallback, useEffect, useRef, useState } from 'react';
import { beepError, beepOk } from '../audio/beeps';
import { useDelayedCommit } from '../lib/useDelayedCommit';
import { usePda, usePdaKeys } from '../nav/PdaContext';
import { usePdaStore } from '../store/PdaStore';
import type { PdaKey } from '../types';
import { LcdChrome } from './LcdWidgets';

export function LockScreen() {
  const { pin } = usePdaStore();
  const { openApp, triggerShake } = usePda();
  const [digits, setDigits] = useState('');
  const [msg, setMsg] = useState('ENTER PIN');
  const armed = useRef(true);
  const unlockTimer = useRef<number | null>(null);

  useEffect(() => {
    if (digits.length < 4) armed.current = true;
  }, [digits]);

  useEffect(() => {
    return () => {
      if (unlockTimer.current !== null) window.clearTimeout(unlockTimer.current);
    };
  }, []);

  const submit = useCallback(
    (value: string) => {
      if (!armed.current || value.length !== 4) return;
      armed.current = false;
      if (value === pin) {
        beepOk();
        setMsg('OK!');
        if (unlockTimer.current !== null) return;
        unlockTimer.current = window.setTimeout(() => {
          unlockTimer.current = null;
          openApp('home');
        }, 220);
        return;
      }
      beepError();
      triggerShake();
      setDigits('');
      setMsg('WRONG PIN');
    },
    [pin, openApp, triggerShake],
  );

  const cancel = useDelayedCommit(digits, digits.length === 4, submit);

  usePdaKeys((key: PdaKey) => {
    if (key === 'C') {
      cancel();
      setDigits('');
      setMsg('ENTER PIN');
      return;
    }
    if (key === 'OK') {
      cancel();
      if (digits.length === 4) submit(digits);
      return;
    }
    if (key < '0' || key > '9') return;
    setMsg('ENTER PIN');
    setDigits((current) => (current + key).slice(0, 4));
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

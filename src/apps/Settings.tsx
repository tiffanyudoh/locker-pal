import { useCallback, useEffect, useRef, useState } from 'react';
import { LcdChrome } from '../components/LcdWidgets';
import { beepError, beepOk } from '../audio/beeps';
import { useDelayedCommit } from '../lib/useDelayedCommit';
import { usePda, usePdaKeys } from '../nav/PdaContext';
import { usePdaStore } from '../store/PdaStore';
import type { PdaKey } from '../types';

type Step = 'old' | 'next' | 'confirm' | 'done';

const LABELS: Record<Step, string> = {
  old: 'OLD PIN',
  next: 'NEW PIN',
  confirm: 'CONFIRM',
  done: 'SAVED',
};

export function Settings() {
  const { pin, setPin } = usePdaStore();
  const { triggerShake } = usePda();
  const [step, setStep] = useState<Step>('old');
  const [digits, setDigits] = useState('');
  const [pending, setPending] = useState('');
  const [msg, setMsg] = useState('ENTER CURRENT PIN');
  const armed = useRef(true);
  const stepRef = useRef(step);
  const pendingRef = useRef(pending);
  const pinRef = useRef(pin);

  useEffect(() => {
    stepRef.current = step;
    pendingRef.current = pending;
    pinRef.current = pin;
  });

  useEffect(() => {
    if (digits.length < 4) armed.current = true;
  }, [digits]);

  const advance = useCallback(
    (value: string) => {
      if (!armed.current || value.length !== 4 || stepRef.current === 'done') return;
      armed.current = false;
      const stepNow = stepRef.current;

      if (stepNow === 'old') {
        if (value !== pinRef.current) {
          beepError();
          triggerShake();
          setDigits('');
          setMsg('NOPE');
          return;
        }
        beepOk();
        setDigits('');
        stepRef.current = 'next';
        setStep('next');
        setMsg('ENTER NEW PIN');
        return;
      }

      if (stepNow === 'next') {
        pendingRef.current = value;
        stepRef.current = 'confirm';
        setPending(value);
        setDigits('');
        setStep('confirm');
        setMsg('AGAIN PLEASE');
        return;
      }

      if (value !== pendingRef.current) {
        beepError();
        triggerShake();
        setDigits('');
        pendingRef.current = '';
        stepRef.current = 'next';
        setPending('');
        setStep('next');
        setMsg('NO MATCH');
        return;
      }

      setPin(value);
      beepOk();
      setDigits('');
      stepRef.current = 'done';
      setStep('done');
      setMsg('PIN SAVED');
    },
    [setPin, triggerShake],
  );

  const cancel = useDelayedCommit(digits, step !== 'done' && digits.length === 4, advance);

  usePdaKeys((key: PdaKey) => {
    if (stepRef.current === 'done') return;
    if (key === 'C') {
      cancel();
      setDigits('');
      return;
    }
    if (key === 'OK') {
      cancel();
      if (digits.length === 4) advance(digits);
      return;
    }
    if (key < '0' || key > '9') return;
    setDigits((current) => (current + key).slice(0, 4));
  });

  return (
    <LcdChrome title="SET PIN">
      <div className="lock-wrap">
        <div>{LABELS[step]}</div>
        <div className="lock-dots">
          {'1234'.split('').map((_, i) => (
            <span key={i}>{i < digits.length ? '*' : '-'}</span>
          ))}
        </div>
        <div className="lock-msg">{msg}</div>
      </div>
    </LcdChrome>
  );
}

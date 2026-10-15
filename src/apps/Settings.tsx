import { useState } from 'react';
import { LcdChrome } from '../components/LcdWidgets';
import { beepError, beepOk } from '../audio/beeps';
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

  const advance = (value: string) => {
    if (step === 'old') {
      if (value !== pin) {
        beepError();
        triggerShake();
        setDigits('');
        setMsg('NOPE');
        return;
      }
      beepOk();
      setDigits('');
      setStep('next');
      setMsg('ENTER NEW PIN');
      return;
    }
    if (step === 'next') {
      setPending(value);
      setDigits('');
      setStep('confirm');
      setMsg('AGAIN PLEASE');
      return;
    }
    if (step === 'confirm') {
      if (value !== pending) {
        beepError();
        triggerShake();
        setDigits('');
        setStep('next');
        setPending('');
        setMsg('NO MATCH');
        return;
      }
      setPin(value);
      beepOk();
      setDigits('');
      setStep('done');
      setMsg('PIN SAVED');
    }
  };

  usePdaKeys((key: PdaKey) => {
    if (step === 'done') return;
    if (key === 'C') {
      setDigits('');
      return;
    }
    if (key === 'OK') {
      if (digits.length === 4) advance(digits);
      return;
    }
    if (key < '0' || key > '9') return;
    setDigits((current) => {
      const next = (current + key).slice(0, 4);
      if (next.length === 4) {
        window.setTimeout(() => advance(next), 80);
      }
      return next;
    });
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

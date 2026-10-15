import { useCallback, useEffect, useRef, useState } from 'react';
import { LcdBtn, LcdChrome } from '../components/LcdWidgets';
import { beepError, beepWin } from '../audio/beeps';
import { useDelayedCommit } from '../lib/useDelayedCommit';
import { randomCombo, scoreGuess } from '../lib/util';
import { usePdaKeys } from '../nav/PdaContext';
import { usePdaStore } from '../store/PdaStore';
import type { PdaKey } from '../types';

type Guess = {
  code: string;
  rightPlace: number;
  rightDigit: number;
};

type Phase = 'play' | 'win' | 'lose';

function newSecret(): string {
  return randomCombo();
}

export function LockerCombo() {
  const { comboStreak, setComboStreak } = usePdaStore();
  const [secret, setSecret] = useState(newSecret);
  const [digits, setDigits] = useState('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [phase, setPhase] = useState<Phase>('play');
  const armed = useRef(true);
  const phaseRef = useRef(phase);
  const secretRef = useRef(secret);
  const guessesRef = useRef(guesses);
  const streakRef = useRef(comboStreak);

  useEffect(() => {
    phaseRef.current = phase;
    secretRef.current = secret;
    guessesRef.current = guesses;
    streakRef.current = comboStreak;
  });

  useEffect(() => {
    if (digits.length < 4 && phase === 'play') armed.current = true;
  }, [digits, phase]);

  const restart = () => {
    armed.current = true;
    phaseRef.current = 'play';
    setSecret(newSecret());
    setDigits('');
    setGuesses([]);
    guessesRef.current = [];
    setPhase('play');
  };

  const lockIn = useCallback(
    (code: string) => {
      if (code.length !== 4 || phaseRef.current !== 'play' || !armed.current) return;
      armed.current = false;
      const scored = scoreGuess(code, secretRef.current);
      const next = [...guessesRef.current, { code, ...scored }];
      guessesRef.current = next;
      setGuesses(next);
      setDigits('');
      if (scored.rightPlace === 4) {
        phaseRef.current = 'win';
        beepWin();
        setComboStreak(streakRef.current + 1);
        setPhase('win');
        return;
      }
      if (next.length >= 6) {
        phaseRef.current = 'lose';
        beepError();
        setComboStreak(0);
        setPhase('lose');
      }
    },
    [setComboStreak],
  );

  const cancel = useDelayedCommit(digits, phase === 'play' && digits.length === 4, lockIn);

  usePdaKeys((key: PdaKey) => {
    if (phaseRef.current !== 'play') {
      if (key === 'OK') restart();
      return;
    }
    if (key === 'C') {
      cancel();
      setDigits('');
      return;
    }
    if (key === 'OK' || key === '=') {
      cancel();
      lockIn(digits);
      return;
    }
    if (key < '0' || key > '9') return;
    setDigits((current) => (current + key).slice(0, 4));
  });

  if (phase === 'win') {
    return (
      <LcdChrome title="COMBO" right={`S${comboStreak}`}>
        <div className="splash-big">
          <div>CLICK!</div>
          <div>LOCKER OPEN</div>
          <div>STREAK {comboStreak}</div>
          <LcdBtn onClick={restart}>PLAY AGAIN</LcdBtn>
        </div>
      </LcdChrome>
    );
  }

  if (phase === 'lose') {
    return (
      <LcdChrome title="COMBO" right="0">
        <div className="splash-big">
          <div>STUCK OUTSIDE</div>
          <div>CODE WAS {secret}</div>
          <LcdBtn onClick={restart}>PLAY AGAIN</LcdBtn>
        </div>
      </LcdChrome>
    );
  }

  return (
    <LcdChrome title="COMBO" right={`S${comboStreak}`}>
      <div>
        <div>GUESS {guesses.length + 1}/6</div>
        <div className="lock-dots">
          {'1234'.split('').map((_, i) => (
            <span key={i}>{digits[i] ?? '_'}</span>
          ))}
        </div>
        <div className="lcd-list" style={{ marginTop: 8 }}>
          {guesses.map((guess, i) => (
            <div key={`${guess.code}-${i}`} className="guess-line">
              <span>
                {i + 1}. {guess.code.split('').join(' ')}
              </span>
              <span>
                {guess.rightDigit} DIG {guess.rightPlace} PLC
              </span>
            </div>
          ))}
        </div>
        <div className="lcd-empty-sub" style={{ marginTop: 8 }}>
          OK LOCKS IN · 6 TRIES
        </div>
      </div>
    </LcdChrome>
  );
}

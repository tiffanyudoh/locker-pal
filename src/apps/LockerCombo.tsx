import { useState } from 'react';
import { LcdBtn, LcdChrome } from '../components/LcdWidgets';
import { beepError, beepWin } from '../audio/beeps';
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

  const restart = () => {
    setSecret(newSecret());
    setDigits('');
    setGuesses([]);
    setPhase('play');
  };

  const lockIn = (code: string) => {
    if (code.length !== 4 || phase !== 'play') return;
    const scored = scoreGuess(code, secret);
    const next = [...guesses, { code, ...scored }];
    setGuesses(next);
    setDigits('');
    if (scored.rightPlace === 4) {
      beepWin();
      setComboStreak(comboStreak + 1);
      setPhase('win');
      return;
    }
    if (next.length >= 6) {
      beepError();
      setComboStreak(0);
      setPhase('lose');
    }
  };

  usePdaKeys((key: PdaKey) => {
    if (phase !== 'play') {
      if (key === 'OK') restart();
      return;
    }
    if (key === 'C') {
      setDigits('');
      return;
    }
    if (key === 'OK' || key === '=') {
      lockIn(digits);
      return;
    }
    if (key < '0' || key > '9') return;
    setDigits((current) => {
      const next = (current + key).slice(0, 4);
      if (next.length === 4) {
        window.setTimeout(() => lockIn(next), 80);
      }
      return next;
    });
  });

  if (phase === 'win') {
    return (
      <LcdChrome title="COMBO" right={`S${comboStreak}`}>
        <div className="splash-big" data-combo-secret={secret}>
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
        <div className="splash-big" data-combo-secret={secret}>
          <div>STUCK OUTSIDE</div>
          <div>CODE WAS {secret}</div>
          <LcdBtn onClick={restart}>PLAY AGAIN</LcdBtn>
        </div>
      </LcdChrome>
    );
  }

  return (
    <LcdChrome title="COMBO" right={`S${comboStreak}`}>
      <div data-combo-secret={secret}>
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

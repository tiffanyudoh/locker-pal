import { useState, type ReactNode } from 'react';
import { beepClick, resumeAudio } from '../audio/beeps';
import { backspaceField, focusedControl, focusedTextField, insertText } from '../lib/fieldEdit';
import { usePda } from '../nav/PdaContext';
import type { PdaKey } from '../types';
import { MarbleFace } from './MarbleFace';

type Cap = {
  label: string;
  key?: PdaKey;
  wide?: 'space' | 'enter';
  tint?: 'fn' | 'enter';
};

function Keycap({
  label,
  keyCode,
  wide,
  tint,
  latched,
  onSend,
  onPress,
}: {
  label: string;
  keyCode?: PdaKey;
  wide?: Cap['wide'];
  tint?: Cap['tint'];
  latched?: boolean;
  onSend: (key: PdaKey) => void;
  onPress: (label: string, keyCode?: PdaKey) => boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={latched || undefined}
      className={`keycap${wide ? ` key-${wide}` : ''}${tint ? ` key-${tint}` : ''}${latched ? ' key-latched' : ''}`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        if (onPress(label, keyCode)) return;
        if (keyCode) {
          onSend(keyCode);
          return;
        }
        resumeAudio();
        beepClick();
      }}
    >
      {label}
    </button>
  );
}

function Row({
  keys,
  onSend,
  onPress,
  latchedLabel,
}: {
  keys: Cap[];
  onSend: (key: PdaKey) => void;
  onPress: (label: string, keyCode?: PdaKey) => boolean;
  latchedLabel?: string;
}) {
  return (
    <div className="kb-row">
      {keys.map((item) => (
        <Keycap
          key={item.label}
          label={item.label}
          keyCode={item.key}
          wide={item.wide}
          tint={item.tint}
          latched={item.label === latchedLabel}
          onSend={onSend}
          onPress={onPress}
        />
      ))}
    </div>
  );
}

const NUM: Cap[] = [
  { label: '1', key: '1' },
  { label: '2', key: '2' },
  { label: '3', key: '3' },
  { label: '4', key: '4' },
  { label: '5', key: '5' },
  { label: '6', key: '6' },
  { label: '7', key: '7' },
  { label: '8', key: '8' },
  { label: '9', key: '9' },
  { label: '0', key: '0' },
];

const Q: Cap[] = 'QWERTYUIOP'.split('').map((label) => ({ label }));
const A: Cap[] = 'ASDFGHJKL'.split('').map((label) => ({ label }));
const Z: Cap[] = [
  { label: '2nd', tint: 'fn' },
  ...'ZXCVBNM'.split('').map((label) => ({ label })),
  { label: '.', key: '.' },
];

const OPS: Cap[] = [
  { label: '+', key: '+' },
  { label: '−', key: '-' },
  { label: '×', key: '*' },
  { label: '/', key: '/' },
  { label: '=', key: '=' },
];

function letterCase(label: string, caps: boolean, shift: boolean): string {
  return caps !== shift ? label : label.toLowerCase();
}

export function PdaShell({ children }: { children: ReactNode }) {
  const { lidOpen, openLid, sendKey, shaking } = usePda();
  const [caps, setCaps] = useState(false);
  const [shift, setShift] = useState(false);

  const onPress = (label: string, keyCode?: PdaKey): boolean => {
    if (label === 'CAPS') {
      setCaps((on) => !on);
      setShift(false);
      resumeAudio();
      beepClick();
      return true;
    }
    if (label === '2nd') {
      setShift((on) => !on);
      resumeAudio();
      beepClick();
      return true;
    }

    const control = focusedControl();
    if (!control) return false;

    if (keyCode === 'BACK') {
      control.blur();
      resumeAudio();
      beepClick();
      return true;
    }

    const field = focusedTextField();
    if (keyCode === 'C' && field) {
      backspaceField(field);
      resumeAudio();
      beepClick();
      return true;
    }
    if (keyCode === 'OK') {
      if (field instanceof HTMLTextAreaElement) insertText(field, '\n');
      else control.blur();
      resumeAudio();
      beepClick();
      return true;
    }
    if (!field) return false;

    let text: string | null = null;
    if (/^[A-Z]$/.test(label)) text = letterCase(label, caps, shift);
    else if (label === 'SPACE') text = ' ';
    else if (keyCode === '.') text = '.';
    else if (keyCode && keyCode >= '0' && keyCode <= '9') text = keyCode;
    else if (keyCode === '+' || keyCode === '-' || keyCode === '*' || keyCode === '/' || keyCode === '=') {
      text = keyCode === '*' ? '×' : keyCode;
    }
    if (!text) return false;

    insertText(field, text);
    if (shift) setShift(false);
    resumeAudio();
    beepClick();
    return true;
  };

  if (!lidOpen) {
    return (
      <div className="pda closed">
        <button type="button" className="lid" onClick={openLid} aria-label="Open Locker Pal">
          <MarbleFace variant="lid" />
          <span className="lid-logo">
            <span className="lid-logo-name">Locker Pal</span>
            <span className="lid-logo-sub">electronic organizer</span>
          </span>
          <span className="tap-hint">tap to open</span>
          <span className="latch" />
        </button>
      </div>
    );
  }

  return (
    <div className="pda open">
      <section className="lid-inner">
        <div className="mirror-well">
          <div className="mirror" />
        </div>
        <div className="lid-card">
          <div className="sticker">
            <div className="sticker-title">SECRETS</div>
            <div className="sticker-art" />
            <div className="sticker-sub">KEEP OUT</div>
          </div>
          <div className="name-plate">Locker Pal</div>
        </div>
      </section>

      <div className="hinge">
        <span />
        <span />
        <span />
      </div>

      <section className="console">
        <div className="brand-line">Locker Pal</div>
        <div className="console-main">
          <div className="lcd-bezel">
            <div className={`lcd${shaking ? ' shaking' : ''}`}>
              {children}
              <div className="lcd-glass" />
            </div>
          </div>

          <div className="keys-block">
            <div className="fn-row">
              <Keycap label="MENU" keyCode="MENU" tint="fn" onSend={sendKey} onPress={onPress} />
              <Keycap label="BACK" keyCode="BACK" tint="fn" onSend={sendKey} onPress={onPress} />
              <Keycap label="CLR" keyCode="C" onSend={sendKey} onPress={onPress} />
              {OPS.map((item) => (
                <Keycap
                  key={item.label}
                  label={item.label}
                  keyCode={item.key}
                  onSend={sendKey}
                  onPress={onPress}
                />
              ))}
            </div>
            <div className="keyboard">
              <Row keys={NUM} onSend={sendKey} onPress={onPress} />
              <Row keys={Q} onSend={sendKey} onPress={onPress} />
              <Row keys={A} onSend={sendKey} onPress={onPress} />
              <Row keys={Z} onSend={sendKey} onPress={onPress} latchedLabel={shift ? '2nd' : undefined} />
              <div className="kb-row">
                <Keycap label="CAPS" tint="fn" latched={caps} onSend={sendKey} onPress={onPress} />
                <Keycap label="SPACE" wide="space" onSend={sendKey} onPress={onPress} />
                <Keycap label="ENTER" keyCode="OK" wide="enter" tint="enter" onSend={sendKey} onPress={onPress} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { ReactNode } from 'react';
import { beepClick, resumeAudio } from '../audio/beeps';
import {
  backspaceDateField,
  backspaceField,
  focusedControl,
  focusedTextField,
  insertDateDigit,
  insertText,
  isDateField,
} from '../lib/fieldEdit';
import { usePda } from '../nav/PdaContext';
import type { PdaKey } from '../types';
import { MarbleFace } from './MarbleFace';

type Cap = {
  key: PdaKey;
  label: string;
  extra?: string;
};

function Keycap({
  label,
  keyCode,
  extra,
  onSend,
  onPress,
}: {
  label: string;
  keyCode: PdaKey;
  extra?: string;
  onSend: (key: PdaKey) => void;
  onPress: (keyCode: PdaKey) => boolean;
}) {
  return (
    <button
      type="button"
      className={`keycap${extra ? ` ${extra}` : ''}`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        if (onPress(keyCode)) return;
        onSend(keyCode);
      }}
    >
      {label}
    </button>
  );
}

const PAD: Cap[] = [
  { key: '7', label: '7' },
  { key: '8', label: '8' },
  { key: '9', label: '9' },
  { key: '+', label: '+', extra: 'key-op' },
  { key: '4', label: '4' },
  { key: '5', label: '5' },
  { key: '6', label: '6' },
  { key: '-', label: '−', extra: 'key-op' },
  { key: '1', label: '1' },
  { key: '2', label: '2' },
  { key: '3', label: '3' },
  { key: '*', label: '×', extra: 'key-op' },
  { key: 'C', label: 'CLR' },
  { key: '0', label: '0' },
  { key: '.', label: '.' },
  { key: '/', label: '/', extra: 'key-op' },
];

export function PdaShell({ children }: { children: ReactNode }) {
  const { lidOpen, openLid, sendKey, shaking } = usePda();

  const onPress = (keyCode: PdaKey): boolean => {
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
      if (isDateField(field)) backspaceDateField(field);
      else backspaceField(field);
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

    if (isDateField(field)) {
      if (keyCode && keyCode >= '0' && keyCode <= '9') {
        insertDateDigit(field, keyCode);
        resumeAudio();
        beepClick();
        return true;
      }
      return true;
    }

    let text: string | null = null;
    if (keyCode === '.') text = '.';
    else if (keyCode >= '0' && keyCode <= '9') text = keyCode;
    if (!text) return false;

    insertText(field, text);
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
              <Keycap label="MENU" keyCode="MENU" extra="key-fn" onSend={sendKey} onPress={onPress} />
              <Keycap label="BACK" keyCode="BACK" extra="key-fn" onSend={sendKey} onPress={onPress} />
              <Keycap label="ENTER" keyCode="OK" extra="key-enter" onSend={sendKey} onPress={onPress} />
            </div>
            <div className="keypad">
              {PAD.map((item) => {
                const keycap = (
                  <Keycap
                    key={item.key}
                    label={item.label}
                    keyCode={item.key}
                    extra={item.extra}
                    onSend={sendKey}
                    onPress={onPress}
                  />
                );
                if (item.key !== 'C') return keycap;
                return (
                  <div className="key-with-hint" key={item.key}>
                    <span className="clr-hint">CLR = BACKSPACE</span>
                    <Keycap
                      label={item.label}
                      keyCode={item.key}
                      extra={item.extra}
                      onSend={sendKey}
                      onPress={onPress}
                    />
                  </div>
                );
              })}
              <Keycap label="=" keyCode="=" extra="key-wide key-op" onSend={sendKey} onPress={onPress} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

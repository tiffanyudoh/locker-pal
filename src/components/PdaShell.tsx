import type { ReactNode } from 'react';
import { beepClick, resumeAudio } from '../audio/beeps';
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
  onSend,
}: {
  label: string;
  keyCode?: PdaKey;
  wide?: Cap['wide'];
  tint?: Cap['tint'];
  onSend: (key: PdaKey) => void;
}) {
  return (
    <button
      type="button"
      className={`keycap${wide ? ` key-${wide}` : ''}${tint ? ` key-${tint}` : ''}`}
      onClick={() => {
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
}: {
  keys: Cap[];
  onSend: (key: PdaKey) => void;
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
          onSend={onSend}
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

export function PdaShell({ children }: { children: ReactNode }) {
  const { lidOpen, openLid, sendKey, shaking } = usePda();

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
              <Keycap label="MENU" keyCode="MENU" tint="fn" onSend={sendKey} />
              <Keycap label="BACK" keyCode="BACK" tint="fn" onSend={sendKey} />
              <Keycap label="CLR" keyCode="C" onSend={sendKey} />
              {OPS.map((item) => (
                <Keycap
                  key={item.label}
                  label={item.label}
                  keyCode={item.key}
                  onSend={sendKey}
                />
              ))}
            </div>
            <div className="keyboard">
              <Row keys={NUM} onSend={sendKey} />
              <Row keys={Q} onSend={sendKey} />
              <Row keys={A} onSend={sendKey} />
              <Row keys={Z} onSend={sendKey} />
              <div className="kb-row">
                <Keycap label="CAPS" tint="fn" onSend={sendKey} />
                <Keycap label="SPACE" wide="space" onSend={sendKey} />
                <Keycap label="ENTER" keyCode="OK" wide="enter" tint="enter" onSend={sendKey} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

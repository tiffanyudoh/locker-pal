import { usePda, usePdaKeys } from '../nav/PdaContext';
import { usePdaStore } from '../store/PdaStore';
import type { ScreenId } from '../types';
import { LcdChrome } from './LcdWidgets';

const APPS: { id: ScreenId; key: string; label: string; glyph: string }[] = [
  { id: 'diary', key: '1', label: 'DIARY', glyph: '≡' },
  { id: 'friends', key: '2', label: 'FRIENDS', glyph: ':)' },
  { id: 'homework', key: '3', label: 'HOMEWORK', glyph: 'HW' },
  { id: 'fortune', key: '4', label: 'FORTUNE', glyph: '*' },
  { id: 'calc', key: '5', label: 'CALC', glyph: '12' },
  { id: 'combo', key: '6', label: 'COMBO', glyph: '#' },
  { id: 'settings', key: '7', label: 'SET', glyph: '::' },
];

export function HomeGrid() {
  const { openApp } = usePda();
  const { hasOverdue, comboStreak } = usePdaStore();

  usePdaKeys((key) => {
    const app = APPS.find((item) => item.key === key);
    if (app) openApp(app.id);
  });

  return (
    <LcdChrome title="HOME" right={comboStreak ? `S${comboStreak}` : undefined}>
      <div className="home-grid">
        {APPS.map((app) => (
          <button
            key={app.id}
            type="button"
            className={`home-icon${app.id === 'homework' && hasOverdue ? ' overdue' : ''}`}
            onClick={() => openApp(app.id)}
          >
            <span className="home-glyph">{app.glyph}</span>
            <span className="home-label">{app.label}</span>
          </button>
        ))}
      </div>
    </LcdChrome>
  );
}

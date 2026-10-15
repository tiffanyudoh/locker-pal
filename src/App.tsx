import { useEffect, useState } from 'react';
import { Calculator } from './apps/Calculator';
import { Diary } from './apps/Diary';
import { Fortune } from './apps/Fortune';
import { Friends } from './apps/Friends';
import { Homework } from './apps/Homework';
import { LockerCombo } from './apps/LockerCombo';
import { Settings } from './apps/Settings';
import { BootSplash } from './components/BootSplash';
import { Hallway } from './components/Hallway';
import { HomeGrid } from './components/HomeGrid';
import { LockScreen } from './components/LockScreen';
import { PdaShell } from './components/PdaShell';
import { PdaProvider, usePda } from './nav/PdaContext';
import { PdaStoreProvider } from './store/PdaStore';

const BASE_W = 680;
const CLOSED_H = 420;
const OPEN_H = 640;

function useFitScale(open: boolean): number {
  const baseH = open ? OPEN_H : CLOSED_H;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const pad = 24;
      const sx = (window.innerWidth - pad) / BASE_W;
      const sy = (window.innerHeight - pad) / baseH;
      setScale(Math.min(1, sx, sy));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [baseH]);

  return scale;
}

function LcdRouter() {
  const { screen } = usePda();
  switch (screen) {
    case 'boot':
      return <BootSplash />;
    case 'lock':
      return <LockScreen />;
    case 'home':
      return <HomeGrid />;
    case 'diary':
      return <Diary />;
    case 'friends':
      return <Friends />;
    case 'homework':
      return <Homework />;
    case 'fortune':
      return <Fortune />;
    case 'calc':
      return <Calculator />;
    case 'combo':
      return <LockerCombo />;
    case 'settings':
      return <Settings />;
    default:
      return <HomeGrid />;
  }
}

function Stage() {
  const { lidOpen } = usePda();
  const scale = useFitScale(lidOpen);
  const baseH = lidOpen ? OPEN_H : CLOSED_H;

  return (
    <div className="stage">
      <Hallway />
      <div
        className="pda-scale"
        style={{ width: BASE_W * scale, height: baseH * scale }}
      >
        <div
          className="pda-scale-inner"
          style={{
            width: BASE_W,
            height: baseH,
            transform: `scale(${scale})`,
          }}
        >
          <PdaShell>
            <LcdRouter />
          </PdaShell>
          <div className="caption">
            {lidOpen ? (
              <>
                <div>MENU CLOSES THE LID</div>
                <div className="caption-sub">CLR = BACKSPACE</div>
              </>
            ) : (
              'CLICK THE NOTEBOOK'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PdaStoreProvider>
      <PdaProvider>
        <Stage />
      </PdaProvider>
    </PdaStoreProvider>
  );
}

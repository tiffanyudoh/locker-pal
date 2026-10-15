import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { beepBoot, beepClick, resumeAudio } from '../audio/beeps';
import type { PdaKey, ScreenId } from '../types';

type KeyHandler = (key: PdaKey) => void;
type BackHandler = () => boolean;

type PdaNav = {
  lidOpen: boolean;
  screen: ScreenId;
  shaking: boolean;
  openLid: () => void;
  closeLid: () => void;
  openApp: (screen: ScreenId) => void;
  goHome: () => void;
  sendKey: (key: PdaKey) => void;
  subscribeKeys: (handler: KeyHandler) => () => void;
  registerBackHandler: (handler: BackHandler) => () => void;
  triggerShake: () => void;
};

const PdaNavContext = createContext<PdaNav | null>(null);

const KEY_MAP: Record<string, PdaKey> = {
  Escape: 'BACK',
  Enter: 'OK',
  Backspace: 'C',
  Delete: 'C',
  c: 'C',
  C: 'C',
  '.': '.',
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '=': '=',
  m: 'MENU',
  M: 'MENU',
};

export function PdaProvider({ children }: { children: ReactNode }) {
  const [lidOpen, setLidOpen] = useState(false);
  const [screen, setScreen] = useState<ScreenId>('lock');
  const [shaking, setShaking] = useState(false);
  const listeners = useRef(new Set<KeyHandler>());
  const backRef = useRef<BackHandler | null>(null);
  const bootTimer = useRef<number | null>(null);

  const openLid = useCallback(() => {
    if (lidOpen) return;
    resumeAudio();
    beepBoot();
    setLidOpen(true);
    setScreen('boot');
    if (bootTimer.current) window.clearTimeout(bootTimer.current);
    bootTimer.current = window.setTimeout(() => {
      setScreen('lock');
      bootTimer.current = null;
    }, 1600);
  }, [lidOpen]);

  const closeLid = useCallback(() => {
    if (bootTimer.current) {
      window.clearTimeout(bootTimer.current);
      bootTimer.current = null;
    }
    setLidOpen(false);
    setScreen('lock');
  }, []);

  const openApp = useCallback((next: ScreenId) => {
    setScreen(next);
  }, []);

  const goHome = useCallback(() => {
    setScreen('home');
  }, []);

  const triggerShake = useCallback(() => {
    setShaking(true);
    window.setTimeout(() => setShaking(false), 380);
  }, []);

  const subscribeKeys = useCallback((handler: KeyHandler) => {
    listeners.current.add(handler);
    return () => {
      listeners.current.delete(handler);
    };
  }, []);

  const registerBackHandler = useCallback((handler: BackHandler) => {
    backRef.current = handler;
    return () => {
      if (backRef.current === handler) backRef.current = null;
    };
  }, []);

  const sendKey = useCallback(
    (key: PdaKey) => {
      if (!lidOpen) return;
      if (screen === 'boot') return;

      resumeAudio();
      beepClick();

      if (key === 'MENU') {
        if (screen === 'home' || screen === 'lock') {
          closeLid();
          return;
        }
        goHome();
        return;
      }

      if (key === 'BACK') {
        if (backRef.current?.()) return;
        if (screen === 'home' || screen === 'lock') return;
        goHome();
        return;
      }

      listeners.current.forEach((fn) => fn(key));
    },
    [lidOpen, screen, closeLid, goHome],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lidOpen) return;
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT');
      if (typing) {
        if (e.key === 'Escape') {
          e.preventDefault();
          sendKey('BACK');
        }
        return;
      }
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        sendKey(e.key as PdaKey);
        return;
      }
      const mapped = KEY_MAP[e.key];
      if (mapped) {
        e.preventDefault();
        sendKey(mapped);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sendKey, lidOpen]);

  useEffect(() => {
    return () => {
      if (bootTimer.current) window.clearTimeout(bootTimer.current);
    };
  }, []);

  const value = useMemo<PdaNav>(
    () => ({
      lidOpen,
      screen,
      shaking,
      openLid,
      closeLid,
      openApp,
      goHome,
      sendKey,
      subscribeKeys,
      registerBackHandler,
      triggerShake,
    }),
    [
      lidOpen,
      screen,
      shaking,
      openLid,
      closeLid,
      openApp,
      goHome,
      sendKey,
      subscribeKeys,
      registerBackHandler,
      triggerShake,
    ],
  );

  return <PdaNavContext.Provider value={value}>{children}</PdaNavContext.Provider>;
}

export function usePda(): PdaNav {
  const ctx = useContext(PdaNavContext);
  if (!ctx) throw new Error('usePda must be used inside PdaProvider');
  return ctx;
}

export function usePdaKeys(handler: KeyHandler): void {
  const { subscribeKeys } = usePda();
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => subscribeKeys((key) => ref.current(key)), [subscribeKeys]);
}

export function usePdaBack(handler: BackHandler): void {
  const { registerBackHandler } = usePda();
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => registerBackHandler(() => ref.current()), [registerBackHandler]);
}

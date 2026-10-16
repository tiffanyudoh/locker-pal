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
import { beepAlarm, beepBoot, beepClick, resumeAudio } from '../audio/beeps';
import { POMODORO_MS, type PdaKey, type ScreenId } from '../types';

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
  /** Live remaining. Derived from last snapshot + runningSince. */
  timerRemainingMs: number;
  timerPaused: boolean;
  timerFinished: boolean;
  /** True while a focus block is running or paused mid-count. False after STOP / lid close / TIME'S UP. */
  timerActive: boolean;
  timerRunningSince: number | null;
  pauseTimer: () => void;
  resumeTimer: () => void;
  restartTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
};

function liveRemaining(remainingMs: number, runningSince: number | null, now = Date.now()): number {
  if (runningSince == null) return remainingMs;
  return Math.max(0, remainingMs - (now - runningSince));
}

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
  const [screen, setScreen] = useState<ScreenId>('home');
  const [shaking, setShaking] = useState(false);
  const [remainingMs, setRemainingMs] = useState(POMODORO_MS);
  const [timerPaused, setTimerPaused] = useState(true);
  const [runningSince, setRunningSince] = useState<number | null>(null);
  const [timerFinished, setTimerFinished] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [tick, setTick] = useState(0);
  const listeners = useRef(new Set<KeyHandler>());
  const backRef = useRef<BackHandler | null>(null);
  const bootTimer = useRef<number | null>(null);
  const remainingRef = useRef(remainingMs);
  const pausedRef = useRef(timerPaused);
  const runningSinceRef = useRef(runningSince);
  const finishedRef = useRef(timerFinished);
  const activeRef = useRef(timerActive);
  const winBeepRef = useRef(false);

  useEffect(() => {
    remainingRef.current = remainingMs;
    pausedRef.current = timerPaused;
    runningSinceRef.current = runningSince;
    finishedRef.current = timerFinished;
    activeRef.current = timerActive;
  });

  const startFreshSession = useCallback(() => {
    winBeepRef.current = false;
    const now = Date.now();
    remainingRef.current = POMODORO_MS;
    pausedRef.current = false;
    runningSinceRef.current = now;
    finishedRef.current = false;
    activeRef.current = true;
    setRemainingMs(POMODORO_MS);
    setTimerPaused(false);
    setRunningSince(now);
    setTimerFinished(false);
    setTimerActive(true);
  }, []);

  const finishSession = useCallback(() => {
    remainingRef.current = 0;
    pausedRef.current = true;
    runningSinceRef.current = null;
    finishedRef.current = true;
    activeRef.current = false;
    setRemainingMs(0);
    setTimerPaused(true);
    setRunningSince(null);
    setTimerFinished(true);
    setTimerActive(false);
    if (!winBeepRef.current) {
      winBeepRef.current = true;
      beepAlarm();
    }
  }, []);

  const openLid = useCallback(() => {
    if (lidOpen) return;
    resumeAudio();
    beepBoot();
    setLidOpen(true);
    setScreen('boot');
    startFreshSession();
    if (bootTimer.current) window.clearTimeout(bootTimer.current);
    bootTimer.current = window.setTimeout(() => {
      setScreen('timer');
      bootTimer.current = null;
    }, 1600);
  }, [lidOpen, startFreshSession]);

  const closeLid = useCallback(() => {
    if (bootTimer.current) {
      window.clearTimeout(bootTimer.current);
      bootTimer.current = null;
    }
    setLidOpen(false);
    setScreen('home');
    winBeepRef.current = false;
    remainingRef.current = POMODORO_MS;
    pausedRef.current = true;
    runningSinceRef.current = null;
    finishedRef.current = false;
    activeRef.current = false;
    setRemainingMs(POMODORO_MS);
    setTimerPaused(true);
    setRunningSince(null);
    setTimerFinished(false);
    setTimerActive(false);
  }, []);

  const pauseTimer = useCallback(() => {
    if (pausedRef.current || finishedRef.current) return;
    const left = liveRemaining(remainingRef.current, runningSinceRef.current);
    remainingRef.current = left;
    pausedRef.current = true;
    runningSinceRef.current = null;
    setRemainingMs(left);
    setTimerPaused(true);
    setRunningSince(null);
    if (left <= 0) finishSession();
  }, [finishSession]);

  const resumeTimer = useCallback(() => {
    if (!pausedRef.current || finishedRef.current || remainingRef.current <= 0) return;
    const now = Date.now();
    pausedRef.current = false;
    runningSinceRef.current = now;
    activeRef.current = true;
    setTimerPaused(false);
    setRunningSince(now);
    setTimerActive(true);
  }, []);

  const restartTimer = useCallback(() => {
    startFreshSession();
  }, [startFreshSession]);

  const stopTimer = useCallback(() => {
    if (!activeRef.current && !finishedRef.current) return;
    winBeepRef.current = false;
    remainingRef.current = POMODORO_MS;
    pausedRef.current = true;
    runningSinceRef.current = null;
    finishedRef.current = false;
    activeRef.current = false;
    setRemainingMs(POMODORO_MS);
    setTimerPaused(true);
    setRunningSince(null);
    setTimerFinished(false);
    setTimerActive(false);
  }, []);

  const resetTimer = useCallback(() => {
    startFreshSession();
  }, [startFreshSession]);

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
        // Timer and other apps: MENU returns to HOME; lid stays open.
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
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        if (e.key === 'Escape') {
          e.preventDefault();
          target.blur();
        }
        return;
      }
      if (target?.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) {
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

  useEffect(() => {
    if (!lidOpen || timerPaused || timerFinished) return;
    const id = window.setInterval(() => {
      const left = liveRemaining(remainingRef.current, runningSinceRef.current);
      if (left <= 0) {
        finishSession();
        return;
      }
      setTick((n) => n + 1);
    }, 250);
    return () => window.clearInterval(id);
  }, [lidOpen, timerPaused, timerFinished, finishSession]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) return;
      const left = liveRemaining(remainingRef.current, runningSinceRef.current);
      if (left <= 0 && runningSinceRef.current != null && !finishedRef.current) {
        finishSession();
        return;
      }
      setTick((n) => n + 1);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [finishSession]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const host = window as unknown as { __expirePomodoro?: () => void };
    host.__expirePomodoro = finishSession;
    return () => {
      delete host.__expirePomodoro;
    };
  }, [finishSession]);

  const timerRemainingMs = timerFinished
    ? 0
    : liveRemaining(remainingMs, runningSince);
  void tick;

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
      timerRemainingMs,
      timerPaused,
      timerFinished,
      timerActive,
      timerRunningSince: runningSince,
      pauseTimer,
      resumeTimer,
      restartTimer,
      stopTimer,
      resetTimer,
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
      timerRemainingMs,
      timerPaused,
      timerFinished,
      timerActive,
      runningSince,
      pauseTimer,
      resumeTimer,
      restartTimer,
      stopTimer,
      resetTimer,
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

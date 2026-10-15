import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_DATA, STORAGE_KEY, type DiaryEntry, type Friend, type HomeworkItem, type PdaData } from '../types';
import { isOverdue, uid } from '../lib/util';

type PdaStoreValue = PdaData & {
  setPin: (pin: string) => void;
  addDiary: (entry: Omit<DiaryEntry, 'id'>) => void;
  updateDiary: (entry: DiaryEntry) => void;
  deleteDiary: (id: string) => void;
  addFriend: (friend: Omit<Friend, 'id'>) => void;
  updateFriend: (friend: Friend) => void;
  deleteFriend: (id: string) => void;
  addHomework: (item: Omit<HomeworkItem, 'id'>) => void;
  updateHomework: (item: HomeworkItem) => void;
  deleteHomework: (id: string) => void;
  toggleHomework: (id: string) => void;
  setComboStreak: (n: number) => void;
  hasOverdue: boolean;
};

const PdaStoreContext = createContext<PdaStoreValue | null>(null);

function load(): PdaData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<PdaData>;
    return {
      pin: typeof parsed.pin === 'string' && parsed.pin.length === 4 ? parsed.pin : DEFAULT_DATA.pin,
      diary: Array.isArray(parsed.diary) ? parsed.diary : [],
      friends: Array.isArray(parsed.friends) ? parsed.friends : [],
      homework: Array.isArray(parsed.homework) ? parsed.homework : [],
      comboStreak: typeof parsed.comboStreak === 'number' ? parsed.comboStreak : 0,
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function PdaStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PdaData>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const setPin = useCallback((pin: string) => {
    setData((d) => ({ ...d, pin }));
  }, []);

  const addDiary = useCallback((entry: Omit<DiaryEntry, 'id'>) => {
    setData((d) => ({ ...d, diary: [{ ...entry, id: uid() }, ...d.diary] }));
  }, []);

  const updateDiary = useCallback((entry: DiaryEntry) => {
    setData((d) => ({
      ...d,
      diary: d.diary.map((item) => (item.id === entry.id ? entry : item)),
    }));
  }, []);

  const deleteDiary = useCallback((id: string) => {
    setData((d) => ({ ...d, diary: d.diary.filter((item) => item.id !== id) }));
  }, []);

  const addFriend = useCallback((friend: Omit<Friend, 'id'>) => {
    setData((d) => ({ ...d, friends: [{ ...friend, id: uid() }, ...d.friends] }));
  }, []);

  const updateFriend = useCallback((friend: Friend) => {
    setData((d) => ({
      ...d,
      friends: d.friends.map((item) => (item.id === friend.id ? friend : item)),
    }));
  }, []);

  const deleteFriend = useCallback((id: string) => {
    setData((d) => ({ ...d, friends: d.friends.filter((item) => item.id !== id) }));
  }, []);

  const addHomework = useCallback((item: Omit<HomeworkItem, 'id'>) => {
    setData((d) => ({ ...d, homework: [{ ...item, id: uid() }, ...d.homework] }));
  }, []);

  const updateHomework = useCallback((item: HomeworkItem) => {
    setData((d) => ({
      ...d,
      homework: d.homework.map((row) => (row.id === item.id ? item : row)),
    }));
  }, []);

  const deleteHomework = useCallback((id: string) => {
    setData((d) => ({ ...d, homework: d.homework.filter((item) => item.id !== id) }));
  }, []);

  const toggleHomework = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      homework: d.homework.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    }));
  }, []);

  const setComboStreak = useCallback((n: number) => {
    setData((d) => ({ ...d, comboStreak: n }));
  }, []);

  const hasOverdue = data.homework.some((item) => isOverdue(item));

  const value = useMemo<PdaStoreValue>(
    () => ({
      ...data,
      setPin,
      addDiary,
      updateDiary,
      deleteDiary,
      addFriend,
      updateFriend,
      deleteFriend,
      addHomework,
      updateHomework,
      deleteHomework,
      toggleHomework,
      setComboStreak,
      hasOverdue,
    }),
    [
      data,
      setPin,
      addDiary,
      updateDiary,
      deleteDiary,
      addFriend,
      updateFriend,
      deleteFriend,
      addHomework,
      updateHomework,
      deleteHomework,
      toggleHomework,
      setComboStreak,
      hasOverdue,
    ],
  );

  return <PdaStoreContext.Provider value={value}>{children}</PdaStoreContext.Provider>;
}

export function usePdaStore(): PdaStoreValue {
  const ctx = useContext(PdaStoreContext);
  if (!ctx) throw new Error('usePdaStore must be used inside PdaStoreProvider');
  return ctx;
}

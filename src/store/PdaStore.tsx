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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asDiary(value: unknown): DiaryEntry | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.body !== 'string' ||
    typeof value.date !== 'string'
  ) {
    return null;
  }
  return { id: value.id, title: value.title, body: value.body, date: value.date };
}

function asFriend(value: unknown): Friend | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== 'string' ||
    typeof value.name !== 'string' ||
    typeof value.nickname !== 'string' ||
    typeof value.birthday !== 'string' ||
    typeof value.phone !== 'string'
  ) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    nickname: value.nickname,
    birthday: value.birthday,
    phone: value.phone,
  };
}

function asHomework(value: unknown): HomeworkItem | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== 'string' ||
    typeof value.subject !== 'string' ||
    typeof value.assignment !== 'string' ||
    typeof value.dueDate !== 'string'
  ) {
    return null;
  }
  return {
    id: value.id,
    subject: value.subject,
    assignment: value.assignment,
    dueDate: value.dueDate,
    done: value.done === true,
  };
}

function asPin(value: unknown): string {
  return typeof value === 'string' && /^\d{4}$/.test(value) ? value : DEFAULT_DATA.pin;
}

function asStreak(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 9999
    ? value
    : 0;
}

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

function keep<T>(items: unknown, parse: (value: unknown) => T | null): T[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => {
    const parsed = parse(item);
    return parsed ? [parsed] : [];
  });
}

function load(): PdaData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<PdaData>;
    return {
      pin: asPin(parsed.pin),
      diary: keep(parsed.diary, asDiary),
      friends: keep(parsed.friends, asFriend),
      homework: keep(parsed.homework, asHomework),
      comboStreak: asStreak(parsed.comboStreak),
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function PdaStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PdaData>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Quota or blocked storage. Keep the in-memory copy.
    }
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

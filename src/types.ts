export type ScreenId =
  | 'boot'
  | 'lock'
  | 'home'
  | 'diary'
  | 'friends'
  | 'homework'
  | 'fortune'
  | 'calc'
  | 'combo'
  | 'settings';

export type PdaKey =
  | 'MENU'
  | 'BACK'
  | 'OK'
  | 'C'
  | '.'
  | '+'
  | '-'
  | '*'
  | '/'
  | '='
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';

export type DiaryEntry = {
  id: string;
  title: string;
  body: string;
  date: string;
};

export type Friend = {
  id: string;
  name: string;
  nickname: string;
  birthday: string;
  phone: string;
};

export type HomeworkItem = {
  id: string;
  subject: string;
  assignment: string;
  dueDate: string;
  done: boolean;
};

export type PdaData = {
  pin: string;
  diary: DiaryEntry[];
  friends: Friend[];
  homework: HomeworkItem[];
  comboStreak: number;
};

export const STORAGE_KEY = 'locker-pal-v1';

export const DEFAULT_DATA: PdaData = {
  pin: '1234',
  diary: [],
  friends: [],
  homework: [],
  comboStreak: 0,
};

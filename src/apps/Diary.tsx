import { useState } from 'react';
import { LcdBtn, LcdChrome, LcdEmpty, LcdField } from '../components/LcdWidgets';
import { beepOk } from '../audio/beeps';
import { fmtDate, todayISO } from '../lib/util';
import { usePdaBack } from '../nav/PdaContext';
import { usePdaStore } from '../store/PdaStore';
import type { DiaryEntry } from '../types';

const blank = (): Omit<DiaryEntry, 'id'> => ({
  title: '',
  body: '',
  date: todayISO(),
});

export function Diary() {
  const { diary, addDiary, updateDiary, deleteDiary } = usePdaStore();
  const [editing, setEditing] = useState<DiaryEntry | Omit<DiaryEntry, 'id'> | null>(null);

  usePdaBack(() => {
    if (editing) {
      setEditing(null);
      return true;
    }
    return false;
  });

  if (editing) {
    const isSaved = 'id' in editing;
    return (
      <LcdChrome title="DIARY" right="EDIT">
        <LcdField label="TITLE">
          <input
            className="lcd-input"
            value={editing.title}
            maxLength={24}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
          />
        </LcdField>
        <LcdField label="DATE">
          <input
            className="lcd-input"
            type="date"
            value={editing.date}
            onChange={(e) => setEditing({ ...editing, date: e.target.value })}
          />
        </LcdField>
        <LcdField label="SECRET">
          <textarea
            className="lcd-area"
            value={editing.body}
            maxLength={280}
            onChange={(e) => setEditing({ ...editing, body: e.target.value })}
          />
        </LcdField>
        <div className="lcd-btn-row">
          <LcdBtn
            onClick={() => {
              if (!editing.title.trim() && !editing.body.trim()) return;
              if (isSaved) updateDiary(editing);
              else addDiary(editing);
              beepOk();
              setEditing(null);
            }}
          >
            SAVE
          </LcdBtn>
          {isSaved ? (
            <LcdBtn
              danger
              onClick={() => {
                deleteDiary(editing.id);
                setEditing(null);
              }}
            >
              DEL
            </LcdBtn>
          ) : null}
          <LcdBtn onClick={() => setEditing(null)}>BACK</LcdBtn>
        </div>
      </LcdChrome>
    );
  }

  return (
    <LcdChrome
      title="DIARY"
      right={
        <LcdBtn onClick={() => setEditing(blank())}>NEW</LcdBtn>
      }
    >
      {diary.length === 0 ? (
        <LcdEmpty title="NO ENTRIES" hint="PRESS NEW" />
      ) : (
        <div className="lcd-list">
          {diary.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="lcd-row"
              onClick={() => setEditing(entry)}
            >
              <span>{fmtDate(entry.date)}</span>
              <span>{entry.title || 'UNTITLED'}</span>
              <span>›</span>
            </button>
          ))}
        </div>
      )}
    </LcdChrome>
  );
}

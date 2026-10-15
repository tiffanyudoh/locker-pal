import { useState } from 'react';
import { LcdBtn, LcdChrome, LcdEmpty, LcdField } from '../components/LcdWidgets';
import { beepOk } from '../audio/beeps';
import { fmtDate, isOverdue, todayISO } from '../lib/util';
import { usePdaBack } from '../nav/PdaContext';
import { usePdaStore } from '../store/PdaStore';
import type { HomeworkItem } from '../types';

const blank = (): Omit<HomeworkItem, 'id'> => ({
  subject: '',
  assignment: '',
  dueDate: todayISO(),
  done: false,
});

export function Homework() {
  const { homework, addHomework, updateHomework, deleteHomework, toggleHomework } =
    usePdaStore();
  const [editing, setEditing] = useState<HomeworkItem | Omit<HomeworkItem, 'id'> | null>(
    null,
  );

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
      <LcdChrome title="HOMEWORK" right="EDIT">
        <LcdField label="SUBJECT">
          <input
            className="lcd-input"
            value={editing.subject}
            maxLength={16}
            onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
          />
        </LcdField>
        <LcdField label="ASSIGNMENT">
          <input
            className="lcd-input"
            value={editing.assignment}
            maxLength={28}
            onChange={(e) => setEditing({ ...editing, assignment: e.target.value })}
          />
        </LcdField>
        <LcdField label="DUE">
          <input
            className="lcd-input"
            type="date"
            value={editing.dueDate}
            onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })}
          />
        </LcdField>
        <div className="lcd-btn-row">
          <LcdBtn
            onClick={() => {
              if (!editing.subject.trim()) return;
              if (isSaved) updateHomework(editing);
              else addHomework(editing);
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
                deleteHomework(editing.id);
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
      title="HOMEWORK"
      right={<LcdBtn onClick={() => setEditing(blank())}>NEW</LcdBtn>}
    >
      {homework.length === 0 ? (
        <LcdEmpty title="NO HOMEWORK" hint="PRESS NEW" />
      ) : (
        <div className="lcd-list">
          {homework.map((item) => (
            <div key={item.id} className="lcd-row">
              <button
                type="button"
                className={`check${isOverdue(item) && !item.done ? ' lcd-blink' : ''}`}
                onClick={() => toggleHomework(item.id)}
                aria-label={item.done ? 'Mark not done' : 'Mark done'}
              >
                {item.done ? 'x' : isOverdue(item) ? '!' : 'o'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(item)}
                style={{
                  background: 'none',
                  border: 0,
                  color: 'inherit',
                  textAlign: 'left',
                  padding: 0,
                }}
              >
                {item.subject} {item.assignment}
              </button>
              <span>{fmtDate(item.dueDate)}</span>
            </div>
          ))}
        </div>
      )}
    </LcdChrome>
  );
}

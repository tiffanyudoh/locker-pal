import { useState } from 'react';
import { LcdBtn, LcdChrome, LcdDateInput, LcdEmpty, LcdField } from '../components/LcdWidgets';
import { beepOk } from '../audio/beeps';
import { fmtDate } from '../lib/util';
import { usePdaBack } from '../nav/PdaContext';
import { usePdaStore } from '../store/PdaStore';
import type { Friend } from '../types';

const blank = (): Omit<Friend, 'id'> => ({
  name: '',
  nickname: '',
  birthday: '',
  phone: '',
});

export function Friends() {
  const { friends, addFriend, updateFriend, deleteFriend } = usePdaStore();
  const [editing, setEditing] = useState<Friend | Omit<Friend, 'id'> | null>(null);

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
      <LcdChrome title="FRIENDS" right="EDIT">
        <LcdField label="NAME">
          <input
            className="lcd-input"
            value={editing.name}
            maxLength={20}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
          />
        </LcdField>
        <LcdField label="NICKNAME">
          <input
            className="lcd-input"
            value={editing.nickname}
            maxLength={16}
            onChange={(e) => setEditing({ ...editing, nickname: e.target.value })}
          />
        </LcdField>
        <LcdField label="BIRTHDAY">
          <LcdDateInput
            value={editing.birthday}
            onChange={(birthday) => setEditing({ ...editing, birthday })}
          />
        </LcdField>
        <LcdField label="PHONE">
          <input
            className="lcd-input"
            value={editing.phone}
            maxLength={14}
            onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
          />
        </LcdField>
        <div className="lcd-btn-row">
          <LcdBtn
            onClick={() => {
              if (!editing.name.trim()) return;
              if (isSaved) updateFriend(editing);
              else addFriend(editing);
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
                deleteFriend(editing.id);
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
      title="FRIENDS"
      right={<LcdBtn onClick={() => setEditing(blank())}>NEW</LcdBtn>}
    >
      {friends.length === 0 ? (
        <LcdEmpty title="NO FRIENDS YET" hint="PRESS NEW" />
      ) : (
        <div className="lcd-list">
          {friends.map((friend) => (
            <button
              key={friend.id}
              type="button"
              className="lcd-row"
              onClick={() => setEditing(friend)}
            >
              <span>{friend.nickname || friend.name.slice(0, 4)}</span>
              <span>{friend.name}</span>
              <span>{friend.birthday ? fmtDate(friend.birthday) : '›'}</span>
            </button>
          ))}
        </div>
      )}
    </LcdChrome>
  );
}

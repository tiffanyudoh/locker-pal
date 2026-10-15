import { useMemo, useState } from 'react';
import { LcdBtn, LcdChrome, LcdField } from '../components/LcdWidgets';
import { starRating, todayISO, todaySeed } from '../lib/util';
import { usePdaStore } from '../store/PdaStore';

const FORTUNES = [
  'A NOTE APPEARS IN YOUR LOCKER.',
  'LUCKY COLOR: TEAL. WEAR IT.',
  'DO HOMEWORK. THEN PASS NOTES.',
  'SOMEONE LIKES YOUR HANDWRITING.',
  'AVOID THE CAFETERIA PUDDING.',
  'YOUR SECRET IS SAFE TODAY.',
  'A NEW FRIEND SAYS HI AT 3:15.',
  'LUCKY NUMBER: 4. TRY THE COMBO.',
  'THE HALL MONITOR IS DISTRACTED.',
  'WRITE IN YOUR DIARY BEFORE BED.',
  'A COMPATIBILITY SURPRISE AWAITS.',
  'TODAY THE LOCK CLICKS FIRST TRY.',
];

const FLAVOR = [
  'TOTAL FLOP',
  'KIND OF AWKWARD',
  'PRETTY CUTE PAIR',
  'LUNCH TABLE GOALS',
  'MEANT TO BE!!',
];

export function Fortune() {
  const { friends } = usePdaStore();
  const [tab, setTab] = useState<'fate' | 'match'>('fate');
  const [picked, setPicked] = useState<string>('');
  const [typedBday, setTypedBday] = useState('');
  const [result, setResult] = useState<{ name: string; stars: number } | null>(null);

  const fortune = useMemo(() => FORTUNES[todaySeed() % FORTUNES.length], []);

  const runMatch = (key: string, name: string) => {
    setResult({ name, stars: starRating(key) });
  };

  return (
    <LcdChrome title="FORTUNE">
      <div className="tab-row">
        <LcdBtn active={tab === 'fate'} onClick={() => setTab('fate')}>
          FATE
        </LcdBtn>
        <LcdBtn active={tab === 'match'} onClick={() => setTab('match')}>
          MATCH
        </LcdBtn>
      </div>

      {tab === 'fate' ? (
        <div>
          <div>TODAY {todayISO().slice(5).replace('-', '/')}</div>
          <p style={{ margin: '12px 0 0' }}>{fortune}</p>
        </div>
      ) : (
        <div>
          <div>PICK A FRIEND</div>
          {friends.length === 0 ? (
            <div className="lcd-empty-sub">NO FRIENDS YET</div>
          ) : (
            <div className="lcd-list">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  className="lcd-row"
                  onClick={() => {
                    setPicked(friend.id);
                    runMatch(`${friend.name}|${friend.birthday}`, friend.nickname || friend.name);
                  }}
                >
                  <span>{picked === friend.id ? '>' : ' '}</span>
                  <span>{friend.name}</span>
                  <span>GO</span>
                </button>
              ))}
            </div>
          )}
          <LcdField label="OR BDAY">
            <input
              className="lcd-input"
              type="date"
              value={typedBday}
              onChange={(e) => setTypedBday(e.target.value)}
            />
          </LcdField>
          <LcdBtn
            onClick={() => {
              if (!typedBday) return;
              runMatch(`bday|${typedBday}`, typedBday);
            }}
          >
            MATCH BDAY
          </LcdBtn>
          {result ? (
            <div style={{ marginTop: 10 }}>
              <div>{result.name}</div>
              <div className="stars">
                {'*'.repeat(result.stars)}
                {'-'.repeat(5 - result.stars)}
              </div>
              <div>{FLAVOR[result.stars - 1]}</div>
            </div>
          ) : null}
        </div>
      )}
    </LcdChrome>
  );
}

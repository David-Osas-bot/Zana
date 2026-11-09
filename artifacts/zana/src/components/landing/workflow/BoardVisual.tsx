import { useEffect, useState } from 'react';
import { useReducedMotion } from '../features/hooks';
import { MockAvatar, MockDue } from './mock-ui';

type Due = { tone: 'overdue' | 'today' | 'later'; label: string };
type Card = { id: string; title: string; who: string; col: number; due?: Due };

const COLUMNS = ['Not started', 'In progress', 'Complete'];
const CARDS: Card[] = [
  { id: 'copy', title: 'Write launch copy', who: 'AO', col: 0, due: { tone: 'later', label: 'Fri' } },
  { id: 'analytics', title: 'Set up analytics', who: 'TK', col: 0 },
  { id: 'review', title: 'Design review', who: 'KM', col: 1, due: { tone: 'today', label: 'Today' } },
  { id: 'bug', title: 'Fix signup bug', who: 'AO', col: 1, due: { tone: 'overdue', label: 'Overdue' } },
  { id: 'plan', title: 'Draft launch plan', who: 'TK', col: 2 },
];

const CARD_H = 84;
const GAP = 12;
const HEAD_H = 40;
const BOARD_H = HEAD_H + 3 * (CARD_H + GAP);

// Step 2: the board appears card by card, then one card is dragged to Complete.
export default function BoardVisual() {
  const reduced = useReducedMotion();
  const [moved, setMoved] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    if (reduced) {
      setMoved(true);
      return;
    }
    const move = window.setTimeout(() => { setMoved(true); setLifted(true); }, 1700);
    const drop = window.setTimeout(() => setLifted(false), 2600);
    return () => { window.clearTimeout(move); window.clearTimeout(drop); };
  }, [reduced]);

  // The moved card goes to the end of the list, which puts it at the bottom of its new column.
  const cards = moved
    ? [...CARDS.filter(c => c.id !== 'review'), { ...CARDS.find(c => c.id === 'review')!, col: 2 }]
    : CARDS;
  const counts = COLUMNS.map((_, col) => cards.filter(c => c.col === col).length);
  const rowInColumn = [0, 0, 0];

  return (
    <div className="relative w-full" style={{ height: BOARD_H }} role="img" aria-label="A board with tasks in three columns">
      <div className="absolute inset-0 grid grid-cols-3 gap-2 sm:gap-3" aria-hidden>
        {COLUMNS.map((label, col) => (
          <div key={label} className="zw-rise rounded-2xl bg-[color:var(--z-surface)] px-3 pt-3.5" style={{ '--i': col } as React.CSSProperties}>
            <div className="flex items-center gap-2 text-[11px] font-medium text-[color:var(--z-fg)] sm:text-[12px]">
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[color:var(--z-fg)] ${col === 2 ? 'bg-[color:var(--z-fg)]' : ''}`}
              />
              <span className="truncate">{label}</span>
              <span className="tabular-nums text-[color:var(--z-muted)]">{counts[col]}</span>
            </div>
          </div>
        ))}
      </div>

      {cards.map((card, n) => {
        const row = rowInColumn[card.col]++;
        const isLifted = lifted && card.id === 'review';
        return (
          <div
            key={card.id}
            aria-hidden
            className="absolute left-0 top-0"
            style={{
              height: CARD_H,
              width: 'calc((100% - 16px) / 3 - 12px)',
              zIndex: isLifted ? 20 : 1,
              transform: `translate(calc(${card.col} * (100% + 20px) + 6px), ${HEAD_H + row * (CARD_H + GAP)}px)`,
              scale: isLifted ? 1.05 : 1,
              rotate: isLifted ? '-2deg' : '0deg',
              transition: 'transform .7s cubic-bezier(.22,.61,.36,1), scale .3s ease, rotate .3s ease',
            }}
          >
            <div
              className="zw-rise flex h-full flex-col justify-between rounded-xl border border-[color:var(--z-border)] bg-[color:var(--z-panel)] p-2.5 sm:p-3"
              style={{
                '--i': n + 2,
                boxShadow: isLifted ? '0 16px 32px -14px rgba(0,0,0,0.5)' : 'none',
                transition: 'box-shadow .3s ease',
              } as React.CSSProperties}
            >
              <p className="truncate text-[12px] font-medium text-[color:var(--z-fg)] sm:text-[13px]">{card.title}</p>
              <div className="flex items-center justify-between gap-1">
                <span className="min-w-0">{card.due && <MockDue tone={card.due.tone} label={card.due.label} />}</span>
                <MockAvatar initials={card.who} className="!h-6 !w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

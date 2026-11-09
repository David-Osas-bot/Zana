import { useEffect, useRef, useState } from 'react';
import FeatureCard from './FeatureCard';
import { useCardLoop, useInterval } from './hooks';

type Item = { id: string; title: string; who: string; col: number };

const COLUMNS = ['Not started', 'In progress', 'Complete'];
const INITIAL: Item[] = [
  { id: 'plan', title: 'Draft launch plan', who: 'AO', col: 0 },
  { id: 'review', title: 'Design review', who: 'TK', col: 0 },
  { id: 'bug', title: 'Fix signup bug', who: 'KM', col: 1 },
  { id: 'notes', title: 'Write release notes', who: 'AO', col: 2 },
];

const CARD_H = 52;
const GAP = 8;
const HEAD_H = 36;
const BOARD_H = HEAD_H + 4 * (CARD_H + GAP);

// A tiny board that works by itself: every couple of seconds a card is lifted
// and carried to the next column, then the board resets and starts again.
export default function BoardCard({ index, className = '' }: { index: number; className?: string }) {
  const { ref, running } = useCardLoop<HTMLDivElement>();
  const [items, setItems] = useState<Item[]>(INITIAL);
  const [lifted, setLifted] = useState<string | null>(null);
  const step = useRef(0);

  useInterval(() => {
    const movable = items.filter(item => item.col < 2);
    if (!movable.length) {
      setItems(INITIAL);
      setLifted(null);
      return;
    }
    const pick = movable[step.current % movable.length];
    step.current += 1;
    setLifted(pick.id);
    // Moved cards go to the end of the list, which puts them at the bottom of the new column.
    setItems([...items.filter(item => item.id !== pick.id), { ...pick, col: pick.col + 1 }]);
  }, running ? 2200 : null);

  useEffect(() => {
    if (!lifted) return;
    const timer = window.setTimeout(() => setLifted(null), 800);
    return () => window.clearTimeout(timer);
  }, [lifted]);

  const counts = COLUMNS.map((_, col) => items.filter(item => item.col === col).length);
  const rowInColumn = [0, 0, 0];

  return (
    <FeatureCard
      index={index}
      className={className}
      title="Move work across the board."
      description="Drag a task from not started to complete and the numbers update everywhere."
    >
      <div ref={ref} className="relative w-full" style={{ height: BOARD_H }} role="img" aria-label="A board with tasks moving from not started to complete">
        <div className="absolute inset-0 grid grid-cols-3 gap-2" aria-hidden>
          {COLUMNS.map((label, col) => (
            <div key={label} className="rounded-2xl bg-[color:var(--z-panel)] px-3 pt-3">
              <div className="flex items-center justify-between gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[color:var(--z-muted)] sm:text-[11px] sm:tracking-[0.12em]">
                <span className="truncate">{label}</span>
                <span className="tabular-nums">{String(counts[col]).padStart(2, '0')}</span>
              </div>
            </div>
          ))}
        </div>

        {items.map(item => {
          const row = rowInColumn[item.col]++;
          const isLifted = lifted === item.id;
          return (
            <div
              key={item.id}
              aria-hidden
              className="absolute left-0 top-0 flex items-center justify-between gap-2 rounded-xl border border-[color:var(--z-border)] bg-[color:var(--z-surface)] px-3"
              style={{
                height: CARD_H,
                width: 'calc((100% - 16px) / 3 - 12px)',
                zIndex: isLifted ? 20 : 1,
                transform: `translate(calc(${item.col} * (100% + 20px) + 6px), ${HEAD_H + row * (CARD_H + GAP)}px)`,
                scale: isLifted ? 1.05 : 1,
                rotate: isLifted ? '-2deg' : '0deg',
                boxShadow: isLifted ? '0 16px 32px -14px rgba(0,0,0,0.5)' : '0 0 0 rgba(0,0,0,0)',
                transition:
                  'transform .7s cubic-bezier(.22,.61,.36,1), scale .3s ease, rotate .3s ease, box-shadow .3s ease',
              }}
            >
              <span className="truncate text-[12px] font-medium text-[color:var(--z-fg)] sm:text-[13px]">{item.title}</span>
              <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--z-fg)] text-[9px] font-medium text-[color:var(--z-fg)] sm:flex">
                {item.who}
              </span>
            </div>
          );
        })}
      </div>
    </FeatureCard>
  );
}

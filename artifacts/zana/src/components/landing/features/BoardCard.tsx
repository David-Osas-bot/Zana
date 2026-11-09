import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

// Below the `lg` breakpoint the board never gets narrower than this. On a phone
// the card is narrower, so the board scrolls sideways (with snapping) instead of
// squeezing three columns into ~80px each.
const MIN_BOARD_W = 440;
const COL_GAP = 8; // matches `gap-2` on the column grid

// A tiny board that works by itself: every couple of seconds a card is lifted
// and carried to the next column, then the board resets and starts again.
export default function BoardCard({ index, className = '' }: { index: number; className?: string }) {
  const { ref, running } = useCardLoop<HTMLDivElement>(); // `ref` is the scroll container
  const boardRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>(INITIAL);
  const [lifted, setLifted] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ width: 0, scrollable: false });
  const step = useRef(0);

  // Measure the real board width so the content can adapt to it (avatars, label
  // size) and so we know whether the board actually scrolls.
  useLayoutEffect(() => {
    const scroller = ref.current;
    const board = boardRef.current;
    if (!scroller || !board) return;
    const measure = () =>
      setMetrics({ width: board.clientWidth, scrollable: scroller.scrollWidth > scroller.clientWidth + 1 });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(board);
    return () => observer.disconnect();
  }, [ref]);

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

  const colW = metrics.width ? (metrics.width - COL_GAP * 2) / 3 : 0;
  const showAvatar = colW >= 150; // only when there is room next to the title
  const tight = colW > 0 && colW < 130; // squeezed laptop widths: smaller column labels

  return (
    <FeatureCard
      index={index}
      className={className}
      title="Move work across the board."
      description="Drag a task from not started to complete and the numbers update everywhere."
    >
      <div
        ref={ref}
        role="img"
        aria-label="A board with tasks moving from not started to complete"
        tabIndex={metrics.scrollable ? 0 : undefined}
        className="w-full min-w-0 snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--z-fg)] [&::-webkit-scrollbar]:hidden"
      >
        <div ref={boardRef} className="relative min-w-[440px] lg:min-w-0" style={{ height: BOARD_H }}>
          <div className="absolute inset-0 grid grid-cols-3 gap-2" aria-hidden>
            {COLUMNS.map((label, col) => (
              <div key={label} className="snap-start rounded-2xl bg-[color:var(--z-panel)] px-3 pt-3">
                <div
                  className={`flex items-center justify-between gap-1 font-mono uppercase text-[color:var(--z-muted)] ${tight ? 'text-[9px] tracking-[0.1em]' : 'text-[11px] tracking-[0.12em]'
                    }`}
                >
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
                  width: `calc((100% - ${COL_GAP * 2}px) / 3 - 12px)`,
                  zIndex: isLifted ? 20 : 1,
                  transform: `translate(calc(${item.col} * (100% + 20px) + 6px), ${HEAD_H + row * (CARD_H + GAP)}px)`,
                  scale: isLifted ? 1.05 : 1,
                  rotate: isLifted ? '-2deg' : '0deg',
                  boxShadow: isLifted ? '0 16px 32px -14px rgba(0,0,0,0.5)' : '0 0 0 rgba(0,0,0,0)',
                  transition:
                    'transform .7s cubic-bezier(.22,.61,.36,1), scale .3s ease, rotate .3s ease, box-shadow .3s ease',
                }}
              >
                {/* Wraps to two lines instead of cutting titles off after a few letters. */}
                <span className="line-clamp-2 min-w-0 break-words text-[12px] font-medium leading-[1.2] text-[color:var(--z-fg)] sm:text-[13px]">
                  {item.title}
                </span>
                {showAvatar && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[color:var(--z-fg)] text-[9px] font-medium text-[color:var(--z-fg)]">
                    {item.who}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </FeatureCard>
  );
}
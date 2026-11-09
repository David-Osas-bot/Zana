import { useRef, useState } from 'react';
import FeatureCard from './FeatureCard';
import AnimatedStack from './AnimatedStack';
import { useCardLoop, useInterval } from './hooks';

type Entry = { id: number; text: string };

const SOURCE = [
  'Ada moved “Design review” to Complete',
  'Tunde invited sam@studio.co',
  'Kemi was assigned “Fix signup bug”',
  'Sam created the project Website refresh',
  'Ada set a reminder on “Launch checklist”',
  'Kemi added “Write release notes”',
];
const make = (n: number): Entry => ({ id: n, text: SOURCE[n % SOURCE.length] });
const VISIBLE = 4;

export default function ActivityCard({ index, className = '' }: { index: number; className?: string }) {
  const { ref, running } = useCardLoop<HTMLDivElement>();
  const next = useRef(4);
  const [items, setItems] = useState<Entry[]>(() => [make(3), make(2), make(1), make(0)]);

  useInterval(() => {
    const n = next.current;
    next.current += 1;
    setItems(prev => [make(n), ...prev].slice(0, VISIBLE + 1));
  }, running ? 2200 : null);

  return (
    <FeatureCard
      index={index}
      className={className}
      title="Follow every change."
      description="A running feed shows who did what, right on your overview."
    >
      <div ref={ref} className="w-full" role="img" aria-label="An activity feed with new updates arriving">
        <AnimatedStack
          items={items}
          getKey={e => e.id}
          render={e => (
            <div className="flex h-full items-center gap-3 rounded-xl border border-[color:var(--z-border)] bg-[color:var(--z-surface)] px-4">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--z-fg)]" />
              <span className="truncate text-[13px] text-[color:var(--z-fg)]">{e.text}</span>
            </div>
          )}
          itemHeight={44}
          gap={10}
          visible={VISIBLE}
        />
      </div>
    </FeatureCard>
  );
}

import { useEffect, useState } from 'react';
import FeatureCard from './FeatureCard';
import { useCardLoop, useInterval } from './hooks';

const TOTAL = 12;
const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// A miniature of the overview screen: the status ring sweeps in when scrolled
// into view, then tasks keep getting completed so the numbers visibly move.
export default function ProgressCard({ index, className = '' }: { index: number; className?: string }) {
  const { ref, inView, running, reduced } = useCardLoop<HTMLDivElement>();
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (reduced) setDone(8);
    else if (inView) setDone(d => (d === 0 ? 5 : d));
  }, [inView, reduced]);

  useInterval(() => setDone(d => (d >= TOTAL ? 3 : d + 1)), running ? 2400 : null);

  const percent = Math.round((done / TOTAL) * 100);
  const stats = [
    { label: 'Projects', value: 3 },
    { label: 'Open tasks', value: TOTAL - done },
    { label: 'Completed', value: done },
    { label: 'Collaborators', value: 4 },
  ];

  return (
    <FeatureCard
      index={index}
      className={className}
      title="See progress at a glance."
      description="Open and completed work sit on your overview, so you always know where things stand."
    >
      <div ref={ref} className="flex w-full flex-wrap items-center gap-x-10 gap-y-8">
        <div className="relative h-[180px] w-[180px] shrink-0" role="img" aria-label={`${percent}% of tasks completed`}>
          <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="var(--z-track)" strokeWidth="14" />
            <circle
              cx="90"
              cy="90"
              r={RADIUS}
              fill="none"
              stroke="var(--z-fg)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - done / TOTAL)}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,.61,.36,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[36px] font-bold leading-none tracking-[-0.04em] tabular-nums text-[color:var(--z-fg)]">
              {percent}%
            </span>
            <span className="mt-1.5 text-[12px] text-[color:var(--z-muted)]">Completed</span>
          </div>
        </div>

        <dl className="grid min-w-[220px] flex-1 grid-cols-2 gap-x-6 gap-y-6">
          {stats.map(stat => (
            <div key={stat.label} className="border-t border-[color:var(--z-border)] pt-3">
              <dd className="text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[color:var(--z-fg)]">
                {stat.value}
              </dd>
              <dt className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--z-muted)]">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </FeatureCard>
  );
}

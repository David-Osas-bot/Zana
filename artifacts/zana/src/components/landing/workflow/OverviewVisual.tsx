import { useEffect, useState } from 'react';
import { useInterval, useReducedMotion } from '../features/hooks';
import { MockAvatar, clamp } from './mock-ui';

const TARGETS = { projects: 3, open: 5, done: 12, people: 4 };
const PERCENT = 71; // 12 of 17 tasks
const RADIUS = 46;
const CIRC = 2 * Math.PI * RADIUS;
const STEPS = 22;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

const PROJECTS = [
  { name: 'Website refresh', tasks: 9, when: '2d ago' },
  { name: 'Mobile app', tasks: 8, when: '5d ago' },
];

// Step 4: the overview counts up and the status ring sweeps in.
export default function OverviewVisual() {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  const [sweep, setSweep] = useState(false);

  useInterval(() => setTick(t => t + 1), reduced || tick >= STEPS ? null : 45);
  useEffect(() => {
    if (reduced) { setSweep(true); return; }
    const timer = window.setTimeout(() => setSweep(true), 120);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  const progress = reduced ? 1 : easeOut(clamp(tick / STEPS, 0, 1));
  const shown = (n: number) => Math.round(n * progress);

  const stats = [
    { label: 'Projects', value: shown(TARGETS.projects) },
    { label: 'Open tasks', value: shown(TARGETS.open) },
    { label: 'Completed', value: shown(TARGETS.done) },
    { label: 'Collaborators', value: shown(TARGETS.people) },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <dl className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="zw-rise border-t border-[color:var(--z-fg)] pt-3" style={{ '--i': i } as React.CSSProperties}>
            <dd className="text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[color:var(--z-fg)]">{stat.value}</dd>
            <dt className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--z-muted)]">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="zw-rise flex items-center gap-5 rounded-2xl border border-[color:var(--z-border)] bg-[color:var(--z-panel)] p-4" style={{ '--i': 4 } as React.CSSProperties}>
          <div className="relative h-[112px] w-[112px] shrink-0" role="img" aria-label={`${PERCENT}% of tasks completed`}>
            <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="56" cy="56" r={RADIUS} fill="none" stroke="var(--z-track)" strokeWidth="10" />
              <circle
                cx="56"
                cy="56"
                r={RADIUS}
                fill="none"
                stroke="var(--z-fg)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={sweep ? CIRC * (1 - PERCENT / 100) : CIRC}
                style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,.61,.36,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[24px] font-bold leading-none tracking-[-0.04em] tabular-nums text-[color:var(--z-fg)]">{shown(PERCENT)}%</span>
              <span className="mt-1 text-[10px] text-[color:var(--z-muted)]">Completed</span>
            </div>
          </div>
          <ul className="hidden space-y-2 text-[12px] text-[color:var(--z-fg)] sm:block">
            <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-[color:var(--z-fg)]" />Open — {TARGETS.open}</li>
            <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-[color:var(--z-track)]" />Completed — {TARGETS.done}</li>
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {PROJECTS.map((project, i) => (
            <div
              key={project.name}
              className="zw-rise flex flex-col justify-between rounded-2xl border border-[color:var(--z-border)] bg-[color:var(--z-panel)] p-4"
              style={{ '--i': i + 5 } as React.CSSProperties}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] text-[color:var(--z-muted)]">0{i + 1}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--z-fg)]" />
              </div>
              <div className="mt-4">
                <p className="text-[15px] font-semibold tracking-[-0.02em] text-[color:var(--z-fg)]">{project.name}</p>
                <p className="mt-1 font-mono text-[10px] text-[color:var(--z-muted)]">
                  {project.tasks} tasks · {project.when}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="zw-rise flex items-center gap-3" style={{ '--i': 7 } as React.CSSProperties}>
        <div className="flex -space-x-2">
          {['AO', 'TK', 'KM', 'SB'].map(initials => (
            <MockAvatar key={initials} initials={initials} className="bg-[color:var(--z-surface)]" />
          ))}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--z-muted)]">
          {TARGETS.people} people on this project
        </span>
      </div>
    </div>
  );
}

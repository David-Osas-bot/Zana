import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { BellRing, Clock } from 'lucide-react';
import { useReducedMotion } from '@/components/landing/features/hooks';

const COPY = {
  signin: {
    title: 'Welcome back to a calmer workspace.',
    text: 'Your boards, reminders and teammates are right where you left them.',
  },
  signup: {
    title: 'Start your first project today.',
    text: 'Boards, reminders and invites together in one quiet workspace.',
  },
} as const;

const CHIPS = ['Kanban boards', 'Due-date reminders', 'Team invites'];
const RADIUS = 34;
const CIRC = 2 * Math.PI * RADIUS;

// One floating glass card. Three nested layers so the three motions never fight:
// float (translate), pointer parallax (transform) and the entrance (opacity).
function FloatCard({
  className,
  index,
  depth,
  rotate,
  children,
}: {
  className: string;
  index: number;
  depth: number;
  rotate: number;
  children: ReactNode;
}) {
  return (
    <div className={`za-float absolute ${className}`} style={{ '--i': index } as CSSProperties}>
      <div className="za-parallax" style={{ '--d': depth, '--r': `${rotate}deg` } as CSSProperties}>
        <div
          className="za-rise rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          style={{ '--i': index + 3 } as CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/70 bg-black/30 text-[10px] font-medium text-white"
    >
      {initials}
    </span>
  );
}

export default function AuthShowcase({ variant }: { variant: 'signin' | 'signup' }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [ring, setRing] = useState(false);
  const copy = COPY[variant];

  useEffect(() => {
    const timer = window.setTimeout(() => setRing(true), reduced ? 0 : 600);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  // Cards drift slightly toward the cursor, each by its own depth.
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--px', (((e.clientX - rect.left) / rect.width - 0.5) * 2).toFixed(3));
    e.currentTarget.style.setProperty('--py', (((e.clientY - rect.top) / rect.height - 0.5) * 2).toFixed(3));
  };
  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--px', '0');
    e.currentTarget.style.setProperty('--py', '0');
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate h-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a] text-white"
      data-testid="auth-showcase"
    >
      {/* Optional photo: drop a picture at public/landing/auth/showcase.jpg. It is shown in grayscale. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-40"
        style={{ backgroundImage: 'url(/landing/auth/showcase.jpg)', filter: 'grayscale(1) contrast(1.1)' }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 18% 0%, rgba(255,255,255,0.16), transparent 62%), radial-gradient(50% 40% at 100% 100%, rgba(255,255,255,0.09), transparent 60%), linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.35) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 35%, #000 25%, transparent 72%)',
          maskImage: 'radial-gradient(ellipse at 50% 35%, #000 25%, transparent 72%)',
        }}
      />

      {/* Floating product cards */}
      <div className="absolute inset-x-0 top-[6%] h-[60%]" aria-hidden>
        <FloatCard className="left-[7%] top-[4%] w-[250px]" index={0} depth={0.8} rotate={-3}>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <span className="h-2 w-2 rounded-full border-2 border-white" />
            In progress
          </div>
          <p className="mt-3 text-[15px] font-medium">Design review</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">
              <Clock size={11} /> Today
            </span>
            <Avatar initials="KM" />
          </div>
        </FloatCard>

        <FloatCard className="right-[7%] top-[16%] w-[225px]" index={1} depth={1.3} rotate={2}>
          <div className="flex items-center gap-4">
            <div className="relative h-[78px] w-[78px] shrink-0">
              <svg viewBox="0 0 78 78" className="h-full w-full -rotate-90">
                <circle cx="39" cy="39" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
                <circle
                  cx="39"
                  cy="39"
                  r={RADIUS}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={ring ? CIRC * 0.28 : CIRC}
                  style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.22,.61,.36,1)' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[17px] font-bold tabular-nums">72%</span>
            </div>
            <div>
              <p className="text-[13px] font-medium">Completed</p>
              <p className="mt-1 text-[12px] text-white/60">9 of 12 tasks</p>
            </div>
          </div>
        </FloatCard>

        <FloatCard className="bottom-[8%] left-[15%] w-[270px]" index={2} depth={1} rotate={1.5}>
          <div className="flex items-start gap-3">
            <BellRing size={16} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">Due soon: Launch checklist</p>
              <p className="mt-1 text-[12px] text-white/60">Friday, 2:00 PM</p>
            </div>
          </div>
        </FloatCard>

        <FloatCard className="bottom-[0%] right-[6%] w-[215px]" index={3} depth={0.6} rotate={-2}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['AO', 'TK', 'KM', 'SB'].map(initials => (
                <Avatar key={initials} initials={initials} />
              ))}
            </div>
            <span className="text-[12px] text-white/70">4 people</span>
          </div>
        </FloatCard>
      </div>

      {/* Message */}
      <div className="absolute inset-x-0 bottom-0 p-10 xl:p-12">
        <h2
          className="max-w-[18ch] text-[clamp(1.75rem,2.6vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.04em]"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
        >
          {copy.title}
        </h2>
        <p className="mt-4 max-w-[30rem] text-[16px] leading-relaxed text-white/65">{copy.text}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {CHIPS.map(chip => (
            <li key={chip} className="rounded-full border border-white/20 px-3 py-1 text-[12px] font-medium text-white/85">
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

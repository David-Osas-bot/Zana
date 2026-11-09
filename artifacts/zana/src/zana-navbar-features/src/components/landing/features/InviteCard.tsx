import { useState } from 'react';
import { Send } from 'lucide-react';
import FeatureCard from './FeatureCard';
import { useCardLoop, useInterval } from './hooks';

const EMAIL = 'sam@studio.co';

// One loop = type an email, press Invite, watch the new member appear, reset.
// Counted in 70ms ticks.
const TYPE = 18;
const SEND = 10;
const HOLD = 38;
const REST = 8;
const CYCLE = TYPE + SEND + HOLD + REST;

function Avatar({ initial }: { initial: string }) {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--z-fg)] text-[12px] font-medium text-[color:var(--z-fg)]"
    >
      {initial}
    </span>
  );
}

function Row({ initial, name, status, revoke = false }: { initial: string; name: string; status: string; revoke?: boolean }) {
  return (
    <div className="flex items-center gap-3 border-t border-[color:var(--z-border)] py-2.5">
      <Avatar initial={initial} />
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[color:var(--z-fg)]">{name}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--z-muted)]">{status}</span>
      {revoke && <span className="text-[12px] font-medium text-[#ef4444]">Revoke</span>}
    </div>
  );
}

export default function InviteCard({ index, className = '' }: { index: number; className?: string }) {
  const { ref, running, reduced } = useCardLoop<HTMLDivElement>();
  const [tick, setTick] = useState(0);
  useInterval(() => setTick(t => t + 1), running ? 70 : null);

  // Reduced motion shows the finished state instead of the loop.
  const t = reduced ? TYPE + SEND + 2 : tick % CYCLE;
  const typed = t < TYPE ? EMAIL.slice(0, t) : t < TYPE + SEND ? EMAIL : '';
  const typing = t < TYPE;
  const sending = t >= TYPE && t < TYPE + SEND;
  const added = t >= TYPE + SEND && t < TYPE + SEND + HOLD;

  return (
    <FeatureCard
      index={index}
      className={className}
      title="Bring your team in."
      description="Invite by email, see who has joined, and revoke access any time."
    >
      <div ref={ref} className="h-[236px] w-full" role="img" aria-label="Typing an email address, sending an invite and seeing the new member appear">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--z-muted)]">Invite by email</p>
        <div className="mt-2 flex gap-2">
          <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-[color:var(--z-border)] bg-[color:var(--z-panel)] px-3 text-[13px]">
            {typed ? (
              <span className="truncate text-[color:var(--z-fg)]">{typed}</span>
            ) : (
              <span className="truncate text-[color:var(--z-muted)]">name@company.com</span>
            )}
            {typing && (
              <span
                aria-hidden
                className="ml-px h-4 w-px bg-[color:var(--z-fg)]"
                style={{ animation: 'zf-caret 1s steps(1) infinite' }}
              />
            )}
          </div>
          <div
            className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[color:var(--z-fg)] px-4 text-[13px] font-semibold text-[color:var(--z-bg)] transition-opacity duration-300"
            style={{ opacity: typed || sending ? 1 : 0.45 }}
          >
            <Send size={13} aria-hidden />
            {sending ? 'Sending…' : 'Invite'}
          </div>
        </div>

        <div className="mt-4">
          <Row initial="A" name="Ada · you" status="owner" />
          <Row initial="T" name="Tunde" status="member" />
          <div
            style={{
              display: 'grid',
              gridTemplateRows: added ? '1fr' : '0fr',
              opacity: added ? 1 : 0,
              transition: 'grid-template-rows .5s cubic-bezier(.22,.61,.36,1), opacity .4s ease',
            }}
          >
            <div className="min-h-0 overflow-hidden">
              <Row initial="S" name={EMAIL} status="invited" revoke />
            </div>
          </div>
        </div>
      </div>
    </FeatureCard>
  );
}

import { useEffect, useState } from 'react';
import ProgressCard from './ProgressCard';
import BoardCard from './BoardCard';
import RemindersCard from './RemindersCard';
import InviteCard from './InviteCard';
import ActivityCard from './ActivityCard';
import { useInView } from './hooks';

const HEADING_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

const css = `
.zf-card {
  opacity: 0;
  transition: transform .3s cubic-bezier(.22,.61,.36,1), border-color .2s ease, box-shadow .3s ease;
}
.zf-section[data-revealed="true"] .zf-card {
  opacity: 1;
  animation: zf-card-in .8s cubic-bezier(.22,.61,.36,1) calc(var(--i) * 90ms) backwards;
}
.zf-section[data-revealed="true"] .zf-card:hover {
  transform: translateY(-3px);
  border-color: var(--z-subtle);
  box-shadow: 0 18px 40px -24px rgba(0,0,0,.35);
}
@keyframes zf-card-in { from { opacity: 0; transform: translateY(24px); } }

.zf-stack-item {
  transition: transform .6s cubic-bezier(.22,.61,.36,1), opacity .5s ease;
  animation: zf-stack-in .6s cubic-bezier(.22,.61,.36,1) backwards;
}
@keyframes zf-stack-in { from { opacity: 0; transform: translateY(calc(var(--y) - 28px)); } }
@keyframes zf-caret { 50% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .zf-card { opacity: 1 !important; animation: none !important; transition: none; }
  .zf-stack-item { animation: none; transition: none; }
}
`;

export default function Features() {
  const [ref, inView] = useInView<HTMLElement>(0.1);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (inView) setRevealed(true);
  }, [inView]);

  return (
    <section
      ref={ref}
      id="features"
      aria-labelledby="features-heading"
      data-revealed={revealed}
      className="zf-section scroll-mt-24 px-3 pb-3 sm:px-5 sm:pb-5"
    >
      <style>{css}</style>

      <div className="rounded-[28px] bg-[color:var(--z-panel)] px-6 py-16 sm:px-12 sm:py-20 lg:px-[8%] lg:py-24">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--z-muted)]">Features / 05</p>
              <h2
                id="features-heading"
                className="mt-5 max-w-[20ch] text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--z-fg)]"
                style={{ fontFamily: HEADING_FONT }}
              >
                Everything your team needs to get work done.
              </h2>
            </div>
            <p className="max-w-[26rem] text-[17px] leading-relaxed text-[color:var(--z-muted)]">
              Boards, reminders, invites and a clear overview, together in one quiet workspace.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-6">
            <ProgressCard index={0} className="lg:col-span-3 lg:min-h-[26rem]" />
            <BoardCard index={1} className="lg:col-span-3 lg:min-h-[26rem]" />
            <RemindersCard index={2} className="lg:col-span-2" />
            <InviteCard index={3} className="lg:col-span-2" />
            <ActivityCard index={4} className="lg:col-span-2" />
          </div>
        </div>
      </div>
    </section>
  );
}

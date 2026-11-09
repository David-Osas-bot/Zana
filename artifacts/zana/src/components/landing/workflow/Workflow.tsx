import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { useInView, useReducedMotion } from '../features/hooks';
import { steps } from './steps';

const HEADING_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const pad = (n: number) => String(n).padStart(2, '0');

const css = `
.zw-reveal { opacity: 0; transform: translateY(24px); transition: opacity .8s ease, transform .8s cubic-bezier(.22,.61,.36,1); }
.zw-section[data-revealed="true"] .zw-reveal { opacity: 1; transform: none; }

.zw-swap { transition: opacity .18s ease, transform .18s ease; }
.zw-swap[data-leaving="true"] { opacity: 0; transform: translateY(6px); }
.zw-enter { animation: zw-enter .45s cubic-bezier(.22,.61,.36,1) backwards; }
.zw-rise { animation: zw-rise .6s cubic-bezier(.22,.61,.36,1) calc(var(--i, 0) * 70ms + 60ms) backwards; }
@keyframes zw-enter { from { opacity: 0; } }
@keyframes zw-rise { from { opacity: 0; transform: translateY(14px); } }
@keyframes zw-caret { 50% { opacity: 0; } }

.zw-tabs { scrollbar-width: none; }
.zw-tabs::-webkit-scrollbar { display: none; }

@media (prefers-reduced-motion: reduce) {
  .zw-reveal { opacity: 1; transform: none; transition: none; }
  .zw-swap, .zw-enter, .zw-rise { animation: none; transition: none; }
}
`;

export default function Workflow() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.12);
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  const [active, setActive] = useState(0); // which tab is highlighted
  const [shown, setShown] = useState(0); // which panel is on screen
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [animateBox, setAnimateBox] = useState(false);

  useEffect(() => {
    if (inView) setRevealed(true);
  }, [inView]);

  // Clicking fades the old panel out, then the new one rises in.
  const select = useCallback(
    (i: number) => {
      if (i === active) return;
      setActive(i);
      window.clearTimeout(timer.current);
      if (reduced) {
        setShown(i);
        setLeaving(false);
        return;
      }
      setLeaving(true);
      timer.current = window.setTimeout(() => {
        setShown(i);
        setLeaving(false);
      }, 180);
    },
    [active, reduced],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // The highlight is one element that glides to the active tab.
  const measure = useCallback(() => {
    const el = tabRefs.current[active];
    if (!el) return;
    setBox({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  }, [active]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimateBox(true));
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (observer && listRef.current) observer.observe(listRef.current);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [measure]);

  // On phones the tabs scroll sideways; keep the active one in view.
  useEffect(() => {
    const list = listRef.current;
    const el = tabRefs.current[active];
    if (!list || !el || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: el.offsetLeft - (list.clientWidth - el.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let target: number | null = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') target = (active + 1) % steps.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') target = (active - 1 + steps.length) % steps.length;
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = steps.length - 1;
    if (target === null) return;
    e.preventDefault();
    select(target);
    tabRefs.current[target]?.focus();
  };

  const step = steps[shown];
  const Visual = step.Visual;

  return (
    <section
      ref={sectionRef}
      id="workflow"
      aria-labelledby="workflow-heading"
      data-revealed={revealed}
      className="zw-section scroll-mt-24 px-6 py-20 sm:px-12 sm:py-28 lg:px-[8%]"
    >
      <style>{css}</style>

      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--z-muted)]">
              Workflow / {pad(steps.length)}
            </p>
            <h2
              id="workflow-heading"
              className="mt-5 max-w-[18ch] text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--z-fg)]"
              style={{ fontFamily: HEADING_FONT }}
            >
              One workspace for the whole project.
            </h2>
          </div>
          <p className="max-w-[26rem] text-[17px] leading-relaxed text-[color:var(--z-muted)]">
            Follow a project through Zana in four steps, from the first task to the final check-off.
          </p>
        </div>

        <div className="zw-reveal mt-12 grid gap-4 sm:mt-16 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-5">
          {/* Tabs: a column on desktop, a scrolling row on phones */}
          <div
            ref={listRef}
            role="tablist"
            aria-label="Workflow steps"
            onKeyDown={onKeyDown}
            className="zw-tabs relative flex gap-1 self-start overflow-x-auto rounded-2xl bg-[color:var(--z-panel)] p-1.5 lg:flex-col lg:overflow-visible lg:rounded-3xl lg:p-2"
          >
            <span
              aria-hidden
              className="absolute left-0 top-0 rounded-2xl bg-[color:var(--z-surface)] shadow-[0_6px_20px_-10px_rgba(0,0,0,0.35)]"
              style={{
                width: box.w,
                height: box.h,
                transform: `translate(${box.x}px, ${box.y}px)`,
                transition: animateBox && !reduced
                  ? 'transform .45s cubic-bezier(.22,.61,.36,1), width .45s cubic-bezier(.22,.61,.36,1), height .45s cubic-bezier(.22,.61,.36,1)'
                  : 'none',
              }}
            />

            {steps.map((s, i) => {
              const isActive = i === active;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  ref={el => { tabRefs.current[i] = el; }}
                  type="button"
                  role="tab"
                  id={`workflow-tab-${s.id}`}
                  aria-selected={isActive}
                  aria-controls="workflow-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => select(i)}
                  data-testid={`tab-workflow-${s.id}`}
                  className="group relative z-10 flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-2xl px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--z-fg)] lg:flex-col lg:items-start lg:gap-3 lg:whitespace-normal lg:px-5 lg:py-5"
                >
                  <Icon
                    size={22}
                    strokeWidth={1.7}
                    aria-hidden
                    className={`shrink-0 transition-colors duration-200 ${
                      isActive ? 'text-[color:var(--z-fg)]' : 'text-[color:var(--z-muted)] group-hover:text-[color:var(--z-fg)]'
                    }`}
                  />
                  <span>
                    <span
                      className={`block text-[16px] font-medium leading-snug transition-colors duration-200 lg:text-[17px] ${
                        isActive ? 'text-[color:var(--z-fg)]' : 'text-[color:var(--z-muted)] group-hover:text-[color:var(--z-fg)]'
                      }`}
                    >
                      {s.title}
                    </span>
                    <span className="mt-1.5 hidden max-w-[16rem] text-[15px] leading-snug text-[color:var(--z-muted)] lg:block">
                      {s.summary}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Panel: text on top, the picture below */}
          <div
            id="workflow-panel"
            role="tabpanel"
            aria-labelledby={`workflow-tab-${steps[active].id}`}
            className="min-w-0 overflow-hidden rounded-3xl border border-[color:var(--z-border)] bg-[color:var(--z-surface)]"
          >
            <div className="zw-swap" data-leaving={leaving}>
              <div key={shown} className="zw-enter">
                <div className="p-6 sm:p-8">
                  <p className="zw-rise max-w-[40rem] text-[clamp(1.0625rem,1.5vw,1.3125rem)] leading-[1.5] tracking-[-0.01em] text-[color:var(--z-muted)]">
                    <strong className="font-semibold text-[color:var(--z-fg)]">{step.lead}</strong> {step.body}
                  </p>
                </div>
                <div className="border-t border-[color:var(--z-border)] bg-[color:var(--z-panel)] p-5 sm:p-8">
                  <div className="flex min-h-[21rem] items-center justify-center sm:min-h-[22rem]">
                    <Visual key={step.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

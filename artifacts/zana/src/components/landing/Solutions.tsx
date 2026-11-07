import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight } from 'lucide-react';

type Sector = {
    id: string;
    label: string;
    title: string;
    description: string;
    /** Short, true statements about what Zana gives this group. No made-up stats. */
    tags: string[];
    /** Path under /public. If the file is missing, the gradient below shows instead. */
    image: string;
    fallback: string;
};

// Edit this array to change, add or reorder cards. Four reads best on desktop.
const sectors: Sector[] = [
    {
        id: 'software',
        label: 'Software teams',
        title: 'Plan sprints, track bugs and ship releases.',
        description: 'Break a release into tasks, assign owners and move work across the board without the busywork.',
        tags: ['Boards', 'Assignees', 'Due dates'],
        image: '/landing/solutions/software.jpg',
        fallback: 'linear-gradient(160deg, #3d4d44 0%, #181c17 100%)',
    },
    {
        id: 'agencies',
        label: 'Agencies & freelancers',
        title: 'Keep every client project on schedule.',
        description: 'Give each client a project of its own, invite collaborators by email and get reminded before a deadline slips.',
        tags: ['Projects', 'Invites', 'Reminders'],
        image: '/landing/solutions/agencies.jpg',
        fallback: 'linear-gradient(160deg, #565546 0%, #1b1b16 100%)',
    },
    {
        id: 'startups',
        label: 'Startups & small business',
        title: 'Run launches and daily operations in one place.',
        description: 'A light workflow the whole team can pick up quickly, from the launch checklist to weekly operations.',
        tags: ['Overview', 'Boards', 'Team'],
        image: '/landing/solutions/startups.jpg',
        fallback: 'linear-gradient(160deg, #3c5560 0%, #151b1e 100%)',
    },
    {
        id: 'education',
        label: 'Education & student teams',
        title: 'Coordinate group projects and coursework.',
        description: 'Split a project into tasks, assign owners and track progress together until the deadline.',
        tags: ['Tasks', 'Progress', 'Due dates'],
        image: '/landing/solutions/education.jpg',
        fallback: 'linear-gradient(160deg, #5a4e4e 0%, #1e1919 100%)',
    },
];

const HEADING_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const EXPANDED_GROW = 2; // how much wider the open card is than a closed one (desktop)
const pad = (n: number) => String(n).padStart(2, '0');

// All state-dependent styling lives here so mobile (no hover) and desktop
// (accordion) can differ cleanly. Below 1024px every card is fully open.
const css = `
.sector-card {
  opacity: 0;
  transform: translateY(24px);
  transition:
    flex-grow .7s cubic-bezier(.22,.61,.36,1),
    opacity .8s ease calc(var(--i) * 90ms),
    transform .8s cubic-bezier(.22,.61,.36,1) calc(var(--i) * 90ms);
}
.sector-section[data-revealed="true"] .sector-card { opacity: 1; transform: none; }
@media (min-width: 1024px) { .sector-card { flex: var(--grow, 1) 1 0%; min-width: 0; } }

.sector-img {
  transform: scale(1.02);
  transition: transform 1.2s cubic-bezier(.22,.61,.36,1), filter .7s ease;
}
.sector-shade {
  background: linear-gradient(to top, rgba(10,14,11,.9) 0%, rgba(10,14,11,.55) 40%, rgba(10,14,11,.08) 72%, rgba(10,14,11,.28) 100%);
}
.sector-spot {
  opacity: 0;
  transition: opacity .4s ease;
  background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.18), transparent 62%);
}
@media (hover: hover) { .sector-card:hover .sector-spot { opacity: 1; } }

.sector-corner {
  position: absolute; top: 18px; right: 18px; width: 18px; height: 18px; opacity: .7;
  border-top: 1px solid rgba(255,255,255,.6); border-right: 1px solid rgba(255,255,255,.6);
  border-top-right-radius: 6px;
  transition: width .6s cubic-bezier(.22,.61,.36,1), height .6s cubic-bezier(.22,.61,.36,1), opacity .4s ease;
}
.sector-arrow {
  transition: background-color .3s ease, color .3s ease, transform .5s cubic-bezier(.22,.61,.36,1);
}
.sector-card:hover .sector-arrow,
.sector-card:focus-visible .sector-arrow { background: #fff; color: #181c17; transform: translate(2px, -2px); }

.sector-details { display: grid; grid-template-rows: 1fr; opacity: 1; transition: grid-template-rows .6s cubic-bezier(.22,.61,.36,1), opacity .5s ease; }
.sector-details > div { min-height: 0; overflow: hidden; }

@media (min-width: 1024px) {
  .sector-img { filter: saturate(.7) brightness(.8); }
  .sector-card[data-active="true"] .sector-img { transform: scale(1.08); filter: none; }
  .sector-card[data-active="true"] .sector-corner { width: 40px; height: 40px; opacity: 1; }
  .sector-details { grid-template-rows: 0fr; opacity: 0; }
  .sector-card[data-active="true"] .sector-details { grid-template-rows: 1fr; opacity: 1; transition-delay: .12s; }
}

@media (prefers-reduced-motion: reduce) {
  .sector-card, .sector-img, .sector-spot, .sector-corner, .sector-arrow, .sector-details { transition: none !important; }
  .sector-card { opacity: 1; transform: none; }
  .sector-img { transform: none !important; }
}
`;

export default function Solutions() {
    const [active, setActive] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const lastPointer = useRef('mouse');

    // Fade the cards in (staggered) the first time the section scrolls into view.
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRevealed(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Cursor-following spotlight: just updates two CSS variables.
    const onPointerMove = (e: PointerEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };

    return (
        <section
            ref={sectionRef}
            id="solutions"
            aria-labelledby="solutions-heading"
            data-revealed={revealed}
            className="sector-section scroll-mt-24 px-6 py-20 sm:px-12 sm:py-28 lg:px-[8%]"
        >
            <style>{css}</style>

            <div className="mx-auto max-w-[1280px]">
                {/* Header: title left, short intro right */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#5f655e]">
                            Who it&rsquo;s for / {pad(sectors.length)}
                        </p>
                        <h2
                            id="solutions-heading"
                            className="mt-5 max-w-[18ch] text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#181c17]"
                            style={{ fontFamily: HEADING_FONT }}
                        >
                            Built for the teams that keep work moving.
                        </h2>
                    </div>
                    <p className="max-w-[26rem] text-[17px] leading-relaxed text-[#5f655e]">
                        From solo freelancers to growing teams, Zana gives every group the same calm setup: one board, clear
                        owners and reminders that keep work on schedule.
                    </p>
                </div>

                {/* Cards: an accordion on desktop, a stack on mobile */}
                <div className="mt-12 flex flex-col gap-4 sm:mt-16 lg:h-[34rem] lg:flex-row">
                    {sectors.map((s, i) => {
                        const isActive = active === i;
                        return (
                            <Link
                                key={s.id}
                                href="/signup"
                                data-active={isActive}
                                data-testid={`card-solution-${s.id}`}
                                className="sector-card group relative isolate block h-[28rem] overflow-hidden rounded-3xl bg-[#181c17] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#181c17] lg:h-auto"
                                style={{ '--i': i, '--grow': isActive ? EXPANDED_GROW : 1 } as CSSProperties}
                                onPointerEnter={() => setActive(i)}
                                onFocus={() => setActive(i)}
                                onPointerMove={onPointerMove}
                                onPointerDown={e => { lastPointer.current = e.pointerType; }}
                                onClick={e => {
                                    // On touch screens the first tap opens a closed card; the second follows the link.
                                    if (!isActive && lastPointer.current !== 'mouse') {
                                        e.preventDefault();
                                        setActive(i);
                                    }
                                }}
                            >
                                <div
                                    aria-hidden
                                    className="sector-img absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${s.image}), ${s.fallback}` }}
                                />
                                <div aria-hidden className="sector-shade absolute inset-0" />
                                <div aria-hidden className="sector-spot absolute inset-0" />
                                <span aria-hidden className="sector-corner" />

                                <div className="relative z-10 flex h-full flex-col justify-between p-6">
                                    <span className="font-mono text-[11px] tracking-[0.16em] text-white/70">
                                        {pad(i + 1)} / {pad(sectors.length)}
                                    </span>

                                    <div>
                                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/70">{s.label}</p>
                                        <h3
                                            className="mt-3 text-[clamp(1.25rem,1.9vw,1.75rem)] font-medium leading-[1.2] tracking-[-0.02em]"
                                            style={{ fontFamily: HEADING_FONT }}
                                        >
                                            {s.title}
                                        </h3>

                                        <div className="sector-details">
                                            <div>
                                                <p className="mt-4 max-w-[30rem] text-[15px] leading-relaxed text-white/80">{s.description}</p>
                                                <div className="mt-5 flex items-center justify-between gap-4">
                                                    <ul className="flex flex-wrap gap-2">
                                                        {s.tags.map(tag => (
                                                            <li
                                                                key={tag}
                                                                className="rounded-full border border-white/25 px-3 py-1 text-[12px] font-medium text-white/90"
                                                            >
                                                                {tag}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <span className="sector-arrow flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40">
                                                        <ArrowUpRight size={18} aria-hidden />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
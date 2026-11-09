import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { scrollToSection } from '../nav-links';

type Voice = {
    id: string;
    quote: string;
    name: string;
    role: string;
    company: string;
    /** Path under /public. If the file is missing, the gradient below shows instead. */
    image: string;
    fallback: string;
};

// TODO: PLACEHOLDER COPY. These are not real customers. Replace every entry with a real
// quote (from a beta user, with permission) and a real photo before launch.
// Kept deliberately free of numbers and stats so nothing invented reads as a claim.
const voices: Voice[] = [
    {
        id: 'engineering',
        quote: 'Triage got lighter the first week. Zana is the first board my engineers open without being asked.',
        name: 'Chidinma Eze',
        role: 'Head of Engineering',
        company: 'Northgate Labs',
        image: './public/testimonials/eze.jpg',
        fallback: 'linear-gradient(160deg, #3f3f3f 0%, #0a0a0a 100%)',
    },
    {
        id: 'product',
        quote: 'Deadlines finally stick. Weekly planning went from a long meeting to a quick check on the board.',
        name: 'Tunde Balogun',
        role: 'Product Lead',
        company: 'Fathom',
        image: './public/testimonials/tunde.jpg',
        fallback: 'linear-gradient(160deg, #505050 0%, #111111 100%)',
    },
    {
        id: 'leadership',
        quote: 'The board view won over our whole leadership team. Everyone can see what ships next and who owns it.',
        name: 'Ifeoma Nwosu',
        role: 'VP Product',
        company: 'Latimer',
        image: './public/testimonials/ifeoma.jpg',
        fallback: 'linear-gradient(160deg, #2d2d2d 0%, #050505 100%)',
    },
    {
        id: 'agency',
        quote: 'Reminders arrive before work slips, not after. Client projects stay on schedule without chasing people.',
        name: 'Kelechi Adeyemi',
        role: 'Operations Manager',
        company: 'Brightpath Agency',
        image: './public/testimonials/kelechi.jpg',
        fallback: 'linear-gradient(160deg, #464646 0%, #0d0d0d 100%)',
    },
    {
        id: 'founder',
        quote: 'A new teammate opens the workspace and already knows what to pick up. Onboarding stopped being a meeting.',
        name: 'Zainab Musa',
        role: 'Founder',
        company: 'Kora Studio',
        image: './public/testimonials/zainab.jpg',
        fallback: 'linear-gradient(160deg, #3a3a3a 0%, #090909 100%)',
    },
];

const HEADING_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const AUTOPLAY_MS = 6000; // set to 0 to turn autoplay off
const pad = (n: number) => String(n).padStart(2, '0');
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Same approach as Solutions.tsx: all state-dependent styling lives in one block.
// The track's left padding matches the header's side padding so cards line up with the heading.
const css = `
.voice-card {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity .8s ease calc(var(--i) * 90ms),
    transform .8s cubic-bezier(.22,.61,.36,1) calc(var(--i) * 90ms);
}
.voice-section[data-revealed="true"] .voice-card { opacity: 1; transform: none; }

.voice-track {
  --pad: 1.5rem;
  padding-left: var(--pad);
  padding-right: var(--pad);
  scroll-padding-left: var(--pad);
  scrollbar-width: none;
}
.voice-track::-webkit-scrollbar { display: none; }
@media (min-width: 640px)  { .voice-track { --pad: 3rem; } }
@media (min-width: 1024px) { .voice-track { --pad: 8vw; } }

.voice-photo {
  filter: grayscale(1) brightness(.92);
  transform: scale(1.02);
  transition: filter .7s ease, transform 1.2s cubic-bezier(.22,.61,.36,1);
}
.voice-card[data-active="true"] .voice-photo { filter: none; transform: scale(1.06); }

.voice-card { background: color-mix(in srgb, var(--z-fg) 4%, transparent); }

.voice-dot { transition: width .3s ease, background-color .3s ease; }

.voice-btn, .voice-cta { transition: background-color .3s ease, opacity .3s ease; }
.voice-btn:hover:not(:disabled), .voice-cta:hover { background: color-mix(in srgb, var(--z-fg) 7%, transparent); }
.voice-cta svg { transition: transform .4s cubic-bezier(.22,.61,.36,1); }
.voice-cta:hover svg { transform: translateX(3px); }

@media (prefers-reduced-motion: reduce) {
  .voice-card, .voice-photo, .voice-dot, .voice-btn, .voice-cta, .voice-cta svg { transition: none !important; }
  .voice-card { opacity: 1; transform: none; }
  .voice-photo { transform: none !important; }
}
`;

export default function CustomerVoices() {
    const [active, setActive] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [paused, setPaused] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLUListElement>(null);
    const rafRef = useRef(0);
    const last = voices.length - 1;

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

    const leftPad = () => {
        const track = trackRef.current;
        return track ? parseFloat(getComputedStyle(track).paddingLeft) || 0 : 0;
    };

    const goTo = useCallback(
        (index: number) => {
            const track = trackRef.current;
            const card = track?.children[Math.max(0, Math.min(last, index))] as HTMLElement | undefined;
            if (!track || !card) return;
            track.scrollTo({ left: card.offsetLeft - leftPad(), behavior: reducedMotion() ? 'auto' : 'smooth' });
        },
        [last],
    );

    // Keep the active card/dot in sync with swiping and trackpad scrolling.
    const onScroll = () => {
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = 0;
            const track = trackRef.current;
            if (!track) return;
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) {
                setActive(last);
                return;
            }
            const x = track.scrollLeft + leftPad();
            let nearest = 0;
            let best = Infinity;
            Array.from(track.children).forEach((el, i) => {
                const d = Math.abs((el as HTMLElement).offsetLeft - x);
                if (d < best) {
                    best = d;
                    nearest = i;
                }
            });
            setActive(nearest);
        });
    };
    useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

    // Autoplay: pauses on hover/focus/touch, skips hidden tabs, off for reduced motion.
    useEffect(() => {
        if (!AUTOPLAY_MS || paused || reducedMotion()) return;
        const id = window.setInterval(() => {
            if (!document.hidden) goTo(active >= last ? 0 : active + 1);
        }, AUTOPLAY_MS);
        return () => window.clearInterval(id);
    }, [active, paused, goTo, last]);

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
    };

    return (
        <section
            ref={sectionRef}
            id="customer-voices"
            aria-labelledby="customer-voices-heading"
            data-revealed={revealed}
            className="voice-section scroll-mt-24 px-0 py-20 sm:py-28"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
        >
            <style>{css}</style>

            {/* Header: title left, intro + action right (same shape as Solutions) */}
            <div className="px-6 sm:px-12 lg:px-[8%]">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--z-muted)]">
                            Customer voices / {pad(voices.length)}
                        </p>
                        <h2
                            id="customer-voices-heading"
                            className="mt-5 max-w-[18ch] text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[color:var(--z-fg)]"
                            style={{ fontFamily: HEADING_FONT }}
                        >
                            Teams that switched don&rsquo;t go back.
                        </h2>
                    </div>
                    <div className="max-w-[26rem]">
                        <p className="text-[17px] leading-relaxed text-[color:var(--z-muted)]">
                            Leaders at fast-moving teams describe what changed once tasks, deadlines and reminders lived in
                            one place, and status meetings stopped eating the calendar.
                        </p>
                        <button
                            type="button"
                            onClick={() => scrollToSection('workflow')}
                            className="voice-cta mt-6 inline-flex items-center gap-3 rounded-full border border-[color:var(--z-border)] px-5 py-3 text-sm font-medium text-[color:var(--z-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--z-fg)]"
                        >
                            See how teams use Zana
                            <ArrowRight size={16} aria-hidden />
                        </button>
                    </div>
                </div>
            </div>

            {/* Track: bleeds off the right edge so people know to swipe */}
            <ul
                ref={trackRef}
                onScroll={onScroll}
                onKeyDown={onKeyDown}
                tabIndex={0}
                role="region"
                aria-roledescription="carousel"
                aria-label="Customer testimonials"
                className="voice-track relative mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 focus-visible:outline-none sm:mt-16"
            >
                {voices.map((v, i) => (
                    <li
                        key={v.id}
                        data-active={active === i}
                        data-testid={`card-voice-${v.id}`}
                        aria-roledescription="slide"
                        aria-label={`${i + 1} of ${voices.length}`}
                        style={{ '--i': i } as React.CSSProperties}
                        className="voice-card flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-[color:var(--z-border)] sm:w-[24rem] lg:w-[26rem]"
                    >
                        <div className="relative aspect-[5/4] overflow-hidden">
                            <div
                                role="img"
                                aria-label={`Portrait of ${v.name}`}
                                className="voice-photo absolute inset-0 bg-cover bg-top"
                                style={{ backgroundImage: `url(${v.image}), ${v.fallback}` }}
                            />
                        </div>
                        <figure className="flex flex-1 flex-col p-6">
                            <blockquote
                                className="text-[clamp(1.05rem,1.4vw,1.2rem)] font-medium leading-[1.35] tracking-[-0.01em] text-[color:var(--z-fg)]"
                                style={{ fontFamily: HEADING_FONT }}
                            >
                                {v.quote}
                            </blockquote>
                            <figcaption className="mt-auto pt-6">
                                <p className="text-[15px] font-medium text-[color:var(--z-fg)]">{v.name}</p>
                                <p className="text-[14px] text-[color:var(--z-muted)]">
                                    {v.role}, {v.company}
                                </p>
                            </figcaption>
                        </figure>
                    </li>
                ))}
            </ul>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-between px-6 sm:px-12 lg:px-[8%]">
                <div className="flex items-center" role="group" aria-label="Choose testimonial">
                    {voices.map((v, i) => (
                        <button
                            key={v.id}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`Go to testimonial ${i + 1}`}
                            aria-current={active === i}
                            className="group p-1.5 focus-visible:outline-none"
                        >
                            <span
                                className="voice-dot block h-2.5 rounded-full group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[color:var(--z-fg)]"
                                style={{
                                    width: active === i ? '1.5rem' : '0.625rem',
                                    background:
                                        active === i ? 'var(--z-fg)' : 'color-mix(in srgb, var(--z-fg) 25%, transparent)',
                                }}
                            />
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {[
                        { label: 'Previous testimonial', Icon: ChevronLeft, to: active - 1, disabled: active === 0 },
                        { label: 'Next testimonial', Icon: ChevronRight, to: active + 1, disabled: active === last },
                    ].map(({ label, Icon, to, disabled }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => goTo(to)}
                            disabled={disabled}
                            aria-label={label}
                            className="voice-btn inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--z-border)] text-[color:var(--z-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--z-fg)] disabled:pointer-events-none disabled:opacity-40"
                        >
                            <Icon size={20} aria-hidden />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
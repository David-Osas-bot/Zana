import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

type Slide = {
    id: string;
    title: string;
    description: string;
    alt: string;
    /** Path under /public. */
    src: string;
    /** Video slides play muted and looped while they are the active slide. */
    type?: 'image' | 'video';
    /** Shown before a video loads. */
    poster?: string;
    /** How long autoplay stays on this slide, in ms. */
    duration?: number;
};

// To add, remove or reorder steps, edit this array only. Everything else
// (tabs, counter, progress bars) is generated from it.
const slides: Slide[] = [
    {
        id: 'overview',
        title: 'Overview',
        description: 'Projects, open tasks and recent activity on one calm screen.',
        alt: 'The Zana overview dashboard with project and task counts, a list of projects and recent activity',
        src: '/landing/overview-dashboard.png',
    },
    {
        id: 'create-project',
        title: 'New project',
        description: 'Give new work a clear home in a few seconds.',
        alt: 'The New project dialog with fields for a name and a description',
        src: '/landing/create-project.png',
    },
    {
        id: 'invite-members',
        title: 'Invite your team',
        description: 'Invite by email, see who has joined, and revoke any time.',
        alt: 'The Project members dialog for inviting teammates by email and managing invites',
        src: '/landing/invite-members.png',
    },
    // Ready for a short screen recording of the board. Uncomment once the files
    // exist in /public/landing (same 1919:939 shape as the screenshots is best).
    // {
    //   id: 'board',
    //   type: 'video',
    //   title: 'Drag to progress',
    //   description: 'Move tasks from not started to complete and watch progress update.',
    //   alt: 'A task being dragged across the Zana board',
    //   src: '/landing/board-drag.mp4',
    //   poster: '/landing/board-drag.png',
    //   duration: 8000,
    // },
];

const DEFAULT_DURATION = 6500;
const SWIPE_THRESHOLD = 50;
const HEADING_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const pad = (n: number) => String(n).padStart(2, '0');

function ControlButton({
    label,
    onClick,
    testId,
    primary = false,
    children,
}: {
    label: string;
    onClick: () => void;
    testId: string;
    primary?: boolean;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            data-testid={testId}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-[transform,background-color] duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#181c17] ${primary
                    ? 'border-[#181c17] bg-[#181c17] text-white hover:bg-[#2a302a]'
                    : 'border-[#dfe4d8] bg-[#fbfcf8] text-[#181c17] hover:bg-white'
                }`}
        >
            {children}
        </button>
    );
}

function SlideMedia({ slide, active, play }: { slide: Slide; active: boolean; play: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Only video slides have a ref. Play while the slide is active and on screen,
    // and rewind once it is no longer the active slide.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (play) {
            video.play().catch(() => { });
        } else {
            video.pause();
            if (!active) video.currentTime = 0;
        }
    }, [play, active]);

    if (slide.type === 'video') {
        return (
            <video
                ref={videoRef}
                src={slide.src}
                poster={slide.poster}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={slide.alt}
                className="block h-full w-full object-cover object-top"
            />
        );
    }

    return (
        <img
            src={slide.src}
            alt={slide.alt}
            draggable={false}
            decoding="async"
            className="block h-full w-full object-cover object-top"
        />
    );
}

export default function ProductCarousel() {
    const [index, setIndex] = useState(0);
    const [userPaused, setUserPaused] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [focused, setFocused] = useState(false);
    const [inView, setInView] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    const rootRef = useRef<HTMLElement>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const startX = useRef<number | null>(null);
    const swiped = useRef(false);

    const count = slides.length;
    const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
    const next = useCallback(() => setIndex(i => (i + 1) % count), [count]);
    const prev = useCallback(() => setIndex(i => (i - 1 + count) % count), [count]);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReducedMotion(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    // Only run autoplay while the section is actually on screen.
    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const autoplay = !reducedMotion;
    const playing = autoplay && inView && !userPaused && !hovering && !focused;

    // --- swipe / drag ---------------------------------------------------------
    const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        startX.current = e.clientX;
        swiped.current = false;
    };
    const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
            swiped.current = true; // stops the click that follows a drag from re-selecting a slide
            if (dx < 0) next();
            else prev();
        }
    };
    const onPointerCancel = () => { startX.current = null; };

    // --- keyboard (tabs follow the WAI-ARIA tab pattern) ------------------------
    const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        let target: number | null = null;
        if (e.key === 'ArrowRight') target = (index + 1) % count;
        else if (e.key === 'ArrowLeft') target = (index - 1 + count) % count;
        else if (e.key === 'Home') target = 0;
        else if (e.key === 'End') target = count - 1;
        if (target === null) return;
        e.preventDefault();
        go(target);
        tabRefs.current[target]?.focus();
    };

    // Pause for keyboard users only, so clicking a tab doesn't stop autoplay.
    const onFocusCapture = (e: FocusEvent<HTMLElement>) => {
        if ((e.target as HTMLElement).matches(':focus-visible')) setFocused(true);
    };
    const onBlurCapture = (e: FocusEvent<HTMLElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
    };

    return (
        <section
            ref={rootRef}
            id="product-tour"
            aria-roledescription="carousel"
            aria-labelledby="product-tour-heading"
            className="scroll-mt-24 px-3 pb-3 sm:px-5 sm:pb-5"
        >
            <style>{`@keyframes zana-tour-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>

            <div
                className="overflow-hidden rounded-[28px] bg-[#edf1ea] py-16 sm:py-20 lg:py-24"
                onPointerEnter={e => { if (e.pointerType === 'mouse') setHovering(true); }}
                onPointerLeave={() => setHovering(false)}
                onFocusCapture={onFocusCapture}
                onBlurCapture={onBlurCapture}
            >
                {/* Header: title on the left, controls on the right */}
                <div className="px-6 sm:px-12 lg:px-[8%]">
                    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#5f655e]">
                                Product tour / {pad(count)}
                            </p>
                            <h2
                                id="product-tour-heading"
                                className="mt-5 text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#181c17]"
                                style={{ fontFamily: HEADING_FONT }}
                            >
                                See how work moves through Zana.
                            </h2>
                            <p className="mt-5 max-w-[32rem] text-[17px] leading-relaxed text-[#5f655e]">
                                From the first project to the last finished task, it all lives in one quiet workspace.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#5f655e]" aria-hidden>
                                {pad(index + 1)} / {pad(count)}
                            </span>
                            <ControlButton label="Previous slide" onClick={prev} testId="button-tour-prev">
                                <ChevronLeft size={18} aria-hidden />
                            </ControlButton>
                            <ControlButton label="Next slide" onClick={next} testId="button-tour-next" primary>
                                <ChevronRight size={18} aria-hidden />
                            </ControlButton>
                            {autoplay && (
                                <ControlButton
                                    label={userPaused ? 'Play autoplay' : 'Pause autoplay'}
                                    onClick={() => setUserPaused(p => !p)}
                                    testId="button-tour-toggle"
                                >
                                    {userPaused ? <Play size={15} aria-hidden /> : <Pause size={15} aria-hidden />}
                                </ControlButton>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stage: the active slide is centred, its neighbours peek in from the sides */}
                <div
                    className="mt-4 touch-pan-y select-none overflow-hidden py-8"
                    aria-live={playing ? 'off' : 'polite'}
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerCancel}
                >
                    <div
                        className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] [--gap:12px] [--w:92%] sm:[--gap:20px] sm:[--w:min(86%,1120px)] motion-reduce:transition-none"
                        style={{
                            gap: 'var(--gap)',
                            transform: `translateX(calc((100% - var(--w)) / 2 - ${index} * (var(--w) + var(--gap))))`,
                        }}
                    >
                        {slides.map((slide, i) => {
                            const active = i === index;
                            return (
                                <div
                                    key={slide.id}
                                    id={`tour-panel-${slide.id}`}
                                    role="tabpanel"
                                    aria-roledescription="slide"
                                    aria-labelledby={`tour-tab-${slide.id}`}
                                    aria-hidden={!active}
                                    onClick={() => {
                                        if (swiped.current) { swiped.current = false; return; }
                                        if (!active) go(i);
                                    }}
                                    className={`relative aspect-[1919/939] overflow-hidden rounded-2xl border border-[#dfe4d8] bg-white shadow-[0_24px_60px_-24px_rgba(24,28,23,0.35)] transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none ${active ? 'scale-100 opacity-100' : 'scale-[0.96] cursor-pointer opacity-40 hover:opacity-60'
                                        }`}
                                    style={{ flex: '0 0 var(--w)' }}
                                    data-testid={`slide-${slide.id}`}
                                >
                                    <SlideMedia slide={slide} active={active} play={active && inView && !reducedMotion} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step tabs with progress bars */}
                <div className="px-6 sm:px-12 lg:px-[8%]">
                    <div
                        role="tablist"
                        aria-label="Product tour steps"
                        onKeyDown={onTabKeyDown}
                        className="mx-auto mt-4 grid max-w-[1280px] gap-5 sm:gap-6 sm:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
                        style={{ '--n': count } as CSSProperties}
                    >
                        {slides.map((slide, i) => {
                            const active = i === index;
                            const duration = slide.duration ?? DEFAULT_DURATION;

                            let fillStyle: CSSProperties;
                            if (i < index) fillStyle = { transform: 'scaleX(1)' };
                            else if (!active) fillStyle = { transform: 'scaleX(0)' };
                            else if (!autoplay) fillStyle = { transform: 'scaleX(1)' };
                            else {
                                fillStyle = {
                                    animation: `zana-tour-progress ${duration}ms linear forwards`,
                                    animationPlayState: playing ? 'running' : 'paused',
                                };
                            }

                            return (
                                <button
                                    key={slide.id}
                                    ref={el => { tabRefs.current[i] = el; }}
                                    type="button"
                                    role="tab"
                                    id={`tour-tab-${slide.id}`}
                                    aria-selected={active}
                                    aria-controls={`tour-panel-${slide.id}`}
                                    tabIndex={active ? 0 : -1}
                                    onClick={() => go(i)}
                                    data-testid={`tab-tour-${slide.id}`}
                                    className="group text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#181c17]"
                                >
                                    <span className="relative block h-[2px] overflow-hidden rounded-full bg-[#d3d9cc]">
                                        <span
                                            className="absolute inset-0 origin-left bg-[#181c17]"
                                            style={fillStyle}
                                            onAnimationEnd={active && autoplay ? next : undefined}
                                        />
                                    </span>
                                    <span className="mt-4 grid grid-cols-[auto_1fr] gap-x-3">
                                        <span className="pt-[5px] font-mono text-[11px] tracking-[0.14em] text-[#8a9087]">
                                            {pad(i + 1)}
                                        </span>
                                        <span
                                            className={`text-[17px] font-medium leading-snug transition-colors duration-200 ${active ? 'text-[#181c17]' : 'text-[#7a8077] group-hover:text-[#181c17]'
                                                }`}
                                        >
                                            {slide.title}
                                        </span>
                                        <span
                                            className={`col-start-2 mt-1 text-[15px] leading-relaxed text-[#5f655e] ${active ? 'block' : 'hidden sm:block'
                                                }`}
                                        >
                                            {slide.description}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
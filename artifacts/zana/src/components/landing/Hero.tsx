import { Link } from 'wouter';
import { ArrowRight, BellRing, Columns3, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Feature = { icon: LucideIcon; title: string; description: string };

// Copy lives next to the markup so it is easy to edit without touching layout.
const features: Feature[] = [
    {
        icon: Columns3,
        title: 'Boards',
        description: 'Move work from not started to complete on one clear board.',
    },
    {
        icon: BellRing,
        title: 'Due dates & reminders',
        description: 'Get a nudge before a task is due, in the app and by email.',
    },
    {
        icon: Users,
        title: 'Teams & invites',
        description: 'Invite people by email and assign every task to an owner.',
    },
];

function FeatureRow({ icon: Icon, title, description }: Feature) {
    return (
        <li className="flex gap-4 rounded-2xl px-5 py-5 transition-colors duration-200 hover:bg-[color:var(--z-row-hover)]">
            <Icon size={18} strokeWidth={1.8} className="mt-[3px] shrink-0 text-[color:var(--z-fg)]" aria-hidden />
            <div>
                <h3 className="text-[17px] font-medium leading-snug text-[color:var(--z-fg)]">{title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-[color:var(--z-muted)]">{description}</p>
            </div>
        </li>
    );
}

export default function Hero() {
    return (
        <section className="px-3 pb-3 sm:px-5 sm:pb-5" aria-labelledby="hero-heading">
            <div className="rounded-[28px] bg-[color:var(--z-panel)] px-6 py-16 sm:px-12 sm:py-20 lg:px-[8%] lg:py-28">
                <div className="mx-auto grid max-w-[1280px] items-center gap-14 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
                    {/* Left: message + calls to action */}
                    <div>
                        <h1
                            id="hero-heading"
                            className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-[color:var(--z-fg)]"
                            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
                        >
                            Project management that keeps the important work moving.
                        </h1>

                        <p className="mt-8 max-w-[34rem] text-[clamp(1.05rem,1.6vw,1.375rem)] leading-[1.55] text-[color:var(--z-muted)]">
                            Zana is a quiet workspace for planning projects, assigning tasks, and tracking
                            progress on one board, with reminders so nothing slips.
                        </p>

                        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/signup"
                                data-testid="link-hero-start"
                                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[color:var(--z-fg)] px-8 text-base font-semibold text-[color:var(--z-bg)] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--z-fg)]"
                            >
                                Start free
                                <ArrowRight size={16} aria-hidden />
                            </Link>
                            <a
                                href="#features"
                                data-testid="link-hero-features"
                                className="inline-flex h-14 items-center justify-center rounded-xl border border-[color:var(--z-border)] bg-[color:var(--z-surface)] px-8 text-base font-semibold text-[color:var(--z-fg)] transition-colors hover:bg-[color:var(--z-surface-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--z-fg)]"
                            >
                                See how it works
                            </a>
                        </div>
                    </div>

                    {/* Right: feature summary */}
                    <ul className="flex flex-col gap-1 lg:pl-4">
                        {features.map(f => (
                            <FeatureRow key={f.title} {...f} />
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

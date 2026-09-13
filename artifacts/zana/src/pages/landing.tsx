import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { HowItWorks } from '@/components/ui/how-it-works';
import { OrbScene } from '@/components/ui/orb-scene';

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};


export default function Landing() {
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const headlineY = useTransform(scrollYProgress, [0, 1], [0, -60]);
    const heroFade = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

    return (
        <div className="min-h-dvh bg-background text-foreground overflow-x-hidden">
            {/* ---------- Nav ---------- */}
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur sm:px-10">
                <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-mono text-xs font-medium text-primary-foreground">za</span>
                    <span className="text-lg font-extrabold tracking-tight">zana</span>
                </div>
                <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
                    <a href="#features" className="transition-colors hover:text-foreground">Features</a>
                    <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
                </nav>
                <div className="flex items-center gap-3 sm:gap-4">
                    <ThemeToggle />
                    <Link href="/signin" className="text-sm font-semibold hover:underline" data-testid="link-signin-nav">
                        Sign in
                    </Link>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 sm:text-sm"
                        data-testid="link-create-account-nav"
                    >
                        Create account
                    </Link>
                </div>
            </header>

            {/* ---------- Hero ---------- */}
            <section ref={heroRef} className="relative isolate overflow-hidden px-6 pb-24 pt-16 sm:px-10 sm:pt-24">
                <motion.div style={{ opacity: heroFade }} className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute right-[2%] top-[-20px] h-[380px] w-[380px] opacity-90 sm:right-[4%] sm:top-[10px] sm:h-[480px] sm:w-[480px] lg:h-[560px] lg:w-[560px]">
                        <OrbScene className="h-full w-full" />
                    </div>
                </motion.div>

                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                    A quieter way to work
                </motion.p>

                <motion.h1
                    style={{ y: headlineY }}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl lg:text-8xl"
                >
                    Make room for
                    <br />
                    the important work.
                </motion.h1>

                <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.1 }}
                    className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                    Zana keeps projects focused, tasks moving, and collaboration close to the work — without the noise. Free, forever.
                </motion.p>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: 0.2 }}
                    className="mt-8 flex flex-wrap items-center gap-5"
                >
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
                        data-testid="link-create-account"
                    >
                        Create your account
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <span className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/signin" className="font-semibold text-foreground underline" data-testid="link-signin-inline">
                            Sign in
                        </Link>
                    </span>
                </motion.div>

                {/* Stat row — real value props, not fabricated usage numbers */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-80px' }}
                    className="mt-16 grid max-w-2xl grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4"
                >
                    {[
                        { value: 'Free', label: 'Forever' },
                        { value: '∞', label: 'Projects & tasks' },
                        { value: '1-click', label: 'Team invites' },
                        { value: 'B/W', label: 'Focus-first design' },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div className="text-2xl font-extrabold tracking-tight sm:text-3xl">{stat.value}</div>
                            <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ---------- Mission statement ---------- */}
            <motion.section
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-100px' }}
                className="border-y border-border bg-muted/30 px-6 py-20 text-center sm:px-10 sm:py-28"
            >
                <p className="mx-auto max-w-3xl text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    We help you make room for the work that matters —
                    <span className="text-muted-foreground"> without the tools built for teams ten times your size.</span>
                </p>
            </motion.section>

            {/* ---------- Feature split ---------- */}
            <section id="features" className="grid grid-cols-1 items-center gap-10 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-2 lg:gap-16">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-100px' }}
                >
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Built for focus</p>
                    <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                        A clear board for clear thinking.
                    </h2>
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Every project gets a simple three-column board — not started, in progress, complete. No configuration,
                        no clutter, no learning curve. Just the next thing that needs doing.
                    </p>
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-border bg-[#111] p-6 text-[#f8f7f3] sm:p-8"
                >
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                        <span>Product launch</span>
                        <span>03 / 08</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                        A clear board for clear thinking.
                    </h3>
                    <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-wide text-white/50">
                        <span>Not started 01</span>
                        <span>In progress 02</span>
                        <span>Complete 02</span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {[
                            { title: 'Research onboarding friction', by: 'Maya' },
                            { title: 'Write the release brief', by: 'Jordan' },
                            { title: 'Confirm pricing copy', by: null },
                        ].map((task) => (
                            <div key={task.title} className="rounded-lg border border-white/10 p-3 text-xs">
                                <p className="font-semibold leading-snug">{task.title}</p>
                                <p className="mt-3 text-white/40">{task.by ? `Assigned to ${task.by}` : 'Finished recently'}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-mono uppercase tracking-wide text-white/50">
                        <span>3 people on this project</span>
                        <div className="flex -space-x-1.5">
                            {['JL', 'MC', 'OH'].map((i) => (
                                <span key={i} className="grid h-6 w-6 place-items-center rounded-full border border-white/20 bg-[#1a1a1a] text-[9px]">
                                    {i}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ---------- Existing How It Works section ---------- */}
            <div id="how-it-works">
                <HowItWorks />
            </div>

            {/* ---------- Closing CTA ---------- */}
            <motion.section
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-100px' }}
                className="border-t border-border px-6 py-20 text-center sm:px-10 sm:py-28"
            >
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Ready to make room?</h2>
                <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
                    Free forever. No credit card. Just a clearer way to move projects forward.
                </p>
                <Link
                    href="/signup"
                    className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
                    data-testid="link-create-account-footer"
                >
                    Create your account
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </motion.section>

            <footer className="flex flex-col gap-2 border-t border-border px-6 py-6 text-[10px] font-mono uppercase tracking-wide text-muted-foreground sm:flex-row sm:justify-between sm:px-10">
                <span>Personal project management, pared back.</span>
                <span>Black / White / Focus</span>
            </footer>
        </div>
    );
}
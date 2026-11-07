import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useRef } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { HowItWorks } from '@/components/ui/how-it-works';
import { OrbScene } from '@/components/ui/orb-scene';
import Logo from '@/components/landing/Logo';
import { useTheme } from '@/hooks/use-theme';
import NavBar from '../components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import ProductCarousel from '@/components/landing/ProductCarousel';
import FeatureMarquee from '../components/landing/Featuremarquee';
import Solutions from '@/components/landing/Solutions';

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
            <NavBar />

            {/* ---------- Hero ---------- */}
            <Hero />

            {/* ---------- Product carousel ---------- */}
            <ProductCarousel />

            {/* ---------- Feature marquees ---------- */}
            <FeatureMarquee />

            {/* ---------- Solutions ---------- */}
            <Solutions />

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
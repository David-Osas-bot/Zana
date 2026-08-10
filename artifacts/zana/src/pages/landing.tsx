import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Landing() {
    return (
        <div className="min-h-dvh bg-background text-foreground">
            <header className="flex items-center justify-between px-6 py-5 sm:px-10">
                <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-mono text-xs font-medium text-primary-foreground">za</span>
                    <span className="text-lg font-extrabold tracking-tight">zana</span>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/signin" className="text-sm font-semibold hover:underline" data-testid="link-signin-nav">
                        Sign in
                    </Link>
                </div>
            </header>

            <main className="grid grid-cols-1 items-center gap-10 px-6 pb-16 pt-8 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:pt-16">
                <div>
                    <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">A quieter way to work</p>
                    <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl">
                        Make room for the important work.
                    </h1>
                    <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                        Zana keeps projects focused, tasks moving, and collaboration close to the work — without the noise.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-5">
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
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-[#111] p-6 text-[#f8f7f3] sm:p-8">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                        <span>Product launch</span>
                        <span>03 / 08</span>
                    </div>
                    <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                        A clear board for clear thinking.
                    </h2>
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
                </div>
            </main>

            <footer className="flex flex-col gap-2 border-t border-border px-6 py-6 text-[10px] font-mono uppercase tracking-wide text-muted-foreground sm:flex-row sm:justify-between sm:px-10">
                <span>Personal project management, pared back.</span>
                <span>Black / White / Focus</span>
            </footer>
        </div>
    );
}
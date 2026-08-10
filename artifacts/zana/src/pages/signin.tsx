import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { signIn } from '@/lib/auth';
import { useInvalidateSession } from '@/hooks/use-session';

export default function SignIn() {
    const [, setLocation] = useLocation();
    const invalidateSession = useInvalidateSession();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const submit = async () => {
        if (!email || !password) return;
        setPending(true);
        setError(null);
        try {
            await signIn(email, password);
            await invalidateSession();
            setLocation('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="min-h-dvh bg-background text-foreground">
            <header className="flex items-center justify-between px-6 py-5 sm:px-10">
                <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-mono text-xs font-medium text-primary-foreground">za</span>
                    <span className="text-lg font-extrabold tracking-tight">zana</span>
                </Link>
                <ThemeToggle />
            </header>

            <main className="grid grid-cols-1 items-center gap-10 px-6 pb-16 pt-6 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:pt-14">
                <div className="hidden lg:block">
                    <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Personal workspace</p>
                    <h1 className="text-6xl font-extrabold leading-[0.95] tracking-tighter">Welcome back.</h1>
                    <p className="mt-6 max-w-sm text-sm text-muted-foreground">Pick up exactly where you left off.</p>
                </div>

                <div className="mx-auto w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
                    <div className="mb-6 flex flex-col items-center text-center">
                        <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary font-mono text-sm text-primary-foreground">za</span>
                        <h2 className="text-xl font-extrabold tracking-tight">Welcome back</h2>
                        <p className="mt-1 text-xs text-muted-foreground">Sign in to access your workspace</p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive" data-testid="text-signin-error">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="signin-email" className="text-xs font-semibold">Email address</label>
                            <input
                                id="signin-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground"
                                data-testid="input-signin-email"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="signin-password" className="text-xs font-semibold">Password</label>
                            <input
                                id="signin-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submit()}
                                placeholder="Enter your password"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground"
                                data-testid="input-signin-password"
                            />
                        </div>
                        <button
                            onClick={submit}
                            disabled={!email || !password || pending}
                            className="mt-1 w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                            data-testid="button-signin-submit"
                        >
                            {pending ? 'Signing in…' : 'Continue'}
                        </button>
                    </div>

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-semibold text-foreground underline" data-testid="link-go-signup">
                            Sign up
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
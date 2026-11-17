import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import Logo from '@/components/landing/Logo';
import ThemeToggle from '@/components/landing/ThemeToggle';
import AuthShowcase from './AuthShowcase';

const HEADING_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

const css = `
.za-rise { animation: za-rise .7s cubic-bezier(.22,.61,.36,1) calc(var(--i, 0) * 80ms + 60ms) backwards; }
@keyframes za-rise { from { opacity: 0; transform: translateY(16px); } }
@keyframes za-float { from { translate: 0 -8px; } to { translate: 0 8px; } }
.za-float { animation: za-float 7s ease-in-out infinite alternate; animation-delay: calc(var(--i, 0) * -1.7s); }
.za-parallax {
  transform: translate3d(calc(var(--px, 0) * var(--d, 1) * 16px), calc(var(--py, 0) * var(--d, 1) * 16px), 0) rotate(var(--r, 0deg));
  transition: transform .35s cubic-bezier(.22,.61,.36,1);
}
.za-error { color: #dc2626; }
.dark .za-error, [data-theme='dark'] .za-error { color: #f87171; }
@media (prefers-reduced-motion: reduce) {
  .za-rise, .za-float { animation: none; }
  .za-parallax { transition: none; transform: rotate(var(--r, 0deg)); }
}
`;

// Staggers a block in. Wrap each part of the form in <Rise n={...}>.
export function Rise({ n, children, className = '' }: { n: number; children: ReactNode; className?: string }) {
  return (
    <div className={`za-rise ${className}`} style={{ '--i': n } as CSSProperties}>
      {children}
    </div>
  );
}

type AuthLayoutProps = {
  variant: 'signin' | 'signup';
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** The "New to Zana? / Already have an account?" line */
  footer: ReactNode;
};

// Form on the left, a moving product preview on the right (large screens only).
export default function AuthLayout({ variant, eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="z-page min-h-screen">
      <style>{css}</style>

      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex min-h-screen flex-col px-6 py-6 sm:px-10">
          <header className="flex items-center justify-between">
            <Logo />
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </header>

          <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
            <Rise n={0}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--z-muted)]">{eyebrow}</p>
              <h1
                className="mt-4 text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-[color:var(--z-fg)]"
                style={{ fontFamily: HEADING_FONT }}
              >
                {title}
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-[color:var(--z-muted)]">{subtitle}</p>
            </Rise>

            <div className="mt-8">{children}</div>

            <Rise n={6} className="mt-8 text-center text-[15px] text-[color:var(--z-muted)]">
              {footer}
            </Rise>
          </main>

          <footer className="flex items-center justify-between text-[13px] text-[color:var(--z-muted)]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-[color:var(--z-fg)]"
              data-testid="link-auth-home"
            >
              <ArrowLeft size={14} aria-hidden /> Back to home
            </Link>
            <span>© {new Date().getFullYear()} Zana</span>
          </footer>
        </div>

        <aside className="hidden p-4 lg:block" aria-hidden>
          <div className="sticky top-4 h-[calc(100vh-2rem)]">
            <AuthShowcase variant={variant} />
          </div>
        </aside>
      </div>
    </div>
  );
}

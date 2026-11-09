import type { ReactNode } from 'react';
import { Clock } from 'lucide-react';

// Small building blocks that imitate Zana's real screens. They use the theme
// tokens, so every mock follows light and dark mode (screenshots cannot).

export function MockAvatar({ initials, className = '' }: { initials: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color:var(--z-fg)] text-[10px] font-medium text-[color:var(--z-fg)] ${className}`}
    >
      {initials}
    </span>
  );
}

const dueStyles = {
  overdue: 'bg-[color:var(--z-fg)] text-[color:var(--z-bg)]',
  today: 'bg-[color:var(--z-track)] text-[color:var(--z-fg)]',
  later: 'border border-[color:var(--z-border)] bg-[color:var(--z-panel)] text-[color:var(--z-fg)]',
} as const;

// Same three looks as the due badge on real task cards.
export function MockDue({ tone, label }: { tone: keyof typeof dueStyles; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${dueStyles[tone]}`}>
      <Clock size={11} aria-hidden />
      {label}
    </span>
  );
}

export function MockModal({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full max-w-[460px] rounded-2xl border border-[color:var(--z-border)] bg-[color:var(--z-surface)] p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.4)] sm:p-6 ${className}`}
    >
      <h3 className="text-[20px] font-semibold leading-tight tracking-[-0.03em] text-[color:var(--z-fg)]">{title}</h3>
      <p className="mt-1 text-[13px] text-[color:var(--z-muted)]">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--z-muted)]">{children}</p>
  );
}

export function FieldBox({
  children,
  focused = false,
  className = '',
}: {
  children: ReactNode;
  focused?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[42px] items-center gap-2 rounded-xl border bg-[color:var(--z-panel)] px-3 text-[13px] text-[color:var(--z-fg)] transition-colors duration-200 ${
        focused ? 'border-[color:var(--z-fg)]' : 'border-[color:var(--z-border)]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Placeholder({ children }: { children: ReactNode }) {
  return <span className="truncate text-[color:var(--z-muted)]">{children}</span>;
}

export function Caret() {
  return (
    <span
      aria-hidden
      className="ml-px inline-block h-4 w-px bg-[color:var(--z-fg)]"
      style={{ animation: 'zw-caret 1s steps(1) infinite' }}
    />
  );
}

export function MockButton({ children, primary = false, dim = false }: { children: ReactNode; primary?: boolean; dim?: boolean }) {
  return (
    <span
      className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition-opacity duration-300 ${
        primary
          ? 'bg-[color:var(--z-fg)] text-[color:var(--z-bg)]'
          : 'border border-[color:var(--z-border)] bg-[color:var(--z-surface)] text-[color:var(--z-fg)]'
      }`}
      style={{ opacity: dim ? 0.45 : 1 }}
    >
      {children}
    </span>
  );
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

import { useState } from 'react';
import type { InputHTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, TriangleAlert } from 'lucide-react';

const inputBase =
  'h-[54px] w-full rounded-xl border bg-[color:var(--z-surface)] px-4 text-[16px] text-[color:var(--z-fg)] outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[color:var(--z-subtle)] focus:border-[color:var(--z-fg)] focus:shadow-[0_0_0_4px_rgba(127,127,127,0.18)]';

const inputState = (invalid: boolean) =>
  invalid ? 'border-[#dc2626]' : 'border-[color:var(--z-border)]';

type FieldShellProps = { id: string; label: string; error?: string; hint?: ReactNode; children: ReactNode };

function FieldShell({ id, label, error, hint, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[15px] font-medium text-[color:var(--z-fg)]">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="za-error mt-2 text-[13px]">
          {error}
        </p>
      ) : (
        hint && <div className="mt-2 text-[13px] text-[color:var(--z-muted)]">{hint}</div>
      )}
    </div>
  );
}

type AuthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
};

export function AuthField({ id, label, error, hint, className = '', ...props }: AuthFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputBase} ${inputState(!!error)} ${className}`}
        {...props}
      />
    </FieldShell>
  );
}

// Password input with a show/hide button and a Caps Lock warning.
export function PasswordField({ id, label, error, hint, ...props }: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState('CapsLock'));

  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputBase} ${inputState(!!error)} pr-12`}
          onKeyDown={onKey}
          onKeyUp={onKey}
          onBlur={() => setCapsLock(false)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          data-testid={`button-toggle-${id}`}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[color:var(--z-muted)] transition-colors hover:bg-[color:var(--z-panel)] hover:text-[color:var(--z-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--z-fg)]"
        >
          {visible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
        </button>
      </div>
      {capsLock && (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-[color:var(--z-muted)]" role="status">
          <TriangleAlert size={13} aria-hidden /> Caps Lock is on
        </p>
      )}
    </FieldShell>
  );
}

export function scorePassword(password: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!password) return { score: 0, label: '' };
  if (password.length < 8) return { score: 1, label: 'Too short' };
  let score = 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const;
  return { score: score as 1 | 2 | 3 | 4, label: labels[score] };
}

export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = scorePassword(password);
  return (
    <div className="mt-3" aria-live="polite" data-testid="password-strength">
      <div className="flex gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map(n => (
          <span
            key={n}
            className="h-1 flex-1 rounded-full transition-colors duration-300"
            style={{ background: n <= score ? 'var(--z-fg)' : 'var(--z-track)' }}
          />
        ))}
      </div>
      <p className="mt-2 text-[12px] text-[color:var(--z-muted)]">
        {label ? `Password strength: ${label}` : 'Use at least 8 characters.'}
      </p>
    </div>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      data-testid="button-auth-submit"
      className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--z-fg)] text-[16px] font-semibold text-[color:var(--z-bg)] transition-[opacity,transform] duration-200 hover:opacity-85 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--z-fg)]"
    >
      {children}
      {loading ? (
        <Loader2 size={18} className="animate-spin" aria-hidden />
      ) : (
        <ArrowRight size={18} aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </button>
  );
}

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="za-error flex items-start gap-2.5 rounded-xl border border-[#dc2626]/40 bg-[#dc2626]/10 px-4 py-3 text-[14px]"
    >
      <TriangleAlert size={16} aria-hidden className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

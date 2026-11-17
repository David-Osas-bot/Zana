import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'wouter';
import AuthLayout, { Rise } from '@/components/auth/AuthLayout';
import { AuthField, FormAlert, PasswordField, SubmitButton } from '@/components/auth/fields';
import { goToApp, signInWithEmail } from '@/lib/auth-actions';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = { email?: string; password?: string };

export default function SignIn() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const change = (key: keyof Errors) => (e: ChangeEvent<HTMLInputElement>) => {
    setValues(v => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    if (serverError) setServerError(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') return;

    const found: Errors = {};
    if (!EMAIL_RE.test(values.email.trim())) found.email = 'Enter a valid email address.';
    if (!values.password) found.password = 'Enter your password.';
    setErrors(found);
    if (found.email) return document.getElementById('email')?.focus();
    if (found.password) return document.getElementById('password')?.focus();

    setStatus('sending');
    setServerError(null);
    try {
      await signInWithEmail(values.email.trim(), values.password);
      setStatus('success');
      goToApp();
    } catch (err) {
      setServerError(err instanceof Error && err.message ? err.message : 'We could not sign you in. Check your details and try again.');
      setStatus('idle');
    }
  };

  const busy = status !== 'idle';

  return (
    <AuthLayout
      variant="signin"
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Sign in to continue to your workspace."
      footer={
        <>
          New to Zana?{' '}
          <Link href="/signup" className="font-semibold text-[color:var(--z-fg)] underline-offset-4 hover:underline" data-testid="link-to-signup">
            Create an account
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={onSubmit} aria-busy={busy} className="space-y-5">
        {serverError && <FormAlert>{serverError}</FormAlert>}

        <Rise n={1}>
          <AuthField
            id="email"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={change('email')}
            error={errors.email}
            autoFocus
          />
        </Rise>

        <Rise n={2}>
          <PasswordField
            id="password"
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            value={values.password}
            onChange={change('password')}
            error={errors.password}
          />
        </Rise>

        <Rise n={3} className="pt-1">
          <SubmitButton loading={busy}>
            {status === 'success' ? 'Redirecting…' : status === 'sending' ? 'Signing in…' : 'Sign in'}
          </SubmitButton>
        </Rise>
      </form>
    </AuthLayout>
  );
}

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'wouter';
import AuthLayout, { Rise } from '@/components/auth/AuthLayout';
import { AuthField, FormAlert, PasswordField, PasswordStrength, SubmitButton } from '@/components/auth/fields';
import { goToApp, signUpWithEmail } from '@/lib/auth-actions';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Match whatever your backend enforces.
const MIN_PASSWORD = 8;

type Errors = { name?: string; email?: string; password?: string };

export default function SignUp() {
  const [values, setValues] = useState({ name: '', email: '', password: '' });
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
    if (!values.name.trim()) found.name = 'Enter your name.';
    if (!EMAIL_RE.test(values.email.trim())) found.email = 'Enter a valid email address.';
    if (values.password.length < MIN_PASSWORD) found.password = `Use at least ${MIN_PASSWORD} characters.`;
    setErrors(found);
    const first = (['name', 'email', 'password'] as const).find(k => found[k]);
    if (first) return document.getElementById(first)?.focus();

    setStatus('sending');
    setServerError(null);
    try {
      await signUpWithEmail(values.name.trim(), values.email.trim(), values.password);
      setStatus('success');
      goToApp();
    } catch (err) {
      setServerError(err instanceof Error && err.message ? err.message : 'We could not create your account. Please try again.');
      setStatus('idle');
    }
  };

  const busy = status !== 'idle';

  return (
    <AuthLayout
      variant="signup"
      eyebrow="Create account"
      title="Start with Zana"
      subtitle="Create your account and set up your first project."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/signin" className="font-semibold text-[color:var(--z-fg)] underline-offset-4 hover:underline" data-testid="link-to-signin">
            Sign in
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={onSubmit} aria-busy={busy} className="space-y-5">
        {serverError && <FormAlert>{serverError}</FormAlert>}

        <Rise n={1}>
          <AuthField
            id="name"
            label="Full name"
            autoComplete="name"
            placeholder="First and last name"
            value={values.name}
            onChange={change('name')}
            error={errors.name}
            autoFocus
          />
        </Rise>

        <Rise n={2}>
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
          />
        </Rise>

        <Rise n={3}>
          <PasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={values.password}
            onChange={change('password')}
            error={errors.password}
          />
          <PasswordStrength password={values.password} />
        </Rise>

        <Rise n={4} className="pt-1">
          <SubmitButton loading={busy}>
            {status === 'success' ? 'Redirecting…' : status === 'sending' ? 'Creating account…' : 'Create account'}
          </SubmitButton>
        </Rise>
      </form>
    </AuthLayout>
  );
}

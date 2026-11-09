import { useState, type FormEvent } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer, { SOCIALS, SocialIcon } from '@/components/landing/Footer';

// Change this to the route your api-server exposes for contact submissions.
const CONTACT_ENDPOINT = '/api/contact';

const css = `
.zc-page {
  --zc-bg: #fcfcf8;
  --zc-fg: #1a1c18;
  --zc-muted: #5f625b;
  --zc-faint: #9a9c95;
  --zc-line: #e3e4dd;
  --zc-error: #b3261e;
  --zc-ok: #1f6b3a;
  background: var(--zc-bg);
  color: var(--zc-fg);
  font-family: inherit;
}
.zc-main { max-width: 1040px; margin: 0 auto; padding: 120px 24px 96px; }
.zc-title { margin: 0; text-align: center; font-size: clamp(40px, 6vw, 56px); font-weight: 500; line-height: 1.1; letter-spacing: -0.03em; }
.zc-lede { margin: 16px 0 0; text-align: center; color: var(--zc-muted); font-size: 16px; }

.zc-grid { display: grid; grid-template-columns: 1fr 1.6fr; max-width: 880px; margin: 72px auto 0; }
.zc-info { padding-right: 48px; border-right: 1px solid var(--zc-line); }
.zc-form-col { padding-left: 32px; }

.zc-h2 { margin: 0 0 16px; font-size: 20px; font-weight: 500; letter-spacing: -0.02em; }
.zc-block + .zc-block { margin-top: 40px; }
.zc-address { font-style: normal; color: var(--zc-muted); font-size: 18px; line-height: 1.6; }
.zc-mail { margin: 0 0 16px; }
.zc-mail span { display: block; font-size: 16px; }
.zc-mail a { color: var(--zc-muted); font-size: 18px; text-decoration: none; }
.zc-mail a:hover { color: var(--zc-fg); text-decoration: underline; }

.zc-socials { display: flex; gap: 20px; padding: 0; margin: 0; list-style: none; }
.zc-social { display: grid; place-items: center; width: 28px; height: 28px; color: var(--zc-muted); }
.zc-social:hover { color: var(--zc-fg); }

.zc-form { display: grid; gap: 20px; }
.zc-label { display: block; margin-bottom: 6px; font-size: 15px; font-weight: 500; }
.zc-opt { color: var(--zc-faint); font-weight: 400; }
.zc-input, .zc-textarea {
  width: 100%; padding: 12px 14px; box-sizing: border-box;
  background: var(--zc-bg); color: var(--zc-fg);
  border: 1px solid var(--zc-line); border-radius: 8px;
  font: inherit; font-size: 15px;
}
.zc-input::placeholder, .zc-textarea::placeholder { color: var(--zc-faint); }
.zc-textarea { min-height: 120px; resize: vertical; }
.zc-input:focus-visible, .zc-textarea:focus-visible { outline: none; border-color: var(--zc-fg); }
.zc-input[aria-invalid="true"], .zc-textarea[aria-invalid="true"] { border-color: var(--zc-error); }
.zc-err { margin: 6px 0 0; color: var(--zc-error); font-size: 13px; }

.zc-actions { display: flex; align-items: center; justify-content: flex-end; gap: 16px; }
.zc-status { margin: 0 auto 0 0; font-size: 14px; }
.zc-status[data-state="ok"] { color: var(--zc-ok); }
.zc-status[data-state="error"] { color: var(--zc-error); }
.zc-submit {
  padding: 12px 28px; border: 0; border-radius: 10px; cursor: pointer;
  background: var(--zc-fg); color: var(--zc-bg);
  font: inherit; font-size: 16px; font-weight: 600;
}
.zc-submit:disabled { opacity: .6; cursor: progress; }
.zc-submit:focus-visible, .zc-social:focus-visible { outline: 2px solid var(--zc-fg); outline-offset: 2px; }
.zc-hp { position: absolute; left: -9999px; }

@media (max-width: 760px) {
  .zc-grid { grid-template-columns: 1fr; margin-top: 48px; }
  .zc-info { padding: 0 0 40px; border-right: 0; border-bottom: 1px solid var(--zc-line); }
  .zc-form-col { padding: 40px 0 0; }
}
`;

type Values = {
    name: string;
    email: string;
    company: string;
    employees: string;
    message: string;
    website: string; // honeypot
};

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;
type Status = { state: 'idle' | 'sending' | 'ok' | 'error'; text: string };

const EMPTY: Values = { name: '', email: '', company: '', employees: '', message: '', website: '' };

function validate(v: Values): Errors {
    const errors: Errors = {};
    if (!v.name.trim()) errors.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'Enter a valid email address.';
    if (!v.message.trim()) errors.message = 'Write a message so we know how to help.';
    return errors;
}

export default function Contact() {
    const [values, setValues] = useState<Values>(EMPTY);
    const [errors, setErrors] = useState<Errors>({});
    const [status, setStatus] = useState<Status>({ state: 'idle', text: '' });

    const set = (key: keyof Values) => (e: { target: { value: string } }) =>
        setValues((prev) => ({ ...prev, [key]: e.target.value }));

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (values.website) return; // bot

        const found = validate(values);
        setErrors(found);
        if (Object.keys(found).length) return;

        setStatus({ state: 'sending', text: '' });
        try {
            const res = await fetch(CONTACT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    company: values.company.trim(),
                    employees: values.employees.trim(),
                    message: values.message.trim(),
                }),
            });
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            setValues(EMPTY);
            setStatus({ state: 'ok', text: 'Message sent. We’ll reply within a day.' });
        } catch {
            setStatus({
                state: 'error',
                text: 'Couldn’t send your message. Try again, or email us directly.',
            });
        }
    }

    const sending = status.state === 'sending';

    return (
        <div className="zc-page">
            <style>{css}</style>
            <Navbar />

            <main className="zc-main">
                <h1 className="zc-title">Contact us</h1>
                <p className="zc-lede">Tell us what you’re building — we usually reply within a day.</p>

                <div className="zc-grid">
                    <section className="zc-info" aria-label="Company details">
                        <div className="zc-block">
                            <h2 className="zc-h2">Corporate office</h2>
                            <address className="zc-address">
                                Level 5, 120 Collins Street
                                <br />
                                Melbourne VIC 3000, Australia
                            </address>
                        </div>

                        <div className="zc-block">
                            <h2 className="zc-h2">Email us</h2>
                            <p className="zc-mail">
                                <span>Careers</span>
                                <a href="mailto:aituayuwaosas@gmail.com">aituayuwaosas@gmail.com</a>
                            </p>
                            <p className="zc-mail">
                                <span>Press</span>
                                <a href="mailto:davidosas011@gmail.com">davidosas011@gmail.com</a>
                            </p>
                        </div>

                        <div className="zc-block">
                            <h2 className="zc-h2">Follow us</h2>
                            <ul className="zc-socials">
                                {SOCIALS.map((s) => (
                                    <li key={s.label}>
                                        <a
                                            className="zc-social"
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={s.label}
                                        >
                                            <SocialIcon name={s.icon} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="zc-form-col" aria-label="Inquiries">
                        <h2 className="zc-h2">Inquiries</h2>
                        <form className="zc-form" onSubmit={onSubmit} noValidate>
                            <div>
                                <label className="zc-label" htmlFor="zc-name">Full name</label>
                                <input
                                    id="zc-name"
                                    className="zc-input"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="First and last name"
                                    value={values.name}
                                    onChange={set('name')}
                                    aria-invalid={errors.name ? true : undefined}
                                    aria-describedby={errors.name ? 'zc-name-err' : undefined}
                                />
                                {errors.name && <p id="zc-name-err" className="zc-err" role="alert">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="zc-label" htmlFor="zc-email">Work email address</label>
                                <input
                                    id="zc-email"
                                    className="zc-input"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="me@example.com"
                                    value={values.email}
                                    onChange={set('email')}
                                    aria-invalid={errors.email ? true : undefined}
                                    aria-describedby={errors.email ? 'zc-email-err' : undefined}
                                />
                                {errors.email && <p id="zc-email-err" className="zc-err" role="alert">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="zc-label" htmlFor="zc-company">
                                    Company name <span className="zc-opt">(optional)</span>
                                </label>
                                <input
                                    id="zc-company"
                                    className="zc-input"
                                    type="text"
                                    autoComplete="organization"
                                    placeholder="Company name"
                                    value={values.company}
                                    onChange={set('company')}
                                />
                            </div>

                            <div>
                                <label className="zc-label" htmlFor="zc-employees">
                                    Number of employees <span className="zc-opt">(optional)</span>
                                </label>
                                <input
                                    id="zc-employees"
                                    className="zc-input"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="e.g. 25"
                                    value={values.employees}
                                    onChange={set('employees')}
                                />
                            </div>

                            <div>
                                <label className="zc-label" htmlFor="zc-message">Your message</label>
                                <textarea
                                    id="zc-message"
                                    className="zc-textarea"
                                    placeholder="Write your message"
                                    value={values.message}
                                    onChange={set('message')}
                                    aria-invalid={errors.message ? true : undefined}
                                    aria-describedby={errors.message ? 'zc-message-err' : undefined}
                                />
                                {errors.message && <p id="zc-message-err" className="zc-err" role="alert">{errors.message}</p>}
                            </div>

                            {/* Honeypot: real users never see or fill this */}
                            <input
                                className="zc-hp"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden="true"
                                value={values.website}
                                onChange={set('website')}
                            />

                            <div className="zc-actions">
                                <p className="zc-status" data-state={status.state} role="status" aria-live="polite">
                                    {status.text}
                                </p>
                                <button className="zc-submit" type="submit" disabled={sending}>
                                    {sending ? 'Sending…' : 'Send message'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
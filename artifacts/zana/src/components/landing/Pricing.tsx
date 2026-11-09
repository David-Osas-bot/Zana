import { useState } from 'react';

type Plan = {
    name: string;
    tagline: string;
    monthly: number;
    annual: number;
    cta: string;
    href: string;
    featured?: boolean;
    features: string[];
};

const PLANS: Plan[] = [
    {
        name: 'Free',
        tagline: 'For small teams getting started',
        monthly: 0,
        annual: 0,
        cta: 'Get started',
        href: '/signup',
        features: ['Unlimited members', '2 teams', '500 issues', 'Slack & GitHub'],
    },
    {
        name: 'Team',
        tagline: 'For growing product orgs',
        monthly: 8,
        annual: 60,
        cta: 'Start 14-day trial',
        href: '/signup',
        featured: true,
        features: [
            'Zana AI',
            'Unlimited teams & issues',
            'Velocity insights',
            'Roadmaps',
            'Priority support',
        ],
    },
    {
        name: 'Enterprise',
        tagline: 'For regulated & large orgs',
        monthly: 15,
        annual: 120,
        cta: 'Talk to sales',
        href: '/contact',
        features: [
            'SAML & SCIM SSO',
            'Audit log & SLA',
            'Advanced security',
            'Dedicated support',
            'Custom onboarding',
        ],
    },
];

const HEADING_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const SAVINGS_LABEL = 'save 37%';

// Same approach as Solutions.tsx / Customervoices.tsx: all styling lives in one block.
// Colors are variables on .pricing-section so the dark theme only overrides them once.
const css = `
.pricing-section {
  --pr-bg: #ffffff;
  --pr-ink: #0a0a0a;
  --pr-muted: #5f5f5f;
  --pr-card: #ffffff;
  --pr-border: #e5e5e5;
  --pr-accent: #0a0a0a;
  --pr-accent-ink: #ffffff;
  --pr-savings: #0a0a0a;
  background: var(--pr-bg);
  color: var(--pr-ink);
  padding: 5rem 1.5rem 6rem;
}
.dark .pricing-section {
  --pr-accent: #fafafa;
  --pr-accent-ink: #0a0a0a;
  --pr-bg: #0a0a0a;
  --pr-ink: #fafafa;
  --pr-muted: #a1a1a1;
  --pr-card: #111111;
  --pr-border: #262626;
  --pr-savings: #fafafa;
}

.pricing-head { text-align: center; max-width: 52rem; margin: 0 auto; }
.pricing-eyebrow { font-size: .8rem; letter-spacing: .08em; color: var(--pr-muted); }
.pricing-title {
  margin: 1rem 0 0;
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  line-height: 1.02;
  letter-spacing: -0.035em;
  font-weight: 600;
}
.pricing-sub {
  margin: 1.25rem auto 0;
  max-width: 40rem;
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--pr-muted);
}

.pricing-toggle {
  display: inline-flex;
  align-items: center;
  gap: .75rem;
  margin-top: 2rem;
  padding: .55rem 1.1rem;
  border: 1px solid var(--pr-border);
  border-radius: 999px;
  background: var(--pr-card);
  font-size: .95rem;
}
.pricing-toggle button.pricing-label {
  all: unset;
  cursor: pointer;
  font-weight: 500;
  color: var(--pr-muted);
}
.pricing-toggle button.pricing-label[aria-pressed="true"] { color: var(--pr-ink); }
.pricing-save { font-size: .8rem; color: var(--pr-savings); margin-left: .25rem; }

.pricing-switch {
  all: unset;
  position: relative;
  width: 2.8rem;
  height: 1.5rem;
  border-radius: 999px;
  background: var(--pr-border);
  cursor: pointer;
  transition: background .2s ease;
}
.pricing-switch[aria-checked="true"] { background: var(--pr-ink); }
.pricing-switch::after {
  content: '';
  position: absolute;
  top: .2rem;
  left: .2rem;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.25);
  transition: transform .2s cubic-bezier(.22,.61,.36,1);
}
.pricing-switch[aria-checked="true"]::after { transform: translateX(1.3rem); }
.pricing-switch:focus-visible,
.pricing-toggle button.pricing-label:focus-visible,
.pricing-cta:focus-visible { outline: 2px solid var(--pr-accent); outline-offset: 3px; }

.pricing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
  max-width: 80rem;
  margin: 3.5rem auto 0;
}
@media (min-width: 900px) {
  .pricing-grid { grid-template-columns: repeat(3, 1fr); }
}

.pricing-card {
  position: relative;
  padding: 1.75rem 1.9rem 2.1rem;
  border: 1px solid var(--pr-border);
  border-radius: 1.25rem;
  background: var(--pr-card);
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
}
/* The featured card sits slightly taller than its neighbours */
.pricing-card[data-featured="true"] {
  border-color: color-mix(in srgb, var(--pr-ink) 35%, var(--pr-border));
  box-shadow: 0 8px 24px rgba(0,0,0,.08);
  margin-top: -.6rem;
  padding-bottom: 2.7rem;
}
.pricing-badge {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  padding: .3rem 1rem;
  border-radius: 0 0 .75rem .75rem;
  background: var(--pr-accent);
  color: var(--pr-accent-ink);
  font-size: .85rem;
  font-weight: 600;
}

.pricing-name { margin: 0; font-size: 1.7rem; font-weight: 500; letter-spacing: -0.02em; }
.pricing-tagline { margin: .5rem 0 0; color: var(--pr-muted); }
.pricing-price { margin-top: 1.75rem; display: flex; align-items: baseline; gap: .5rem; flex-wrap: wrap; }
.pricing-amount { font-size: 2.6rem; font-weight: 600; letter-spacing: -0.03em; line-height: 1; }
.pricing-unit { flex-basis: 100%; margin-top: .4rem; font-size: .95rem; color: var(--pr-muted); min-height: 1.4em; }

.pricing-cta {
  display: block;
  width: 100%;
  margin-top: 1.25rem;
  padding: .95rem 1rem;
  border: 1px solid var(--pr-border);
  border-radius: .8rem;
  background: var(--pr-bg);
  color: var(--pr-ink);
  text-align: center;
  font-weight: 600;
  text-decoration: none;
  transition: background .15s ease, border-color .15s ease;
}
.pricing-cta:hover { border-color: var(--pr-ink); }
.pricing-cta[data-primary="true"] { background: var(--pr-ink); border-color: var(--pr-ink); color: var(--pr-bg); }
.pricing-cta[data-primary="true"]:hover { background: color-mix(in srgb, var(--pr-ink) 85%, var(--pr-bg)); }

.pricing-features { list-style: none; margin: 1.75rem 0 0; padding: 0; display: grid; gap: .95rem; }
.pricing-features li { display: flex; align-items: center; gap: .85rem; font-size: .98rem; color: var(--pr-ink); }
.pricing-check { flex: none; color: var(--pr-ink); }
.pricing-card[data-featured="true"] .pricing-check { color: var(--pr-accent); }

@media (prefers-reduced-motion: reduce) {
  .pricing-switch, .pricing-switch::after, .pricing-cta { transition: none; }
}
`;

function Check() {
    return (
        <svg
            className="pricing-check"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

export default function Pricing() {
    const [annual, setAnnual] = useState(false);

    return (
        <section id="pricing" className="pricing-section" aria-labelledby="pricing-title">
            <style>{css}</style>

            <div className="pricing-head">
                <p className="pricing-eyebrow">PLANS</p>
                <h2 id="pricing-title" className="pricing-title" style={{ fontFamily: HEADING_FONT }}>
                    Simple pricing that scales with your team
                </h2>
                <p className="pricing-sub">
                    Start free, upgrade when you need AI triage, unlimited issues, and enterprise
                    controls. No surprise fees.
                </p>

                <div className="pricing-toggle">
                    <button
                        type="button"
                        className="pricing-label"
                        aria-pressed={!annual}
                        onClick={() => setAnnual(false)}
                    >
                        Monthly
                    </button>
                    <button
                        type="button"
                        role="switch"
                        className="pricing-switch"
                        aria-checked={annual}
                        aria-label="Bill annually"
                        onClick={() => setAnnual((v) => !v)}
                    />
                    <button
                        type="button"
                        className="pricing-label"
                        aria-pressed={annual}
                        onClick={() => setAnnual(true)}
                    >
                        Annual <span className="pricing-save">({SAVINGS_LABEL})</span>
                    </button>
                </div>
            </div>

            <div className="pricing-grid">
                {PLANS.map((plan) => {
                    const price = annual ? plan.annual : plan.monthly;
                    const isFree = plan.monthly === 0;
                    return (
                        <article
                            key={plan.name}
                            className="pricing-card"
                            data-featured={plan.featured ? 'true' : 'false'}
                        >
                            {plan.featured && <span className="pricing-badge">Most popular</span>}

                            <h3 className="pricing-name" style={{ fontFamily: HEADING_FONT }}>
                                {plan.name}
                            </h3>
                            <p className="pricing-tagline">{plan.tagline}</p>

                            <div className="pricing-price">
                                <span className="pricing-amount" style={{ fontFamily: HEADING_FONT }}>
                                    ${price}
                                </span>
                                <span className="pricing-unit">
                                    {isFree ? '' : annual ? 'per user / yr' : 'per user / mo'}
                                </span>
                            </div>

                            <a
                                href={plan.href}
                                className="pricing-cta"
                                data-primary={plan.featured ? 'true' : 'false'}
                            >
                                {plan.cta}
                            </a>

                            <ul className="pricing-features">
                                {plan.features.map((feature) => (
                                    <li key={feature}>
                                        <Check />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
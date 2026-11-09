import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

type Category = 'Product' | 'Plans & billing' | 'Integrations' | 'Security & support';

type FaqItem = {
    id: string;
    category: Category;
    question: string;
    answer: string;
};

const CATEGORIES: Array<'All' | Category> = [
    'All',
    'Product',
    'Plans & billing',
    'Integrations',
    'Security & support',
];

// TODO: replace with your real support address / route.
const SUPPORT_EMAIL = 'hello@zana.app';

// Edit copy here. Keep answers short and concrete; every claim should match what Zana does today.
const FAQS: FaqItem[] = [
    {
        id: 'what-is-zana',
        category: 'Product',
        question: 'What is Zana?',
        answer:
            'Zana is a project management tool for product teams. You plan work as issues on boards, group it into projects, and track progress in one place, so everyone knows what is next and who owns it.',
    },
    {
        id: 'reminders',
        category: 'Product',
        question: 'How do reminders work?',
        answer:
            'Set a reminder on any issue and pick a date. When it is due, it shows up in your reminder inbox so follow-ups do not get buried. You can mark it done or snooze it from there.',
    },
    {
        id: 'vs-jira',
        category: 'Product',
        question: 'How is Zana different from Jira?',
        answer:
            'Zana is built to stay out of your way. There is no admin setup before you can ship: create a team, add issues, and start working. You get the boards, projects, and roadmaps most product teams actually use, without the configuration overhead.',
    },
    {
        id: 'import',
        category: 'Product',
        question: 'Can I import from my current tool?',
        answer:
            'Yes. You can bring existing work in from a CSV export, which covers most tools including Jira, Trello, and spreadsheets. If you are moving a large workspace, contact us and we will help you plan the migration.',
    },
    {
        id: 'free-plan',
        category: 'Plans & billing',
        question: 'Is there a free plan?',
        answer:
            'Yes. The Free plan includes unlimited members, 2 teams, 500 issues, and the Slack and GitHub integrations. It has no time limit, so you can use it for as long as it fits your team.',
    },
    {
        id: 'trial',
        category: 'Plans & billing',
        question: 'What happens after the 14-day trial?',
        answer:
            'The Team trial lasts 14 days. When it ends, you can choose a paid plan to keep Team features such as Zana AI, roadmaps, and unlimited issues, or move back to Free.',
    },
    {
        id: 'annual',
        category: 'Plans & billing',
        question: 'How does annual billing work?',
        answer:
            'Annual billing saves 37% compared with paying monthly. Team is $60 per user per year instead of $8 per user per month. You can switch between monthly and annual from your billing settings.',
    },
    {
        id: 'per-user',
        category: 'Plans & billing',
        question: 'Who counts toward per-user pricing?',
        answer:
            'On Team and Enterprise, you pay for each member of your workspace. On the Free plan, members are unlimited and cost nothing, so you can invite your whole company.',
    },
    {
        id: 'integrations',
        category: 'Integrations',
        question: 'Do you integrate with GitHub and Slack?',
        answer:
            'Yes, on every plan including Free. Link pull requests to issues in GitHub, and get updates and create issues from Slack without leaving the conversation.',
    },
    {
        id: 'security',
        category: 'Security & support',
        question: 'How secure is my data?',
        answer:
            'Your workspace data is private to your members. Enterprise adds SAML and SCIM single sign-on, an audit log, and advanced security controls for regulated teams. For a security review, contact us and we will share the details.',
    },
    {
        id: 'support',
        category: 'Security & support',
        question: 'What does support look like?',
        answer:
            'Every plan has access to our help docs and email support. Team includes priority support, and Enterprise adds a dedicated support contact, an SLA, and custom onboarding.',
    },
];

const HEADING_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
const reducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Same approach as Pricing.tsx / Solutions.tsx: all styling lives in one block.
const css = `
.faq-section {
  --fq-bg: #ffffff;
  --fq-ink: #0a0a0a;
  --fq-muted: #5f5f5f;
  --fq-line: #e5e5e5;
  --fq-card: #ffffff;
  --fq-accent: #0a0a0a;
  --fq-accent-ink: #ffffff;
  background: var(--fq-bg);
  color: var(--fq-ink);
  padding: 5rem 1.5rem 6rem;
}
.dark .faq-section {
  --fq-accent: #fafafa;
  --fq-accent-ink: #0a0a0a;
  --fq-bg: #0a0a0a;
  --fq-ink: #fafafa;
  --fq-muted: #a1a1a1;
  --fq-line: #262626;
  --fq-card: #111111;
}

.faq-head { text-align: center; max-width: 48rem; margin: 0 auto; }
.faq-title {
  margin: 0;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.035em;
  font-weight: 600;
}
.faq-sub { margin: 1rem auto 0; max-width: 36rem; font-size: 1.05rem; line-height: 1.6; color: var(--fq-muted); }

.faq-tools {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  max-width: 76rem;
  margin: 2.5rem auto 0;
}
.faq-search { position: relative; width: 100%; max-width: 26rem; }
.faq-search input {
  width: 100%;
  padding: .8rem 2.6rem .8rem 2.6rem;
  border: 1px solid var(--fq-line);
  border-radius: 999px;
  background: var(--fq-card);
  color: var(--fq-ink);
  font: inherit;
  font-size: .95rem;
}
.faq-search input::placeholder { color: var(--fq-muted); }
.faq-search input::-webkit-search-cancel-button { display: none; }
.faq-search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--fq-muted); pointer-events: none; }
.faq-clear {
  all: unset;
  position: absolute;
  right: .5rem;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  color: var(--fq-muted);
  cursor: pointer;
}
.faq-clear:hover { background: var(--fq-line); color: var(--fq-ink); }

.faq-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; }
.faq-chip {
  all: unset;
  cursor: pointer;
  padding: .45rem .95rem;
  border: 1px solid var(--fq-line);
  border-radius: 999px;
  font-size: .88rem;
  font-weight: 500;
  color: var(--fq-muted);
  transition: background .2s ease, color .2s ease, border-color .2s ease;
}
.faq-chip:hover { border-color: var(--fq-ink); color: var(--fq-ink); }
.faq-chip[aria-pressed="true"] { background: var(--fq-ink); border-color: var(--fq-ink); color: var(--fq-bg); }

.faq-search input:focus-visible,
.faq-chip:focus-visible,
.faq-clear:focus-visible,
.faq-q:focus-visible,
.faq-link:focus-visible { outline: 2px solid var(--fq-accent); outline-offset: 3px; }

.faq-status { min-height: 1.2rem; margin: 1.25rem 0 0; text-align: center; font-size: .85rem; color: var(--fq-muted); }

.faq-columns {
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 4rem;
  align-items: start;
  max-width: 76rem;
  margin: 1rem auto 0;
}
@media (min-width: 900px) { .faq-columns { grid-template-columns: 1fr 1fr; } }
.faq-col { border-top: 1px solid var(--fq-line); }
.faq-col:empty { display: none; }
@media (max-width: 899px) { .faq-col + .faq-col { border-top: 0; } }

.faq-item {
  border-bottom: 1px solid var(--fq-line);
  opacity: 0;
  transform: translateY(14px);
  transition: opacity .6s ease calc(var(--i) * 60ms), transform .6s cubic-bezier(.22,.61,.36,1) calc(var(--i) * 60ms);
}
.faq-section[data-revealed="true"] .faq-item { opacity: 1; transform: none; }

.faq-q-wrap { margin: 0; font: inherit; }
.faq-q {
  all: unset;
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem .25rem;
  cursor: pointer;
  font-size: 1.02rem;
  font-weight: 500;
  color: var(--fq-muted);
  transition: color .2s ease;
}
.faq-q:hover, .faq-item[data-open="true"] .faq-q { color: var(--fq-ink); }

.faq-icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  border: 1px solid var(--fq-line);
  color: var(--fq-ink);
  transition: transform .35s cubic-bezier(.22,.61,.36,1), background .25s ease, border-color .25s ease, color .25s ease;
}
.faq-item[data-open="true"] .faq-icon {
  transform: rotate(180deg);
  background: var(--fq-accent);
  border-color: var(--fq-accent);
  color: var(--fq-accent-ink);
}

/* Height animation without measuring: grid rows go from 0fr to 1fr. */
.faq-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s cubic-bezier(.22,.61,.36,1); }
.faq-item[data-open="true"] .faq-a { grid-template-rows: 1fr; }
.faq-a-inner { min-height: 0; overflow: hidden; visibility: hidden; transition: visibility 0s linear .35s; }
.faq-item[data-open="true"] .faq-a-inner { visibility: visible; transition-delay: 0s; }
.faq-a p { margin: 0; padding: 0 3.25rem 1.5rem .25rem; line-height: 1.7; color: var(--fq-muted); max-width: 60ch; }

.faq-empty { max-width: 76rem; margin: 2rem auto 0; padding: 2.5rem 1rem; text-align: center; color: var(--fq-muted); border-top: 1px solid var(--fq-line); border-bottom: 1px solid var(--fq-line); }
.faq-empty button { all: unset; cursor: pointer; margin-left: .35rem; color: var(--fq-ink); text-decoration: underline; text-underline-offset: 3px; }
.faq-empty button:focus-visible { outline: 2px solid var(--fq-accent); outline-offset: 3px; }

.faq-more { margin: 3rem auto 0; text-align: center; color: var(--fq-muted); }
.faq-link { color: var(--fq-ink); font-weight: 600; text-underline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .faq-item { opacity: 1; transform: none; transition: none; }
  .faq-a, .faq-a-inner, .faq-icon, .faq-chip, .faq-q { transition: none; }
}
`;

function Chevron() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

export default function Faq() {
    const baseId = useId();
    const sectionRef = useRef<HTMLElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<'All' | Category>('All');
    const [openId, setOpenId] = useState<string | null>(null);
    const [revealed, setRevealed] = useState(false);

    // One reveal when the section scrolls into view (skipped for reduced motion).
    useEffect(() => {
        const el = sectionRef.current;
        if (!el || reducedMotion() || typeof IntersectionObserver === 'undefined') {
            setRevealed(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRevealed(true);
                    io.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return FAQS.filter((f) => {
            if (category !== 'All' && f.category !== category) return false;
            if (!q) return true;
            return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
        });
    }, [query, category]);

    // Split in reading order: left column first, then right.
    const mid = Math.ceil(visible.length / 2);
    const columns = [visible.slice(0, mid), visible.slice(mid)];

    const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

    // Arrow keys / Home / End move between questions (WAI-ARIA accordion pattern).
    const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
        const buttons = Array.from(
            listRef.current?.querySelectorAll<HTMLButtonElement>('.faq-q') ?? [],
        );
        const i = buttons.indexOf(e.currentTarget);
        if (i === -1) return;
        let next = -1;
        if (e.key === 'ArrowDown') next = (i + 1) % buttons.length;
        else if (e.key === 'ArrowUp') next = (i - 1 + buttons.length) % buttons.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = buttons.length - 1;
        if (next >= 0) {
            e.preventDefault();
            buttons[next].focus();
        }
    };

    const clearFilters = () => {
        setQuery('');
        setCategory('All');
    };

    const isFiltering = query.trim() !== '' || category !== 'All';
    let index = 0;

    return (
        <section
            id="faq"
            ref={sectionRef}
            className="faq-section"
            data-revealed={revealed ? 'true' : 'false'}
            aria-labelledby={`${baseId}-title`}
        >
            <style>{css}</style>

            <div className="faq-head">
                <h2 id={`${baseId}-title`} className="faq-title" style={{ fontFamily: HEADING_FONT }}>
                    Frequently asked questions
                </h2>
                <p className="faq-sub">
                    Quick answers about plans, security, integrations, and how Zana fits your team.
                </p>
            </div>

            <div className="faq-tools">
                <div className="faq-search">
                    <svg className="faq-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                    </svg>
                    <label htmlFor={`${baseId}-search`} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                        Search questions
                    </label>
                    <input
                        id={`${baseId}-search`}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search questions"
                        autoComplete="off"
                    />
                    {query && (
                        <button type="button" className="faq-clear" onClick={() => setQuery('')} aria-label="Clear search">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                                <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="faq-chips" role="group" aria-label="Filter by topic">
                    {CATEGORIES.map((c) => (
                        <button key={c} type="button" className="faq-chip" aria-pressed={category === c} onClick={() => setCategory(c)}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <p className="faq-status" role="status" aria-live="polite">
                {isFiltering ? `${visible.length} ${visible.length === 1 ? 'question' : 'questions'} found` : ''}
            </p>

            {visible.length === 0 ? (
                <div className="faq-empty">
                    No questions match your search.
                    <button type="button" onClick={clearFilters}>Clear filters</button>
                </div>
            ) : (
                <div className="faq-columns" ref={listRef}>
                    {columns.map((col, c) => (
                        <div className="faq-col" key={c}>
                            {col.map((item) => {
                                const open = openId === item.id;
                                const btnId = `${baseId}-q-${item.id}`;
                                const panelId = `${baseId}-a-${item.id}`;
                                const i = index++;
                                return (
                                    <div
                                        key={item.id}
                                        className="faq-item"
                                        data-open={open ? 'true' : 'false'}
                                        style={{ ['--i' as string]: i }}
                                    >
                                        <h3 className="faq-q-wrap">
                                            <button
                                                id={btnId}
                                                type="button"
                                                className="faq-q"
                                                aria-expanded={open}
                                                aria-controls={panelId}
                                                onClick={() => toggle(item.id)}
                                                onKeyDown={onKeyDown}
                                            >
                                                <span>{item.question}</span>
                                                <span className="faq-icon">
                                                    <Chevron />
                                                </span>
                                            </button>
                                        </h3>
                                        <div id={panelId} role="region" aria-labelledby={btnId} className="faq-a">
                                            <div className="faq-a-inner">
                                                <p>{item.answer}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            <p className="faq-more">
                Still have a question?{' '}
                <a className="faq-link" href={`mailto:${SUPPORT_EMAIL}`}>
                    Email the Zana team
                </a>
            </p>
        </section>
    );
}
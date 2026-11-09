// type FooterLink = { label: string; href: string };
// type FooterGroup = { title: string; links: FooterLink[] };

// // TODO: point these at your real routes / anchors.
// const GROUPS: FooterGroup[] = [
//     {
//         title: 'Product',
//         links: [
//             { label: 'Issue tracking', href: '/#features' },
//             { label: 'Boards & projects', href: '/#solutions' },
//         ],
//     },
//     {
//         title: 'Company',
//         links: [
//             { label: 'About', href: '/about' },
//             { label: 'Pricing', href: '/#pricing' },
//         ],
//     },
//     {
//         title: 'Support',
//         links: [
//             { label: 'FAQ', href: '/#faq' },
//             { label: 'Contact', href: '/contact' },
//         ],
//     },
//     {
//         title: 'Legal',
//         links: [
//             { label: 'Terms of service', href: '/terms' },
//             { label: 'Privacy policy', href: '/privacy' },
//         ],
//     },
// ];

// // TODO: replace with your real profiles.
// const SOCIALS = [
//     { label: 'Zana on GitHub', href: 'https://github.com/', icon: 'github' },
//     { label: 'Zana on X', href: 'https://x.com/', icon: 'x' },
//     { label: 'Zana on LinkedIn', href: 'https://linkedin.com/', icon: 'linkedin' },
// ] as const;

// const TAGLINE = 'Plan less. Ship more.';
// const HEADING_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

// // Same approach as Pricing.tsx / Faq.tsx: all styling lives in one block.
// // The footer is always black with white text, in both light and dark themes.
// const css = `
// .zf-footer {
//   --zf-bg: #0a0a0a;
//   --zf-ink: #fafafa;
//   --zf-muted: #a1a1a1;
//   --zf-line: #262626;
//   background: var(--zf-bg);
//   color: var(--zf-ink);
//   padding: 4.5rem 1.5rem 2.5rem;
// }
// /* Same 76rem container as the navbar, so the mark lines up with the header logo. */
// .zf-inner { max-width: 76rem; margin: 0 auto; }

// .zf-top {
//   display: flex;
//   flex-wrap: wrap;
//   align-items: center;
//   justify-content: space-between;
//   gap: 1.5rem;
//   padding-bottom: 4rem;
//   border-bottom: 1px solid var(--zf-line);
// }
// .zf-brand { display: flex; align-items: center; gap: 1rem; }
// .zf-mark {
//   flex: none;
//   display: grid;
//   place-items: center;
//   width: 2.5rem;
//   height: 2.5rem;
//   border-radius: 50%;
//   background: var(--zf-ink);
//   color: var(--zf-bg);
//   font-size: .85rem;
//   font-weight: 700;
//   letter-spacing: -0.02em;
//   line-height: 1;
//   user-select: none;
// }
// .zf-tagline {
//   margin: 0;
//   font-size: clamp(1.75rem, 3.6vw, 2.6rem);
//   font-weight: 600;
//   letter-spacing: -0.035em;
//   line-height: 1.05;
// }
// .zf-cta {
//   display: inline-block;
//   padding: .95rem 1.6rem;
//   border-radius: .8rem;
//   background: var(--zf-ink);
//   color: var(--zf-bg);
//   font-weight: 600;
//   text-decoration: none;
//   transition: transform .2s cubic-bezier(.22,.61,.36,1), background .2s ease;
// }
// .zf-cta:hover { background: #e5e5e5; transform: translateY(-2px); }

// .zf-groups {
//   display: grid;
//   grid-template-columns: repeat(2, 1fr);
//   gap: 2.5rem 2rem;
//   padding: 3.5rem 0 4rem;
//   border-bottom: 1px solid var(--zf-line);
// }
// @media (min-width: 800px) { .zf-groups { grid-template-columns: repeat(4, 1fr); } }

// .zf-group-title { margin: 0 0 1.25rem; font-size: .85rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--zf-muted); }
// .zf-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .9rem; }
// .zf-link {
//   color: var(--zf-ink);
//   text-decoration: none;
//   background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
//   transition: background-size .25s ease;
// }
// .zf-link:hover { background-size: 100% 1px; }

// .zf-bottom {
//   display: flex;
//   flex-wrap: wrap;
//   align-items: center;
//   justify-content: space-between;
//   gap: 1.25rem;
//   padding-top: 2.25rem;
// }
// .zf-copy { margin: 0; font-size: .92rem; color: var(--zf-muted); }
// .zf-copy strong { font-weight: 500; color: var(--zf-ink); }

// .zf-socials { display: flex; gap: .75rem; }
// .zf-social {
//   display: grid;
//   place-items: center;
//   width: 2.8rem;
//   height: 2.8rem;
//   border: 1px solid var(--zf-line);
//   border-radius: 50%;
//   color: var(--zf-ink);
//   transition: background .2s ease, color .2s ease, border-color .2s ease;
// }
// .zf-social:hover { background: var(--zf-ink); color: var(--zf-bg); border-color: var(--zf-ink); }

// .zf-cta:focus-visible,
// .zf-link:focus-visible,
// .zf-social:focus-visible { outline: 2px solid var(--zf-ink); outline-offset: 3px; }

// @media (prefers-reduced-motion: reduce) {
//   .zf-cta, .zf-link, .zf-social { transition: none; }
//   .zf-cta:hover { transform: none; }
// }
// `;

// // The Zana mark only (no wordmark). Inverted for the black footer: white disc, black "za".
// function ZanaMark() {
//     return (
//         <span className="zf-mark" style={{ fontFamily: HEADING_FONT }} aria-hidden="true">
//             za
//         </span>
//     );
// }

// function SocialIcon({ name }: { name: (typeof SOCIALS)[number]['icon'] }) {
//     const common = {
//         width: 18,
//         height: 18,
//         viewBox: '0 0 24 24',
//         fill: 'none',
//         stroke: 'currentColor',
//         strokeWidth: 1.8,
//         strokeLinecap: 'round' as const,
//         strokeLinejoin: 'round' as const,
//         'aria-hidden': true,
//     };
//     if (name === 'github')
//         return (
//             <svg {...common}>
//                 <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
//                 <path d="M9 18c-4.51 2-5-2-7-2" />
//             </svg>
//         );
//     if (name === 'x')
//         return (
//             <svg {...common}>
//                 <path d="M4 4l11.733 16h4.267l-11.733-16z" />
//                 <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
//             </svg>
//         );
//     return (
//         <svg {...common}>
//             <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
//             <rect width="4" height="12" x="2" y="9" />
//             <circle cx="4" cy="4" r="2" />
//         </svg>
//     );
// }

// export default function Footer() {
//     const year = new Date().getFullYear();

//     return (
//         <footer className="zf-footer">
//             <style>{css}</style>

//             <div className="zf-inner">
//                 <div className="zf-top">
//                     <div className="zf-brand">
//                         <ZanaMark />
//                         <p className="zf-tagline" style={{ fontFamily: HEADING_FONT }}>
//                             {TAGLINE}
//                         </p>
//                     </div>
//                     <a className="zf-cta" href="/signup">
//                         Start free
//                     </a>
//                 </div>

//                 <nav className="zf-groups" aria-label="Footer">
//                     {GROUPS.map((group) => (
//                         <div key={group.title}>
//                             <h2 className="zf-group-title">{group.title}</h2>
//                             <ul className="zf-list">
//                                 {group.links.map((link) => (
//                                     <li key={link.label}>
//                                         <a className="zf-link" href={link.href}>
//                                             {link.label}
//                                         </a>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     ))}
//                 </nav>

//                 <div className="zf-bottom">
//                     <p className="zf-copy">
//                         © {year} <strong>Zana</strong> - All rights reserved.
//                     </p>
//                     <div className="zf-socials">
//                         {SOCIALS.map((s) => (
//                             <a key={s.label} className="zf-social" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
//                                 <SocialIcon name={s.icon} />
//                             </a>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </footer>
//     );
// }









type FooterLink = { label: string; href: string };
type FooterGroup = { title: string; links: FooterLink[] };

// TODO: point these at your real routes / anchors.
const GROUPS: FooterGroup[] = [
    {
        title: 'Product',
        links: [
            { label: 'Issue tracking', href: '/#features' },
            { label: 'Boards & projects', href: '/#solutions' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/about' },
            { label: 'Pricing', href: '/#pricing' },
        ],
    },
    {
        title: 'Support',
        links: [
            { label: 'FAQ', href: '/#faq' },
            { label: 'Contact', href: '/contact' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Terms of service', href: '/terms' },
            { label: 'Privacy policy', href: '/privacy' },
        ],
    },
];

// TODO: replace with your real profiles.
export const SOCIALS = [
    { label: 'Zana on GitHub', href: 'https://github.com/', icon: 'github' },
    { label: 'Zana on X', href: 'https://x.com/', icon: 'x' },
    { label: 'Zana on LinkedIn', href: 'https://linkedin.com/', icon: 'linkedin' },
] as const;

const TAGLINE = 'Plan less. Ship more.';
const HEADING_FONT = "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";

// Same approach as Pricing.tsx / Faq.tsx: all styling lives in one block.
// The footer is always black with white text, in both light and dark themes.
const css = `
.zf-footer {
  --zf-bg: #0a0a0a;
  --zf-ink: #fafafa;
  --zf-muted: #a1a1a1;
  --zf-line: #262626;
  background: var(--zf-bg);
  color: var(--zf-ink);
  padding: 4.5rem 1.5rem 2.5rem;
}
/* Same 76rem container as the navbar, so the mark lines up with the header logo. */
.zf-inner { max-width: 76rem; margin: 0 auto; }

.zf-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-bottom: 4rem;
  border-bottom: 1px solid var(--zf-line);
}
.zf-brand { display: flex; align-items: center; gap: 1rem; }
.zf-mark {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--zf-ink);
  color: var(--zf-bg);
  font-size: .85rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  user-select: none;
}
.zf-tagline {
  margin: 0;
  font-size: clamp(1.75rem, 3.6vw, 2.6rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.05;
}
.zf-cta {
  display: inline-block;
  padding: .95rem 1.6rem;
  border-radius: .8rem;
  background: var(--zf-ink);
  color: var(--zf-bg);
  font-weight: 600;
  text-decoration: none;
  transition: transform .2s cubic-bezier(.22,.61,.36,1), background .2s ease;
}
.zf-cta:hover { background: #e5e5e5; transform: translateY(-2px); }

.zf-groups {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem 2rem;
  padding: 3.5rem 0 4rem;
  border-bottom: 1px solid var(--zf-line);
}
@media (min-width: 800px) { .zf-groups { grid-template-columns: repeat(4, 1fr); } }

.zf-group-title { margin: 0 0 1.25rem; font-size: .85rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--zf-muted); }
.zf-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .9rem; }
.zf-link {
  color: var(--zf-ink);
  text-decoration: none;
  background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
  transition: background-size .25s ease;
}
.zf-link:hover { background-size: 100% 1px; }

.zf-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding-top: 2.25rem;
}
.zf-copy { margin: 0; font-size: .92rem; color: var(--zf-muted); }
.zf-copy strong { font-weight: 500; color: var(--zf-ink); }

.zf-socials { display: flex; gap: .75rem; }
.zf-social {
  display: grid;
  place-items: center;
  width: 2.8rem;
  height: 2.8rem;
  border: 1px solid var(--zf-line);
  border-radius: 50%;
  color: var(--zf-ink);
  transition: background .2s ease, color .2s ease, border-color .2s ease;
}
.zf-social:hover { background: var(--zf-ink); color: var(--zf-bg); border-color: var(--zf-ink); }

.zf-cta:focus-visible,
.zf-link:focus-visible,
.zf-social:focus-visible { outline: 2px solid var(--zf-ink); outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .zf-cta, .zf-link, .zf-social { transition: none; }
  .zf-cta:hover { transform: none; }
}
`;

// The Zana mark only (no wordmark). Inverted for the black footer: white disc, black "za".
function ZanaMark() {
    return (
        <span className="zf-mark" style={{ fontFamily: HEADING_FONT }} aria-hidden="true">
            za
        </span>
    );
}

export function SocialIcon({ name }: { name: (typeof SOCIALS)[number]['icon'] }) {
    const common = {
        width: 18,
        height: 18,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        'aria-hidden': true,
    };
    if (name === 'github')
        return (
            <svg {...common}>
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
        );
    if (name === 'x')
        return (
            <svg {...common}>
                <path d="M4 4l11.733 16h4.267l-11.733-16z" />
                <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
            </svg>
        );
    return (
        <svg {...common}>
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    );
}

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="zf-footer">
            <style>{css}</style>

            <div className="zf-inner">
                <div className="zf-top">
                    <div className="zf-brand">
                        <ZanaMark />
                        <p className="zf-tagline" style={{ fontFamily: HEADING_FONT }}>
                            {TAGLINE}
                        </p>
                    </div>
                    <a className="zf-cta" href="/signup">
                        Start free
                    </a>
                </div>

                <nav className="zf-groups" aria-label="Footer">
                    {GROUPS.map((group) => (
                        <div key={group.title}>
                            <h2 className="zf-group-title">{group.title}</h2>
                            <ul className="zf-list">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <a className="zf-link" href={link.href}>
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="zf-bottom">
                    <p className="zf-copy">
                        © {year} <strong>Zana</strong> - All rights reserved.
                    </p>
                    <div className="zf-socials">
                        {SOCIALS.map((s) => (
                            <a key={s.label} className="zf-social" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                                <SocialIcon name={s.icon} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
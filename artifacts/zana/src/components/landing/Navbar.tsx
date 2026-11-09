import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
import Logo from '../landing/Logo';
import { useTheme } from '../../hooks/use-theme';

// Hash links start with "/" so they also work from other pages (e.g. /contact).
const featureLinks = [
    { label: 'Task boards', description: 'Move work across Not started, In progress and Complete.', href: '/#features' },
    { label: 'Due dates & reminders', description: 'Get nudged before something slips.', href: '/#features' },
    { label: 'Team collaboration', description: 'Invite people and assign tasks.', href: '/#features' },
    { label: 'Progress overview', description: 'See what is open and what is done.', href: '/#features' },
];

const navLinks = [
    { label: 'Pricing', href: '/#pricing' },
    { label: 'About', href: '/#about' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Contact', href: '/contact' },
];

const linkClass =
    'rounded-md px-1 py-1 text-[15px] font-medium text-neutral-900 transition-colors hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 dark:text-neutral-100 dark:hover:text-neutral-400 dark:focus-visible:ring-white/50';

// Padding is deliberately NOT in the base: combining `px-4` and `px-0` on one
// element is order-dependent in Tailwind, which squashed the theme toggle icon.
const buttonBase =
    'inline-flex h-10 items-center justify-center rounded-xl border border-neutral-900/10 bg-white/70 text-sm font-medium text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 dark:border-white/10 dark:bg-white/5 dark:text-neutral-50 dark:hover:bg-white/10 dark:focus-visible:ring-white/50';

const outlineButton = `${buttonBase} px-4`;
const iconButton = `${buttonBase} w-10 shrink-0`;

const mobileLink =
    'rounded-xl px-3 py-3 text-base font-medium text-neutral-900 hover:bg-neutral-900/5 dark:text-neutral-50 dark:hover:bg-white/5';

function ThemeToggle() {
    const { theme, toggle } = useTheme();
    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className={iconButton}
            data-testid="button-theme-toggle"
        >
            {theme === 'dark' ? <Moon size={16} strokeWidth={1.8} /> : <Sun size={16} strokeWidth={1.8} />}
        </button>
    );
}

function FeaturesDropdown() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                className={`${linkClass} inline-flex items-center gap-1`}
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpen(o => !o)}
                data-testid="button-nav-features"
            >
                Features
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-1/2 top-full z-50 mt-3 w-80 -translate-x-1/2 rounded-2xl border border-neutral-900/10 bg-[#fdfdf9] p-2 shadow-[0_12px_32px_rgba(0,0,0,0.10)] dark:border-white/10 dark:bg-[#1a1a16]">
                    {featureLinks.map(item => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-900/5 dark:hover:bg-white/5"
                        >
                            <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-50">{item.label}</span>
                            <span className="block text-[13px] text-neutral-500 dark:text-neutral-400">{item.description}</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Lock body scroll while the mobile menu is open.
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    // Close the menu on Escape, and if the viewport grows to the desktop layout.
    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
        const mq = window.matchMedia('(min-width: 1024px)');
        const onChange = () => mq.matches && setMobileOpen(false);
        document.addEventListener('keydown', onKey);
        mq.addEventListener('change', onChange);
        return () => {
            document.removeEventListener('keydown', onKey);
            mq.removeEventListener('change', onChange);
        };
    }, [mobileOpen]);

    const close = () => setMobileOpen(false);

    return (
        <header
            className={`sticky top-0 z-50 bg-[#fbfbf6]/90 backdrop-blur transition-[border-color] dark:bg-[#12120f]/90 ${scrolled || mobileOpen ? 'border-b border-neutral-900/10 dark:border-white/10' : 'border-b border-transparent'
                }`}
        >
            <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-4 sm:px-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
                <Logo className="lg:justify-self-start" />

                {/* Desktop nav */}
                <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
                    <FeaturesDropdown />
                    {navLinks.map(l => (
                        <a key={l.label} href={l.href} className={linkClass} data-testid={`link-nav-${l.label.toLowerCase()}`}>
                            {l.label}
                        </a>
                    ))}
                </nav>

                {/* Desktop actions */}
                <div className="hidden items-center gap-3 justify-self-end lg:flex">
                    <Link
                        href="/signup"
                        className="rounded-md px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 dark:text-neutral-400 dark:hover:text-neutral-50"
                        data-testid="link-nav-signup"
                    >
                        Sign up
                    </Link>
                    <Link href="/signin" className={outlineButton} data-testid="link-nav-login">
                        Log in
                    </Link>
                    <ThemeToggle />
                </div>

                {/* Mobile / tablet actions */}
                <div className="flex items-center gap-2 lg:hidden">
                    <Link href="/signin" className={outlineButton} data-testid="link-nav-login-mobile">
                        Log in
                    </Link>
                    <ThemeToggle />
                    <button
                        type="button"
                        onClick={() => setMobileOpen(o => !o)}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 dark:text-neutral-50 dark:focus-visible:ring-white/50"
                        data-testid="button-mobile-menu"
                    >
                        {mobileOpen ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
                    </button>
                </div>
            </div>

            {/*
              Mobile panel. It is `absolute` (not `fixed`) on purpose: this header has
              `backdrop-blur`, and a backdrop filter makes the header the containing
              block for fixed children, which collapsed the old panel to ~0px height.
              top-full + a viewport-based height fills the screen under the bar.
            */}
            {mobileOpen && (
                <nav
                    id="mobile-menu"
                    className="absolute inset-x-0 top-full h-[calc(100dvh-73px)] overflow-y-auto overscroll-contain bg-[#fbfbf6] px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-4 dark:bg-[#12120f] lg:hidden"
                    aria-label="Mobile"
                >
                    <p className="px-1 pb-2 text-[13px] text-neutral-500 dark:text-neutral-400">Features</p>
                    <div className="mb-4 flex flex-col">
                        {featureLinks.map(item => (
                            <a key={item.label} href={item.href} onClick={close} className={mobileLink}>
                                {item.label}
                            </a>
                        ))}
                    </div>
                    <div className="flex flex-col border-t border-neutral-900/10 pt-4 dark:border-white/10">
                        {navLinks.map(l => (
                            <a key={l.label} href={l.href} onClick={close} className={mobileLink}>
                                {l.label}
                            </a>
                        ))}
                    </div>
                    <Link
                        href="/signup"
                        onClick={close}
                        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-neutral-900 text-base font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
                        data-testid="link-mobile-signup"
                    >
                        Sign up
                    </Link>
                </nav>
            )}
        </header>
    );
}
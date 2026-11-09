import { useCallback, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import { navLinks, scrollToSection } from './nav-links';

const NAV_H = 68;
const sectionIds = navLinks.map(link => link.id);

const css = `
.z-nav {
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background-color .25s ease, border-color .25s ease;
}
.z-nav[data-scrolled="true"] {
  background: var(--z-bg);
  background: color-mix(in srgb, var(--z-bg) 82%, transparent);
  -webkit-backdrop-filter: saturate(180%) blur(14px);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom-color: var(--z-border);
}
.z-nav[data-open="true"] {
  background: var(--z-bg);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  border-bottom-color: var(--z-border);
}
@media (prefers-reduced-motion: reduce) { .z-nav { transition: none; } }
`;

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useScrollSpy(sectionIds);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // If the window grows to desktop width while the menu is open, close it.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const goTo = useCallback((id: string) => {
    setOpen(false);
    // Wait a beat so the page scroll lock from the menu is released first.
    window.setTimeout(() => scrollToSection(id), 60);
  }, []);

  return (
    <>
      <style>{css}</style>

      {/* fixed, so it stays at the top whatever the page's overflow settings are */}
      <header
        className="z-nav fixed inset-x-0 top-0 z-50"
        data-scrolled={scrolled}
        data-open={open}
        data-testid="header-landing"
      >
        <div className="px-3 sm:px-5">
          <div className="px-6 sm:px-12 lg:px-[8%]">
            <div
              className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto] items-center lg:grid-cols-[1fr_auto_1fr]"
              style={{ height: NAV_H }}
            >
              <div className="justify-self-start">
                <Logo />
              </div>

              <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
                {navLinks.map(link => {
                  const isActive = active === link.id;
                  return (
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      onClick={e => { e.preventDefault(); goTo(link.id); }}
                      aria-current={isActive ? 'true' : undefined}
                      data-testid={`link-nav-${link.id}`}
                      className={`relative rounded-lg px-4 py-2 text-[15px] font-medium transition-colors duration-200 hover:text-[color:var(--z-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--z-fg)] ${
                        isActive ? 'text-[color:var(--z-fg)]' : 'text-[color:var(--z-muted)]'
                      }`}
                    >
                      {link.label}
                      <span
                        aria-hidden
                        className="absolute inset-x-4 -bottom-0.5 h-[2px] origin-left rounded-full bg-[color:var(--z-fg)] transition-transform duration-300"
                        style={{ transform: isActive ? 'scaleX(1)' : 'scaleX(0)' }}
                      />
                    </a>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2 justify-self-end">
                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

                <Link
                  href="/signin"
                  data-testid="link-nav-login"
                  className="hidden h-11 items-center rounded-xl px-4 text-[15px] font-medium text-[color:var(--z-fg)] transition-colors hover:bg-[color:var(--z-panel)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--z-fg)] lg:inline-flex"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  data-testid="link-nav-signup"
                  className="hidden h-11 items-center rounded-xl bg-[color:var(--z-fg)] px-5 text-[15px] font-semibold text-[color:var(--z-bg)] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--z-fg)] lg:inline-flex"
                >
                  Start free
                </Link>

                <button
                  type="button"
                  onClick={() => setOpen(o => !o)}
                  aria-label={open ? 'Close menu' : 'Open menu'}
                  aria-expanded={open}
                  aria-controls="mobile-menu"
                  data-testid="button-mobile-menu"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--z-border)] bg-[color:var(--z-surface)] text-[color:var(--z-fg)] transition-[transform,background-color] duration-200 hover:bg-[color:var(--z-surface-hover)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--z-fg)] lg:hidden"
                >
                  {open ? <X size={20} strokeWidth={1.8} aria-hidden /> : <Menu size={20} strokeWidth={1.8} aria-hidden />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={open}
        top={NAV_H}
        active={active}
        isDark={isDark}
        onClose={close}
        onNavigate={goTo}
        onToggleTheme={toggleTheme}
      />

      {/* A fixed header takes no space, so reserve it here */}
      <div aria-hidden style={{ height: NAV_H + 8 }} />
    </>
  );
}

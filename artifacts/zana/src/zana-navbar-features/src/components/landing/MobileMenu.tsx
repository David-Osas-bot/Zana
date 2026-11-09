import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'wouter';
import { ArrowRight, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { navLinks } from './nav-links';

type MobileMenuProps = {
  open: boolean;
  /** Height of the fixed header; the panel starts right below it. */
  top: number;
  active: string | null;
  isDark: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onToggleTheme: () => void;
};

const css = `
.z-menu {
  visibility: hidden;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity .25s ease, transform .3s cubic-bezier(.22,.61,.36,1), visibility 0s linear .3s;
}
.z-menu[data-open="true"] { visibility: visible; opacity: 1; transform: none; transition-delay: 0s; }
.z-menu-item { opacity: 0; transform: translateY(10px); }
.z-menu[data-open="true"] .z-menu-item {
  opacity: 1;
  transform: none;
  transition: opacity .4s ease calc(var(--i) * 60ms + 80ms), transform .4s cubic-bezier(.22,.61,.36,1) calc(var(--i) * 60ms + 80ms);
}
@media (prefers-reduced-motion: reduce) {
  .z-menu, .z-menu[data-open="true"], .z-menu-item, .z-menu[data-open="true"] .z-menu-item { transition: none; transform: none; }
}
`;

export default function MobileMenu({ open, top, active, isDark, onClose, onNavigate, onToggleTheme }: MobileMenuProps) {
  const panelRef = useRef<HTMLElement>(null);

  // Lock page scroll while the menu is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  // Escape closes the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('a')?.focus();
  }, [open]);

  const itemIndex = navLinks.length; // CTAs animate in after the links

  return (
    <nav
      id="mobile-menu"
      ref={panelRef}
      aria-label="Mobile"
      aria-hidden={!open}
      data-open={open}
      className="z-menu fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-[color:var(--z-bg)] lg:hidden"
      style={{ top }}
    >
      <style>{css}</style>

      <ul className="px-6 pt-2 sm:px-12">
        {navLinks.map((link, i) => {
          const isActive = active === link.id;
          return (
            <li
              key={link.id}
              className="z-menu-item border-b border-[color:var(--z-border)]"
              style={{ '--i': i } as CSSProperties}
            >
              <a
                href={`#${link.id}`}
                onClick={e => { e.preventDefault(); onNavigate(link.id); }}
                className={`flex items-center justify-between py-5 text-[28px] font-medium tracking-[-0.03em] transition-colors hover:text-[color:var(--z-fg)] ${
                  isActive ? 'text-[color:var(--z-fg)]' : 'text-[color:var(--z-muted)]'
                }`}
              >
                {link.label}
                <ChevronRight size={22} strokeWidth={1.6} aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>

      <div
        className="z-menu-item flex flex-col gap-3 px-6 pt-8 sm:px-12"
        style={{ '--i': itemIndex } as CSSProperties}
      >
        <Link
          href="/signin"
          onClick={onClose}
          className="inline-flex h-14 items-center justify-center rounded-xl border border-[color:var(--z-border)] bg-[color:var(--z-surface)] text-base font-semibold text-[color:var(--z-fg)] transition-colors hover:bg-[color:var(--z-surface-hover)]"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          onClick={onClose}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[color:var(--z-fg)] text-base font-semibold text-[color:var(--z-bg)] transition-opacity hover:opacity-80"
        >
          Start free
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>

      <div
        className="z-menu-item mx-6 mb-10 mt-8 flex items-center justify-between rounded-2xl border border-[color:var(--z-border)] bg-[color:var(--z-panel)] px-5 py-4 sm:mx-12"
        style={{ '--i': itemIndex + 1 } as CSSProperties}
      >
        <div>
          <p className="text-[15px] font-medium text-[color:var(--z-fg)]">Appearance</p>
          <p className="text-[13px] text-[color:var(--z-muted)]">{isDark ? 'Dark' : 'Light'} mode</p>
        </div>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
    </nav>
  );
}

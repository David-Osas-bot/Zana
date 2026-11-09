import { Moon, Sun } from 'lucide-react';

type ThemeToggleProps = {
  /** True when the page is currently in dark mode. */
  isDark: boolean;
  onToggle: () => void;
  className?: string;
};

// 44px round button with a visible border and a 20px icon that swaps with a
// small spin. Takes plain props so it works with whatever your use-theme hook
// returns: <ThemeToggle isDark={theme === 'dark'} onToggle={toggleTheme} />
export function ThemeToggle({ isDark, onToggle, className = '' }: ThemeToggleProps) {
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      data-testid="button-theme-toggle"
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--z-border)] bg-[color:var(--z-surface)] text-[color:var(--z-fg)] shadow-sm transition-[transform,background-color] duration-200 hover:bg-[color:var(--z-surface-hover)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--z-fg)] ${className}`}
    >
      <Sun
        size={20}
        strokeWidth={1.8}
        aria-hidden
        className={`absolute transition-all duration-300 motion-reduce:transition-none ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
          }`}
      />
      <Moon
        size={20}
        strokeWidth={1.8}
        aria-hidden
        className={`absolute transition-all duration-300 motion-reduce:transition-none ${isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
      />
    </button>
  );
}

export default ThemeToggle;

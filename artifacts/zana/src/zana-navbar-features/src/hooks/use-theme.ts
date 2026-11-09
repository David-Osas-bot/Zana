import { useCallback, useLayoutEffect, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'zana-theme';
const listeners = new Set<() => void>();
let current: Theme | null = null;

function readInitial(): Theme {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage can be blocked (private mode); fall back to the system setting.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getSnapshot(): Theme {
  if (current === null) current = readInitial();
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function setThemeValue(next: Theme) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore
  }
  listeners.forEach(listener => listener());
}

// One shared theme for every component that calls this hook.
// The `dark` class and data-theme attribute go on <html> only while a page that
// uses the hook is mounted, and are removed when it unmounts, so the dashboard
// (which is not built for dark mode) is never affected.
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light' as Theme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    return () => {
      root.classList.remove('dark');
      delete root.dataset.theme;
    };
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeValue(next), []);
  const toggleTheme = useCallback(() => setThemeValue(getSnapshot() === 'dark' ? 'light' : 'dark'), []);

  return { theme, isDark: theme === 'dark', setTheme, toggleTheme };
}

export default useTheme;

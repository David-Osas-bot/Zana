import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
    } catch {
        /* storage unavailable */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            /* ignore */
        }
    }, [theme]);

    const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

    return { theme, toggle };
}
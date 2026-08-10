import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="h-9 w-24" />;

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium tracking-wide uppercase transition-colors hover:bg-accent"
            data-testid="button-theme-toggle"
        >
            <span className="relative h-4 w-4">
                <Sun
                    className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                />
                <Moon
                    className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
                />
            </span>
            {isDark ? 'Light' : 'Dark'}
        </button>
    );
}
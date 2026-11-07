import { Link } from 'wouter';

type LogoProps = {
    name?: string;
    className?: string;
};

export function LogoMark({ size = 36 }: { size?: number }) {
    return (
        <svg viewBox="0 0 36 36" width={size} height={size} aria-hidden="true" className="shrink-0">
            {/* outer ring */}
            <circle cx="18" cy="18" r="16.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {/* solid right half */}
            <path d="M18 1.25a16.75 16.75 0 0 1 0 33.5z" fill="currentColor" />
            {/* concentric arcs on the left half */}
            {[13.5, 10.5, 7.5, 4.5].map((r) => (
                <path
                    key={r}
                    d={`M18 ${18 - r}a${r} ${r} 0 0 0 0 ${r * 2}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                />
            ))}
        </svg>
    );
}

export default function Logo({ name = 'Cadence', className = '' }: LogoProps) {
    return (
        <Link
            href="/"
            className={`inline-flex items-center gap-2.5 rounded-lg text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 dark:text-neutral-50 dark:focus-visible:ring-white/50 ${className}`}
            aria-label={`${name} home`}
            data-testid="link-landing-logo"
        >
            <LogoMark />
            <span className="text-[24px] font-medium leading-none tracking-[-0.03em]">{name}</span>
        </Link>
    );
}
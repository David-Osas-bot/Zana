import { Link } from 'wouter';

type LogoProps = {
    className?: string;
    /** Set to false if the parent already wraps the logo in a link. */
    link?: boolean;
};

// Same brand as the dashboard: a rounded "za" mark plus the wordmark.
export function Logo({ className = '', link = true }: LogoProps) {
    const base = `inline-flex items-center gap-2.5 ${className}`;
    const inner = (
        <>
            <span
                aria-hidden
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--z-fg)] text-[13px] font-semibold lowercase tracking-tight text-[color:var(--z-bg)]"
            >
                za
            </span>
            <span className="text-[22px] font-semibold leading-none tracking-[-0.04em] text-[color:var(--z-fg)]">Zana</span>
        </>
    );

    if (!link) return <span className={base}>{inner}</span>;

    return (
        <Link href="/" aria-label="Zana home" data-testid="link-logo" className={base}>
            {inner}
        </Link>
    );
}

export default Logo;

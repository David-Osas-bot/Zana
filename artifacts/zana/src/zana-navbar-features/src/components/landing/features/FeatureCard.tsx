import type { CSSProperties, ReactNode } from 'react';

type FeatureCardProps = {
  index: number;
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
};

// The shared frame: a bold lead-in, a muted sentence, and a visual anchored to the bottom.
export default function FeatureCard({ index, title, description, className = '', children }: FeatureCardProps) {
  return (
    <article
      className={`zf-card flex flex-col overflow-hidden rounded-3xl border border-[color:var(--z-border)] bg-[color:var(--z-surface)] p-6 sm:p-7 ${className}`}
      style={{ '--i': index } as CSSProperties}
      data-testid={`card-feature-${index}`}
    >
      <p className="max-w-[34rem] text-[17px] leading-snug tracking-[-0.01em] text-[color:var(--z-muted)]">
        <strong className="font-semibold text-[color:var(--z-fg)]">{title}</strong> {description}
      </p>
      <div className="mt-8 flex flex-1 items-end">{children}</div>
    </article>
  );
}

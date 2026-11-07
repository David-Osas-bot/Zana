export function Avatar({ initials, className = '' }: { initials?: string | null; className?: string }) {
  return (
    <span className={`avatar ${className}`} data-testid={`avatar-${initials || 'unassigned'}`}>
      {initials || '—'}
    </span>
  );
}

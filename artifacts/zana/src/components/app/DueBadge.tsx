import type { CSSProperties } from 'react';
import { Clock } from 'lucide-react';
import type { TaskInputStatus } from '@workspace/api-client-react';

// Small badge shown on task cards. Grayscale to match the rest of the
// board — solid black for overdue, light gray for today, outlined for
// anything further out.
export function DueBadge({ dueDate, status }: { dueDate?: string | null; status: TaskInputStatus }) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;

  const now = new Date();
  const isDone = status === 'done';
  const isOverdue = !isDone && due.getTime() < now.getTime();
  const isToday = due.toDateString() === now.toDateString();
  const hasTime = due.getHours() !== 0 || due.getMinutes() !== 0;

  const label = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    (hasTime ? `, ${due.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : '');

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: 20,
    background: isOverdue ? '#111111' : isToday ? '#e5e5e5' : '#f5f5f5',
    color: isOverdue ? '#ffffff' : '#111111',
    border: isOverdue ? 'none' : '1px solid #e5e5e5',
  };

  return (
    <span style={style} data-testid="badge-due-date">
      <Clock size={11} />
      {isOverdue ? 'Overdue' : label}
    </span>
  );
}

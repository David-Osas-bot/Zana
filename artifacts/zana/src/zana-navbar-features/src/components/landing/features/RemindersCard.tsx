import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import FeatureCard from './FeatureCard';
import AnimatedStack from './AnimatedStack';
import { useCardLoop, useInterval } from './hooks';

type Toast = { id: number; tone: 'reminder' | 'overdue'; title: string; message: string };

const SOURCE: Omit<Toast, 'id'>[] = [
  { tone: 'reminder', title: 'Due soon: Design review', message: 'Today, 4:00 PM' },
  { tone: 'overdue', title: 'Overdue: Fix signup bug', message: 'Yesterday, 9:00 AM' },
  { tone: 'reminder', title: 'Due soon: Send client update', message: 'Tomorrow, 10:30 AM' },
  { tone: 'reminder', title: 'Due soon: Launch checklist', message: 'Friday, 2:00 PM' },
];
const make = (n: number): Toast => ({ id: n, ...SOURCE[n % SOURCE.length] });
const VISIBLE = 3;

// The same two toast styles the app shows: light for "due soon", solid for "overdue".
function ToastCard({ toast }: { toast: Toast }) {
  const overdue = toast.tone === 'overdue';
  return (
    <div
      className={`flex h-full items-start justify-between gap-3 rounded-xl px-4 py-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] ${
        overdue
          ? 'bg-[color:var(--z-fg)] text-[color:var(--z-bg)]'
          : 'border border-[color:var(--z-border)] bg-[color:var(--z-surface)] text-[color:var(--z-fg)]'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold">{toast.title}</p>
        <p className="mt-1 text-[12px] opacity-70">{toast.message}</p>
      </div>
      <X size={13} aria-hidden className="mt-0.5 shrink-0 opacity-60" />
    </div>
  );
}

export default function RemindersCard({ index, className = '' }: { index: number; className?: string }) {
  const { ref, running } = useCardLoop<HTMLDivElement>();
  const next = useRef(3);
  const [items, setItems] = useState<Toast[]>(() => [make(2), make(1), make(0)]);

  useInterval(() => {
    const n = next.current;
    next.current += 1;
    setItems(prev => [make(n), ...prev].slice(0, VISIBLE + 1));
  }, running ? 2600 : null);

  return (
    <FeatureCard
      index={index}
      className={className}
      title="Never miss a deadline."
      description="Set a due date and a reminder, and Zana nudges you in the app and by email."
    >
      <div ref={ref} className="w-full rounded-2xl bg-[color:var(--z-panel)] p-4" role="img" aria-label="Reminder notifications appearing one after another">
        <AnimatedStack
          items={items}
          getKey={t => t.id}
          render={t => <ToastCard toast={t} />}
          itemHeight={64}
          gap={10}
          visible={VISIBLE}
        />
      </div>
    </FeatureCard>
  );
}

import { useState } from 'react';
import { CalendarClock, Check, ChevronDown } from 'lucide-react';
import { useInterval, useReducedMotion } from '../features/hooks';
import { FieldBox, FieldLabel, MockAvatar, MockButton, MockModal, Placeholder } from './mock-ui';

const OPTIONS = [
  { name: 'Ada O.', initials: 'AO' },
  { name: 'Tunde K.', initials: 'TK' },
  { name: 'Kemi M.', initials: 'KM' },
];
const END = 76;

// Step 3: the task dialog picks an assignee, sets a due date and adds a reminder.
export default function TaskVisual() {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useInterval(() => setTick(t => t + 1), reduced || tick >= END ? null : 70);

  const t = reduced ? END : tick;
  const open = t >= 10 && t < 28;
  const highlight = t < 17 ? 0 : 1;
  const selected = t >= 28;
  const dueSet = t >= 36;
  const remindSet = t >= 48;
  const ready = t >= 58;

  return (
    <MockModal title="Edit task" subtitle="Keep the next action precise." className="zw-rise">
      <FieldLabel>Title</FieldLabel>
      <FieldBox>Design review</FieldBox>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Status</FieldLabel>
          <FieldBox className="justify-between">
            In progress
            <ChevronDown size={14} aria-hidden className="text-[color:var(--z-muted)]" />
          </FieldBox>
        </div>

        <div className="relative">
          <FieldLabel>Assignee</FieldLabel>
          <FieldBox focused={open} className="justify-between">
            <span className="flex min-w-0 items-center gap-2">
              {selected ? (
                <>
                  <MockAvatar initials="TK" className="!h-5 !w-5 !text-[8px]" />
                  <span className="truncate">Tunde K.</span>
                </>
              ) : (
                <Placeholder>Unassigned</Placeholder>
              )}
            </span>
            <ChevronDown size={14} aria-hidden className="shrink-0 text-[color:var(--z-muted)]" />
          </FieldBox>

          <div
            className="absolute inset-x-0 top-[calc(100%+6px)] z-20 rounded-xl border border-[color:var(--z-border)] bg-[color:var(--z-surface)] p-1 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.45)] transition-all duration-200"
            style={{ opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(-6px)', pointerEvents: 'none' }}
          >
            {OPTIONS.map((option, i) => (
              <div
                key={option.name}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-[color:var(--z-fg)] transition-colors duration-150 ${
                  highlight === i ? 'bg-[color:var(--z-panel)]' : ''
                }`}
              >
                <MockAvatar initials={option.initials} className="!h-5 !w-5 !text-[8px]" />
                {option.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Due date</FieldLabel>
          <FieldBox focused={t >= 34 && t < 44}>
            <CalendarClock size={14} aria-hidden className="shrink-0 text-[color:var(--z-muted)]" />
            {dueSet ? <span className="truncate">Nov 14, 4:00 PM</span> : <Placeholder>Select date</Placeholder>}
          </FieldBox>
        </div>
        <div>
          <FieldLabel>Remind me</FieldLabel>
          <FieldBox focused={t >= 46 && t < 56} className="justify-between">
            {remindSet ? <span className="truncate">1 hour before</span> : <Placeholder>No reminder</Placeholder>}
            <ChevronDown size={14} aria-hidden className="shrink-0 text-[color:var(--z-muted)]" />
          </FieldBox>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <MockButton>Cancel</MockButton>
        <MockButton primary dim={!ready}>
          Save changes
          <Check size={14} aria-hidden />
        </MockButton>
      </div>
    </MockModal>
  );
}

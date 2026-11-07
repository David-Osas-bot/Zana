import type { Task, TaskInputStatus } from '@workspace/api-client-react';

export type Modal = 'project' | 'task' | 'members' | 'invite' | null;

export const columns: { key: TaskInputStatus; label: string }[] = [
  { key: 'not_done', label: 'Not started' },
  { key: 'doing', label: 'In progress' },
  { key: 'done', label: 'Complete' },
];

// Stage 3: due dates + reminders.
// The generated API client (Task / TaskInputStatus / TaskUpdateStatus) doesn't
// know about these fields yet, so we extend the type locally and cast the
// mutation payloads. Field names match the backend contract: `dueDate`
// (ISO string) and `reminderOffsets` (array of minutes-before, one per
// reminder the task should fire). Once the generated client picks these up,
// the `as any` casts in TaskModal can be dropped.
export type TaskWithReminder = Task & {
  dueDate?: string | null;
  reminderOffsets?: number[];
};

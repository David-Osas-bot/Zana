import { useEffect, useRef } from 'react';
import { apiBaseUrl } from '@/lib/api-base-url';
import { useToast } from './ToastProvider';

// The server already decides *when* a reminder fires (see the 30s
// processDueReminders loop + taskRemindersTable on the backend) and emails
// it. This just polls the in-app inbox for reminders that have fired but
// haven't been shown yet, toasts them, and acks them so they don't repeat.
// App-wide (not scoped to a project board), since the inbox is per-user.
type InboxReminder = {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  dueDate: string | null;
  offsetMinutes: number;
  firedAt: string;
};

export function useReminderInbox() {
  const { push } = useToast();
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`${apiBaseUrl()}/api/reminders/inbox`, { credentials: 'include' });
        if (!res.ok || cancelled) return;
        const reminders: InboxReminder[] = await res.json();

        for (const reminder of reminders) {
          if (cancelled || seenRef.current.has(reminder.id)) continue;
          seenRef.current.add(reminder.id);

          const overdue = reminder.dueDate ? new Date(reminder.dueDate).getTime() < Date.now() : false;
          push({
            tone: overdue ? 'overdue' : 'reminder',
            title: overdue ? `Overdue: ${reminder.taskTitle}` : `Due soon: ${reminder.taskTitle}`,
            message: reminder.dueDate ? new Date(reminder.dueDate).toLocaleString() : undefined,
          });

          // Ack so it doesn't show again on the next poll or after a reload.
          fetch(`${apiBaseUrl()}/api/reminders/${reminder.id}/ack`, { method: 'POST', credentials: 'include' }).catch(() => { });
        }
      } catch (err) {
        console.error('Failed to poll reminder inbox', err);
      }
    };

    poll();
    const interval = setInterval(poll, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [push]);
}

// Renders nothing; mounting it starts the polling.
export function ReminderInboxWatcher() {
  useReminderInbox();
  return null;
}

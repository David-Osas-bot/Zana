import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateTask,
  useUpdateTask,
  getGetOverviewQueryKey,
  getGetProjectQueryKey,
  getListProjectsQueryKey,
} from '@workspace/api-client-react';
import type { Member, Task, TaskInputStatus, TaskUpdateStatus } from '@workspace/api-client-react';
import { Check, X } from 'lucide-react';
import { columns, type TaskWithReminder } from '@/lib/board';

type TaskModalProps = {
  projectId: string;
  task?: Task;
  members: Member[];
  close: () => void;
  after: () => void;
};

export function TaskModal({ projectId, task, members, close, after }: TaskModalProps) {
  const create = useCreateTask();
  const update = useUpdateTask();
  const qc = useQueryClient();
  const existing = task as TaskWithReminder | undefined;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskInputStatus>(task?.status || 'not_done');
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '');
  // datetime-local wants "YYYY-MM-DDTHH:mm" with no timezone/seconds.
  const [dueDate, setDueDate] = useState(existing?.dueDate ? existing.dueDate.slice(0, 16) : '');
  // UI only offers one reminder at a time for now; the backend supports an
  // array (reminderOffsets) so this still round-trips as a single-item list.
  const [reminderOffset, setReminderOffset] = useState<number | ''>(
    existing?.reminderOffsets?.[0] ?? ''
  );
  const [error, setError] = useState<string | null>(null);

  const pending = create.isPending || update.isPending;

  const submit = () => {
    if (!title.trim()) return;
    setError(null);
    const data = {
      title: title.trim(),
      description,
      status,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      reminderOffsets: dueDate && reminderOffset !== '' ? [Number(reminderOffset)] : [],
      // Cast: dueDate/reminderOffsets aren't in the generated client types yet.
    } as any;
    const done = () => {
      qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
      after();
    };
    const fail = (err: unknown) => {
      console.error('Task save failed:', err);
      const message = (err as any)?.response?.data?.error || (err as any)?.message || 'Something went wrong. Check the network tab for details.';
      setError(typeof message === 'string' ? message : 'Could not save this task.');
    };
    if (task) update.mutate({ projectId, taskId: task.id, data: { ...data, status: status as TaskUpdateStatus } }, { onSuccess: done, onError: fail });
    else create.mutate({ projectId, data }, { onSuccess: done, onError: fail });
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}>
      <div className="modal" role="dialog">
        <div className="modal-head">
          <div>
            <h2>{task ? 'Edit task' : 'New task'}</h2>
            <p className="modal-subtitle">{task ? 'Keep the next action precise.' : 'Capture one meaningful next action.'}</p>
          </div>
          <button className="icon-button" onClick={close} data-testid="button-close-task"><X size={17} /></button>
        </div>
        <div className="field">
          <label htmlFor="task-title">Title</label>
          <input id="task-title" autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs doing?" data-testid="input-task-title" />
        </div>
        <div className="field">
          <label htmlFor="task-description">Details</label>
          <textarea id="task-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add context if it helps…" data-testid="input-task-description" />
        </div>
        <div className="field">
          <label htmlFor="task-status">Status</label>
          <select id="task-status" value={status} onChange={e => setStatus(e.target.value as TaskInputStatus)} data-testid="select-task-status">
            {columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="task-assignee">Assignee</label>
          <select id="task-assignee" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} data-testid="select-task-assignee">
            <option value="">Unassigned</option>
            {members.filter(m => m.status === 'active').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="task-due">Due date</label>
          <input
            id="task-due"
            type="datetime-local"
            value={dueDate}
            onChange={e => {
              setDueDate(e.target.value);
              if (!e.target.value) setReminderOffset('');
            }}
            data-testid="input-task-due"
          />
        </div>
        {dueDate && (
          <div className="field">
            <label htmlFor="task-reminder">Remind me</label>
            <select
              id="task-reminder"
              value={reminderOffset}
              onChange={e => setReminderOffset(e.target.value === '' ? '' : Number(e.target.value))}
              data-testid="select-task-reminder"
            >
              <option value="">No reminder</option>
              <option value={15}>15 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={1440}>1 day before</option>
            </select>
          </div>
        )}
        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, margin: '4px 0 0' }} data-testid="text-task-error">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button className="button secondary" onClick={close} data-testid="button-cancel-task">Cancel</button>
          <button className="button" disabled={!title.trim() || pending} onClick={submit} data-testid="button-save-task">
            {pending ? 'Saving…' : task ? 'Save changes' : 'Add task'}
            <Check size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

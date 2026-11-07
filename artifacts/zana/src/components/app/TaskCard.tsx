import { memo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import type { Task, TaskInputStatus } from '@workspace/api-client-react';
import { formatTimeAgo } from '@/lib/utils';
import type { TaskWithReminder } from '@/lib/board';
import { Avatar } from './Avatar';
import { DueBadge } from './DueBadge';

type TaskCardProps = {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  move: (status: TaskInputStatus) => void;
};

export const TaskCard = memo(function TaskCard({ task, onEdit, onDelete, onDragStart, move }: TaskCardProps) {
  const dueDate = (task as TaskWithReminder).dueDate;
  return (
    <article className="task-card" draggable onDragStart={onDragStart} data-testid={`card-task-${task.id}`}>
      <div className="task-card-top">
        <h3>{task.title}</h3>
        <button className="icon-button" onClick={onEdit} data-testid={`button-edit-task-${task.id}`}>
          <MoreHorizontal size={15} />
        </button>
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
      {dueDate && (
        <div style={{ marginTop: 8 }}>
          <DueBadge dueDate={dueDate} status={task.status} />
        </div>
      )}
      <div className="task-footer">
        <span className="task-date">{formatTimeAgo(task.updatedAt)}</span>
        {task.assigneeId ? (
          <span className="task-assignee">
            <Avatar initials={task.assigneeInitials} />{task.assigneeName?.split(' ')[0]}
          </span>
        ) : null}
      </div>
    </article>
  );
});

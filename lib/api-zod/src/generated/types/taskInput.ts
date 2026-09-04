import type { TaskInputStatus } from './taskInputStatus';

export interface TaskInput {
  /** @minLength 1 */
  title: string;
  description?: string;
  status: TaskInputStatus;
  /** @nullable */
  assigneeId?: string | null;
  /** @nullable */
  dueDate?: string | null;       // ← NEW
  reminderOffsets?: number[];    // ← NEW
}
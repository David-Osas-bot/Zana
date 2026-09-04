import type { TaskUpdateStatus } from './taskUpdateStatus';

export interface TaskUpdate {
  /** @minLength 1 */
  title?: string;
  description?: string;
  status?: TaskUpdateStatus;
  /** @nullable */
  assigneeId?: string | null;
  /** @nullable */
  dueDate?: string | null;       // ← NEW
  reminderOffsets?: number[];    // ← NEW
}
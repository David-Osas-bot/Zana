import type { ComponentType } from 'react';
import { CalendarClock, Columns3, FolderPlus, LayoutDashboard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ProjectVisual from './ProjectVisual';
import BoardVisual from './BoardVisual';
import TaskVisual from './TaskVisual';
import OverviewVisual from './OverviewVisual';

export type Step = {
  id: string;
  icon: LucideIcon;
  /** Left tab */
  title: string;
  summary: string;
  /** Right panel: bold lead-in plus a muted sentence */
  lead: string;
  body: string;
  Visual: ComponentType;
};

// Edit, add or reorder steps here. Each step is one tab on the left and one
// panel on the right.
export const steps: Step[] = [
  {
    id: 'project',
    icon: FolderPlus,
    title: 'Create a project',
    summary: 'Give the work a clear home.',
    lead: 'Start with a project.',
    body: 'Name it, say what done looks like, and you have one place for every task, teammate and deadline.',
    Visual: ProjectVisual,
  },
  {
    id: 'board',
    icon: Columns3,
    title: 'Plan on a board',
    summary: 'Move work from not started to complete.',
    lead: 'Plan it on a board.',
    body: 'Add tasks to Not started, In progress or Complete, then drag them forward as the work moves.',
    Visual: BoardVisual,
  },
  {
    id: 'task',
    icon: CalendarClock,
    title: 'Assign and schedule',
    summary: 'Owners, due dates and reminders.',
    lead: 'Give every task an owner and a date.',
    body: 'Assign a teammate, set a due date and pick a reminder, and Zana nudges you before it is due.',
    Visual: TaskVisual,
  },
  {
    id: 'overview',
    icon: LayoutDashboard,
    title: 'Track progress together',
    summary: 'See where everything stands.',
    lead: 'See the whole picture.',
    body: 'Your overview shows open and completed work, your projects and who is on them, so the team stays in step.',
    Visual: OverviewVisual,
  },
];

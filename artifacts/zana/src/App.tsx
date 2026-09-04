import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  useCreateInvite,
  useCreateProject,
  useCreateTask,
  useDeleteProject,
  useDeleteTask,
  useGetMe,
  useGetOverview,
  useGetProject,
  useListProjects,
  useListProjectMembers,
  useUpdateProject,
  useUpdateTask,
  getGetOverviewQueryKey,
  getGetProjectQueryKey,
  getListProjectsQueryKey,
  getListProjectMembersQueryKey
} from '@workspace/api-client-react';
import type { Member, Task, TaskInputStatus, TaskUpdateStatus, Project } from '@workspace/api-client-react';
import { ArrowLeft, ArrowRight, Check, Clock, LayoutDashboard, LogOut, MoreHorizontal, Plus, Send, Settings2, Users, X } from 'lucide-react';
import { createContext, memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Pie, PieChart, Label } from 'recharts';
import { signOutRequest } from '@/lib/auth';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import NotFound from '@/pages/not-found';
import Landing from '@/pages/landing';
import SignIn from '@/pages/signin';
import SignUp from '@/pages/signup';
import { useSession } from '@/hooks/use-session';
import { Redirect } from 'wouter';
import { formatTimeAgo } from "./lib/utils";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const queryClient = new QueryClient();
type Modal = 'project' | 'task' | 'members' | 'invite' | null;
const columns: { key: TaskInputStatus; label: string }[] = [
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
// the `as any` casts below can be dropped.
type TaskWithReminder = Task & {
  dueDate?: string | null;
  reminderOffsets?: number[];
};

function apiBaseUrl() {
  // Matches the pattern already used for the raw member-removal fetch below:
  // dev server on :3000 talks to the API on :3001, everything else is same-origin.
  return window.location.port === '3000' ? 'http://localhost:3001' : '';
}

function ensureArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray((data as any).projects)) return (data as any).projects;
    if (Array.isArray((data as any).members)) return (data as any).members;
    if (Array.isArray((data as any).data)) return (data as any).data;
    if (Array.isArray((data as any).items)) return (data as any).items;
  }
  return [];
}

function Avatar({ initials, className = '' }: { initials?: string | null; className?: string }) {
  return <span className={`avatar ${className}`} data-testid={`avatar-${initials || 'unassigned'}`}>{initials || '—'}</span>;
}

// --- Stage 3: self-contained toast system --------------------------------
// Deliberately dependency-free (no shadcn/radix toast wiring) — plain
// context + fixed-position container + inline styles, so it works
// regardless of what's already set up in the shared CSS file.

type ToastItem = { id: string; title: string; message?: string; tone: 'reminder' | 'overdue' };

const ToastContext = createContext<{ push: (t: Omit<ToastItem, 'id'>) => void } | null>(null);

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const toastContainerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 20,
  right: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  zIndex: 1000,
  maxWidth: 320,
  pointerEvents: 'none',
};

function toastCardStyle(tone: ToastItem['tone']): React.CSSProperties {
  return {
    pointerEvents: 'auto',
    background: tone === 'overdue' ? '#111111' : '#ffffff',
    color: tone === 'overdue' ? '#ffffff' : '#111111',
    border: tone === 'overdue' ? 'none' : '1px solid #e5e5e5',
    borderRadius: 10,
    padding: '12px 14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
    animation: 'zana-toast-in 0.2s ease-out',
  };
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = (t: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id));
    }, 8000);
  };

  const dismiss = (id: string) => setToasts(prev => prev.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div style={toastContainerStyle}>
        <style>{`@keyframes zana-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {toasts.map(t => (
          <div key={t.id} style={toastCardStyle(t.tone)} data-testid={`toast-${t.id}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <strong style={{ fontSize: 13 }}>{t.title}</strong>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                data-testid={`button-dismiss-toast-${t.id}`}
                style={{ background: 'none', border: 'none', color: 'inherit', opacity: 0.6, cursor: 'pointer', padding: 0, lineHeight: 0 }}
              >
                <X size={13} />
              </button>
            </div>
            {t.message && (
              <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>{t.message}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

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

function useReminderInbox() {
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

function ReminderInboxWatcher() {
  useReminderInbox();
  return null;
}

// Small badge shown on task cards. Grayscale to match the rest of the
// board — solid black for overdue, light gray for today, outlined for
// anything further out.
function DueBadge({ dueDate, status }: { dueDate?: string | null; status: TaskInputStatus }) {
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

  const style: React.CSSProperties = {
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
// ---------------------------------------------------------------------------

function Shell({ children }: { children: React.ReactNode }) {
  const { data: me } = useGetMe();
  const [location, setLocation] = useLocation();
  const logout = async () => { await signOutRequest(); window.location.href = '/'; };
  const nav = [{ href: '/', label: 'Overview', icon: LayoutDashboard }];

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="brand" data-testid="link-brand">
          <span className="brand-mark">za</span><span className="brand-name">zana</span>
        </Link>
        <nav className="nav">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${location === href ? 'active' : ''}`} data-testid={`link-nav-${label.toLowerCase()}`}>
              <Icon size={15} strokeWidth={1.8} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="profile">
            <Avatar initials={me?.initials} />
            <div>
              <div className="profile-name" data-testid="text-user-name">{me?.name || 'Workspace'}</div>
              <div className="profile-email">{me?.email || 'Personal workspace'}</div>
            </div>
          </div>
          <button className="button ghost" style={{ marginTop: 10, width: '100%', justifyContent: 'flex-start' }} onClick={logout} data-testid="button-logout"><LogOut size={14} /> Log out</button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <span className="topbar-label">Personal workspace / 01</span>
          <span className="eyebrow">Focus mode</span>
        </header>
        {children}
      </main>

      <nav className="mobile-bar">
        <Link href="/" className={`nav-link ${location === '/' ? 'active' : ''}`} data-testid="link-mobile-overview">
          <LayoutDashboard size={16} /><span>Overview</span>
        </Link>
        <button
          className="nav-link"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          data-testid="button-mobile-logout"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <LogOut size={18} />
        </button>
      </nav>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="content">
      <div className="skeleton" style={{ height: 55, width: 290, marginBottom: 45 }} />
      <div className="stats">
        {[1, 2, 3, 4].map(i => (
          <div className="stat" key={i}>
            <div className="skeleton" style={{ height: 36, width: 70 }} />
            <div className="skeleton" style={{ height: 11, width: 100, marginTop: 12 }} />
          </div>
        ))}
      </div>
      <div className="project-grid">
        {[1, 2, 3].map(i => <div className="skeleton" style={{ height: 183 }} key={i} />)}
      </div>
    </div>
  );
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="content">
      <div className="error">
        <strong>Could not load this workspace.</strong>
        <p>There was a brief interruption. Your work is safe.</p>
        <button className="button secondary" onClick={retry} data-testid="button-retry">Try again</button>
      </div>
    </div>
  );
}

function ProjectModal({ close, onCreated }: { close: () => void; onCreated: (id: string) => void }) {
  const create = useCreateProject();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    create.mutate({ data: { name: name.trim(), description, color: '#111111' } }, {
      onSuccess: p => {
        qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
        onCreated(p.id);
      }
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}>
      <div className="modal" role="dialog">
        <div className="modal-head">
          <div>
            <h2>New project</h2>
            <p className="modal-subtitle">Give the work a clear home.</p>
          </div>
          <button className="icon-button" onClick={close} data-testid="button-close-project"><X size={17} /></button>
        </div>
        <div className="field">
          <label htmlFor="project-name">Project name</label>
          <input id="project-name" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Website refresh" data-testid="input-project-name" />
        </div>
        <div className="field">
          <label htmlFor="project-description">Description</label>
          <textarea id="project-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What does done look like?" data-testid="input-project-description" />
        </div>
        <div className="modal-actions">
          <button className="button secondary" onClick={close} data-testid="button-cancel-project">Cancel</button>
          <button className="button" disabled={!name.trim() || create.isPending} onClick={submit} data-testid="button-create-project">
            {create.isPending ? 'Creating…' : 'Create project'}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Monochrome to match Zana's black-and-white visual language.
const taskChartConfig: ChartConfig = {
  value: { label: 'Tasks' },
  open: { label: 'Open', color: '#111111' },
  completed: { label: 'Completed', color: '#d4d4d4' },
};

function TaskStatusChart({ open, completed }: { open: number; completed: number }) {
  const total = open + completed;

  const data = useMemo(
    () => [
      { status: 'open', label: 'Open', value: open, fill: 'var(--color-open)' },
      { status: 'completed', label: 'Completed', value: completed, fill: 'var(--color-completed)' },
    ],
    [open, completed],
  );

  if (total === 0) {
    return (
      <div className="empty" style={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3>No tasks yet.</h3>
        <p>Task status will show up here once you add some.</p>
      </div>
    );
  }

  const completionRate = Math.round((completed / total) * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
      <ChartContainer config={taskChartConfig} className="aspect-square max-h-[200px]" style={{ width: 200 }}>
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="label" />} />
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={62} outerRadius={90} strokeWidth={3} stroke="#fff">
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground" style={{ fontSize: 26, fontWeight: 800 }}>
                        {completionRate}%
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground" style={{ fontSize: 11 }}>
                        Completed
                      </tspan>
                    </text>
                  );
                }
                return null;
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#111111', display: 'inline-block' }} />
          <span>Open — {open}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#d4d4d4', display: 'inline-block' }} />
          <span>Completed — {completed}</span>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const overview = useGetOverview();
  const projects = useListProjects();
  const [, setLocation] = useLocation();
  const [modal, setModal] = useState<Modal>(null);

  const qc = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      // Refreshes all active dashboard data every minute
      qc.invalidateQueries();
    }, 60000);
    return () => clearInterval(interval);
  }, [qc]);

  const projectList = useMemo(() => ensureArray<Project>(projects.data), [projects.data]);

  if (overview.isLoading || projects.isLoading) return <Shell><LoadingState /></Shell>;
  if (overview.isError || projects.isError) return <Shell><ErrorState retry={() => { overview.refetch(); projects.refetch(); }} /></Shell>;

  const openTaskCount = overview.data?.openTaskCount ?? 0;
  const completedTaskCount = overview.data?.completedTaskCount ?? 0;

  const stats = [
    { label: 'Projects', value: overview.data?.projectCount ?? projectList.length },
    { label: 'Open tasks', value: openTaskCount },
    { label: 'Completed', value: completedTaskCount },
    { label: 'Collaborators', value: overview.data?.memberCount ?? 0 }
  ];

  return (
    <Shell>
      <div className="content">
        <div className="page-heading">
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Monday, your command center</div>
            <h1>Make room for<br />the important work.</h1>
            <p>A quieter way to move projects forward.</p>
          </div>
          <button className="button" onClick={() => setModal('project')} data-testid="button-new-project">
            <Plus size={15} /> New project
          </button>
        </div>

        <div className="stats">
          {stats.map(stat => (
            <div className="stat" key={stat.label}>
              <span className="stat-value" data-testid={`text-stat-${stat.label.toLowerCase().replace(' ', '-')}`}>{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <section>
          <div className="section-head">
            <span className="section-title">Task status</span>
            <span className="section-count">{openTaskCount + completedTaskCount} total</span>
          </div>
          <TaskStatusChart open={openTaskCount} completed={completedTaskCount} />
        </section>

        <section>
          <div className="section-head">
            <span className="section-title">Your projects</span>
            <span className="section-count">{projectList.length} total</span>
          </div>
          {projectList.length ? (
            <div className="project-grid">
              {projectList.map((project, i) => (
                <Link href={`/project/${project.id}`} className="project-card" key={project.id} data-testid={`card-project-${project.id}`}>
                  <span className="project-index">0{i + 1}</span>
                  <span className="project-dot" />
                  <h3>{project.name}</h3>
                  <p>{project.description || 'A focused space for the work ahead.'}</p>
                  <div className="project-meta">
                    <span>{project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}</span>
                    <span>{formatTimeAgo(project.updatedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>A clear desk is a good start.</h3>
              <p>Create your first project and give the next idea somewhere to land.</p>
              <button className="button" onClick={() => setModal('project')} data-testid="button-empty-project">Create a project</button>
            </div>
          )}
        </section>

        <div className="lower-grid">
          <section>
            <div className="section-head">
              <span className="section-title">Recent activity</span>
              <span className="section-count">Latest</span>
            </div>
            {overview.data?.activities?.length ? (
              <div className="activity-list">
                {overview.data.activities.slice(0, 5).map(a => (
                  <div className="activity-item" key={a.id} data-testid={`activity-${a.id}`}>
                    <span className="activity-mark" />
                    <div>
                      <div className="activity-text">{a.text}</div>
                      <span className="activity-time">{formatTimeAgo(a.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">
                <h3>Nothing has moved yet.</h3>
                <p>Updates from your projects will appear here.</p>
              </div>
            )}
          </section>

          <section>
            <div className="section-head">
              <span className="section-title">Quick actions</span>
            </div>
            <div className="quick-actions">
              <button className="quick-action" onClick={() => setModal('project')} data-testid="button-quick-project">
                <span>Start a new project</span>
                <Plus size={15} />
              </button>
              {projectList[0] && (
                <button className="quick-action" onClick={() => setLocation(`/project/${projectList[0].id}`)} data-testid="button-quick-board">
                  <span>Open {projectList[0].name}</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
      {modal === 'project' && <ProjectModal close={() => setModal(null)} onCreated={id => setLocation(`/project/${id}`)} />}
    </Shell>
  );
}

function TaskModal({ projectId, task, members, close, after }: { projectId: string; task?: Task; members: Member[]; close: () => void; after: () => void }) {
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

function MembersModal({ projectId, members, close }: { projectId: string; members: Member[]; close: () => void }) {
  const invite = useCreateInvite();
  const qc = useQueryClient();
  const [email, setEmail] = useState('');

  const submit = () => {
    if (!email.includes('@')) return;
    invite.mutate({ projectId, data: { email } }, {
      onSuccess: () => {
        setEmail('');
        qc.invalidateQueries({ queryKey: getListProjectMembersQueryKey(projectId) });
        qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      }
    });
  };

  const handleRemove = async (memberId: string) => {
    try {
      const baseUrl = window.location.port === "3000" ? "http://localhost:3001" : "";
      const res = await fetch(`${baseUrl}/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        qc.invalidateQueries({ queryKey: getListProjectMembersQueryKey(projectId) });
        qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to remove member");
      }
    } catch (err) {
      console.error("Error removing member:", err);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}>
      <div className="modal" role="dialog">
        <div className="modal-head">
          <div>
            <h2>Project members</h2>
            <p className="modal-subtitle">Keep the right people close to the work.</p>
          </div>
          <button className="icon-button" onClick={close} data-testid="button-close-members"><X size={17} /></button>
        </div>
        <div className="field">
          <label htmlFor="invite-email">Invite by email</label>
          <div style={{ display: 'flex', gap: 7 }}>
            <input id="invite-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" data-testid="input-invite-email" />
            <button className="button" disabled={!email.includes('@') || invite.isPending} onClick={submit} data-testid="button-send-invite">
              <Send size={14} />
              {invite.isPending ? 'Sending…' : 'Invite'}
            </button>
          </div>
        </div>
        <div className="member-list">
          {members.length ? (
            members.map(m => (
              <div className="member-row" key={m.id} data-testid={`member-${m.id}`}>
                <Avatar initials={m.initials} />
                <div className="member-info">
                  <strong>{m.name}</strong>
                  <span>{m.email}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="member-status">{m.status === 'invited' ? 'Invited' : m.role}</span>
                  {m.role !== 'owner' && (
                    <button
                      className="button-link"
                      onClick={() => handleRemove(m.id)}
                      style={{ color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                      data-testid={`button-remove-${m.id}`}
                    >
                      {m.status === 'invited' ? 'Revoke' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="modal-subtitle">No members yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  confirmText = 'Delete',
  onConfirm,
  onClose,
  isPending,
}: {
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
  isPending?: boolean;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            <p className="modal-subtitle">{description}</p>
          </div>
          <button className="icon-button" onClick={onClose} data-testid="button-close-confirm">
            <X size={17} />
          </button>
        </div>
        <div className="modal-actions" style={{ marginTop: 24 }}>
          <button className="button secondary" onClick={onClose} data-testid="button-cancel-confirm">
            Cancel
          </button>
          <button
            className="button"
            disabled={isPending}
            onClick={onConfirm}
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
            data-testid="button-action-confirm"
          >
            {isPending ? 'Deleting…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectBoard() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const board = useGetProject(projectId);
  const memberQuery = useListProjectMembers(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const [modal, setModal] = useState<Modal>(null);
  const [editing, setEditing] = useState<Task>();
  const [dragging, setDragging] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [projectName, setProjectName] = useState('');

  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const members = useMemo(() => {
    const fetchedMembers = ensureArray<Member>(memberQuery.data);
    return fetchedMembers.length ? fetchedMembers : board.data?.members || [];
  }, [memberQuery.data, board.data?.members]);

  const tasks = board.data?.tasks || [];

  const grouped = useMemo(() => columns.reduce((acc, c) => ({
    ...acc,
    [c.key]: tasks.filter(t => t.status === c.key)
  }), {} as Record<TaskInputStatus, Task[]>), [tasks]);

  if (board.isLoading) return <Shell><LoadingState /></Shell>;
  if (board.isError || !board.data) return <Shell><ErrorState retry={() => board.refetch()} /></Shell>;

  const project = board.data.project;

  const move = (task: Task, status: TaskInputStatus) => {
    if (task.status === status) return;

    const queryKey = getGetProjectQueryKey(projectId);
    const previous = qc.getQueryData(queryKey);

    qc.setQueryData(queryKey, (old: any) => {
      if (!old) return old;
      return {
        ...old,
        tasks: (old.tasks || []).map((t: Task) =>
          t.id === task.id ? { ...t, status } : t
        ),
      };
    });

    updateTask.mutate(
      { projectId, taskId: task.id, data: { status: status as TaskUpdateStatus } },
      {
        onError: () => {
          qc.setQueryData(queryKey, previous);
        },
        onSettled: () => {
          qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
        },
      }
    );
  };

  const removeProject = () => {
    setConfirmDeleteProject(true);
  };

  const handleExecuteDeleteProject = () => {
    deleteProject.mutate({ projectId }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
        setLocation('/');
      }
    });
  };

  const handleExecuteDeleteTask = () => {
    if (!taskToDelete) return;

    deleteTask.mutate(
      { projectId, taskId: taskToDelete.id },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
          qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
          setTaskToDelete(null);
        },
      }
    );
  };

  return (
    <Shell>
      <div className="content">
        <Link href="/" className="back-link" data-testid="link-back-overview">
          <ArrowLeft size={13} /> All projects
        </Link>
        <div className="board-heading">
          <div>
            {editingProject ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={projectName || project.name}
                  autoFocus
                  onChange={e => setProjectName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && projectName.trim()) {
                      updateProject.mutate({ projectId, data: { name: projectName.trim() } }, {
                        onSuccess: () => {
                          qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
                          setEditingProject(false);
                        }
                      });
                    }
                  }}
                  style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-.08em', background: 'transparent', border: 0, borderBottom: '1px solid #111', outline: 0, maxWidth: '100%' }}
                  data-testid="input-project-title"
                />
                <button className="icon-button" onClick={() => setEditingProject(false)} data-testid="button-cancel-project-edit">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <h1 data-testid="text-project-name">{project.name}</h1>
            )}
            <p>{project.description || 'A focused space for the work ahead.'}</p>
          </div>
          <div className="board-actions">
            <button className="button secondary" onClick={() => setModal('members')} data-testid="button-manage-members">
              <Users size={14} /> Members <span>{members.length}</span>
            </button>
            <button className="button" onClick={() => { setEditing(undefined); setModal('task'); }} data-testid="button-new-task">
              <Plus size={14} /> New task
            </button>
            <button className="icon-button" onClick={() => setEditingProject(true)} title="Edit project" data-testid="button-edit-project">
              <Settings2 size={16} />
            </button>
            <button className="icon-button" onClick={removeProject} title="Delete project" data-testid="button-delete-project">
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>

        <div className="board">
          {columns.map(column => (
            <div
              className={`column ${dragging ? 'drag-over' : ''}`}
              key={column.key}
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                const task = tasks.find(t => t.id === dragging);
                if (task) move(task, column.key);
                setDragging(null);
              }}
              data-testid={`column-${column.key}`}
            >
              <div className="column-head">
                <span className="column-title">
                  <span className="project-dot" style={{ position: 'static', width: 6, height: 6 }} />
                  {column.label}
                </span>
                <span className="column-number">{String(grouped[column.key].length).padStart(2, '0')}</span>
              </div>
              <div className="task-stack">
                {grouped[column.key].map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => { setEditing(task); setModal('task'); }}
                    onDelete={() => setTaskToDelete(task)}
                    onDragStart={() => setDragging(task.id)}
                    move={status => move(task, status)}
                  />
                ))}
              </div>
              <button className="add-task" onClick={() => { setEditing(undefined); setModal('task'); }} data-testid={`button-add-task-${column.key}`}>
                <Plus size={14} /> Add task
              </button>
            </div>
          ))}
        </div>

        <div className="members-strip">
          <div className="member-stack">
            {members.slice(0, 5).map(m => <Avatar key={m.id} initials={m.initials} />)}
          </div>
          <span className="members-label">{members.length} {members.length === 1 ? 'person' : 'people'} on this project</span>
        </div>
      </div>

      {modal === 'task' && <TaskModal projectId={projectId} task={editing} members={members} close={() => setModal(null)} after={() => setModal(null)} />}
      {modal === 'members' && <MembersModal projectId={projectId} members={members} close={() => setModal(null)} />}

      {confirmDeleteProject && (
        <ConfirmModal
          title={`Delete "${project.name}"?`}
          description="This will permanently delete the project and all of its tasks. This action cannot be undone."
          confirmText="Delete project"
          isPending={deleteProject.isPending}
          onConfirm={handleExecuteDeleteProject}
          onClose={() => setConfirmDeleteProject(false)}
        />
      )}

      {taskToDelete && (
        <ConfirmModal
          title={`Delete "${taskToDelete.title}"?`}
          description="This will permanently delete this task from the project. This action cannot be undone."
          confirmText="Delete task"
          isPending={deleteTask.isPending}
          onConfirm={handleExecuteDeleteTask}
          onClose={() => setTaskToDelete(null)}
        />
      )}
    </Shell>
  );
}

const TaskCard = memo(function TaskCard({ task, onEdit, onDelete, onDragStart, move }: { task: Task; onEdit: () => void; onDelete: () => void; onDragStart: () => void; move: (status: TaskInputStatus) => void }) {
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
function AppContent() {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  return (
    <>
      {user && <ReminderInboxWatcher />}
      <WouterRouter>
        <Switch>
          <Route path="/">
            {user ? <Dashboard /> : <Landing />}
          </Route>
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route path="/project/:projectId">
            {user ? <ProjectBoard /> : <Redirect to="/signin" />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </QueryClientProvider>
  );
}
// import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
// import { useCreateInvite, useCreateProject, useCreateTask, useDeleteProject, useDeleteTask, useGetMe, useGetOverview, useGetProject, useListProjects, useListProjectMembers, useUpdateProject, useUpdateTask, getGetOverviewQueryKey, getGetProjectQueryKey, getListProjectsQueryKey, getListProjectMembersQueryKey } from '@workspace/api-client-react';
// import type { Member, Task, TaskInputStatus, TaskUpdateStatus } from '@workspace/api-client-react';
// import { ArrowLeft, ArrowRight, Check, LayoutDashboard, MoreHorizontal, Plus, Send, Settings2, Users, X } from 'lucide-react';
// import { useMemo, useState } from 'react';
// import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
// import NotFound from '@/pages/not-found';

// const queryClient = new QueryClient();
// type Modal = 'project' | 'task' | 'members' | 'invite' | null;
// const columns: { key: TaskInputStatus; label: string }[] = [
//   { key: 'not_done', label: 'Not started' }, { key: 'doing', label: 'In progress' }, { key: 'done', label: 'Complete' },
// ];

// function Avatar({ initials, className = '' }: { initials?: string | null; className?: string }) {
//   return <span className={`avatar ${className}`} data-testid={`avatar-${initials || 'unassigned'}`}>{initials || '—'}</span>;
// }

// function Shell({ children }: { children: React.ReactNode }) {
//   const { data: me } = useGetMe();
//   const [location] = useLocation();
//   const nav = [{ href: '/', label: 'Overview', icon: LayoutDashboard }];
//   return <div className="shell">
//     <aside className="sidebar">
//       <Link href="/" className="brand" data-testid="link-brand"><span className="brand-mark">za</span><span className="brand-name">zana</span></Link>
//       <nav className="nav">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`nav-link ${location === href ? 'active' : ''}`} data-testid={`link-nav-${label.toLowerCase()}`}><Icon size={15} strokeWidth={1.8} /><span>{label}</span></Link>)}</nav>
//       <div className="sidebar-bottom"><div className="profile"><Avatar initials={me?.initials} /><div><div className="profile-name" data-testid="text-user-name">{me?.name || 'Workspace'}</div><div className="profile-email">{me?.email || 'Personal workspace'}</div></div></div></div>
//     </aside>
//     <main className="main"><header className="topbar"><span className="topbar-label">Personal workspace / 01</span><span className="eyebrow">Focus mode</span></header>{children}</main>
//     <nav className="mobile-bar"><Link href="/" className={`nav-link ${location === '/' ? 'active' : ''}`} data-testid="link-mobile-overview"><LayoutDashboard size={16} /><span>Overview</span></Link></nav>
//   </div>;
// }

// function LoadingState() { return <div className="content"><div className="skeleton" style={{ height: 55, width: 290, marginBottom: 45 }} /><div className="stats">{[1, 2, 3, 4].map(i => <div className="stat" key={i}><div className="skeleton" style={{ height: 36, width: 70 }} /><div className="skeleton" style={{ height: 11, width: 100, marginTop: 12 }} /></div>)}</div><div className="project-grid">{[1, 2, 3].map(i => <div className="skeleton" style={{ height: 183 }} key={i} />)}</div></div>; }
// function ErrorState({ retry }: { retry: () => void }) { return <div className="content"><div className="error"><strong>Could not load this workspace.</strong><p>There was a brief interruption. Your work is safe.</p><button className="button secondary" onClick={retry} data-testid="button-retry">Try again</button></div></div>; }

// function ProjectModal({ close, onCreated }: { close: () => void; onCreated: (id: string) => void }) {
//   const create = useCreateProject(); const qc = useQueryClient(); const [name, setName] = useState(''); const [description, setDescription] = useState('');
//   const submit = () => { if (!name.trim()) return; create.mutate({ data: { name: name.trim(), description, color: '#111111' } }, { onSuccess: p => { qc.invalidateQueries({ queryKey: getListProjectsQueryKey() }); qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() }); onCreated(p.id); } }); };
//   return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}><div className="modal" role="dialog"><div className="modal-head"><div><h2>New project</h2><p className="modal-subtitle">Give the work a clear home.</p></div><button className="icon-button" onClick={close} data-testid="button-close-project"><X size={17} /></button></div><div className="field"><label htmlFor="project-name">Project name</label><input id="project-name" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Website refresh" data-testid="input-project-name" /></div><div className="field"><label htmlFor="project-description">Description</label><textarea id="project-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="What does done look like?" data-testid="input-project-description" /></div><div className="modal-actions"><button className="button secondary" onClick={close} data-testid="button-cancel-project">Cancel</button><button className="button" disabled={!name.trim() || create.isPending} onClick={submit} data-testid="button-create-project">{create.isPending ? 'Creating…' : 'Create project'}<ArrowRight size={14} /></button></div></div></div>;
// }

// function Dashboard() {
//   const overview = useGetOverview(); const projects = useListProjects(); const [, setLocation] = useLocation(); const [modal, setModal] = useState<Modal>(null);
//   if (overview.isLoading || projects.isLoading) return <Shell><LoadingState /></Shell>;
//   if (overview.isError || projects.isError) return <Shell><ErrorState retry={() => { overview.refetch(); projects.refetch(); }} /></Shell>;
//   const stats = [{ label: 'Projects', value: overview.data?.projectCount ?? projects.data?.length ?? 0 }, { label: 'Open tasks', value: overview.data?.openTaskCount ?? 0 }, { label: 'Completed', value: overview.data?.completedTaskCount ?? 0 }, { label: 'Collaborators', value: overview.data?.memberCount ?? 0 }];
//   return <Shell><div className="content"><div className="page-heading"><div><div className="eyebrow" style={{ marginBottom: 16 }}>Monday, your command center</div><h1>Make room for<br />the important work.</h1><p>A quieter way to move projects forward.</p></div><button className="button" onClick={() => setModal('project')} data-testid="button-new-project"><Plus size={15} /> New project</button></div>
//     <div className="stats">{stats.map(stat => <div className="stat" key={stat.label}><span className="stat-value" data-testid={`text-stat-${stat.label.toLowerCase().replace(' ', '-')}`}>{stat.value}</span><span className="stat-label">{stat.label}</span></div>)}</div>
//     <section><div className="section-head"><span className="section-title">Your projects</span><span className="section-count">{projects.data?.length || 0} total</span></div>{projects.data?.length ? <div className="project-grid">{projects.data.map((project, i) => <Link href={`/project/${project.id}`} className="project-card" key={project.id} data-testid={`card-project-${project.id}`}><span className="project-index">0{i + 1}</span><span className="project-dot" /><h3>{project.name}</h3><p>{project.description || 'A focused space for the work ahead.'}</p><div className="project-meta"><span>{project.taskCount} {project.taskCount === 1 ? 'task' : 'tasks'}</span><span>{relative(project.updatedAt)}</span></div></Link>)}</div> : <div className="empty"><h3>A clear desk is a good start.</h3><p>Create your first project and give the next idea somewhere to land.</p><button className="button" onClick={() => setModal('project')} data-testid="button-empty-project">Create a project</button></div>}</section>
//     <div className="lower-grid"><section><div className="section-head"><span className="section-title">Recent activity</span><span className="section-count">Latest</span></div>{overview.data?.activities?.length ? <div className="activity-list">{overview.data.activities.slice(0, 5).map(a => <div className="activity-item" key={a.id} data-testid={`activity-${a.id}`}><span className="activity-mark" /><div><div className="activity-text">{a.text}</div><span className="activity-time">{relative(a.time)}</span></div></div>)}</div> : <div className="empty"><h3>Nothing has moved yet.</h3><p>Updates from your projects will appear here.</p></div>}</section><section><div className="section-head"><span className="section-title">Quick actions</span></div><div className="quick-actions"><button className="quick-action" onClick={() => setModal('project')} data-testid="button-quick-project"><span>Start a new project</span><Plus size={15} /></button>{projects.data?.[0] && <button className="quick-action" onClick={() => setLocation(`/project/${projects.data[0].id}`)} data-testid="button-quick-board"><span>Open {projects.data[0].name}</span><ArrowRight size={15} /></button>}</div></section></div>
//   </div>{modal === 'project' && <ProjectModal close={() => setModal(null)} onCreated={id => setLocation(`/project/${id}`)} />}</Shell>;
// }

// function TaskModal({ projectId, task, members, close, after }: { projectId: string; task?: Task; members: Member[]; close: () => void; after: () => void }) {
//   const create = useCreateTask(); const update = useUpdateTask(); const qc = useQueryClient(); const [title, setTitle] = useState(task?.title || ''); const [description, setDescription] = useState(task?.description || ''); const [status, setStatus] = useState<TaskInputStatus>(task?.status || 'not_done'); const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '');
//   const pending = create.isPending || update.isPending;
//   const submit = () => { if (!title.trim()) return; const data = { title: title.trim(), description, status, assigneeId: assigneeId || null }; const done = () => { qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) }); qc.invalidateQueries({ queryKey: getListProjectsQueryKey() }); qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() }); after(); }; if (task) update.mutate({ projectId, taskId: task.id, data: { ...data, status: status as TaskUpdateStatus } }, { onSuccess: done }); else create.mutate({ projectId, data }, { onSuccess: done }); };
//   return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}><div className="modal" role="dialog"><div className="modal-head"><div><h2>{task ? 'Edit task' : 'New task'}</h2><p className="modal-subtitle">{task ? 'Keep the next action precise.' : 'Capture one meaningful next action.'}</p></div><button className="icon-button" onClick={close} data-testid="button-close-task"><X size={17} /></button></div><div className="field"><label htmlFor="task-title">Title</label><input id="task-title" autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs doing?" data-testid="input-task-title" /></div><div className="field"><label htmlFor="task-description">Details</label><textarea id="task-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add context if it helps…" data-testid="input-task-description" /></div><div className="field"><label htmlFor="task-status">Status</label><select id="task-status" value={status} onChange={e => setStatus(e.target.value as TaskInputStatus)} data-testid="select-task-status">{columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}</select></div><div className="field"><label htmlFor="task-assignee">Assignee</label><select id="task-assignee" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} data-testid="select-task-assignee"><option value="">Unassigned</option>{members.filter(m => m.status === 'active').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div><div className="modal-actions"><button className="button secondary" onClick={close} data-testid="button-cancel-task">Cancel</button><button className="button" disabled={!title.trim() || pending} onClick={submit} data-testid="button-save-task">{pending ? 'Saving…' : task ? 'Save changes' : 'Add task'}<Check size={14} /></button></div></div></div>;
// }

// function MembersModal({ projectId, members, close }: { projectId: string; members: Member[]; close: () => void }) {
//   const invite = useCreateInvite(); const qc = useQueryClient(); const [email, setEmail] = useState(''); const submit = () => { if (!email.includes('@')) return; invite.mutate({ projectId, data: { email } }, { onSuccess: () => { setEmail(''); qc.invalidateQueries({ queryKey: getListProjectMembersQueryKey(projectId) }); qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) }); } }); };
//   return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}><div className="modal" role="dialog"><div className="modal-head"><div><h2>Project members</h2><p className="modal-subtitle">Keep the right people close to the work.</p></div><button className="icon-button" onClick={close} data-testid="button-close-members"><X size={17} /></button></div><div className="field"><label htmlFor="invite-email">Invite by email</label><div style={{ display: 'flex', gap: 7 }}><input id="invite-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" data-testid="input-invite-email" /><button className="button" disabled={!email.includes('@') || invite.isPending} onClick={submit} data-testid="button-send-invite"><Send size={14} />{invite.isPending ? 'Sending…' : 'Invite'}</button></div></div><div className="member-list">{members.length ? members.map(m => <div className="member-row" key={m.id} data-testid={`member-${m.id}`}><Avatar initials={m.initials} /><div className="member-info"><strong>{m.name}</strong><span>{m.email}</span></div><span className="member-status">{m.status === 'invited' ? 'Invited' : m.role}</span></div>) : <p className="modal-subtitle">No members yet.</p>}</div></div></div>;
// }

// function ProjectBoard() {
//   const { projectId = '' } = useParams<{ projectId: string }>(); const board = useGetProject(projectId); const memberQuery = useListProjectMembers(projectId); const updateProject = useUpdateProject(); const deleteProject = useDeleteProject(); const deleteTask = useDeleteTask(); const updateTask = useUpdateTask(); const qc = useQueryClient(); const [, setLocation] = useLocation(); const [modal, setModal] = useState<Modal>(null); const [editing, setEditing] = useState<Task>(); const [dragging, setDragging] = useState<string | null>(null); const [editingProject, setEditingProject] = useState(false); const [projectName, setProjectName] = useState('');
//   const members = memberQuery.data || board.data?.members || []; const tasks = board.data?.tasks || []; const grouped = useMemo(() => columns.reduce((acc, c) => ({ ...acc, [c.key]: tasks.filter(t => t.status === c.key) }), {} as Record<TaskInputStatus, Task[]>), [tasks]);
//   if (board.isLoading) return <Shell><LoadingState /></Shell>; if (board.isError || !board.data) return <Shell><ErrorState retry={() => board.refetch()} /></Shell>; const project = board.data.project;
//   const move = (task: Task, status: TaskInputStatus) => { if (task.status === status) return; updateTask.mutate({ projectId, taskId: task.id, data: { status: status as TaskUpdateStatus } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) }); qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() }); } }); };
//   const removeProject = () => { if (window.confirm(`Delete ${project.name}? This cannot be undone.`)) deleteProject.mutate({ projectId }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getListProjectsQueryKey() }); qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() }); setLocation('/'); } }); };
//   return <Shell><div className="content"><Link href="/" className="back-link" data-testid="link-back-overview"><ArrowLeft size={13} /> All projects</Link><div className="board-heading"><div>{editingProject ? <div style={{ display: 'flex', gap: 8 }}><input value={projectName || project.name} autoFocus onChange={e => setProjectName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && projectName.trim()) { updateProject.mutate({ projectId, data: { name: projectName.trim() } }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) }); setEditingProject(false); } }); } }} style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-.08em', background: 'transparent', border: 0, borderBottom: '1px solid #111', outline: 0, maxWidth: '100%' }} data-testid="input-project-title" /><button className="icon-button" onClick={() => setEditingProject(false)} data-testid="button-cancel-project-edit"><X size={15} /></button></div> : <h1 data-testid="text-project-name">{project.name}</h1>}<p>{project.description || 'A focused space for the work ahead.'}</p></div><div className="board-actions"><button className="button secondary" onClick={() => setModal('members')} data-testid="button-manage-members"><Users size={14} /> Members <span>{members.length}</span></button><button className="button" onClick={() => { setEditing(undefined); setModal('task'); }} data-testid="button-new-task"><Plus size={14} /> New task</button><button className="icon-button" onClick={() => setEditingProject(true)} title="Edit project" data-testid="button-edit-project"><Settings2 size={16} /></button><button className="icon-button" onClick={removeProject} title="Delete project" data-testid="button-delete-project"><MoreHorizontal size={17} /></button></div></div>
//     <div className="board">{columns.map(column => <div className={`column ${dragging ? 'drag-over' : ''}`} key={column.key} onDragOver={e => e.preventDefault()} onDrop={() => { const task = tasks.find(t => t.id === dragging); if (task) move(task, column.key); setDragging(null); }} data-testid={`column-${column.key}`}><div className="column-head"><span className="column-title"><span className="project-dot" style={{ position: 'static', width: 6, height: 6 }} />{column.label}</span><span className="column-number">{String(grouped[column.key].length).padStart(2, '0')}</span></div><div className="task-stack">{grouped[column.key].map(task => <TaskCard key={task.id} task={task} onEdit={() => { setEditing(task); setModal('task'); }} onDelete={() => { if (window.confirm('Delete this task?')) deleteTask.mutate({ projectId, taskId: task.id }, { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) }); qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() }); } }); }} onDragStart={() => setDragging(task.id)} move={status => move(task, status)} />)}</div><button className="add-task" onClick={() => { setEditing(undefined); setModal('task'); }} data-testid={`button-add-task-${column.key}`}><Plus size={14} /> Add task</button></div>)}</div>
//     <div className="members-strip"><div className="member-stack">{members.slice(0, 5).map(m => <Avatar key={m.id} initials={m.initials} />)}</div><span className="members-label">{members.length} {members.length === 1 ? 'person' : 'people'} on this project</span></div>
//   </div>{modal === 'task' && <TaskModal projectId={projectId} task={editing} members={members} close={() => setModal(null)} after={() => setModal(null)} />}{modal === 'members' && <MembersModal projectId={projectId} members={members} close={() => setModal(null)} />}</Shell>;
// }

// function TaskCard({ task, onEdit, onDelete, onDragStart, move }: { task: Task; onEdit: () => void; onDelete: () => void; onDragStart: () => void; move: (status: TaskInputStatus) => void }) {
//   return <article className="task-card" draggable onDragStart={onDragStart} data-testid={`card-task-${task.id}`}><div className="task-card-top"><h3>{task.title}</h3><button className="icon-button" onClick={onEdit} data-testid={`button-edit-task-${task.id}`}><MoreHorizontal size={15} /></button></div>{task.description && <p className="task-description">{task.description}</p>}<div className="task-footer"><span className="task-date">{relative(task.updatedAt)}</span>{task.assigneeId ? <span className="task-assignee"><Avatar initials={task.assigneeInitials} />{task.assigneeName?.split(' ')[0]}</span> : <span className="task-assignee">Unassigned</span>}</div><div style={{ display: 'flex', gap: 3, marginTop: 9, borderTop: '1px solid hsl(var(--border))', paddingTop: 8 }}><button className="button ghost" onClick={onEdit} data-testid={`button-open-task-${task.id}`}>Edit</button>{task.status !== 'not_done' && <button className="button ghost" onClick={() => move('not_done')} data-testid={`button-move-not-done-${task.id}`}><ArrowLeft size={12} /></button>}{task.status !== 'doing' && <button className="button ghost" onClick={() => move('doing')} data-testid={`button-move-doing-${task.id}`}>Doing</button>}{task.status !== 'done' && <button className="button ghost" onClick={() => move('done')} data-testid={`button-move-done-${task.id}`}><Check size={12} /></button>}<button className="button ghost" style={{ marginLeft: 'auto' }} onClick={onDelete} data-testid={`button-delete-task-${task.id}`}><X size={12} /></button></div></article>;
// }

// function relative(date: string) { const d = new Date(date); if (Number.isNaN(d.getTime())) return 'recently'; const mins = Math.max(1, Math.floor((Date.now() - d.getTime()) / 60000)); if (mins < 60) return `${mins}m ago`; const hours = Math.floor(mins / 60); if (hours < 24) return `${hours}h ago`; const days = Math.floor(hours / 24); return `${days}d ago`; }

// function Router() {
//   return (
//     <Switch>
//       <Route path="/" component={Dashboard} />
//       <Route path="/project/:projectId" component={ProjectBoard} />
//       <Route component={NotFound} />
//     </Switch>
//   );
// }

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>
//     </QueryClientProvider>
//   );
// }

// export default App;









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
import { ArrowLeft, ArrowRight, Check, LayoutDashboard, MoreHorizontal, Plus, Send, Settings2, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import NotFound from '@/pages/not-found';
import Landing from '@/pages/landing';
import SignIn from '@/pages/signin';
import SignUp from '@/pages/signup';
import { useSession } from '@/hooks/use-session';
import { Redirect } from 'wouter';

const queryClient = new QueryClient();
type Modal = 'project' | 'task' | 'members' | 'invite' | null;
const columns: { key: TaskInputStatus; label: string }[] = [
  { key: 'not_done', label: 'Not started' },
  { key: 'doing', label: 'In progress' },
  { key: 'done', label: 'Complete' },
];

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

function Shell({ children }: { children: React.ReactNode }) {
  const { data: me } = useGetMe();
  const [location] = useLocation();
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

function Dashboard() {
  const overview = useGetOverview();
  const projects = useListProjects();
  const [, setLocation] = useLocation();
  const [modal, setModal] = useState<Modal>(null);

  const projectList = useMemo(() => ensureArray<Project>(projects.data), [projects.data]);

  if (overview.isLoading || projects.isLoading) return <Shell><LoadingState /></Shell>;
  if (overview.isError || projects.isError) return <Shell><ErrorState retry={() => { overview.refetch(); projects.refetch(); }} /></Shell>;

  const stats = [
    { label: 'Projects', value: overview.data?.projectCount ?? projectList.length },
    { label: 'Open tasks', value: overview.data?.openTaskCount ?? 0 },
    { label: 'Completed', value: overview.data?.completedTaskCount ?? 0 },
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
                    <span>{relative(project.updatedAt)}</span>
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
                      <span className="activity-time">{relative(a.time)}</span>
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
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskInputStatus>(task?.status || 'not_done');
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '');

  const pending = create.isPending || update.isPending;

  const submit = () => {
    if (!title.trim()) return;
    const data = { title: title.trim(), description, status, assigneeId: assigneeId || null };
    const done = () => {
      qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
      after();
    };
    if (task) update.mutate({ projectId, taskId: task.id, data: { ...data, status: status as TaskUpdateStatus } }, { onSuccess: done });
    else create.mutate({ projectId, data }, { onSuccess: done });
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
                <span className="member-status">{m.status === 'invited' ? 'Invited' : m.role}</span>
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
    updateTask.mutate({ projectId, taskId: task.id, data: { status: status as TaskUpdateStatus } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
        qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
      }
    });
  };

  const removeProject = () => {
    if (window.confirm(`Delete ${project.name}? This cannot be undone.`)) {
      deleteProject.mutate({ projectId }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
          setLocation('/');
        }
      });
    }
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
                    onDelete={() => {
                      if (window.confirm('Delete this task?')) {
                        deleteTask.mutate({ projectId, taskId: task.id }, {
                          onSuccess: () => {
                            qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
                            qc.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
                          }
                        });
                      }
                    }}
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
    </Shell>
  );
}

function TaskCard({ task, onEdit, onDelete, onDragStart, move }: { task: Task; onEdit: () => void; onDelete: () => void; onDragStart: () => void; move: (status: TaskInputStatus) => void }) {
  return (
    <article className="task-card" draggable onDragStart={onDragStart} data-testid={`card-task-${task.id}`}>
      <div className="task-card-top">
        <h3>{task.title}</h3>
        <button className="icon-button" onClick={onEdit} data-testid={`button-edit-task-${task.id}`}>
          <MoreHorizontal size={15} />
        </button>
      </div>
      {task.description && <p className="task-description">{task.description}</p>}
      <div className="task-footer">
        <span className="task-date">{relative(task.updatedAt)}</span>
        {task.assigneeId ? (
          <span className="task-assignee">
            <Avatar initials={task.assigneeInitials} />{task.assigneeName?.split(' ')[0]}
          </span>
        ) : (
          <span className="task-assignee">Unassigned</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 9, borderTop: '1px solid hsl(var(--border))', paddingTop: 8 }}>
        <button className="button ghost" onClick={onEdit} data-testid={`button-open-task-${task.id}`}>Edit</button>
        {task.status !== 'not_done' && (
          <button className="button ghost" onClick={() => move('not_done')} data-testid={`button-move-not-done-${task.id}`}>
            <ArrowLeft size={12} />
          </button>
        )}
        {task.status !== 'doing' && (
          <button className="button ghost" onClick={() => move('doing')} data-testid={`button-move-doing-${task.id}`}>Doing</button>
        )}
        {task.status !== 'done' && (
          <button className="button ghost" onClick={() => move('done')} data-testid={`button-move-done-${task.id}`}>
            <Check size={12} />
          </button>
        )}
        <button className="button ghost" style={{ marginLeft: 'auto' }} onClick={onDelete} data-testid={`button-delete-task-${task.id}`}>
          <X size={12} />
        </button>
      </div>
    </article>
  );
}

function relative(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'recently';
  const mins = Math.max(1, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function Router() {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return <div className="grid min-h-dvh place-items-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <Switch>
      <Route path="/signin">{user ? <Redirect to="/" /> : <SignIn />}</Route>
      <Route path="/signup">{user ? <Redirect to="/" /> : <SignUp />}</Route>
      <Route path="/">{user ? <Dashboard /> : <Landing />}</Route>
      <Route path="/project/:projectId">{user ? <ProjectBoard /> : <Redirect to="/signin" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
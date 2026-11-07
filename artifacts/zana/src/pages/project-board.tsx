import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteProject,
  useDeleteTask,
  useGetProject,
  useListProjectMembers,
  useUpdateProject,
  useUpdateTask,
  getGetOverviewQueryKey,
  getGetProjectQueryKey,
  getListProjectsQueryKey,
} from '@workspace/api-client-react';
import type { Member, Task, TaskInputStatus, TaskUpdateStatus } from '@workspace/api-client-react';
import { ArrowLeft, MoreHorizontal, Plus, Settings2, Users, X } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { ensureArray } from '@/lib/ensure-array';
import { columns, type Modal } from '@/lib/board';
import { Shell } from '@/components/app/Shell';
import { Avatar } from '@/components/app/Avatar';
import { LoadingState } from '@/components/app/LoadingState';
import { ErrorState } from '@/components/app/ErrorState';
import { TaskCard } from '@/components/app/TaskCard';
import { TaskModal } from '@/components/app/modals/TaskModal';
import { MembersModal } from '@/components/app/modals/MembersModal';
import { ConfirmModal } from '@/components/app/modals/ConfirmModal';

export default function ProjectBoard() {
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

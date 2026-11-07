import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetOverview, useListProjects } from '@workspace/api-client-react';
import type { Project } from '@workspace/api-client-react';
import { ArrowRight, Plus } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { formatTimeAgo } from '@/lib/utils';
import { ensureArray } from '@/lib/ensure-array';
import type { Modal } from '@/lib/board';
import { Shell } from '@/components/app/Shell';
import { LoadingState } from '@/components/app/LoadingState';
import { ErrorState } from '@/components/app/ErrorState';
import { TaskStatusChart } from '@/components/app/TaskStatusChart';
import { ProjectModal } from '@/components/app/modals/ProjectModal';

export default function Dashboard() {
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

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateProject,
  getGetOverviewQueryKey,
  getListProjectsQueryKey,
} from '@workspace/api-client-react';
import { ArrowRight, X } from 'lucide-react';

export function ProjectModal({ close, onCreated }: { close: () => void; onCreated: (id: string) => void }) {
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

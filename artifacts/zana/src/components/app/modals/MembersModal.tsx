import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateInvite,
  getGetProjectQueryKey,
  getListProjectMembersQueryKey,
} from '@workspace/api-client-react';
import type { Member } from '@workspace/api-client-react';
import { Send, X } from 'lucide-react';
import { apiBaseUrl } from '@/lib/api-base-url';
import { Avatar } from '../Avatar';

export function MembersModal({ projectId, members, close }: { projectId: string; members: Member[]; close: () => void }) {
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
      const res = await fetch(`${apiBaseUrl()}/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        qc.invalidateQueries({ queryKey: getListProjectMembersQueryKey(projectId) });
        qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to remove member');
      }
    } catch (err) {
      console.error('Error removing member:', err);
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

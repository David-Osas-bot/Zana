import { LayoutDashboard, LogOut } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useGetMe } from '@workspace/api-client-react';
import { signOutRequest } from '@/lib/auth';
import { Avatar } from './Avatar';

export function Shell({ children }: { children: React.ReactNode }) {
  const { data: me } = useGetMe();
  const [location] = useLocation();
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

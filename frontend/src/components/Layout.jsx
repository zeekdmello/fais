import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  ListTodo,
  Route,
  CalendarDays,
  ChartNoAxesColumn,
  History,
  Settings,
  LogOut,
  MoreHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Art } from './Art';
import { ErrorBox } from './Common';
const links = [
  ['/app', 'Today', LayoutGrid],
  ['/app/tasks', 'My tasks', ListTodo],
  ['/app/routines', 'Routines', Route],
  ['/app/calendar', 'Calendar', CalendarDays],
  ['/app/statistics', 'Statistics', ChartNoAxesColumn],
  ['/app/activity', 'Activity', History],
  ['/app/settings', 'Settings', Settings],
];
export default function Layout() {
  const { user, loading, error, restore, logout } = useAuth(),
    navigate = useNavigate(),
    [more, setMore] = useState(false),
    [warning, setWarning] = useState('');
  useEffect(() => {
    const show = (e) => setWarning(e.detail);
    window.addEventListener('fais-warning', show);
    return () => window.removeEventListener('fais-warning', show);
  }, []);
  if (loading) return <div className="loading">Finding your place…</div>;
  if (error) return <ErrorBox error={error} retry={restore} />;
  if (!user) return <Navigate to="/login" replace />;
  async function signOut() {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      setWarning(e.message);
    }
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          fais<span>✳</span>
        </Link>
        <div className="workspace-label">YOUR LITTLE CORNER</div>
        <nav>
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/app'}>
              <Icon size={20} />
              <span>{label}</span>
              {to === '/app' && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <Art kind="plant" />
          <strong>Progress, at your pace.</strong>
          <p>
            A little is a lot
            <br />
            when you do it every day.
          </p>
        </div>
        <div className="profile">
          <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{user.name}</strong>
            <span>
              {user.email.endsWith('@fais.local') ? 'Demo workspace' : 'Your personal space'}
            </span>
          </div>
          <button className="icon-button" aria-label="Log out" onClick={signOut}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <span>
            MAKE A LITTLE PROGRESS <span className="top-star">✳</span>
          </span>
          <Link to="/app/settings">
            {user.name} <span className="small-avatar">{user.name.charAt(0).toUpperCase()}</span>
          </Link>
        </header>
        {warning && (
          <div className="warning" role="alert">
            {warning}
            <button onClick={() => setWarning('')}>Dismiss</button>
          </div>
        )}
        <main className="content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Small steps. Good days.</span>
          <span>
            fais / MAKE IT YOURS <ArrowUpRight size={12} />
          </span>
        </footer>
      </div>
      <nav className="mobile-nav">
        {links.slice(0, 4).map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={to === '/app'}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button aria-expanded={more} onClick={() => setMore(!more)}>
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>
      {more && (
        <div className="more-menu">
          {links.slice(4).map(([to, label, Icon]) => (
            <Link onClick={() => setMore(false)} key={to} to={to}>
              <Icon size={19} />
              {label}
            </Link>
          ))}
          <button onClick={signOut}>
            <LogOut size={19} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

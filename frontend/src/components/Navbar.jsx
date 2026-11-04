import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, LogOut, ChevronRight, User } from 'lucide-react';

const Navbar = ({ title, breadcrumbs = [], onToggleSidebar }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(role === 'ADMIN' ? '/admin/login' : '/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="btn btn-outline btn-sm"
          onClick={onToggleSidebar}
          style={{ display: window.innerWidth > 768 ? 'none' : 'inline-flex' }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="topbar-breadcrumbs">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {crumb.path ? (
                  <Link to={crumb.path}>{crumb.label}</Link>
                ) : (
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {crumb.label}
                  </span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <ChevronRight size={14} className="topbar-breadcrumbs-separator" />
                )}
              </React.Fragment>
            ))
          ) : (
            <h1 className="topbar-title">{title || 'Dashboard'}</h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            backgroundColor: 'var(--surface-muted)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8125rem',
          }}
        >
          <User size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || user?.email || 'User'}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: role === 'ADMIN' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(79, 70, 229, 0.1)',
              color: role === 'ADMIN' ? 'var(--status-error)' : 'var(--primary-color)',
            }}
          >
            {role === 'ADMIN' ? 'Admin' : 'Student'}
          </span>
        </div>

        <button
          className="btn btn-outline btn-sm"
          onClick={handleLogout}
          title="Sign out of account"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

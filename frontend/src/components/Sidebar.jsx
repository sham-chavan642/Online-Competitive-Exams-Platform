import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  Clock,
  Award,
  Users,
  LogOut,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';

const Sidebar = ({ isAdmin, isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? '/admin/login' : '/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Topics', path: '/admin/topics', icon: BookOpen },
    { name: 'Exams', path: '/admin/exams', icon: FileText },
    { name: 'Questions', path: '/admin/questions', icon: HelpCircle },
    { name: 'Attempts', path: '/admin/attempts', icon: Clock },
    { name: 'Results', path: '/admin/results', icon: Award },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Available Exams', path: '/student/exams', icon: FileText },
    { name: 'My Results', path: '/student/results', icon: Award },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  // Extract initials for avatar
  const initials = (user?.name || user?.email || (isAdmin ? 'Admin' : 'Student'))
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {isOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              {isAdmin ? <ShieldCheck size={20} /> : <GraduationCap size={20} />}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.1 }}>
                PrepMaster
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 500 }}>
                {isAdmin ? 'Admin Workspace' : 'Examination Portal'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              color: 'var(--text-secondary)',
              padding: '0.25rem',
              display: window.innerWidth > 768 ? 'none' : 'flex',
            }}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Navigation</div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{link.name}</span>
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </NavLink>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || user?.email || 'User'}</div>
              <div className="sidebar-user-role">{isAdmin ? 'Administrator' : 'Candidate'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              color: 'var(--text-secondary)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--transition-fast)',
            }}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

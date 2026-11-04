import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/authApi';
import { useAuth } from '../../hooks/useAuth';
import ErrorMessage from '../../components/ErrorMessage';
import { ShieldCheck, Eye, EyeOff, Lock, Sparkles } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleQuickFill = () => {
    setEmail('admin1@example.com');
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.loginAdmin({ email, password });
      login({ ...response.user, role: 'ADMIN' }, response.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrator email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid #E2E8F0',
          boxShadow: '0 24px 60px -24px rgba(15, 23, 42, 0.22)',
          padding: '2.5rem 2rem',
          color: '#0F172A',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 10px rgba(220, 38, 38, 0.4)',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
            Administrator Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Authorized personnel only. Manage exams, topics, and question banks.
          </p>
        </div>

        {/* Demo Helper */}
        <div
          style={{
            padding: '0.625rem 0.875rem',
            backgroundColor: '#FFF7F7',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed #FECACA',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
          }}
        >
          <div className="flex items-center gap-2" style={{ color: '#64748B' }}>
            <Sparkles size={15} style={{ color: '#F87171' }} />
            <span>Admin Demo:</span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            style={{
              fontWeight: 600,
              color: '#F87171',
              fontSize: '0.8125rem',
              textDecoration: 'underline',
            }}
          >
            Auto-fill admin1
          </button>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email" style={{ color: '#334155' }}>
              Administrator Email
            </label>
            <input
              id="admin-email"
              type="email"
              className="form-control"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#CBD5E1',
                color: '#FFFFFF',
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin1@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password" style={{ color: '#334155' }}>
              Security Password
            </label>
            <div className="input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control input-with-right-icon"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  color: '#FFFFFF',
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: '#64748B' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-danger btn-lg w-full mt-4"
            disabled={isLoading}
            style={{ backgroundColor: '#DC2626' }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Lock size={18} />
                <span>Verify & Enter Admin Console</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0', textAlign: 'center', fontSize: '0.875rem' }}>
          <Link
            to="/login"
            style={{ color: '#64748B', fontSize: '0.8125rem' }}
          >
            ← Return to Candidate Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

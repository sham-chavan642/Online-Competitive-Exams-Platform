import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  GraduationCap, 
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import AppLayout from '../../components/AppLayout';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';

const ManageAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [securityEvents, setSecurityEvents] = useState([]);
  const [securitySettings, setSecuritySettings] = useState([]);
  const [securityExamId, setSecurityExamId] = useState('');
  const [violationLimit, setViolationLimit] = useState(3);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [securityError, setSecurityError] = useState(null);
  const [securityMessage, setSecurityMessage] = useState('');
  const [savingSecuritySettings, setSavingSecuritySettings] = useState(false);
  const [recoveringAttemptId, setRecoveringAttemptId] = useState(null);
  const [recoveryLink, setRecoveryLink] = useState('');

  useEffect(() => {
    fetchAttempts();
    fetchSecurityMonitoring();
    const refreshTimer = window.setInterval(() => {
      void fetchAttempts(true);
    }, 10000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const fetchAttempts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await adminApi.getAttempts();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAttempts(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidate examination attempts.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchSecurityMonitoring = async () => {
    try {
      const [eventResponse, settingsResponse] = await Promise.all([
        adminApi.getSecurityEvents(),
        adminApi.getSecuritySettings(),
      ]);
      const events = eventResponse?.data || [];
      const settings = settingsResponse?.data || [];
      setSecurityEvents(events);
      setSecuritySettings(settings);
      if (settings.length > 0) {
        setSecurityExamId(String(settings[0].exam_id));
        setViolationLimit(Number(settings[0].violation_limit));
        setAutoSubmit(Boolean(settings[0].auto_submit));
      }
    } catch (err) {
      setSecurityError(err.response?.data?.message || 'Failed to load security activity and settings.');
    }
  };

  const handleSecurityExamChange = (event) => {
    const examId = event.target.value;
    const setting = securitySettings.find((item) => String(item.exam_id) === examId);
    setSecurityExamId(examId);
    setViolationLimit(Number(setting?.violation_limit || 3));
    setAutoSubmit(Boolean(setting?.auto_submit));
    setSecurityMessage('');
  };

  const saveSecuritySettings = async () => {
    try {
      setSavingSecuritySettings(true);
      setSecurityError(null);
      const response = await adminApi.updateSecuritySettings(Number(securityExamId), {
        violationLimit: Number(violationLimit),
        autoSubmit,
      });
      setSecuritySettings((previous) => previous.map((item) => (
        String(item.exam_id) === securityExamId
          ? { ...item, violation_limit: response.data.violation_limit, auto_submit: response.data.auto_submit }
          : item
      )));
      setSecurityMessage('Security settings saved.');
    } catch (err) {
      setSecurityError(err.response?.data?.message || 'Failed to save security settings.');
    } finally {
      setSavingSecuritySettings(false);
    }
  };

  const recoverAutoSubmittedAttempt = async (attempt) => {
    const attemptId = attempt.attempt_id || attempt.id;
    if (!window.confirm(`Recover ${attempt.student_name || 'this candidate'}'s auto-submitted attempt? Their saved answers will be preserved and the exam timer will restart.`)) {
      return;
    }

    try {
      setRecoveringAttemptId(attemptId);
      setSecurityError(null);
      await adminApi.recoverAutoSubmittedAttempt(attemptId);
      setRecoveryLink(`${window.location.origin}/student/exam/${attemptId}`);
      setSecurityMessage(`Attempt #${attemptId} recovered. Ask the candidate to reopen the exam using the resume link.`);
      await fetchAttempts(true);
      const eventResponse = await adminApi.getSecurityEvents();
      setSecurityEvents(eventResponse?.data || []);
    } catch (err) {
      setSecurityError(err.response?.data?.message || 'Failed to recover the auto-submitted attempt.');
    } finally {
      setRecoveringAttemptId(null);
    }
  };

  const copyRecoveryLink = async () => {
    try {
      await navigator.clipboard.writeText(recoveryLink);
      setSecurityMessage('Resume link copied. Share it with the candidate after they sign in.');
    } catch (err) {
      setSecurityError(err.message || 'Could not copy the resume link. Select and copy the displayed URL.');
    }
  };

  const metrics = useMemo(() => {
    const total = attempts.length;
    const submitted = attempts.filter((a) => (a.status || '').toUpperCase() === 'SUBMITTED').length;
    const inProgress = attempts.filter((a) => (a.status || '').toUpperCase() === 'IN_PROGRESS').length;
    return { total, submitted, inProgress };
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    return attempts.filter((a) => {
      const q = searchTerm.toLowerCase().trim();
      const student = (a.candidate_name || a.student_name || a.student?.name || '').toLowerCase();
      const prn = (a.candidate_prn || '').toLowerCase();
      const exam = (a.exam_name || a.exam?.title || a.exam?.exam_name || '').toLowerCase();
      const matchesSearch = student.includes(q) || prn.includes(q) || exam.includes(q);

      const status = (a.status || '').toUpperCase();
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [attempts, searchTerm, statusFilter]);

  return (
    <AppLayout
      isAdmin={true}
      title="Examination Attempts"
      breadcrumbs={[{ label: 'Admin Console' }, { label: 'Attempts' }]}
    >
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Candidate Examination Attempts</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Live session telemetry, audit logs, submission timestamps, and candidate exam statuses.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard
          title="Total Attempts"
          value={metrics.total}
          icon={ClipboardCheck}
          variant="primary"
        />
        <StatCard
          title="Completed Submissions"
          value={metrics.submitted}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Active In-Progress"
          value={metrics.inProgress}
          icon={Clock}
          variant="warning"
        />
      </div>

      <section className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="flex items-center justify-between" style={{ gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Currently Taking Exams</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: '0.25rem 0 0' }}>
              Live participant list refreshes every 10 seconds.
            </p>
          </div>
          <span className="badge badge-warning">{metrics.inProgress} active</span>
        </div>
        {attempts.some((attempt) => (attempt.status || '').toUpperCase() === 'IN_PROGRESS') ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>PRN</th>
                  <th>Exam</th>
                  <th style={{ textAlign: 'center' }}>Duration</th>
                  <th>Started At</th>
                </tr>
              </thead>
              <tbody>
                {attempts
                  .filter((attempt) => (attempt.status || '').toUpperCase() === 'IN_PROGRESS')
                  .map((attempt) => (
                    <tr key={attempt.attempt_id}>
                      <td>{attempt.candidate_name || attempt.student_name}</td>
                      <td>{attempt.candidate_prn || '—'}</td>
                      <td>{attempt.exam_name}</td>
                      <td style={{ textAlign: 'center' }}>{attempt.exam_duration} minutes</td>
                      <td>{attempt.started_at ? new Date(attempt.started_at).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            No students are currently taking an exam.
          </p>
        )}
      </section>

      <section className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
          <ShieldAlert size={18} style={{ color: 'var(--status-warning)' }} />
          <h3 style={{ margin: 0 }}>Exam Security Activity</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Security event records and per-exam violation thresholds. Camera frames are not stored.
        </p>
        <ErrorMessage message={securityError} />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'end',
            gap: '0.75rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <label style={{ minWidth: '220px', flex: '1' }}>
            <span className="form-label">Examination</span>
            <select className="form-control" value={securityExamId} onChange={handleSecurityExamChange}>
              {securitySettings.map((setting) => (
                <option key={setting.exam_id} value={setting.exam_id}>{setting.exam_name}</option>
              ))}
            </select>
          </label>
          <label style={{ width: '150px' }}>
            <span className="form-label">Violation limit</span>
            <input
              type="number"
              min="1"
              max="100"
              className="form-control"
              value={violationLimit}
              onChange={(event) => setViolationLimit(event.target.value)}
            />
          </label>
          <label className="flex items-center gap-2" style={{ minHeight: '40px', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={autoSubmit}
              onChange={(event) => setAutoSubmit(event.target.checked)}
            />
            Auto-submit at limit
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={saveSecuritySettings}
            disabled={!securityExamId || savingSecuritySettings || Number(violationLimit) < 1 || Number(violationLimit) > 100}
          >
            {savingSecuritySettings ? 'Saving...' : 'Save Security Settings'}
          </button>
          {securityMessage && (
            <span role="status" style={{ color: 'var(--status-success)', fontSize: '0.875rem' }}>{securityMessage}</span>
          )}
        </div>
        {recoveryLink && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
            <strong>Candidate resume URL:</strong>{' '}
            <code>{recoveryLink}</code>{' '}
            <button type="button" className="btn btn-outline btn-sm" onClick={copyRecoveryLink}>
              Copy resume link
            </button>
          </div>
        )}

        <h4 style={{ margin: '1rem 0 0.75rem' }}>Recent Student Events</h4>
        {securityEvents.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>PRN</th>
                  <th>Exam</th>
                  <th>Attempt</th>
                  <th>Event</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {securityEvents.slice(0, 30).map((event) => (
                  <tr key={event.event_id}>
                    <td>{event.student_name}</td>
                    <td>{event.candidate_prn || '—'}</td>
                    <td>{event.exam_name}</td>
                    <td>#{event.attempt_id}</td>
                    <td>
                      <strong>{event.event_type.replaceAll('_', ' ')}</strong>
                      {event.details && <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{event.details}</div>}
                    </td>
                    <td>{event.occurred_at ? new Date(event.occurred_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No security events have been recorded.</p>
        )}
      </section>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Search by candidate name or examination title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted Only</option>
              <option value="IN_PROGRESS">In Progress Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attempts Table */}
      {loading ? (
        <Loading text="Loading attempt audit records..." />
      ) : filteredAttempts.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Attempt ID</th>
                  <th>Candidate</th>
                  <th>PRN</th>
                  <th>Examination</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Score</th>
                  <th>Session Started</th>
                  <th>Submission Timestamp</th>
                  <th>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((attempt) => {
                  const aId = attempt.attempt_id || attempt.id;
                  const isSubmitted = (attempt.status || '').toUpperCase() === 'SUBMITTED';

                  return (
                    <tr key={aId}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }} className="tabular-nums">
                        #{aId}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--background-color)',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '0.8125rem',
                              flexShrink: 0,
                            }}
                          >
                            {(attempt.candidate_name || attempt.student_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{attempt.candidate_name || attempt.student_name || 'Candidate'}</span>
                        </div>
                      </td>
                      <td>{attempt.candidate_prn || '—'}</td>
                      <td style={{ fontWeight: 500 }}>
                        {attempt.exam_name || attempt.exam?.title || 'Exam'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isSubmitted ? 'badge-success' : 'badge-warning'}`}>
                          {Number(attempt.auto_submitted) === 1 ? 'Auto-submitted' : attempt.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }} className="tabular-nums">
                        {attempt.score ?? '—'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          <span>{attempt.started_at ? new Date(attempt.started_at).toLocaleString() : '—'}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {attempt.submitted_at ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} style={{ color: 'var(--status-success)' }} />
                            <span>{new Date(attempt.submitted_at).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--status-warning)', fontWeight: 500 }}>
                            Active In-Progress
                          </span>
                        )}
                      </td>
                      <td>
                        {Number(attempt.auto_submitted) === 1 && (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => recoverAutoSubmittedAttempt(attempt)}
                            disabled={recoveringAttemptId === aId}
                          >
                            {recoveringAttemptId === aId ? 'Recovering...' : 'Recover Attempt'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="No Examination Attempts Found"
          description={
            searchTerm || statusFilter !== 'ALL'
              ? 'No attempts match the applied filters. Try clearing your search.'
              : 'No candidates have launched an examination yet.'
          }
          actionText={searchTerm || statusFilter !== 'ALL' ? 'Clear Filters' : undefined}
          onAction={
            searchTerm || statusFilter !== 'ALL'
              ? () => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }
              : undefined
          }
        />
      )}
    </AppLayout>
  );
};

export default ManageAttempts;

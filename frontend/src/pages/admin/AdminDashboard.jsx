import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  HelpCircle, 
  ClipboardCheck, 
  CheckCircle2, 
  PlusCircle, 
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import AppLayout from '../../components/AppLayout';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentExams, setRecentExams] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashRes, examsRes, resultsRes] = await Promise.all([
          adminApi.getDashboard().catch(() => null),
          adminApi.getExams().catch(() => null),
          adminApi.getResults().catch(() => null),
        ]);

        const stats = dashRes?.data || dashRes || {};
        setDashboardData(stats);

        const examsList = Array.isArray(examsRes) ? examsRes : (examsRes?.data || []);
        setRecentExams(examsList.slice(0, 5));

        const resultsList = Array.isArray(resultsRes) ? resultsRes : (resultsRes?.data || []);
        setRecentResults(resultsList.slice(0, 5));
      } catch (err) {
        setError('Failed to load administrative overview metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const totalStudents = dashboardData?.total_students ?? dashboardData?.totalStudents ?? 0;
  const totalExams = dashboardData?.total_exams ?? dashboardData?.totalExams ?? 0;
  const totalTopics = dashboardData?.total_topics ?? dashboardData?.totalTopics ?? 0;
  const totalQuestions = dashboardData?.total_questions ?? dashboardData?.totalQuestions ?? 0;
  const totalAttempts = dashboardData?.total_attempts ?? dashboardData?.totalAttempts ?? 0;
  const completedAttempts = dashboardData?.completed_attempts ?? dashboardData?.completedAttempts ?? 0;

  return (
    <AppLayout
      isAdmin={true}
      title="Admin Dashboard"
      breadcrumbs={[{ label: 'Admin Console' }, { label: 'Overview' }]}
    >
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>System Administration Console</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Monitor candidate enrollments, examination activity, question repositories, and submission audits.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading text="Loading administration metrics..." />
      ) : (
        <>
          {/* Quick Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <StatCard
              title="Registered Candidates"
              value={totalStudents}
              icon={Users}
              variant="primary"
            />
            <StatCard
              title="Active Examinations"
              value={totalExams}
              icon={GraduationCap}
              variant="default"
            />
            <StatCard
              title="Subject Topics"
              value={totalTopics}
              icon={BookOpen}
              variant="default"
            />
            <StatCard
              title="Question Bank Items"
              value={totalQuestions}
              icon={HelpCircle}
              variant="default"
            />
            <StatCard
              title="Total Test Attempts"
              value={totalAttempts}
              icon={ClipboardCheck}
              variant="warning"
            />
            <StatCard
              title="Completed Submissions"
              value={completedAttempts}
              icon={CheckCircle2}
              variant="success"
            />
          </div>

          {/* Quick Action Bar */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Administrative Actions
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/admin/exams')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <PlusCircle size={16} />
                <span>Create New Exam</span>
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/admin/questions')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <HelpCircle size={16} />
                <span>Manage Questions</span>
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/admin/topics')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <BookOpen size={16} />
                <span>Manage Topics</span>
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/admin/students')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Users size={16} />
                <span>View Candidates</span>
              </button>
            </div>
          </div>

          {/* Two-Column Overview: Recent Exams & Recent Results */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Recent Examinations */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Active Examinations</h3>
                <button
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
                  onClick={() => navigate('/admin/exams')}
                >
                  <span>View All</span>
                  <ArrowRight size={13} style={{ marginLeft: '4px' }} />
                </button>
              </div>

              {recentExams.length > 0 ? (
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Exam Title</th>
                        <th>Duration</th>
                        <th style={{ textAlign: 'right' }}>Total Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExams.map((exam) => (
                        <tr
                          key={exam.exam_id || exam.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate('/admin/exams')}
                        >
                          <td style={{ fontWeight: 600 }}>
                            {exam.exam_name || exam.title || 'Exam'}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {exam.duration} mins
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }} className="tabular-nums">
                            {exam.total_marks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No examinations created yet.
                </div>
              )}
            </div>

            {/* Recent Examination Submissions */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Recent Test Submissions</h3>
                <button
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
                  onClick={() => navigate('/admin/results')}
                >
                  <span>View All</span>
                  <ArrowRight size={13} style={{ marginLeft: '4px' }} />
                </button>
              </div>

              {recentResults.length > 0 ? (
                <div className="table-container" style={{ margin: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Score</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentResults.map((r) => {
                        const isPass = (r.result_status || r.status || '').toUpperCase() === 'PASS';
                        return (
                          <tr key={r.result_id || r.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{r.student_name || r.student?.name || 'Student'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {r.exam_name || r.exam?.title || 'Exam'}
                              </div>
                            </td>
                            <td className="tabular-nums" style={{ fontWeight: 600 }}>
                              {r.score}
                            </td>
                            <td>
                              <span className={`badge ${isPass ? 'badge-success' : 'badge-error'}`}>
                                {isPass ? 'PASS' : 'FAIL'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }} className="tabular-nums">
                              {parseFloat(r.percentage || 0).toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No candidate submissions recorded yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default AdminDashboard;

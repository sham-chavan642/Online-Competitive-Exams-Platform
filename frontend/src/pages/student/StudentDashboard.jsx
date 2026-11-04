import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useStudent from '../../hooks/useStudent';
import useResults from '../../hooks/useResults';
import AppLayout from '../../components/AppLayout';
import StatCard from '../../components/StatCard';
import ExamCard from '../../components/ExamCard';
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  FileText,
  CheckCircle2,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Trophy,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { getAvailableExams, availableExams, loading: examsLoading, error: examsError } = useStudent();
  const { getMyResults, myResults, loading: resultsLoading, error: resultsError } = useResults();
  const navigate = useNavigate();

  useEffect(() => {
    getAvailableExams();
    getMyResults();
  }, [getAvailableExams, getMyResults]);

  const loading = examsLoading || resultsLoading;
  const error = examsError || resultsError;

  const examsList = availableExams || [];
  const resultsList = myResults || [];

  const completedCount = resultsList.length;
  const passedCount = resultsList.filter(
    (r) => r.result_status === 'PASS' || r.status === 'PASS'
  ).length;

  const avgScore = completedCount > 0
    ? (
        resultsList.reduce(
          (acc, curr) => acc + (parseFloat(curr.percentage) || 0),
          0
        ) / completedCount
      ).toFixed(1)
    : 0;

  return (
    <AppLayout title="Student Dashboard">
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.25rem',
          color: '#FFFFFF',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.2rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={14} />
            <span>Candidate Examination Portal</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name || 'Candidate'}!
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: '0.375rem', fontSize: '0.9375rem', lineHeight: 1.5 }}>
            You have <strong style={{ color: '#FFFFFF' }}>{examsList.length} active exams</strong> ready for evaluation. Test your knowledge, monitor real-time rankings, and review scorecards.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            className="btn"
            style={{
              backgroundColor: '#FFFFFF',
              color: 'var(--primary-color)',
              fontWeight: 700,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            onClick={() => navigate('/student/exams')}
          >
            <span>Explore Exams</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Available Exams"
          value={examsList.length}
          subtitle="Ready to attempt"
          icon={FileText}
          color="primary"
        />

        <StatCard
          title="Tests Completed"
          value={completedCount}
          subtitle="Evaluation finalized"
          icon={CheckCircle2}
          color="success"
        />

        <StatCard
          title="Average Score"
          value={`${avgScore}%`}
          subtitle="Across all attempts"
          icon={TrendingUp}
          color="warning"
        />

        <StatCard
          title="Exams Passed"
          value={passedCount}
          subtitle={`${completedCount > 0 ? ((passedCount / completedCount) * 100).toFixed(0) : 0}% passing rate`}
          icon={Award}
          color="primary"
        />
      </div>

      {/* Main Content Sections: Available Exams & Recent Activity */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Available Exams Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recommended Exams</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Active tests available for your enrolled topics
              </p>
            </div>
            {examsList.length > 0 && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/student/exams')}
              >
                <span>View All ({examsList.length})</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {loading && examsList.length === 0 ? (
            <Loading text="Loading available examinations..." />
          ) : examsList.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {examsList.slice(0, 3).map((exam) => (
                <ExamCard
                  key={exam.exam_id || exam.id}
                  exam={{
                    ...exam,
                    title: exam.exam_name || exam.title,
                    status: 'AVAILABLE',
                  }}
                  actionText="View Details & Start"
                  onAction={() => navigate(`/student/exams/${exam.exam_id || exam.id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No active exams available"
              description="You have completed all scheduled exams, or there are no active examination windows right now."
              actionText="View Past Results"
              onAction={() => navigate('/student/results')}
            />
          )}
        </div>

        {/* Recent Results Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Examination Results</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Your latest scored performances and completion certificates
              </p>
            </div>
            {resultsList.length > 0 && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/student/results')}
              >
                <span>Full History</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {resultsList.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Examination</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Evaluation Status</th>
                    <th>Submitted On</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsList.slice(0, 4).map((res) => {
                    const isPass = res.result_status === 'PASS' || res.status === 'PASS';
                    const examTitle = res.exam_name || res.exam?.exam_name || 'Competitive Test';
                    const percentage = parseFloat(res.percentage || 0).toFixed(1);

                    return (
                      <tr key={res.result_id || res.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{examTitle}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attempt #{res.attempt_id}</div>
                        </td>
                        <td className="tabular-nums" style={{ fontWeight: 600 }}>
                          {res.score}
                        </td>
                        <td className="tabular-nums" style={{ fontWeight: 700, color: isPass ? 'var(--status-success)' : 'var(--status-error)' }}>
                          {percentage}%
                        </td>
                        <td>
                          <span className={`badge ${isPass ? 'badge-success' : 'badge-error'}`}>
                            {isPass ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                          {new Date(res.generated_at || res.created_at || Date.now()).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => navigate(`/student/results/${res.result_id || res.id}`)}
                            >
                              Scorecard
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => navigate(`/student/ranking/${res.exam_id}`)}
                            >
                              <Trophy size={13} />
                              <span>Rankings</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="No completed attempts yet"
              description="Take your first examination to see performance metrics, score breakdown, and leaderboards."
              actionText="Browse Available Exams"
              onAction={() => navigate('/student/exams')}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Trophy, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  TrendingUp,
  Award
} from 'lucide-react';
import useResults from '../../hooks/useResults';
import AppLayout from '../../components/AppLayout';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';

const Results = () => {
  const { getMyResults, myResults, loading, error } = useResults();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    getMyResults();
  }, [getMyResults]);

  const rawList = useMemo(() => {
    if (!myResults) return [];
    if (Array.isArray(myResults)) return myResults;
    if (Array.isArray(myResults.results)) return myResults.results;
    if (Array.isArray(myResults.data)) return myResults.data;
    return [];
  }, [myResults]);

  // Summary Metrics
  const summary = useMemo(() => {
    if (!rawList.length) return { total: 0, passed: 0, avgPercentage: 0 };
    const total = rawList.length;
    const passed = rawList.filter(
      (r) => (r.result_status || r.status || '').toUpperCase() === 'PASS'
    ).length;
    const totalPct = rawList.reduce((acc, curr) => acc + (parseFloat(curr.percentage) || 0), 0);
    const avgPercentage = (totalPct / total).toFixed(1);
    return { total, passed, avgPercentage };
  }, [rawList]);

  // Filtered List
  const filteredResults = useMemo(() => {
    return rawList.filter((res) => {
      const examName = (res.exam_name || res.exam?.exam_name || '').toLowerCase();
      const matchesSearch = examName.includes(searchTerm.toLowerCase());
      const status = (res.result_status || res.status || '').toUpperCase();
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rawList, searchTerm, statusFilter]);

  return (
    <AppLayout
      isAdmin={false}
      title="Examination Results"
      breadcrumbs={[
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'My Results' },
      ]}
    >
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Examination History & Performance</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Review past examination scores, percentage achievements, and view live leaderboards.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Summary Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <StatCard
          title="Exams Completed"
          value={summary.total}
          icon={FileCheck}
          variant="default"
        />
        <StatCard
          title="Passed Examinations"
          value={summary.passed}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Average Percentage"
          value={`${summary.avgPercentage}%`}
          icon={TrendingUp}
          variant="primary"
        />
      </div>

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
              placeholder="Search by exam name..."
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
              style={{ width: 'auto', minWidth: '130px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PASS">Passed Only</option>
              <option value="FAIL">Failed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Results Table or Empty State */}
      {loading && !rawList.length ? (
        <Loading text="Loading your scorecards..." />
      ) : filteredResults.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th style={{ textAlign: 'center' }}>Score</th>
                  <th style={{ textAlign: 'center' }}>Percentage</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Completion Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((res) => {
                  const resultId = res.result_id || res.id;
                  const examId = res.exam_id || res.exam?.exam_id || res.exam?.id;
                  const isPass = (res.result_status || res.status || '').toUpperCase() === 'PASS';
                  const dateStr = res.generated_at || res.submitted_at || res.created_at;

                  return (
                    <tr key={resultId}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <Award size={18} style={{ color: isPass ? 'var(--status-success)' : 'var(--text-muted)', flexShrink: 0 }} />
                          <span>{res.exam_name || res.exam?.exam_name || 'Standard Exam'}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }} className="tabular-nums">
                        {res.score}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }} className="tabular-nums">
                        {parseFloat(res.percentage || 0).toFixed(1)}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isPass ? 'badge-success' : 'badge-error'}`}>
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{dateStr ? new Date(dateStr).toLocaleDateString() : '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            className="btn btn-outline"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                            onClick={() => navigate(`/student/results/${resultId}`)}
                            title="View Scorecard"
                          >
                            <Eye size={15} />
                            <span>Scorecard</span>
                          </button>
                          {examId && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                              onClick={() => navigate(`/student/ranking/${examId}`)}
                              title="View Exam Leaderboard"
                            >
                              <Trophy size={15} />
                              <span>Rankings</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : rawList.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No Examination Results Yet"
          description="You haven't attempted any competitive exams yet. Browse our active examinations and start your first test."
          actionText="Browse Available Exams"
          onAction={() => navigate('/student/exams')}
        />
      ) : (
        <EmptyState
          icon={Search}
          title="No Matching Results"
          description={`No scorecards found matching "${searchTerm || statusFilter}". Try adjusting your filters.`}
          actionText="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('ALL');
          }}
        />
      )}
    </AppLayout>
  );
};

export default Results;

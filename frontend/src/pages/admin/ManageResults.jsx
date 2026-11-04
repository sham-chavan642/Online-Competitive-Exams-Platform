import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  TrendingUp, 
  GraduationCap, 
  User 
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import AppLayout from '../../components/AppLayout';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';

const ManageResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getResults();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setResults(list);
    } catch (err) {
      setError('Failed to fetch candidate results.');
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const total = results.length;
    if (!total) return { total: 0, passed: 0, passRate: '0.0' };
    const passed = results.filter((r) => (r.result_status || r.status || '').toUpperCase() === 'PASS').length;
    const passRate = ((passed / total) * 100).toFixed(1);
    return { total, passed, passRate };
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const q = searchTerm.toLowerCase().trim();
      const student = (r.student_name || r.student?.name || '').toLowerCase();
      const prn = (r.candidate_prn || '').toLowerCase();
      const exam = (r.exam_name || r.exam?.title || r.exam?.exam_name || '').toLowerCase();
      const matchesSearch = student.includes(q) || prn.includes(q) || exam.includes(q);

      const status = (r.result_status || r.status || '').toUpperCase();
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [results, searchTerm, statusFilter]);

  return (
    <AppLayout
      isAdmin={true}
      title="Examination Results"
      breadcrumbs={[{ label: 'Admin Console' }, { label: 'Results' }]}
    >
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Candidate Examination Results</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Comprehensive performance audit, pass/fail grading records, and candidate scoring distributions.
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
          title="Graded Submissions"
          value={metrics.total}
          icon={Award}
          variant="primary"
        />
        <StatCard
          title="Passing Candidates"
          value={metrics.passed}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Pass Percentage"
          value={`${metrics.passRate}%`}
          icon={TrendingUp}
          variant="default"
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
              <option value="ALL">All Outcomes</option>
              <option value="PASS">Pass Only</option>
              <option value="FAIL">Fail Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <Loading text="Loading official scorecards..." />
      ) : filteredResults.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>PRN</th>
                  <th>Examination</th>
                  <th style={{ textAlign: 'center' }}>Score</th>
                  <th style={{ textAlign: 'center' }}>Percentage</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Date Graded</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => {
                  const rId = result.result_id || result.id;
                  const isPass = (result.result_status || result.status || '').toUpperCase() === 'PASS';
                  const dateStr = result.generated_at || result.submitted_at || result.created_at;

                  return (
                    <tr key={rId}>
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
                            {(result.student_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{result.student_name || 'Candidate'}</span>
                        </div>
                      </td>
                      <td>{result.candidate_prn || '—'}</td>
                      <td style={{ fontWeight: 500 }}>
                        {result.exam_name || result.exam?.title || 'Exam'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }} className="tabular-nums">
                        {result.score}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }} className="tabular-nums">
                        {parseFloat(result.percentage || 0).toFixed(1)}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isPass ? 'badge-success' : 'badge-error'}`}>
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                          <span>{dateStr ? new Date(dateStr).toLocaleDateString() : '—'}</span>
                        </div>
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
          icon={Award}
          title="No Results Found"
          description={
            searchTerm || statusFilter !== 'ALL'
              ? 'No grading results match the specified filters.'
              : 'No examination submissions have been evaluated yet.'
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

export default ManageResults;

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Medal, ArrowLeft, Search, User, Award, Crown } from 'lucide-react';
import useRanking from '../../hooks/useRanking';
import useAuth from '../../hooks/useAuth';
import AppLayout from '../../components/AppLayout';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const Ranking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRankingByExam, rankings, loading, error } = useRanking();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (examId) {
      getRankingByExam(examId);
    }
  }, [examId, getRankingByExam]);

  // Ranking data might be an array or inside { ranking: [...] } or { data: [...] }
  const rawList = useMemo(() => {
    if (Array.isArray(rankings)) return rankings;
    if (Array.isArray(rankings?.ranking)) return rankings.ranking;
    if (Array.isArray(rankings?.data)) return rankings.data;
    return [];
  }, [rankings]);

  // Assign normalized ranks if backend did not include rank field
  const rankedData = useMemo(() => {
    return rawList.map((entry, index) => ({
      ...entry,
      rank: entry.rank || index + 1,
    }));
  }, [rawList]);

  // Filtered by search
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return rankedData;
    return rankedData.filter((entry) => {
      const name = (entry.student_name || entry.name || '').toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    });
  }, [rankedData, searchQuery]);

  // Top 3 Podium entries
  const top1 = rankedData.find((r) => r.rank === 1);
  const top2 = rankedData.find((r) => r.rank === 2);
  const top3 = rankedData.find((r) => r.rank === 3);

  const isCurrentUser = (entry) => {
    if (!user) return false;
    const currentId = user.student_id || user.id;
    const entryId = entry.student_id || entry.id;
    return currentId && entryId && String(currentId) === String(entryId);
  };

  return (
    <AppLayout
      isAdmin={false}
      title="Exam Leaderboard"
      breadcrumbs={[
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'Results', path: '/student/results' },
        { label: 'Leaderboard' },
      ]}
    >
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          className="btn btn-outline"
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Examination Leaderboard & Rankings</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Official ranked candidate standings based on total scores and completion accuracy.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading && !rankedData.length ? (
        <Loading text="Loading live rankings..." />
      ) : rankedData.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No Ranked Candidates Yet"
          description="No candidate submissions have been recorded for this examination yet. Check back soon after examinations are submitted."
          actionText="View Other Exams"
          onAction={() => navigate('/student/exams')}
        />
      ) : (
        <>
          {/* Top 3 Podium (Only displayed if at least 1 candidate exists) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {/* 1st Place */}
            {top1 && (
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '1.75rem 1.25rem',
                  border: '2px solid rgba(245, 158, 11, 0.4)',
                  backgroundColor: 'rgba(254, 243, 199, 0.25)',
                  order: 1,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#F59E0B',
                    color: '#FFFFFF',
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Crown size={12} />
                  <span>WINNER</span>
                </div>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0.5rem auto 1rem',
                  }}
                >
                  <Trophy size={28} />
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                  {top1.student_name || top1.name}
                  {isCurrentUser(top1) && (
                    <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                      You
                    </span>
                  )}
                </h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Score: <strong style={{ color: 'var(--text-primary)' }}>{top1.score}</strong> (
                  {parseFloat(top1.percentage || 0).toFixed(1)}%)
                </div>
              </div>
            )}

            {/* 2nd Place */}
            {top2 && (
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '1.75rem 1.25rem',
                  border: '1px solid rgba(148, 163, 184, 0.4)',
                  backgroundColor: 'rgba(241, 245, 249, 0.5)',
                  order: 2,
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#E2E8F0',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <Medal size={26} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  2nd Place
                </div>
                <h3 style={{ fontSize: '1.0625rem', margin: '0.25rem 0' }}>
                  {top2.student_name || top2.name}
                  {isCurrentUser(top2) && (
                    <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                      You
                    </span>
                  )}
                </h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Score: <strong style={{ color: 'var(--text-primary)' }}>{top2.score}</strong> (
                  {parseFloat(top2.percentage || 0).toFixed(1)}%)
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '1.75rem 1.25rem',
                  border: '1px solid rgba(180, 83, 9, 0.3)',
                  backgroundColor: 'rgba(255, 247, 237, 0.5)',
                  order: 3,
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#FFEDD5',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <Medal size={26} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
                  3rd Place
                </div>
                <h3 style={{ fontSize: '1.0625rem', margin: '0.25rem 0' }}>
                  {top3.student_name || top3.name}
                  {isCurrentUser(top3) && (
                    <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                      You
                    </span>
                  )}
                </h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Score: <strong style={{ color: 'var(--text-primary)' }}>{top3.score}</strong> (
                  {parseFloat(top3.percentage || 0).toFixed(1)}%)
                </div>
              </div>
            )}
          </div>

          {/* Search Table */}
          <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', maxWidth: '380px' }}>
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
                placeholder="Search candidate name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Rankings Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '90px', textAlign: 'center' }}>Rank</th>
                    <th>Candidate</th>
                    <th style={{ textAlign: 'center' }}>Score</th>
                    <th style={{ textAlign: 'center' }}>Percentage</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((entry) => {
                    const isMe = isCurrentUser(entry);
                    const rankNum = entry.rank;
                    const pct = parseFloat(entry.percentage || 0).toFixed(1);

                    return (
                      <tr
                        key={entry.student_id || entry.id || rankNum}
                        style={{
                          backgroundColor: isMe
                            ? 'rgba(79, 70, 229, 0.05)'
                            : rankNum === 1
                            ? 'rgba(245, 158, 11, 0.04)'
                            : 'inherit',
                        }}
                      >
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {rankNum === 1 ? (
                            <span style={{ color: '#D97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Trophy size={16} /> 1
                            </span>
                          ) : rankNum === 2 ? (
                            <span style={{ color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Medal size={16} /> 2
                            </span>
                          ) : rankNum === 3 ? (
                            <span style={{ color: '#B45309', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Medal size={16} /> 3
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }} className="tabular-nums">
                              #{rankNum}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: isMe ? 'var(--primary-light)' : 'var(--background-color)',
                                color: isMe ? 'var(--primary-color)' : 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                              }}
                            >
                              {(entry.student_name || entry.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {entry.student_name || entry.name || 'Candidate'}
                                {isMe && (
                                  <span
                                    className="badge badge-primary"
                                    style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}
                                  >
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }} className="tabular-nums">
                          {entry.score}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }} className="tabular-nums">
                          {pct}%
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`badge ${
                              (entry.result_status || '').toUpperCase() === 'PASS' || parseFloat(pct) >= 40
                                ? 'badge-success'
                                : 'badge-error'
                            }`}
                          >
                            {(entry.result_status || (parseFloat(pct) >= 40 ? 'PASS' : 'FAIL')).toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Ranking;

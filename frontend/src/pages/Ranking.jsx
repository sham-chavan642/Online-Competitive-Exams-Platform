import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resultApi } from '../../services/resultApi';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const Ranking = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await resultApi.getRanking(examId);
        setRankings(data || []);
      } catch (err) {
        setError('Failed to load rankings');
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [examId]);

  return (
    <div className="app-layout">
      <Sidebar isAdmin={false} />
      <div className="main-content">
        <Navbar title="Ranking" />
        
        <div className="page-content">
          <div className="flex justify-between items-center mb-6">
            <h2>Exam Ranking</h2>
            <button className="btn btn-outline" onClick={() => navigate(-1)}>
              &larr; Back
            </button>
          </div>
          
          <ErrorMessage message={error} />
          
          {loading ? (
            <Loading text="Loading rankings..." />
          ) : (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="table-container" style={{ border: 'none' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                      <th>Student</th>
                      <th style={{ textAlign: 'right' }}>Score</th>
                      <th style={{ textAlign: 'right' }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.length > 0 ? (
                      rankings.map((rank, index) => {
                        const isCurrentUser = user?.id === (rank.student?.id || rank.student_id);
                        return (
                          <tr key={rank.id || index} style={{ backgroundColor: isCurrentUser ? 'rgba(79, 70, 229, 0.05)' : 'transparent' }}>
                            <td style={{ textAlign: 'center' }}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </td>
                            <td style={{ fontWeight: isCurrentUser ? 600 : 400, color: isCurrentUser ? 'var(--primary-color)' : 'inherit' }}>
                              {rank.student?.name || rank.student_name}
                              {isCurrentUser && ' (You)'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{rank.score}</td>
                            <td style={{ textAlign: 'right' }}>{rank.percentage}%</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                          No rankings available yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ranking;

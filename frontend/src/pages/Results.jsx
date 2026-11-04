import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resultApi } from '../../services/resultApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await resultApi.getResults();
        setResults(data || []);
      } catch (err) {
        setError('Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar isAdmin={false} />
      <div className="main-content">
        <Navbar title="My Results" />
        
        <div className="page-content">
          <div className="page-header">
            <h2>All Results</h2>
          </div>
          
          <ErrorMessage message={error} />
          
          {loading ? (
            <Loading text="Loading results..." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length > 0 ? (
                    results.map((result) => (
                      <tr key={result.id}>
                        <td style={{ fontWeight: 500 }}>{result.exam?.title || result.exam_name}</td>
                        <td>{result.score} / {result.exam?.total_marks || result.total_marks || '-'}</td>
                        <td style={{ fontWeight: 600 }}>{result.percentage}%</td>
                        <td>
                          <span className={`badge ${result.status === 'PASS' ? 'badge-success' : 'badge-error'}`}>
                            {result.status}
                          </span>
                        </td>
                        <td>{new Date(result.submitted_at || result.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => navigate(`/student/results/${result.id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;

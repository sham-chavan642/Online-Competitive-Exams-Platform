import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { examApi } from '../../services/examApi';
import { resultApi } from '../../services/resultApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [examsData, resultsData] = await Promise.all([
          examApi.getAvailableExams(),
          resultApi.getResults()
        ]);
        setExams(examsData || []);
        setResults(resultsData || []);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="app-layout"><Sidebar isAdmin={false} /><div className="main-content"><Navbar title="Dashboard" /><div className="page-content"><Loading /></div></div></div>;

  const completedExams = results.length;
  const avgScore = results.length > 0 
    ? (results.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / results.length).toFixed(1) 
    : 0;
  const bestScore = results.length > 0 
    ? Math.max(...results.map(r => r.percentage || 0)) 
    : 0;

  const upcomingExams = exams.filter(e => e.status === 'AVAILABLE' || e.status === 'UPCOMING').slice(0, 3);

  return (
    <div className="app-layout">
      <Sidebar isAdmin={false} />
      <div className="main-content">
        <Navbar title="Dashboard" />
        
        <div className="page-content">
          <div className="page-header">
            <h2>Welcome, {user?.name}</h2>
          </div>
          
          <ErrorMessage message={error} />
          
          <div className="grid grid-cols-4 mb-6">
            <div className="card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Available Exams</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{exams.filter(e => e.status === 'AVAILABLE').length}</div>
            </div>
            <div className="card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Completed Exams</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{completedExams}</div>
            </div>
            <div className="card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Average Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{avgScore}%</div>
            </div>
            <div className="card">
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Best Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{bestScore}%</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ margin: 0 }}>Upcoming & Available Exams</h3>
                <Link to="/student/exams" className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View All</Link>
              </div>
              {upcomingExams.length > 0 ? (
                upcomingExams.map(exam => (
                  <div key={exam.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{exam.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exam.duration} mins • {exam.total_marks} marks</div>
                    </div>
                    <Link to={`/student/exams/${exam.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>View</Link>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No upcoming exams</div>
              )}
            </div>
            
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ margin: 0 }}>Recent Results</h3>
                <Link to="/student/results" className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View All</Link>
              </div>
              {results.slice(0, 3).map(result => (
                <div key={result.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{result.exam?.title || result.exam_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(result.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700 }}>{result.percentage}%</div>
                    <span className={`badge ${result.status === 'PASS' ? 'badge-success' : 'badge-error'}`}>{result.status}</span>
                  </div>
                </div>
              ))}
              {results.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No recent results</div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examApi } from '../../services/examApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await examApi.getExamDetails(id);
        setExam(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load exam details');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const handleStartExam = async () => {
    try {
      setStarting(true);
      setError(null);
      const data = await examApi.startExam(id);
      navigate(`/student/exam/${data.attempt_id || data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start exam. You may have already attempted it.');
      setStarting(false);
    }
  };

  if (loading) return <div className="app-layout"><Sidebar isAdmin={false} /><div className="main-content"><Navbar title="Exam Details" /><div className="page-content"><Loading /></div></div></div>;

  return (
    <div className="app-layout">
      <Sidebar isAdmin={false} />
      <div className="main-content">
        <Navbar title="Exam Details" />
        
        <div className="page-content">
          <button className="btn btn-outline mb-4" onClick={() => navigate('/student/exams')}>
            &larr; Back to Exams
          </button>
          
          <ErrorMessage message={error} />
          
          {exam && (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 style={{ marginBottom: '0.5rem' }}>{exam.title}</h2>
                  <span className="badge badge-info">{exam.topic?.name || exam.topic}</span>
                </div>
                <span className={`badge ${exam.status === 'AVAILABLE' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  {exam.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6" style={{ padding: '1.5rem', backgroundColor: 'var(--background-color)', borderRadius: 'var(--border-radius-md)' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Duration</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{exam.duration} Minutes</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Marks</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{exam.total_marks}</div>
                </div>
                {exam.start_time && (
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Starts At</div>
                    <div style={{ fontWeight: 500 }}>{new Date(exam.start_time).toLocaleString()}</div>
                  </div>
                )}
                {exam.end_time && (
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ends At</div>
                    <div style={{ fontWeight: 500 }}>{new Date(exam.end_time).toLocaleString()}</div>
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Description</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{exam.description || 'No description provided.'}</p>
              </div>
              
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--status-warning)', padding: '1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--status-warning)', margin: 0, marginBottom: '0.25rem' }}>Important Warning</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Once you start the exam, the timer will begin. You cannot pause or attempt it again.
                  If the timer runs out, your exam will be automatically submitted.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}
                  onClick={handleStartExam}
                  disabled={starting || exam.status !== 'AVAILABLE'}
                >
                  {starting ? 'Starting...' : 'START EXAM'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;

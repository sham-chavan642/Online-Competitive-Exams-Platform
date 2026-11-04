import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../../services/examApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ExamCard from '../../components/ExamCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await examApi.getAvailableExams();
        setExams(data || []);
      } catch (err) {
        setError('Failed to fetch exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleViewExam = (examId) => {
    navigate(`/student/exams/${examId}`);
  };

  return (
    <div className="app-layout">
      <Sidebar isAdmin={false} />
      <div className="main-content">
        <Navbar title="Available Exams" />
        
        <div className="page-content">
          <div className="page-header">
            <h2>Exams</h2>
          </div>
          
          <ErrorMessage message={error} />
          
          {loading ? (
            <Loading text="Loading exams..." />
          ) : (
            <div className="grid grid-cols-3">
              {exams.length > 0 ? (
                exams.map(exam => (
                  <ExamCard 
                    key={exam.id} 
                    exam={exam} 
                    actionText="View Exam"
                    onAction={handleViewExam}
                  />
                ))
              ) : (
                <div className="card text-center" style={{ gridColumn: '1 / -1', padding: '3rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <h3>No Exams Available</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>There are currently no exams available for you to take.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableExams;

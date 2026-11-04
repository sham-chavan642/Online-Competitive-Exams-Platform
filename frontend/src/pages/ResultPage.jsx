import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resultApi } from '../../services/resultApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import ResultCard from '../../components/ResultCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await resultApi.getResult(id);
        setResult(data);
      } catch (err) {
        setError('Failed to load result. It may not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) return <div className="app-layout"><Sidebar isAdmin={false} /><div className="main-content"><Navbar title="Result" /><div className="page-content"><Loading /></div></div></div>;

  return (
    <div className="app-layout">
      <Sidebar isAdmin={false} />
      <div className="main-content">
        <Navbar title="Exam Result" />
        
        <div className="page-content flex justify-center items-center">
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <ErrorMessage message={error} />
            
            {result && (
              <>
                <ResultCard 
                  result={result} 
                  onAction={() => navigate(`/student/ranking/${result.exam_id || result.exam?.id}`)} 
                />
                
                <div className="text-center mt-6">
                  <button className="btn btn-outline" onClick={() => navigate('/student/dashboard')}>
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;

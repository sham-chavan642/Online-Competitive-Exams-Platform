import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, FileText, CheckCircle2 } from 'lucide-react';
import useResults from '../../hooks/useResults';
import AppLayout from '../../components/AppLayout';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import ResultCard from '../../components/ResultCard';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResultById, result, loading, error } = useResults();

  useEffect(() => {
    if (id) {
      getResultById(id);
    }
  }, [id, getResultById]);

  // Handle formatted response (either direct object or { result: ... } or { data: ... })
  const resultData = result?.result || result?.data || result;

  return (
    <AppLayout
      isAdmin={false}
      title="Examination Scorecard"
      breadcrumbs={[
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'My Results', path: '/student/results' },
        { label: 'Scorecard' },
      ]}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/student/results')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to All Results</span>
          </button>

          {resultData?.exam_id && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/student/ranking/${resultData.exam_id}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Trophy size={16} />
              <span>View Leaderboard</span>
            </button>
          )}
        </div>

        <ErrorMessage message={error} />

        {loading && !resultData ? (
          <Loading text="Loading official scorecard..." />
        ) : resultData ? (
          <ResultCard
            result={{
              ...resultData,
              status: resultData.result_status || resultData.status,
              percentage: parseFloat(resultData.percentage || 0).toFixed(1),
              submitted_at: resultData.generated_at || resultData.submitted_at || resultData.created_at,
            }}
            onAction={
              resultData.exam_id
                ? () => navigate(`/student/ranking/${resultData.exam_id}`)
                : undefined
            }
          />
        ) : (
          <div className="card text-center" style={{ padding: '3rem 2rem' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Scorecard Not Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              We could not find the requested examination result details.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/student/results')}>
              Return to Results List
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ResultPage;

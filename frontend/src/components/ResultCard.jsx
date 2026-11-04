import React from 'react';
import { Award, CheckCircle2, XCircle, Calendar, Trophy, User } from 'lucide-react';

const ResultCard = ({ result, onAction }) => {
  const isPass = result.status === 'PASS' || result.result_status === 'PASS';
  const percentage = parseFloat(result.percentage || 0).toFixed(1);
  const examName = result.exam_name || result.exam?.exam_name || result.exam?.title || 'Competitive Exam';
  const studentName = result.student_name || result.student?.name || 'Candidate';
  const score = result.score ?? 0;
  const totalMarks = result.total_marks || result.exam?.total_marks || 100;
  const submittedAt = result.submitted_at || result.generated_at || result.created_at;

  return (
    <div className="card text-center" style={{ padding: '2.5rem 2rem', maxWidth: '640px', margin: '0 auto' }}>
      {/* Circular Progress Indicator */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            border: `6px solid ${isPass ? 'var(--status-success)' : 'var(--status-error)'}`,
            backgroundColor: isPass ? 'var(--status-success-bg)' : 'var(--status-error-bg)',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
              className="tabular-nums"
            >
              {percentage}%
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isPass ? 'var(--status-success)' : 'var(--status-error)',
                marginTop: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {isPass ? 'Passed' : 'Failed'}
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{examName}</h2>
        <div className="flex items-center justify-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <User size={15} />
          <span>Candidate: {studentName}</span>
        </div>
      </div>

      {/* Structured Metric Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          padding: '1.25rem 0',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Marks Scored
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }} className="tabular-nums">
            {score}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Marks
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }} className="tabular-nums">
            {totalMarks}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>
            Result Status
          </div>
          <div
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: isPass ? 'var(--status-success)' : 'var(--status-error)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginTop: '0.35rem',
            }}
          >
            {isPass ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            <span>{isPass ? 'PASS' : 'FAIL'}</span>
          </div>
        </div>
      </div>

      {/* Date metadata */}
      {submittedAt && (
        <div className="flex items-center justify-center gap-1 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          <Calendar size={14} />
          <span>Generated: {new Date(submittedAt).toLocaleString()}</span>
        </div>
      )}

      {/* Leaderboard CTA */}
      {onAction && (
        <button className="btn btn-primary btn-lg w-full" onClick={onAction}>
          <Trophy size={18} />
          <span>View Exam Leaderboard & Rankings</span>
        </button>
      )}
    </div>
  );
};

export default ResultCard;

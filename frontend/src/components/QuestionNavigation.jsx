import React from 'react';

const QuestionNavigation = ({
  total,
  current,
  answeredMap = [],
  flaggedMap = {},
  onNavigate,
}) => {
  const answeredCount = answeredMap.filter(Boolean).length;
  const flaggedCount = Object.values(flaggedMap).filter(Boolean).length;
  const unansweredCount = total - answeredCount;

  return (
    <div className="card exam-nav-card" style={{ padding: '1.25rem' }}>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        Question Palette
      </h4>

      {/* Legend with counts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          padding: '0.75rem',
          backgroundColor: 'var(--surface-muted)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          fontSize: '0.6875rem',
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--status-success)', marginBottom: '0.25rem' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Answered</span>
          <strong className="tabular-nums" style={{ color: 'var(--status-success)' }}>{answeredCount}</strong>
        </div>

        <div className="flex flex-col items-center text-center">
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--status-warning)', marginBottom: '0.25rem' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Flagged</span>
          <strong className="tabular-nums" style={{ color: 'var(--status-warning)' }}>{flaggedCount}</strong>
        </div>

        <div className="flex flex-col items-center text-center">
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#CBD5E1', marginBottom: '0.25rem' }}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Unanswered</span>
          <strong className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{unansweredCount}</strong>
        </div>
      </div>

      {/* Grid of question buttons */}
      <div className="question-nav-grid" style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {Array.from({ length: total }, (_, i) => {
          const qNum = i + 1;
          const isCurrent = qNum === current;
          const isAnswered = !!answeredMap[i];
          const isFlagged = !!flaggedMap[i];

          let classNames = 'nav-circle';
          if (isAnswered) classNames += ' answered';
          if (isFlagged) classNames += ' flagged';
          if (isCurrent) classNames += ' current';

          return (
            <button
              key={qNum}
              type="button"
              className={classNames}
              onClick={() => onNavigate(qNum)}
              aria-label={`Go to question ${qNum}${isAnswered ? ', answered' : ''}${isFlagged ? ', flagged' : ''}`}
            >
              {qNum}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionNavigation;

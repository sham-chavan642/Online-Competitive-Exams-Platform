import React from 'react';
import { Award, Bookmark } from 'lucide-react';

const QuestionCard = ({
  question,
  index,
  total,
  selectedOption,
  onSelect,
  isFlagged = false,
  onToggleFlag,
}) => {
  const marks = question.marks || 1;
  const questionText = question.question_text || question.text || 'Question Prompt';
  const options = question.options || [];

  return (
    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.75rem' }}>
      {/* Header with question count, marks and flag button */}
      <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-color)' }}>
            Question {index} of {total}
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
            <Award size={12} /> {marks} {marks === 1 ? 'Mark' : 'Marks'}
          </span>
        </div>

        {onToggleFlag && (
          <button
            type="button"
            className={`btn btn-sm ${isFlagged ? 'btn-secondary' : 'btn-outline'}`}
            onClick={onToggleFlag}
            style={{
              borderColor: isFlagged ? 'var(--status-warning)' : 'var(--border-color)',
              backgroundColor: isFlagged ? 'var(--status-warning-bg)' : '#FFFFFF',
              color: isFlagged ? 'var(--status-warning)' : 'var(--text-secondary)',
            }}
          >
            <Bookmark size={14} />
            <span>{isFlagged ? 'Flagged for Review' : 'Mark for Review'}</span>
          </button>
        )}
      </div>

      {/* Question Text */}
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {questionText}
        </p>
      </div>

      {/* Options List */}
      <div role="radiogroup" aria-label={`Question ${index} choices`}>
        {options.map((opt, optIdx) => {
          const optId = opt.option_id || opt.id;
          const isSelected = selectedOption === optId;
          const letter = String.fromCharCode(65 + optIdx);

          return (
            <label
              key={optId || optIdx}
              className={`option-item ${isSelected ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={`question-${question.question_id || question.id || index}`}
                value={optId}
                checked={isSelected}
                onChange={() => onSelect(optId)}
                className="option-radio"
              />
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--primary-color)' : 'var(--surface-muted)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  flexShrink: 0,
                  marginTop: '0.1rem',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {letter}
              </span>
              <span className="option-text">{opt.option_text || opt.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;

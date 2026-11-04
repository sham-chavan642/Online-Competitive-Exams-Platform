import React from 'react';
import { Clock, Award, Calendar, ArrowRight, BookOpen } from 'lucide-react';

const ExamCard = ({
  exam,
  onAction,
  actionText = 'View Details & Start',
  actionClass = 'btn-primary',
  disabled = false,
}) => {
  const title = exam.exam_name || exam.title || exam.name || 'Competitive Examination';
  const topicName = exam.topic_name || exam.topic?.name || exam.topic;
  const duration = exam.duration || 60;
  const totalMarks = exam.total_marks || exam.totalMarks || 100;
  const isAvailable = exam.status === 'AVAILABLE' || !exam.status;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Header: Topic and Status */}
      <div className="flex justify-between items-center mb-3">
        {topicName ? (
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
            <BookOpen size={13} />
            <span>{topicName}</span>
          </div>
        ) : (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Exam Module</span>
        )}

        <span className={`badge ${isAvailable ? 'badge-success' : 'badge-neutral'}`}>
          {isAvailable ? 'Available' : exam.status}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{title}</h3>

      {/* Description */}
      {exam.description && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.25rem',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {exam.description}
        </p>
      )}

      {/* Key Metric Chips */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'var(--surface-muted)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontSize: '0.8125rem',
        }}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">
              {duration} mins
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Award size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Marks</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">
              {totalMarks} Marks
            </div>
          </div>
        </div>
      </div>

      {/* Schedule window if present */}
      {exam.start_time && (
        <div className="flex items-center gap-1 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          <Calendar size={13} />
          <span>Valid: {new Date(exam.start_time).toLocaleDateString()}</span>
          {exam.end_time && <span> - {new Date(exam.end_time).toLocaleDateString()}</span>}
        </div>
      )}

      {/* Action Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          className={`btn ${actionClass} w-full`}
          onClick={() => onAction(exam.exam_id || exam.id)}
          disabled={disabled}
        >
          <span>{actionText}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default ExamCard;

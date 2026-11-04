import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const Timer = ({ initialSeconds, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const triggeredRef = useRef(false);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    triggeredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!triggeredRef.current && onTimeUp) {
        triggeredRef.current = true;
        onTimeUp();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (!triggeredRef.current && onTimeUp) {
            triggeredRef.current = true;
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formattedTime =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isWarning = timeLeft < 300 && timeLeft > 60; // 1-5 mins
  const isCritical = timeLeft <= 60; // < 1 min

  let bg = 'var(--surface-color)';
  let color = 'var(--text-primary)';
  let border = 'var(--border-color)';

  if (isCritical) {
    bg = 'var(--status-error-bg)';
    color = 'var(--status-error)';
    border = 'var(--status-error-border)';
  } else if (isWarning) {
    bg = 'var(--status-warning-bg)';
    color = 'var(--status-warning)';
    border = 'var(--status-warning-border)';
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.875rem',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-md)',
        fontSize: '1rem',
        fontWeight: 700,
        boxShadow: isCritical ? '0 0 0 2px rgba(220, 38, 38, 0.2)' : 'var(--shadow-xs)',
        transition: 'all var(--transition-fast)',
      }}
      className="font-mono tabular-nums"
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${formattedTime}`}
    >
      {isCritical || isWarning ? <AlertTriangle size={17} /> : <Clock size={17} />}
      <span>{formattedTime}</span>
    </div>
  );
};

export default Timer;

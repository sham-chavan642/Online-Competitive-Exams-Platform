import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--status-error-bg)',
        border: '1px solid var(--status-error-border)',
        color: 'var(--status-error)',
        padding: '0.875rem 1rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
      role="alert"
    >
      <AlertCircle size={18} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
    </div>
  );
};

export default ErrorMessage;

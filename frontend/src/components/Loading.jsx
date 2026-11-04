import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ text = 'Loading data...', size = 'default' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '3rem 1.5rem',
      }}
    >
      <Loader2
        size={size === 'sm' ? 20 : 32}
        style={{
          color: 'var(--primary-color)',
          animation: 'spin 1s linear infinite',
        }}
      />
      {text && (
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export default Loading;

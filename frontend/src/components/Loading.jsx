import React from 'react';

const Loading = ({ message = 'Loading campus mobility data...', isSkeleton = false }) => {
  if (isSkeleton) {
    return (
      <div className="grid-rides">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <div className="skeleton skeleton-line title" style={{ width: '60%' }}></div>
              <div className="skeleton skeleton-line" style={{ width: '25%', height: '1.25rem' }}></div>
            </div>
            <div className="skeleton skeleton-line short"></div>
            <div className="skeleton skeleton-line short"></div>
            <div className="skeleton skeleton-line" style={{ height: '2.25rem', marginTop: '1rem' }}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
};

export default Loading;

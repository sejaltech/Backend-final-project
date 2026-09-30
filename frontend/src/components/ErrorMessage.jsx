import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, errors = [] }) => {
  if (!message && (!errors || errors.length === 0)) return null;

  return (
    <div className="alert alert-error" role="alert">
      <AlertCircle size={18} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{message || 'Please check the following errors:'}</p>
        {errors && errors.length > 0 && (
          <ul style={{ marginTop: '0.35rem', paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
            {errors.map((err, idx) => (
              <li key={idx} style={{ marginTop: '0.15rem' }}>{err}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

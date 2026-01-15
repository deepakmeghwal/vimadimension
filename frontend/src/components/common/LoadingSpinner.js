import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message, size = 'medium', fullPage = false }) => {
  const sizeClass = `spinner-${size}`;
  const containerClass = fullPage ? 'loading-full-page' : 'loading-container-modern';

  return (
    <div className={containerClass}>
      <div className="loading-spinner-modern">
        <div className={`spinner-ring ${sizeClass}`}>
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
          <div className="ring-segment"></div>
        </div>
        {message && <p className="loading-message-modern">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;





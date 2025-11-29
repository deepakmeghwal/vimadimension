import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import './LoadingSpinner.css';

const PageLoading = ({ message = 'Loading...' }) => {
  return (
    <div className="page-loading-overlay">
      <LoadingSpinner message={message} size="large" />
    </div>
  );
};

export default PageLoading;




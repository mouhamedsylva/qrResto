import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeMap = {
    sm: 16,
    md: 32,
    lg: 48,
  };

  return (
    <div className="loading-spinner-container">
      <Loader2 size={sizeMap[size]} className="loading-spinner" style={{ color: 'var(--primary)' }} />
      {text && (
        <p className="loading-spinner-text">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

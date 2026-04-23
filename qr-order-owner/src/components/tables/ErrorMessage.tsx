import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  const { t } = useLanguage();
  
  return (
    <div className="error-message">
      <AlertCircle className="error-message-icon" />
      <div className="error-message-content">
        <h3 className="error-message-title">{t('tables.errorTitle')}</h3>
        <p className="error-message-text">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="error-message-retry"
          >
            {t('tables.retryButton')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

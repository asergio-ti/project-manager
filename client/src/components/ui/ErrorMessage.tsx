import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => {
  return (
    <div className={`text-sm text-red-500 text-center ${className}`}>
      {message}
    </div>
  );
}; 
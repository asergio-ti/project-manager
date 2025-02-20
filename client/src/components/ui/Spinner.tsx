import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-b-2 border-primary ${sizeMap[size]} ${className}`}
      />
    </div>
  );
}; 
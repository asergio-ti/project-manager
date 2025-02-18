import React from 'react';
import { User } from '../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md' }) => {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <div
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          bg-primary-600 text-white font-medium
          rounded-full
        `}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      {user.status === 'online' && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
      )}
      {user.status === 'away' && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-400 border-2 border-white rounded-full" />
      )}
    </div>
  );
}; 
import React from 'react';

interface ChatHeaderProps {
  title: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title }) => {
  return (
    <div className="p-4 border-b border-border">
      <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
    </div>
  );
}; 
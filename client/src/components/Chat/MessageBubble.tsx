import React from 'react';
import { Message } from './ChatInterface';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.type === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          message.type === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}; 
import React from 'react';
import { format } from 'date-fns';
import { Message } from '../types';
import { Avatar } from './Avatar';
import { CheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showSender = true,
}) => {
  const statusIcon = {
    sent: <CheckIcon className="w-4 h-4" />,
    delivered: (
      <>
        <CheckIcon className="w-4 h-4 -mr-1" />
        <CheckIcon className="w-4 h-4" />
      </>
    ),
    read: <CheckCircleIcon className="w-4 h-4 text-primary-600" />,
  };

  return (
    <div
      className={`
        flex gap-3 max-w-[70%]
        ${isOwn ? 'ml-auto flex-row-reverse' : ''}
      `}
    >
      {!isOwn && showSender && <Avatar user={message.sender} size="sm" />}

      <div className="flex-1">
        {showSender && !isOwn && (
          <span className="text-sm font-medium text-gray-700 mb-1 block">
            {message.sender.name}
          </span>
        )}

        <div className="flex items-end gap-2">
          <div
            className={`
              rounded-2xl px-4 py-2
              ${
                isOwn
                  ? 'bg-primary-600 text-white rounded-tr-none'
                  : 'bg-gray-100 text-gray-900 rounded-tl-none'
              }
            `}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>{format(message.timestamp, 'HH:mm')}</span>
            {isOwn && statusIcon[message.status]}
          </div>
        </div>
      </div>
    </div>
  );
}; 
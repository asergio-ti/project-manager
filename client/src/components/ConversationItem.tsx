import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Conversation } from '../types';
import { Avatar } from './Avatar';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const mainParticipant = conversation.isGroup
    ? null
    : conversation.participants.find(p => p.id !== 'u1');

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'HH:mm');
    }
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, "d 'de' MMM", { locale: ptBR });
    }
    return format(date, "d 'de' MMM yyyy", { locale: ptBR });
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-3 cursor-pointer
        transition-colors duration-200
        ${isActive ? 'bg-primary-50' : 'hover:bg-gray-50'}
      `}
      onClick={onClick}
    >
      <Avatar
        user={mainParticipant || conversation.participants[0]}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-sm text-gray-900 truncate">
            {conversation.name || mainParticipant?.name}
          </h4>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-500">
              {formatMessageTime(conversation.lastMessage.timestamp)}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          {conversation.lastMessage && (
            <p className="text-sm text-gray-500 truncate">
              {conversation.isGroup && `${conversation.lastMessage.sender.name}: `}
              {conversation.lastMessage.content}
            </p>
          )}
          {conversation.unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}; 
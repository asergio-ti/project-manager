import React, { useState, useRef, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisHorizontalIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import { ConversationItem } from './ConversationItem';
import { MessageBubble } from './MessageBubble';
import { currentUser, conversations, messages } from '../data/mockData';
import { Conversation, Message } from '../types';

export const ChatApp: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(
    conversations[0]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter((conv) =>
    conv.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = activeConversation
    ? messages[activeConversation.id]
    : [];

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [currentMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: `m${Date.now()}`,
      content: newMessage,
      sender: currentUser,
      timestamp: new Date(),
      status: 'sent',
    };

    messages[activeConversation.id] = [
      ...(messages[activeConversation.id] || []),
      message,
    ];

    setNewMessage('');

    // Simular resposta após 2 segundos
    setTimeout(() => {
      const response: Message = {
        id: `m${Date.now()}`,
        content: 'Ok, entendi! Vou analisar sua mensagem e retorno em breve.',
        sender: activeConversation.participants.find(p => p.id !== currentUser.id)!,
        timestamp: new Date(),
        status: 'delivered',
      };

      messages[activeConversation.id] = [
        ...(messages[activeConversation.id] || []),
        response,
      ];

      // Forçar re-render
      setActiveConversation({ ...activeConversation });
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeConversation?.id === conversation.id}
              onClick={() => setActiveConversation(conversation)}
            />
          ))}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <header className="px-4 py-3 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {activeConversation.name}
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <PhoneIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <VideoCameraIcon className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </header>

            <div
              ref={messageListRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {currentMessages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender.id === currentUser.id}
                  showSender={
                    index === 0 ||
                    currentMessages[index - 1]?.sender.id !== message.sender.id
                  }
                />
              ))}
            </div>

            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <FaceSmileIcon className="w-6 h-6 text-gray-500" />
                </button>
                <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-transparent focus:outline-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <button className="p-2 hover:bg-gray-200 rounded-full">
                    <PaperClipIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <button
                  className="p-2 bg-primary-600 hover:bg-primary-700 rounded-full"
                  onClick={handleSendMessage}
                >
                  <PaperAirplaneIcon className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Selecione uma conversa para começar</p>
          </div>
        )}
      </main>
    </div>
  );
}; 
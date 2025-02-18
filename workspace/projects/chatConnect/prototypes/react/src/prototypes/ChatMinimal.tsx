import React, { useState } from 'react';
import { currentUser, users } from '../data/mockData';

export const ChatMinimal: React.FC = () => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    isOwn: boolean;
  }>>([
    {
      id: '1',
      content: 'Olá! Como posso ajudar?',
      isOwn: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        content: newMessage,
        isOwn: true,
      },
    ]);
    setNewMessage('');

    // Simular resposta
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: 'Entendi! Vou analisar sua mensagem.',
          isOwn: false,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Chat Minimalista</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.isOwn
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}; 
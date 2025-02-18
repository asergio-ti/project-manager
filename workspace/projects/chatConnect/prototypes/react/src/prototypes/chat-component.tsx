import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

// Simulação de mensagens iniciais
const initialMessages = [
  { id: 1, sender: 'João', content: 'Olá, tudo bem?', timestamp: new Date() },
  { id: 2, sender: 'Maria', content: 'Oi! Tudo ótimo!', timestamp: new Date() }
];

export default function ChatComponent() {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [user] = useState({ name: 'Usuário' });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      sender: user.name,
      content: newMessage,
      timestamp: new Date()
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <Card className="flex-1 flex flex-col mb-4 p-4 overflow-hidden bg-white">
        {/* Header */}
        <div className="border-b pb-2 mb-4">
          <h2 className="text-lg font-semibold">ChatConnect</h2>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === user.name ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === user.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <div className="font-semibold text-sm mb-1">{message.sender}</div>
                <div>{message.content}</div>
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 resize-none rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
import React, { useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { useChat } from '../../contexts/ChatContext';
import { Spinner } from '../ui/Spinner';
import { ErrorMessage } from '../ui/ErrorMessage';

/**
 * ChatInterface é o componente responsável pela interface de chat com o assistente.
 * Gerencia a exibição de mensagens e interação com o usuário.
 * 
 * Funcionalidades:
 * - Exibe histórico de mensagens
 * - Permite envio de novas mensagens
 * - Mostra estados de loading durante processamento
 * - Exibe mensagens de erro quando necessário
 * - Desabilita input durante processamento
 * 
 * @component
 */
export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const { messages, loading, error, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const handleSend = (content: string) => {
    if (!content.trim()) return;
    sendMessage(content);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-lg overflow-hidden">
      <ChatHeader title="Chat" />
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {loading && (
          <div className="flex justify-center">
            <Spinner size="sm" />
          </div>
        )}
        {error && <ErrorMessage message={error} />}
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={loading}
      />
    </div>
  );
};

export default ChatInterface; 
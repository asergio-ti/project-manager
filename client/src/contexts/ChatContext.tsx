import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Message } from '../types/chat';

interface ChatContextData {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextData>({} as ChatContextData);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou seu assistente do Project Manager. Como posso ajudar?',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Adiciona a mensagem do usuário
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // TODO: Integração com o Claude
      // Por enquanto, simula uma resposta do assistente
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: 'Entendi sua solicitação. Vou analisar e processar as informações...',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setLoading(false);
      }, 1000);

    } catch (err) {
      setError('Erro ao enviar mensagem');
      console.error('Erro ao enviar mensagem:', err);
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        error,
        sendMessage,
        clearMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve ser usado dentro de um ChatProvider');
  }
  return context;
}; 
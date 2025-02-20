import React from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled) {
      onSend(value);
      onChange('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border">
      <div className="flex space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          className={`flex-1 px-4 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        <button
          type="submit"
          disabled={disabled}
          className={`px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-colors ${
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary/90'
          }`}
        >
          Enviar
        </button>
      </div>
    </form>
  );
}; 
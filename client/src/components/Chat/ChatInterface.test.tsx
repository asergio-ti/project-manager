import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from './ChatInterface';
import { ChatProvider } from '../../contexts/ChatContext';

describe('ChatInterface', () => {
  const renderComponent = () => {
    return render(
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    );
  };

  it('deve mostrar a mensagem inicial do assistente', () => {
    renderComponent();
    expect(
      screen.getByText(/olá! sou seu assistente do project manager/i)
    ).toBeInTheDocument();
  });

  it('deve permitir enviar uma mensagem', async () => {
    renderComponent();
    
    const input = screen.getByPlaceholderText(/digite sua mensagem/i);
    const button = screen.getByText(/enviar/i);

    fireEvent.change(input, { target: { value: 'Olá, assistente!' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Olá, assistente!')).toBeInTheDocument();
    });
  });

  it('não deve enviar mensagem vazia', () => {
    renderComponent();
    
    const button = screen.getByText(/enviar/i);
    fireEvent.click(button);

    expect(
      screen.queryByText(/entendi sua solicitação/i)
    ).not.toBeInTheDocument();
  });

  it('deve desabilitar input durante loading', async () => {
    renderComponent();
    
    const input = screen.getByPlaceholderText(/digite sua mensagem/i);
    const button = screen.getByText(/enviar/i);

    fireEvent.change(input, { target: { value: 'Teste' } });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(input).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(input).not.toBeDisabled();
    });
  });
}); 
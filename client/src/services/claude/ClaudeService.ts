import { Message } from '../../types';

interface ClaudeConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

class ClaudeService {
  private config: ClaudeConfig;

  constructor(config: ClaudeConfig) {
    this.config = config;
  }

  async sendMessage(
    message: string,
    context?: string,
    reference?: string
  ): Promise<Message> {
    try {
      const response = await fetch(`${this.config.baseURL}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: this.formatMessage(message, context, reference)
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          system: "Você é um assistente especializado em documentação de software, focado em ajudar na criação e revisão de documentos técnicos seguindo padrões ISO/IEC."
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API do Claude: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        content: data.content[0].text,
        sender: 'assistant',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem para o Claude:', error);
      throw error;
    }
  }

  private formatMessage(
    message: string,
    context?: string,
    reference?: string
  ): string {
    let formattedMessage = message;

    if (context) {
      formattedMessage = `Contexto: ${context}\n\nMensagem: ${message}`;
    }

    if (reference) {
      formattedMessage = `Referência: ${reference}\n\n${formattedMessage}`;
    }

    return formattedMessage;
  }

  async validateDocument(
    document: any,
    schema: string
  ): Promise<{ isValid: boolean; feedback: string }> {
    try {
      const response = await this.sendMessage(
        'Por favor, valide este documento conforme o schema especificado e forneça feedback detalhado.',
        JSON.stringify(document),
        schema
      );

      // Processar resposta para extrair validação
      const feedback = response.content;
      const isValid = !feedback.toLowerCase().includes('erro') && 
                     !feedback.toLowerCase().includes('inválido');

      return { isValid, feedback };
    } catch (error) {
      console.error('Erro ao validar documento:', error);
      throw error;
    }
  }

  async suggestImprovements(
    document: any,
    context: string
  ): Promise<string> {
    try {
      const response = await this.sendMessage(
        'Por favor, analise este documento e sugira melhorias específicas baseadas no contexto fornecido.',
        JSON.stringify(document),
        context
      );

      return response.content;
    } catch (error) {
      console.error('Erro ao solicitar sugestões:', error);
      throw error;
    }
  }
}

export const claudeService = new ClaudeService({
  apiKey: process.env.REACT_APP_CLAUDE_API_KEY || '',
  baseURL: process.env.REACT_APP_CLAUDE_API_URL || 'https://api.anthropic.com',
  model: process.env.REACT_APP_CLAUDE_MODEL || 'claude-3-opus-20240229'
});

export default ClaudeService; 
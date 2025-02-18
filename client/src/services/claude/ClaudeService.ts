import { Message, Question, InterviewContext, ValidationResult, Document, Schema, AnalysisResult, ConversationEntry, DocumentPhase, Topic, Pattern, Concern, Suggestion } from '../../types';

interface ClaudeConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  temperature: number;
}

interface AnalysisPrompt {
  systemPrompt: string;
  userContext: string;
  previousContext?: string;
}

export class ClaudeService {
  private config: ClaudeConfig;

  constructor(config: ClaudeConfig) {
    this.config = config;
  }

  private async sendMessage(prompt: string, context?: any): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente especializado em documentação e arquitetura de software.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.temperature,
          context: context
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao enviar mensagem para Claude:', error);
      throw error;
    }
  }

  async sendMessageToClaude(
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

  async validateDocument(document: Document, schema: Schema): Promise<ValidationResult> {
    try {
      const prompt = `
        Valide este documento conforme o schema fornecido:
        
        Documento:
        ${JSON.stringify(document)}
        
        Schema:
        ${JSON.stringify(schema)}
        
        Forneça uma análise detalhada incluindo:
        1. Conformidade com o schema
        2. Consistência interna
        3. Sugestões de melhoria
      `;

      const response = await this.sendMessage(prompt);
      
      return {
        isValid: !response.toLowerCase().includes('erro') && 
                !response.toLowerCase().includes('inválido'),
        feedback: response,
        errors: this.extractErrors(response),
        warnings: this.extractWarnings(response),
        suggestions: this.extractSuggestions(response)
      };
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

  async analyzeContext(
    input: string,
    context: InterviewContext
  ): Promise<AnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(input, context);
      const response = await this.sendMessage(prompt);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Erro na análise de contexto:', error);
      throw error;
    }
  }

  private buildAnalysisPrompt(input: string, context: InterviewContext): AnalysisPrompt {
    return {
      systemPrompt: `Você é um especialista em análise de requisitos e documentação de software.
Analise a entrada do usuário considerando:
1. Tópicos mencionados e sua relevância
2. Padrões de arquitetura ou design identificados
3. Possíveis preocupações ou riscos
4. Sugestões para melhorar ou expandir o conceito
5. Nível de confiança nas informações fornecidas`,

      userContext: `Fase atual: ${context.projectContext.currentPhase}
Histórico da conversa: ${this.formatConversationHistory(context.conversationContext.conversationHistory)}
Entrada atual: ${input}`,

      previousContext: context.conversationContext.conversationHistory.length > 0
        ? this.summarizeContext(context)
        : undefined
    };
  }

  private formatConversationHistory(history: ConversationEntry[]): string {
    return history
      .map(entry => `[${entry.type}]: ${entry.content}`)
      .join('\n');
  }

  private summarizeContext(context: InterviewContext): string {
    const topics = Array.from(context.conversationContext.identifiedTopics).join(', ');
    return `Tópicos identificados: ${topics}
Fase atual: ${context.projectContext.currentPhase}
Domínio: ${context.projectContext.domainType}
Complexidade: ${context.projectContext.complexity.overall}`;
  }

  private async parseAnalysisResponse(response: any): Promise<AnalysisResult> {
    try {
      // Estruturar a resposta do Claude em um formato AnalysisResult
      return {
        topics: this.extractTopics(response),
        patterns: this.extractPatterns(response),
        concerns: this.extractConcerns(response),
        suggestions: this.extractSuggestions(response),
        confidence: this.calculateOverallConfidence(response)
      };
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      throw error;
    }
  }

  private extractTopics(response: any): Topic[] {
    // Implementar extração de tópicos da resposta
    return [];
  }

  private extractPatterns(response: any): Pattern[] {
    // Implementar extração de padrões da resposta
    return [];
  }

  private extractConcerns(response: any): Concern[] {
    // Implementar extração de preocupações da resposta
    return [];
  }

  private extractSuggestions(response: any): Suggestion[] {
    // Implementar extração de sugestões da resposta
    return [];
  }

  private calculateOverallConfidence(response: any): number {
    // Implementar cálculo de confiança geral
    return 0;
  }

  async customizeQuestions(
    baseQuestions: Question[],
    context: InterviewContext
  ): Promise<Question[]> {
    try {
      const prompt = this.buildCustomizationPrompt(baseQuestions, context);
      const response = await this.sendMessage(prompt);
      return this.parseCustomizedQuestions(response);
    } catch (error) {
      console.error('Erro na customização de perguntas:', error);
      return baseQuestions;
    }
  }

  private buildCustomizationPrompt(questions: Question[], context: InterviewContext): string {
    return `Com base no contexto atual:
- Fase: ${context.projectContext.currentPhase}
- Tópicos identificados: ${Array.from(context.conversationContext.identifiedTopics).join(', ')}
- Domínio: ${context.projectContext.domainType}
- Complexidade: ${context.projectContext.complexity.overall}

Adapte as seguintes perguntas para serem mais relevantes e naturais:
${questions.map(q => q.content).join('\n')}`;
  }

  private async parseCustomizedQuestions(response: any): Promise<Question[]> {
    // Implementar parsing das perguntas customizadas
    return [];
  }

  // Métodos Auxiliares
  private extractErrors(response: string): string[] {
    // Implementar extração de erros do texto
    return [];
  }

  private extractWarnings(response: string): string[] {
    // Implementar extração de avisos do texto
    return [];
  }
}

export const claudeService = new ClaudeService({
  apiKey: process.env.REACT_APP_CLAUDE_API_KEY || '',
  baseURL: process.env.REACT_APP_CLAUDE_API_URL || 'https://api.anthropic.com',
  model: process.env.REACT_APP_CLAUDE_MODEL || 'claude-3-opus-20240229',
  temperature: 0.7
});

export default ClaudeService; 
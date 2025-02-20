import { Message, Question, InterviewContext, ValidationResult, Document, Schema, AnalysisResult, ConversationEntry, DocumentPhase, Topic, Pattern, Concern, Suggestion, AnalysisPrompt, UserRole } from '../../types';

interface ClaudeConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  temperature: number;
}

interface ExtendedInterviewContext extends InterviewContext {
  phase: DocumentPhase;
  previousAnswers: Record<string, any>;
  projectContext?: {
    currentPhase: string;
    domainType: string;
    complexity: { overall: string };
  };
  conversationContext?: {
    conversationHistory: ConversationEntry[];
    identifiedTopics: Set<string>;
  };
}

export class ClaudeService {
  private config: ClaudeConfig;
  private context: ExtendedInterviewContext;

  constructor(config: ClaudeConfig, context: ExtendedInterviewContext) {
    this.config = config;
    this.context = context;
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
    message: string | AnalysisPrompt,
    context?: any
  ): Promise<Message> {
    try {
      const content = typeof message === 'string' ? message : message.content;
      const messageContext = typeof message === 'string' ? context : message.context;

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
              content: this.formatMessage(content, messageContext)
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
        sender: {
          id: 'claude',
          name: 'Claude',
          status: 'online'
        },
        timestamp: new Date(),
        status: 'delivered'
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem para o Claude:', error);
      throw error;
    }
  }

  private formatMessage(
    message: string,
    context?: any
  ): string {
    let formattedMessage = message;

    if (context) {
      formattedMessage = `Contexto: ${JSON.stringify(context)}\n\nMensagem: ${message}`;
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
    document: Document,
    context: string
  ): Promise<string> {
    try {
      const prompt = 'Por favor, analise este documento e sugira melhorias específicas baseadas no contexto fornecido.';
      const response = await this.sendMessage(prompt, {
        document: JSON.stringify(document),
        context
      });

      return response;
    } catch (error) {
      console.error('Erro ao solicitar sugestões:', error);
      throw error;
    }
  }

  async analyzeContext(
    input: string,
    context: ExtendedInterviewContext
  ): Promise<AnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(input, context);
      const response = await this.sendMessage(prompt.content, prompt.context);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Erro na análise de contexto:', error);
      throw error;
    }
  }

  private buildAnalysisPrompt(input: string, context: ExtendedInterviewContext): AnalysisPrompt {
    return {
      content: `Você é um especialista em análise de requisitos e documentação de software.
Analise a entrada do usuário considerando:
1. Tópicos mencionados e sua relevância
2. Padrões de arquitetura ou design identificados
3. Possíveis preocupações ou riscos
4. Sugestões para melhorar ou expandir o conceito
5. Nível de confiança nas informações fornecidas

Fase atual: ${context.projectContext?.currentPhase || 'N/A'}
Histórico da conversa: ${this.formatConversationHistory(context.conversationContext?.conversationHistory || [])}
Entrada atual: ${input}`,
      context: context.projectContext
    };
  }

  private formatConversationHistory(history: ConversationEntry[]): string {
    return history
      .map(entry => `[${entry.type}]: ${entry.content}`)
      .join('\n');
  }

  private summarizeContext(context: ExtendedInterviewContext): string {
    const topics = Array.from(context.conversationContext?.identifiedTopics || []).join(', ');
    return `Tópicos identificados: ${topics}
Fase atual: ${context.projectContext?.currentPhase || 'N/A'}
Domínio: ${context.projectContext?.domainType || 'N/A'}
Complexidade: ${context.projectContext?.complexity.overall || 'N/A'}`;
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

  private extractTopics(response: any): string[] {
    // Implementar extração de tópicos da resposta
    return [];
  }

  private extractPatterns(response: any): string[] {
    // Implementar extração de padrões da resposta
    return [];
  }

  private extractConcerns(response: any): string[] {
    // Implementar extração de preocupações da resposta
    return [];
  }

  private extractSuggestions(response: any): string[] {
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

  private buildCustomizationPrompt(questions: Question[], context: ExtendedInterviewContext): string {
    return `Com base no contexto atual:
- Fase: ${context.projectContext?.currentPhase || 'N/A'}
- Tópicos identificados: ${Array.from(context.conversationContext?.identifiedTopics || []).join(', ')}
- Domínio: ${context.projectContext?.domainType || 'N/A'}
- Complexidade: ${context.projectContext?.complexity.overall || 'N/A'}

Adapte as seguintes perguntas para serem mais relevantes e naturais:
${questions.map(q => q.text).join('\n')}`;
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

  async analyzeDocument(prompt: AnalysisPrompt): Promise<AnalysisResult> {
    try {
      const response = await this.sendMessageToClaude(prompt);
      return {
        topics: this.extractTopics(response),
        patterns: this.extractPatterns(response),
        concerns: this.extractConcerns(response),
        suggestions: this.extractSuggestions(response),
        confidence: this.calculateOverallConfidence(response)
      };
    } catch (error) {
      console.error('Erro ao analisar documento:', error);
      throw error;
    }
  }
}

export const claudeService = new ClaudeService({
  apiKey: process.env.REACT_APP_CLAUDE_API_KEY || '',
  baseURL: process.env.REACT_APP_CLAUDE_API_URL || 'https://api.anthropic.com',
  model: process.env.REACT_APP_CLAUDE_MODEL || 'claude-3-opus-20240229',
  temperature: 0.7
}, {
  phase: 'dvp',
  previousAnswers: {},
  projectContext: {
    currentPhase: 'Phase 1',
    domainType: 'Software Development',
    complexity: { overall: 'High' }
  },
  conversationContext: {
    conversationHistory: [],
    identifiedTopics: new Set()
  }
});

export default ClaudeService; 
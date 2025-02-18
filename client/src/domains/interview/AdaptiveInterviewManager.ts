import {
  InterviewContext,
  ConversationContext,
  ConversationEntry,
  Question,
  AnalysisResult,
  Topic,
  Pattern,
  Concern,
  Suggestion,
  DocumentPhase,
  ComplexityLevel
} from '../../types';

import { ClaudeService } from '../../services/claude/ClaudeService';
import { SchemaManager } from '../documentation/SchemaManager';
import { ValidationManager } from '../validation/ValidationManager';

export class AdaptiveInterviewManager {
  private conversationContext: ConversationContext = {
    currentPhase: 'DVP',
    conversationHistory: [],
    identifiedTopics: new Set(),
    confidenceLevels: {},
    activeTopics: [],
    pendingQuestions: []
  };

  private readonly responseTemplates = {
    initial_greeting: `Olá! Vamos conversar sobre seu projeto? 
Me conte um pouco sobre ele, de forma livre e natural. 
Enquanto você fala, vou identificar pontos importantes e fazer perguntas quando necessário.`,

    followup_question: `{question}
(Baseado no que você mencionou sobre {topic})`,

    suggestion: `Interessante! {suggestion}
Isso me faz pensar em algumas considerações importantes. 
O que você acha sobre {considerations}?`,

    validation: `Deixa eu ver se entendi corretamente:
{summary}
Isso está correto? Tem algo que você gostaria de ajustar?`,

    progress: `Ótimo! Já temos uma boa compreensão sobre {topics}.
Que tal explorarmos um pouco sobre {next_topic}?`,

    error: `Desculpe, {message}
Podemos tentar de outra forma?`
  } as const;

  constructor(
    private claudeService: ClaudeService,
    private schemaManager: SchemaManager,
    private validationManager: ValidationManager
  ) {}

  async startConversation(context: InterviewContext): Promise<string> {
    // Iniciar com uma abordagem aberta e amigável
    return this.formatResponse('initial_greeting', {
      phase: context.projectContext.currentPhase
    });
  }

  async processUserInput(input: string, context: InterviewContext): Promise<string> {
    try {
      // 1. Registrar entrada do usuário
      await this.recordConversationEntry({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'user',
        content: input
      });

      // 2. Analisar contexto e conteúdo
      const analysis = await this.analyzeInput(input, context);

      // 3. Atualizar contexto da conversa
      this.updateContext(analysis);

      // 4. Determinar próxima ação
      const nextAction = await this.determineNextAction(analysis, context);

      // 5. Gerar resposta apropriada
      return this.generateResponse(nextAction, context);
    } catch (error) {
      console.error('Erro no processamento da entrada:', error);
      return this.formatResponse('error', {
        message: 'Desculpe, tive um problema ao processar sua resposta.'
      });
    }
  }

  private async analyzeInput(input: string, context: InterviewContext): Promise<AnalysisResult> {
    // Análise semântica via Claude
    const analysis = await this.claudeService.analyzeContext(
      input,
      context
    );

    return {
      topics: this.extractTopics(analysis),
      patterns: this.identifyPatterns(analysis),
      concerns: this.identifyConcerns(analysis),
      suggestions: this.generateSuggestions(analysis),
      confidence: this.calculateConfidence(analysis)
    };
  }

  private async determineNextAction(analysis: AnalysisResult, context: InterviewContext): Promise<string> {
    // 1. Verificar se precisamos de mais informações
    const missingInfo = this.identifyMissingInformation(analysis, context);
    if (missingInfo.length > 0) {
      return 'ask_followup';
    }

    // 2. Verificar se devemos fazer sugestões
    const relevantSuggestions = this.filterRelevantSuggestions(analysis.suggestions);
    if (relevantSuggestions.length > 0) {
      return 'make_suggestions';
    }

    // 3. Verificar se devemos validar algo
    const needsValidation = this.checkValidationNeeds(analysis, context);
    if (needsValidation) {
      return 'validate_information';
    }

    // 4. Verificar se podemos progredir
    const canProgress = this.canProgressInConversation(analysis, context);
    if (canProgress) {
      return 'progress_conversation';
    }

    return 'continue_exploration';
  }

  private async generateResponse(action: string, context: InterviewContext): Promise<string> {
    switch (action) {
      case 'ask_followup':
        return this.generateFollowUpQuestion(context);
      case 'make_suggestions':
        return this.generateSuggestionResponse(context);
      case 'validate_information':
        return this.generateValidationQuestion(context);
      case 'progress_conversation':
        return this.generateProgressionResponse(context);
      default:
        return this.generateExplorationQuestion(context);
    }
  }

  private formatResponse(type: keyof typeof this.responseTemplates, params: Record<string, any>): string {
    let response: string = this.responseTemplates[type];
    
    // Substituir parâmetros
    for (const [key, value] of Object.entries(params)) {
      response = response.replace(
        new RegExp(`{${key}}`, 'g'),
        Array.isArray(value) ? value.join('\n') : String(value)
      );
    }

    return response;
  }

  private async recordConversationEntry(entry: ConversationEntry): Promise<void> {
    this.conversationContext.conversationHistory.push(entry);
  }

  private updateContext(analysis: AnalysisResult): void {
    // Atualizar tópicos identificados
    analysis.topics.forEach(topic => {
      this.conversationContext.identifiedTopics.add(topic.name);
      this.conversationContext.confidenceLevels[topic.name] = topic.confidence;
    });

    // Atualizar tópicos ativos
    this.conversationContext.activeTopics = analysis.topics
      .filter(t => t.needsElaboration)
      .map(t => t.name);
  }

  private extractTopics(analysis: any): Topic[] {
    // Implementar extração de tópicos do resultado da análise
    return [];
  }

  private identifyPatterns(analysis: any): Pattern[] {
    // Implementar identificação de padrões
    return [];
  }

  private identifyConcerns(analysis: any): Concern[] {
    // Implementar identificação de preocupações
    return [];
  }

  private generateSuggestions(analysis: any): Suggestion[] {
    // Implementar geração de sugestões
    return [];
  }

  private calculateConfidence(analysis: any): number {
    // Implementar cálculo de confiança
    return 0;
  }

  private identifyMissingInformation(analysis: AnalysisResult, context: InterviewContext): string[] {
    // Implementar identificação de informações faltantes
    return [];
  }

  private filterRelevantSuggestions(suggestions: Suggestion[]): Suggestion[] {
    // Implementar filtragem de sugestões relevantes
    return [];
  }

  private checkValidationNeeds(analysis: AnalysisResult, context: InterviewContext): boolean {
    // Implementar verificação de necessidade de validação
    return false;
  }

  private canProgressInConversation(analysis: AnalysisResult, context: InterviewContext): boolean {
    // Implementar verificação de progressão
    return false;
  }

  private async generateFollowUpQuestion(context: InterviewContext): Promise<string> {
    // Implementar geração de pergunta de follow-up
    return '';
  }

  private async generateSuggestionResponse(context: InterviewContext): Promise<string> {
    // Implementar geração de resposta com sugestões
    return '';
  }

  private async generateValidationQuestion(context: InterviewContext): Promise<string> {
    // Implementar geração de pergunta de validação
    return '';
  }

  private async generateProgressionResponse(context: InterviewContext): Promise<string> {
    // Implementar geração de resposta de progressão
    return '';
  }

  private async generateExplorationQuestion(context: InterviewContext): Promise<string> {
    // Implementar geração de pergunta exploratória
    return '';
  }
} 
import { DocumentPhase, Question, InterviewContext, Document } from '../../types';
import { ClaudeService } from '../../services/claude/ClaudeService';
import { SchemaManager } from '../documentation/SchemaManager';
import { ValidationManager } from '../validation/ValidationManager';

interface DomainPattern {
  keywords: string[];
  suggestedModules: string[];
}

interface ComplexityIndicators {
  highComplexity: string[];
  mediumComplexity: string[];
}

interface ContextAnalysis {
  domainPatterns: {
    [key: string]: DomainPattern;
  };
  complexityIndicators: ComplexityIndicators;
}

interface QuestionExtractor {
  type: string;
  updatePaths: string[];
}

interface EnhancedQuestion extends Question {
  analysis?: {
    extractors: QuestionExtractor[];
  };
}

interface InterviewState {
  currentPhase: DocumentPhase;
  status: 'initial' | 'in_progress' | 'validating' | 'transitioning';
  lastUpdate: Date;
  metadata: {
    version: string;
    status: 'draft' | 'review' | 'approved';
  };
}

export class PhaseManager {
  private interviewState: InterviewState = {
    currentPhase: 'DVP',
    status: 'initial',
    lastUpdate: new Date(),
    metadata: {
      version: "1.0.0",
      status: "draft"
    }
  };

  private contextAnalysis: ContextAnalysis = {
    domainPatterns: {
      ecommerce: {
        keywords: ["marketplace", "vendas", "produtos", "pagamentos"],
        suggestedModules: ["payment", "catalog", "cart", "shipping"]
      },
      healthcare: {
        keywords: ["clínica", "médico", "paciente", "agendamento"],
        suggestedModules: ["scheduling", "medical-records", "prescriptions"]
      }
    },
    complexityIndicators: {
      highComplexity: [
        "integração com sistemas externos",
        "dados sensíveis",
        "alta disponibilidade",
        "tempo real"
      ],
      mediumComplexity: [
        "autenticação de usuários",
        "relatórios",
        "dashboard"
      ]
    }
  };

  constructor(
    private claudeService: ClaudeService,
    private schemaManager: SchemaManager,
    private validationManager: ValidationManager
  ) {}

  async startInterview(phase: DocumentPhase): Promise<string> {
    this.interviewState.currentPhase = phase;
    this.interviewState.status = 'initial';
    
    return this.formatResponse(
      'welcome',
      { fase_atual: phase }
    );
  }

  async processResponse(response: string, context: InterviewContext): Promise<string> {
    try {
      // 1. Análise de Contexto
      const analyzedContext = await this.claudeService.analyzeContext(
        response,
        context
      );

      // 2. Atualização de Schemas
      const schema = await this.schemaManager.getSchema(this.interviewState.currentPhase);
      await this.schemaManager.update(
        this.interviewState.currentPhase,
        analyzedContext
      );

      // 3. Validação da Fase
      const validation = await this.validationManager.validatePhase({
        phase: this.interviewState.currentPhase,
        document: context.projectContext.currentDocument || {
          id: '',
          name: '',
          phase: this.interviewState.currentPhase,
          status: 'draft',
          content: { sections: [], extractedTopics: [], identifiedConcerns: [] },
          metadata: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0.0',
            author: 'system',
            lastAnalysis: new Date().toISOString()
          },
          analysis: {
            domainType: 'generic',
            complexity: {
              overall: 'medium',
              factors: {
                technical: 0.5,
                business: 0.5,
                integration: 0.5,
                security: 0.5,
                scale: 0.5
              },
              indicators: []
            },
            identifiedPatterns: [],
            suggestedApproaches: [],
            riskAreas: [],
            completeness: 0
          }
        },
        schema: schema.id,
        projectContext: context.projectContext,
        conversationContext: context.conversationContext,
        analysisContext: context.analysisContext
      });

      if (!validation.isValid) {
        return this.formatResponse('validation_failed', {
          errors: validation.errors?.join('\n') || 'Erro não especificado'
        });
      }

      // 4. Verificar Transição de Fase
      if (await this.shouldTransitionPhase(context)) {
        return this.handlePhaseTransition(context);
      }

      // 5. Gerar Próxima Pergunta
      return this.generateNextQuestion(context);
    } catch (error) {
      console.error('Erro no processamento da resposta:', error);
      return this.formatResponse('error', {
        message: 'Ocorreu um erro ao processar sua resposta.'
      });
    }
  }

  private async shouldTransitionPhase(context: InterviewContext): Promise<boolean> {
    const validation = await this.validationManager.validatePhase({
      phase: this.interviewState.currentPhase,
      document: context.projectContext.currentDocument || {
        id: '',
        name: '',
        phase: this.interviewState.currentPhase,
        status: 'draft',
        content: { sections: [], extractedTopics: [], identifiedConcerns: [] },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          author: 'system',
          lastAnalysis: new Date().toISOString()
        },
        analysis: {
          domainType: 'generic',
          complexity: {
            overall: 'medium',
            factors: {
              technical: 0.5,
              business: 0.5,
              integration: 0.5,
              security: 0.5,
              scale: 0.5
            },
            indicators: []
          },
          identifiedPatterns: [],
          suggestedApproaches: [],
          riskAreas: [],
          completeness: 0
        }
      },
      schema: await this.schemaManager.getSchema(this.interviewState.currentPhase)
    });

    return validation.isValid && this.isPhaseComplete(context);
  }

  private async handlePhaseTransition(context: InterviewContext): Promise<string> {
    const nextPhase = this.getNextPhase(this.interviewState.currentPhase);
    
    if (!nextPhase) {
      return this.formatResponse('project_complete', {});
    }

    this.interviewState.status = 'transitioning';
    
    return this.formatResponse('phase_transition', {
      fase_atual: this.interviewState.currentPhase,
      próxima_fase: nextPhase
    });
  }

  private async generateNextQuestion(context: InterviewContext): Promise<string> {
    const template = await this.loadQuestionTemplate(this.interviewState.currentPhase);
    const customizedQuestions = await this.claudeService.customizeQuestions(
      template,
      context
    );

    if (customizedQuestions.length === 0) {
      return this.formatResponse('no_questions', {
        fase_atual: this.interviewState.currentPhase
      });
    }

    return customizedQuestions[0].content;
  }

  private readonly responseTemplates = {
    welcome: `Olá, sou seu assistente do Project Manager, especializado em {fase_atual}.
Em qual aspecto do documento atual você precisa de ajuda?`,
    
    validation_failed: `⚠️ Detectei alguns pontos que precisamos resolver:
{errors}
Podemos trabalhar nisso juntos?`,
    
    phase_transition: `✅ {fase_atual} está validada
📝 Preparando transição para {próxima_fase}
❓ Posso iniciar as perguntas da próxima fase?`,
    
    project_complete: `🎉 Parabéns! Todos os documentos foram completados com sucesso.
Gostaria de revisar alguma fase específica?`,
    
    no_questions: `✅ Todas as perguntas para {fase_atual} foram respondidas.
Gostaria de revisar algum aspecto específico?`,
    
    error: `⚠️ {message}
Por favor, tente novamente ou entre em contato com o suporte.`
  } as const;

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

  private getNextPhase(currentPhase: DocumentPhase): DocumentPhase | null {
    const phases: DocumentPhase[] = ['DVP', 'DRS', 'DAS', 'DADI'];
    const currentIndex = phases.indexOf(currentPhase);
    
    if (currentIndex < phases.length - 1) {
      return phases[currentIndex + 1];
    }
    
    return null;
  }

  private isPhaseComplete(context: InterviewContext): boolean {
    // Implementar lógica para verificar se todos os requisitos da fase foram atendidos
    return true;
  }

  private async loadQuestionTemplate(phase: DocumentPhase): Promise<Question[]> {
    // Carregar perguntas base do schema
    const schema = await this.schemaManager.getSchema(phase);
    return this.extractQuestionsFromSchema(schema);
  }

  private extractQuestionsFromSchema(schema: any): Question[] {
    // Extrair perguntas baseadas na estrutura do schema
    return [];
  }

  async generateQuestions(phase: DocumentPhase, context: InterviewContext): Promise<Question[]> {
    // 1. Analisar o domínio do projeto
    const domainAnalysis = await this.analyzeDomain(context);
    
    // 2. Avaliar complexidade
    const complexityLevel = await this.evaluateComplexity(context);
    
    // 3. Carregar template base de perguntas
    const baseQuestions = await this.loadQuestionTemplate(phase);
    
    // 4. Customizar perguntas baseado no contexto
    const customizedQuestions = await this.claudeService.customizeQuestions(
      baseQuestions,
      {
        ...context,
        domainAnalysis,
        complexityLevel
      }
    );

    // 5. Adicionar extratores específicos do domínio
    return this.enrichQuestionsWithExtractors(customizedQuestions, domainAnalysis);
  }

  private async analyzeDomain(context: InterviewContext): Promise<string> {
    const projectDescription = context.projectContext.currentDocument?.content?.sections
      .find(s => s.title.toLowerCase().includes('descrição'))?.content || '';
    
    for (const [domain, pattern] of Object.entries(this.contextAnalysis.domainPatterns)) {
      const matchesKeywords = pattern.keywords.some(
        keyword => projectDescription.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matchesKeywords) {
        return domain;
      }
    }
    
    return 'generic';
  }

  private async evaluateComplexity(context: InterviewContext): Promise<'high' | 'medium' | 'low'> {
    const description = context.projectContext.currentDocument?.content?.sections
      .find(s => s.title.toLowerCase().includes('descrição'))?.content || '';
    
    const highComplexityMatches = this.contextAnalysis.complexityIndicators.highComplexity
      .filter(indicator => description.toLowerCase().includes(indicator.toLowerCase())).length;
      
    const mediumComplexityMatches = this.contextAnalysis.complexityIndicators.mediumComplexity
      .filter(indicator => description.toLowerCase().includes(indicator.toLowerCase())).length;
    
    if (highComplexityMatches > 0) return 'high';
    if (mediumComplexityMatches > 0) return 'medium';
    return 'low';
  }

  private enrichQuestionsWithExtractors(
    questions: Question[],
    domainAnalysis: string
  ): EnhancedQuestion[] {
    return questions.map(question => {
      const enhanced: EnhancedQuestion = { ...question };
      
      if (this.contextAnalysis.domainPatterns[domainAnalysis]) {
        const pattern = this.contextAnalysis.domainPatterns[domainAnalysis];
        
        enhanced.analysis = {
          extractors: [
            ...(enhanced.analysis?.extractors || []),
            {
              type: 'domainSpecific',
              updatePaths: pattern.suggestedModules.map(
                module => `components.modules.${module}`
              )
            }
          ]
        };
      }
      
      return enhanced;
    });
  }

  async generateRecommendations(phase: DocumentPhase, context: InterviewContext) {
    const domainAnalysis = await this.analyzeDomain(context);
    const complexityLevel = await this.evaluateComplexity(context);
    
    return this.claudeService.analyzeContext(phase, {
      ...context,
      projectContext: {
        ...context.projectContext,
        domainType: domainAnalysis,
        complexity: {
          overall: complexityLevel,
          factors: {
            technical: 0.5,
            business: 0.5,
            integration: 0.5,
            security: 0.5,
            scale: 0.5
          },
          indicators: []
        }
      }
    });
  }

  async getFollowUpQuestions(phase: DocumentPhase, previousAnswers: Record<string, any>): Promise<Question[]> {
    const conditions = await this.evaluateFollowUpConditions(phase, previousAnswers);
    return this.generateFollowUpQuestions(conditions);
  }

  private async evaluateFollowUpConditions(phase: DocumentPhase, previousAnswers: Record<string, any>): Promise<any[]> {
    const conditions = [];
    
    // Verificar condições baseadas nas respostas anteriores
    if (this.containsSensitiveData(previousAnswers)) {
      conditions.push({
        id: 'SEC-DETAIL-001',
        question: 'Quais normas de compliance precisamos considerar?',
        type: 'open'
      });
    }

    if (this.hasHighUserLoad(previousAnswers)) {
      conditions.push({
        id: 'SCALE-DETAIL-001',
        question: 'Qual a expectativa de crescimento mensal?',
        type: 'open'
      });
    }

    return conditions;
  }

  private containsSensitiveData(answers: Record<string, any>): boolean {
    const sensitiveKeywords = ['dados pessoais', 'LGPD', 'dados sensíveis', 'informações confidenciais'];
    return this.checkKeywordsInAnswers(answers, sensitiveKeywords);
  }

  private hasHighUserLoad(answers: Record<string, any>): boolean {
    const loadKeywords = ['alta demanda', 'milhões de usuários', 'escala', 'alto tráfego'];
    return this.checkKeywordsInAnswers(answers, loadKeywords);
  }

  private checkKeywordsInAnswers(answers: Record<string, any>, keywords: string[]): boolean {
    const answersText = JSON.stringify(answers).toLowerCase();
    return keywords.some(keyword => answersText.includes(keyword.toLowerCase()));
  }

  private async generateFollowUpQuestions(conditions: any[]): Promise<Question[]> {
    // Implementar geração de perguntas de follow-up baseadas nas condições
    return [];
  }

  // Métodos auxiliares para análise de contexto
  private async analyzeAnswers(answers: Record<string, any>): Promise<any> {
    // Implementar análise de respostas para gerar recomendações
    return {};
  }

  private async validatePhaseCompletion(phase: DocumentPhase, document: Document): Promise<boolean> {
    // Implementar validação de completude da fase
    return true;
  }
} 
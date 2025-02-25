import { 
    ChatMessage, 
    MessageContext, 
    ContextAnalysis, 
    AIServiceConfig,
    ConversationState 
} from '../types';
import { ClaudeService } from './claude.service';
import { ClaudeMessage } from '../types/claude.types';

export class AIService {
    private conversations: Map<string, ConversationState> = new Map();
    private claudeService: ClaudeService;

    constructor(config: AIServiceConfig) {
        this.claudeService = new ClaudeService(config);
    }

    async startConversation(projectId: string, phase: 'DVP' | 'DRS' | 'DAS' | 'DADI'): Promise<ConversationState> {
        try {
            // Configurar estado inicial
            const initialState: ConversationState = {
                projectId,
                messages: [],
                currentPhase: phase,
                context: {
                    completedFields: [],
                    pendingFields: []
                }
            };

            // Registrar conversa antes de qualquer operação
            this.conversations.set(projectId, initialState);

            // Obter mensagem inicial do Claude
            const welcomeResponse = await this.claudeService.sendMessage(
                [{ role: 'assistant', content: 'Olá! Como posso ajudar?' }]
            );

            // Adicionar mensagem inicial do assistente com contexto mínimo
            const welcomeMessage = {
                id: Date.now().toString(),
                role: 'assistant' as const,
                content: welcomeResponse.content,
                timestamp: new Date(),
                context: {
                    projectId,
                    phase
                }
            };

            initialState.messages.push(welcomeMessage);

            return initialState;
        } catch (error) {
            // Remover conversa em caso de erro
            this.conversations.delete(projectId);
            throw new Error('Erro ao iniciar conversa');
        }
    }

    async processMessage(projectId: string, content: string): Promise<ChatMessage> {
        const conversation = this.conversations.get(projectId);
        if (!conversation) {
            throw new Error('Conversa não encontrada');
        }

        // Adicionar mensagem do usuário
        const userMessage = this.createUserMessage(content, {
            projectId,
            phase: conversation.currentPhase
        });

        try {
            // Converter mensagens para formato do Claude
            const claudeHistory = this.convertToCloudeMessages(conversation.messages);

            // Analisar contexto da mensagem
            let analysisResponse;
            try {
                analysisResponse = await this.claudeService.analyzeContext(content, claudeHistory);
            } catch (error: any) {
                if (error.message?.includes('Erro na API do Claude: Erro desconhecido')) {
                    throw new Error('Erro inesperado ao processar mensagem');
                }
                if (error.message?.includes('Erro na API do Claude')) {
                    throw error;
                }
                throw new Error('Erro inesperado ao processar mensagem');
            }

            let analysis: ContextAnalysis;
            try {
                const parsedAnalysis = JSON.parse(analysisResponse.content);
                if (this.isValidAnalysisFormat(parsedAnalysis)) {
                    analysis = parsedAnalysis;
                } else {
                    analysis = this.createDefaultAnalysis(conversation.currentPhase);
                }
            } catch (error) {
                analysis = this.createDefaultAnalysis(conversation.currentPhase);
            }

            // Atualizar campos baseado na análise
            this.updateFieldsStatus(conversation, analysis);

            // Gerar resposta do assistente usando Claude
            let responseMessage;
            try {
                responseMessage = await this.claudeService.generateResponse(
                    content,
                    analysisResponse.content,
                    claudeHistory
                );

                // Validar resposta do assistente
                if (!responseMessage?.content) {
                    throw new Error('Resposta inválida do assistente');
                }
            } catch (error: any) {
                if (error.message === 'Erro na API do Claude: Resposta inválida') {
                    throw new Error('Resposta inválida do assistente');
                }
                if (error.message?.includes('Erro na API do Claude: Erro desconhecido')) {
                    throw new Error('Erro inesperado ao processar mensagem');
                }
                if (error.message?.includes('Erro na API do Claude')) {
                    throw error;
                }
                throw new Error('Erro inesperado ao processar mensagem');
            }

            // Criar mensagem do assistente
            const assistantMessage = this.createAssistantMessage(
                responseMessage.content,
                {
                    projectId,
                    phase: conversation.currentPhase,
                    suggestions: analysis.suggestions.map(s => s.description),
                    confidence: this.calculateConfidence(analysis),
                    detectedFields: analysis.detectedFields
                }
            );

            // Atualizar estado da conversa
            conversation.messages.push(userMessage);
            conversation.messages.push(assistantMessage);
            conversation.context.lastAnalysis = analysis;
            if (analysis.nextQuestion) {
                conversation.context.lastQuestion = analysis.nextQuestion;
            }

            return assistantMessage;
        } catch (error: any) {
            if (error.message === 'Resposta inválida do assistente') {
                throw error;
            }
            if (error.message?.includes('Erro na API do Claude')) {
                throw error;
            }
            throw new Error('Erro inesperado ao processar mensagem');
        }
    }

    private convertToCloudeMessages(messages: ChatMessage[]): ClaudeMessage[] {
        return messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }

    private createUserMessage(content: string, context: MessageContext): ChatMessage {
        return {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
            context
        };
    }

    private createAssistantMessage(content: string, context: MessageContext): ChatMessage {
        const messageContext = { ...context };
        if (context.suggestions && context.suggestions.length > 0) {
            messageContext.suggestions = context.suggestions;
        }

        return {
            id: Date.now().toString(),
            role: 'assistant',
            content: content,
            timestamp: new Date(),
            context: messageContext
        };
    }

    private updateFieldsStatus(conversation: ConversationState, analysis: ContextAnalysis): void {
        // Atualizar campos baseado na análise
        for (const field of analysis.detectedFields) {
            if (field.confidence > 0.8) {
                if (!conversation.context.completedFields.includes(field.field)) {
                    conversation.context.completedFields.push(field.field);
                }
                conversation.context.pendingFields = conversation.context.pendingFields
                    .filter(f => f !== field.field);
            }
        }
    }

    private isValidAnalysisFormat(analysis: any): analysis is ContextAnalysis {
        return (
            analysis &&
            typeof analysis === 'object' &&
            // Validar campos obrigatórios
            Array.isArray(analysis.detectedFields) &&
            Array.isArray(analysis.suggestions) &&
            // Validar estrutura dos campos detectados
            analysis.detectedFields.every((field: any) => 
                typeof field === 'object' &&
                typeof field.phase === 'string' &&
                typeof field.field === 'string' &&
                (field.confidence === undefined || typeof field.confidence === 'number') &&
                field.value !== undefined
            ) &&
            // Validar fase do projeto
            (!analysis.detectedPhase || ['DVP', 'DRS', 'DAS', 'DADI'].includes(analysis.detectedPhase)) &&
            // Validar sugestões
            analysis.suggestions.every((suggestion: any) => 
                typeof suggestion === 'object' &&
                typeof suggestion.type === 'string' &&
                ['field_update', 'next_question', 'validation'].includes(suggestion.type) &&
                typeof suggestion.description === 'string' &&
                typeof suggestion.confidence === 'number'
            ) &&
            // Validar nextQuestion opcional
            (analysis.nextQuestion === undefined || typeof analysis.nextQuestion === 'string')
        );
    }

    private createDefaultAnalysis(phase: 'DVP' | 'DRS' | 'DAS' | 'DADI'): ContextAnalysis {
        return {
            detectedPhase: phase,
            detectedFields: [],
            suggestions: [
                {
                    type: 'next_question',
                    description: 'Forneça mais informações sobre o projeto',
                    confidence: 0.8
                }
            ],
            nextQuestion: 'Pode me dar mais detalhes sobre o que precisa ser documentado?'
        };
    }

    private calculateConfidence(analysis: ContextAnalysis): number {
        if (!analysis.detectedFields.length) {
            return 0.5;
        }

        const avgConfidence = analysis.detectedFields.reduce(
            (sum, field) => sum + (field.confidence || 0),
            0
        ) / analysis.detectedFields.length;

        return Math.min(Math.max(avgConfidence, 0), 1);
    }
} 
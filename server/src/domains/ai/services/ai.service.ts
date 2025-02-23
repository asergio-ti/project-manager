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
        const initialState: ConversationState = {
            projectId,
            messages: [],
            currentPhase: phase,
            context: {
                completedFields: [],
                pendingFields: []
            }
        };

        // Adicionar mensagem inicial do assistente
        const welcomeMessage = await this.createAssistantMessage(
            'Olá! Sou seu assistente do Project Manager. Vou te ajudar a documentar seu projeto. Vamos começar com algumas perguntas sobre a visão geral do projeto.',
            { projectId, phase }
        );

        initialState.messages.push(welcomeMessage);
        this.conversations.set(projectId, initialState);

        return initialState;
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
        conversation.messages.push(userMessage);

        // Converter mensagens para formato do Claude
        const claudeHistory = this.convertToCloudeMessages(conversation.messages);

        // Analisar contexto usando Claude
        const analysisResponse = await this.claudeService.analyzeContext(content, claudeHistory);
        console.log('Resposta do analyzeContext:', analysisResponse.content);
        let analysis: ContextAnalysis;
        try {
            analysis = JSON.parse(analysisResponse.content);
        } catch (error) {
            console.error('Erro ao fazer parse da resposta:', error);
            // Se a resposta não for um JSON válido, criar uma análise padrão
            analysis = {
                detectedPhase: conversation.currentPhase,
                detectedFields: [],
                suggestions: [],
                nextQuestion: undefined
            };
        }

        // Gerar resposta do assistente usando Claude
        const responseMessage = await this.claudeService.generateResponse(
            content,
            analysisResponse.content,
            claudeHistory
        );

        // Criar mensagem do assistente
        const assistantMessage = this.createAssistantMessage(
            responseMessage.content,
            {
                projectId,
                phase: conversation.currentPhase,
                confidence: 0.9 // TODO: Calcular confiança baseado na análise
            }
        );

        conversation.messages.push(assistantMessage);

        // Atualizar estado da conversa
        conversation.context.lastAnalysis = analysis;
        if (analysis.nextQuestion) {
            conversation.context.lastQuestion = analysis.nextQuestion;
        }

        // Atualizar campos completados/pendentes
        this.updateFieldsStatus(conversation, analysis);

        return assistantMessage;
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
        return {
            id: Date.now().toString(),
            role: 'assistant',
            content,
            timestamp: new Date(),
            context
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
} 
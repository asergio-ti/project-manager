import { AIService } from '../ai.service';
import { ClaudeService } from '../claude.service';
import { AIServiceConfig, ConversationState, ChatMessage } from '../../types';
import { ClaudeResponse } from '../../types/claude.types';

// Mock do ClaudeService
jest.mock('../claude.service');
const MockedClaudeService = ClaudeService as jest.MockedClass<typeof ClaudeService>;

describe('AIService', () => {
    let service: AIService;
    const mockConfig: AIServiceConfig = {
        model: 'claude-3-sonnet',
        temperature: 0.7,
        maxTokens: 2000,
        apiKey: 'test-api-key'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock da resposta inicial do Claude
        const mockWelcomeResponse: ClaudeResponse = {
            id: 'welcome-123',
            model: 'claude-3-sonnet',
            role: 'assistant',
            content: 'Olá! Como posso ajudar?',
            stop_reason: 'end_turn',
            stop_sequence: null,
            usage: { input_tokens: 5, output_tokens: 10 }
        };
        
        MockedClaudeService.prototype.sendMessage.mockResolvedValue(mockWelcomeResponse);
        service = new AIService(mockConfig);
    });

    describe('startConversation', () => {
        const mockProjectId = 'project-123';
        const mockPhase = 'DVP' as const;

        it('deve iniciar uma nova conversa com estado inicial correto', async () => {
            const conversation = await service.startConversation(mockProjectId, mockPhase);

            expect(conversation).toBeDefined();
            expect(conversation.projectId).toBe(mockProjectId);
            expect(conversation.currentPhase).toBe(mockPhase);
            expect(conversation.messages).toHaveLength(1);
            expect(conversation.context).toEqual({
                completedFields: [],
                pendingFields: []
            });
        });

        it('deve incluir mensagem inicial do assistente', async () => {
            const conversation = await service.startConversation(mockProjectId, mockPhase);
            const firstMessage = conversation.messages[0];

            expect(firstMessage.role).toBe('assistant');
            expect(firstMessage.content).toContain('Olá');
            expect(firstMessage.context).toEqual({
                projectId: mockProjectId,
                phase: mockPhase
            });
        });
    });

    describe('processMessage', () => {
        const mockProjectId = 'project-123';
        const mockPhase = 'DVP' as const;
        const mockUserMessage = 'Como começo a documentação?';

        beforeEach(async () => {
            // Iniciar conversa antes de cada teste
            await service.startConversation(mockProjectId, mockPhase);
        });

        it('deve processar mensagem do usuário corretamente', async () => {
            // Mock das respostas do Claude
            const mockAnalysisResponse: ClaudeResponse = {
                id: 'analysis-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [],
                    suggestions: [],
                    nextQuestion: 'Qual é o objetivo principal do projeto?'
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 10, output_tokens: 20 }
            };

            const mockResponseMessage: ClaudeResponse = {
                id: 'response-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Vamos começar definindo a visão geral do projeto.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 15, output_tokens: 25 }
            };

            MockedClaudeService.prototype.analyzeContext.mockResolvedValueOnce(mockAnalysisResponse);
            MockedClaudeService.prototype.generateResponse.mockResolvedValueOnce(mockResponseMessage);

            const response = await service.processMessage(mockProjectId, mockUserMessage);

            expect(response.role).toBe('assistant');
            expect(response.content).toBe(mockResponseMessage.content);
            expect(response.context?.projectId).toBe(mockProjectId);
            expect(response.context?.phase).toBe(mockPhase);
        });

        it('deve atualizar o estado da conversa após processamento', async () => {
            const mockAnalysisResponse: ClaudeResponse = {
                id: 'analysis-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [
                        { phase: 'DVP', field: 'vision', value: 'Descrição da visão', confidence: 0.9 }
                    ],
                    suggestions: [],
                    nextQuestion: 'Qual é o escopo do projeto?'
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 10, output_tokens: 20 }
            };

            const mockResponseMessage: ClaudeResponse = {
                id: 'response-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Entendi a visão do projeto. Vamos falar sobre o escopo?',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 15, output_tokens: 25 }
            };

            MockedClaudeService.prototype.analyzeContext.mockResolvedValueOnce(mockAnalysisResponse);
            MockedClaudeService.prototype.generateResponse.mockResolvedValueOnce(mockResponseMessage);

            await service.processMessage(mockProjectId, mockUserMessage);

            // Verificar se o campo foi marcado como completo
            const conversation = (service as any).conversations.get(mockProjectId);
            expect(conversation.context.completedFields).toContain('vision');
            expect(conversation.context.lastQuestion).toBe('Qual é o escopo do projeto?');
        });

        it('deve lançar erro se conversa não existir', async () => {
            await expect(service.processMessage('invalid-project', mockUserMessage))
                .rejects
                .toThrow('Conversa não encontrada');
        });

        it('deve tratar erros do Claude corretamente', async () => {
            MockedClaudeService.prototype.analyzeContext.mockRejectedValueOnce(
                new Error('Erro na API do Claude')
            );

            await expect(service.processMessage(mockProjectId, mockUserMessage))
                .rejects
                .toThrow('Erro na API do Claude');
        });
    });
}); 
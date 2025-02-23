import { AIService } from '../ai.service';
import { ClaudeService } from '../claude.service';
import { AIServiceConfig, ConversationState, ChatMessage } from '../../types';
import { ClaudeResponse } from '../../types/claude.types';
import axios from 'axios';

// Mock do axios para simular chamadas à API do Claude
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Integração AIService-ClaudeService', () => {
    let aiService: AIService;
    const mockConfig: AIServiceConfig = {
        model: 'claude-3-sonnet',
        temperature: 0.7,
        maxTokens: 2000,
        apiKey: 'test-api-key'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        aiService = new AIService(mockConfig);
    });

    describe('Fluxo completo de conversa', () => {
        const mockProjectId = 'project-123';
        const mockPhase = 'DVP' as const;

        it('deve executar fluxo completo de conversa com sucesso', async () => {
            // Mock da resposta inicial do Claude
            const mockWelcomeResponse: ClaudeResponse = {
                id: 'welcome-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Olá! Sou seu assistente do Project Manager. Vou te ajudar a documentar seu projeto. Vamos começar com algumas perguntas sobre a visão geral do projeto.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 10, output_tokens: 20 }
            };

            // Mock da análise de contexto
            const mockAnalysisResponse: ClaudeResponse = {
                id: 'analysis-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [
                        { phase: 'DVP', field: 'vision', value: 'Sistema de documentação', confidence: 0.95 }
                    ],
                    suggestions: ['Pergunte sobre o escopo'],
                    nextQuestion: 'Qual é o escopo do projeto?'
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 15, output_tokens: 25 }
            };

            // Mock da resposta do assistente
            const mockAssistantResponse: ClaudeResponse = {
                id: 'response-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Entendi que você está desenvolvendo um sistema de documentação. Vamos falar sobre o escopo?',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            // Configurar mocks do axios
            mockedAxios.post
                .mockResolvedValueOnce({
                    data: mockWelcomeResponse,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                .mockResolvedValueOnce({
                    data: mockAnalysisResponse,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                .mockResolvedValueOnce({
                    data: mockAssistantResponse,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                });

            // Iniciar conversa
            const conversation = await aiService.startConversation(mockProjectId, mockPhase);
            expect(conversation.messages[0].content).toBe(mockWelcomeResponse.content);

            // Enviar mensagem do usuário
            const userMessage = 'Estou desenvolvendo um sistema de documentação';
            const response = await aiService.processMessage(mockProjectId, userMessage);

            // Verificar estado final da conversa
            expect(response.content).toBe(mockAssistantResponse.content);
            expect(response.context?.projectId).toBe(mockProjectId);
            expect(response.context?.phase).toBe(mockPhase);

            // Verificar chamadas à API do Claude
            expect(mockedAxios.post).toHaveBeenCalledTimes(3);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/messages'),
                expect.objectContaining({
                    model: mockConfig.model,
                    messages: expect.arrayContaining([
                        expect.objectContaining({ content: userMessage })
                    ])
                }),
                expect.any(Object)
            );
        });

        it('deve tratar erros de API durante o fluxo', async () => {
            // Mock da resposta inicial do Claude
            const mockWelcomeResponse: ClaudeResponse = {
                id: 'welcome-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Olá! Sou seu assistente do Project Manager. Vou te ajudar a documentar seu projeto. Vamos começar com algumas perguntas sobre a visão geral do projeto.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 10, output_tokens: 20 }
            };

            // Mock da resposta inicial bem sucedida
            mockedAxios.post
                .mockResolvedValueOnce({
                    data: mockWelcomeResponse,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                // Mock de erro da API para analyzeContext
                .mockRejectedValueOnce({
                    response: {
                        data: {
                            type: 'rate_limit_error',
                            message: 'Rate limit exceeded'
                        }
                    }
                });

            // Iniciar conversa primeiro
            await aiService.startConversation(mockProjectId, mockPhase);

            // Tentar processar mensagem
            const userMessage = 'Como posso começar?';
            await expect(aiService.processMessage(mockProjectId, userMessage))
                .rejects
                .toThrow('Erro ao comunicar com a API do Claude');

            // Verificar que o erro não corrompeu o estado da conversa
            const conversation = (aiService as any).conversations.get(mockProjectId);
            expect(conversation.messages).toBeDefined();
            expect(conversation.context).toBeDefined();
        });

        it('deve manter contexto entre mensagens', async () => {
            // Mock da resposta inicial do Claude
            const mockWelcomeResponse: ClaudeResponse = {
                id: 'welcome-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Olá! Sou seu assistente do Project Manager. Vou te ajudar a documentar seu projeto. Vamos começar com algumas perguntas sobre a visão geral do projeto.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 10, output_tokens: 20 }
            };

            // Mock da primeira análise
            const mockAnalysis1: ClaudeResponse = {
                id: 'analysis-1',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [
                        { phase: 'DVP', field: 'vision', value: 'Sistema de documentação', confidence: 0.95 }
                    ],
                    suggestions: [],
                    nextQuestion: 'Qual é o escopo?'
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 10, output_tokens: 20 }
            };

            // Mock da primeira resposta
            const mockResponse1: ClaudeResponse = {
                id: 'response-1',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Entendi a visão. Vamos falar do escopo?',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 15, output_tokens: 25 }
            };

            // Mock da segunda análise
            const mockAnalysis2: ClaudeResponse = {
                id: 'analysis-2',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [
                        { phase: 'DVP', field: 'scope', value: 'Documentação automática', confidence: 0.9 }
                    ],
                    suggestions: [],
                    nextQuestion: 'Quais são os objetivos específicos?'
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            // Mock da segunda resposta
            const mockResponse2: ClaudeResponse = {
                id: 'response-2',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Ótimo! Agora vamos definir os objetivos específicos.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 25, output_tokens: 35 }
            };

            // Configurar mocks do axios
            mockedAxios.post
                .mockResolvedValueOnce({
                    data: mockWelcomeResponse,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                .mockResolvedValueOnce({
                    data: mockAnalysis1,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                .mockResolvedValueOnce({
                    data: mockResponse1,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                .mockResolvedValueOnce({
                    data: mockAnalysis2,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                })
                .mockResolvedValueOnce({
                    data: mockResponse2,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                });

            // Primeira mensagem
            await aiService.startConversation(mockProjectId, mockPhase);
            const response1 = await aiService.processMessage(mockProjectId, 'O sistema é para documentação');

            // Segunda mensagem
            const response2 = await aiService.processMessage(mockProjectId, 'O escopo é documentação automática');

            // Verificar estado final
            const conversation = (aiService as any).conversations.get(mockProjectId);
            expect(conversation.context.completedFields).toContain('vision');
            expect(conversation.context.completedFields).toContain('scope');
            expect(conversation.messages).toHaveLength(5); // welcome + 2 user + 2 assistant
            expect(conversation.context.lastQuestion).toBe('Quais são os objetivos específicos?');
        });
    });
}); 
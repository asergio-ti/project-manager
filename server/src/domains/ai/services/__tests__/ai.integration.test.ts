import { AIService } from '../ai.service';
import { ClaudeService } from '../claude.service';
import { AIServiceConfig, ConversationState, ChatMessage } from '../../types';
import { ClaudeResponse } from '../../types/claude.types';
import axios from 'axios';

// Mock do axios para simular chamadas à API do Claude
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AIService - Testes Básicos', () => {
    let aiService: AIService;
    const mockConfig: AIServiceConfig = {
        model: 'claude-3-sonnet',
        temperature: 0.7,
        maxTokens: 2000,
        apiKey: 'test-api-key'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.post.mockImplementation((url: string, data?: unknown) => {
            const requestData = data as { system?: string };
            if (requestData?.system?.includes('análise de contexto')) {
                return Promise.resolve({
                    data: {
                        id: 'analysis-123',
                        model: 'claude-3-sonnet',
                        role: 'assistant',
                        content: JSON.stringify({
                            detectedPhase: 'DVP',
                            detectedFields: [],
                            suggestions: [],
                            nextQuestion: 'Qual é o objetivo do projeto?'
                        }),
                        stop_reason: 'end_turn',
                        stop_sequence: null,
                        usage: { input_tokens: 15, output_tokens: 25 }
                    },
                    status: 200
                });
            }
            return Promise.resolve({
                data: {
                    id: 'response-123',
                    model: 'claude-3-sonnet',
                    role: 'assistant',
                    content: 'Olá! Como posso ajudar?',
                    stop_reason: 'end_turn',
                    stop_sequence: null,
                    usage: { input_tokens: 10, output_tokens: 20 }
                },
                status: 200
            });
        });
        aiService = new AIService(mockConfig);
    });

    describe('Inicialização da Conversa', () => {
        it('deve iniciar uma nova conversa com sucesso', async () => {
            const projectId = 'test-project';
            const phase = 'DVP' as const;

            // Mock da resposta inicial
            const mockResponse: ClaudeResponse = {
                id: 'welcome-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Olá! Sou seu assistente do Project Manager.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 10, output_tokens: 20 }
            };

            mockedAxios.post.mockResolvedValueOnce({ data: mockResponse, status: 200 });

            const conversation = await aiService.startConversation(projectId, phase);

            expect(conversation.projectId).toBe(projectId);
            expect(conversation.currentPhase).toBe(phase);
            expect(conversation.messages).toHaveLength(1);
            expect(conversation.messages[0].role).toBe('assistant');
            expect(conversation.messages[0].content).toBe(mockResponse.content);
        });

        it('deve lidar com erro na inicialização da conversa', async () => {
            const projectId = 'test-project';
            const phase = 'DVP' as const;

            // Mock de erro na API
            mockedAxios.post.mockRejectedValueOnce(new Error('Erro na API'));

            await expect(aiService.startConversation(projectId, phase))
                .rejects
                .toThrow('Erro ao iniciar conversa');
        });
    });

    describe('Processamento de Mensagem Simples', () => {
        const projectId = 'test-project';
        const phase = 'DVP' as const;
        
        beforeEach(async () => {
            // Mock da resposta inicial para startConversation
            const mockWelcomeResponse: ClaudeResponse = {
                id: 'welcome-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Olá! Sou seu assistente do Project Manager.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 10, output_tokens: 20 }
            };

            mockedAxios.post.mockResolvedValueOnce({ data: mockWelcomeResponse, status: 200 });
            await aiService.startConversation(projectId, phase);
            jest.clearAllMocks();
        });

        it('deve processar uma mensagem do usuário e retornar resposta em texto', async () => {
            const userMessage = 'Olá, preciso documentar um projeto';

            // Mock da análise de contexto
            const mockAnalysisResponse: ClaudeResponse = {
                id: 'analysis-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [],
                    suggestions: [],
                    nextQuestion: 'Qual é o objetivo do projeto?'
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 15, output_tokens: 25 }
            };

            // Mock da resposta final
            const mockFinalResponse: ClaudeResponse = {
                id: 'response-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Entendi que você precisa documentar um projeto. Pode me contar mais sobre ele?',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            mockedAxios.post
                .mockResolvedValueOnce({ data: mockAnalysisResponse, status: 200 })
                .mockResolvedValueOnce({ data: mockFinalResponse, status: 200 });

            const response = await aiService.processMessage(projectId, userMessage);

            expect(response.role).toBe('assistant');
            expect(response.content).toBe(mockFinalResponse.content);
            expect(typeof response.content).toBe('string');
            expect(response.content).not.toContain('{');
            expect(response.content).not.toContain('}');
        });

        it('deve falhar ao processar mensagem para conversa inexistente', async () => {
            const invalidProjectId = 'invalid-project';
            const userMessage = 'Olá';

            await expect(aiService.processMessage(invalidProjectId, userMessage))
                .rejects
                .toThrow('Conversa não encontrada');
        });

        it('deve lidar com resposta inválida do assistente', async () => {
            const userMessage = 'Olá';

            // Mock da análise de contexto
            const mockAnalysisResponse: ClaudeResponse = {
                id: 'analysis-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [],
                    suggestions: [],
                    nextQuestion: 'Qual é o objetivo do projeto?'
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 15, output_tokens: 25 }
            };

            // Mock de resposta inválida (sem content)
            const mockInvalidResponse: Partial<ClaudeResponse> = {
                id: 'invalid-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 10, output_tokens: 20 }
            };

            mockedAxios.post
                .mockResolvedValueOnce({ data: mockAnalysisResponse, status: 200 })
                .mockResolvedValueOnce({ data: mockInvalidResponse, status: 200 });

            await expect(aiService.processMessage(projectId, userMessage))
                .rejects
                .toThrow('Resposta inválida do assistente');
        });

        it('deve lidar com erro inesperado da API', async () => {
            const userMessage = 'Olá';

            // Mock de erro não estruturado
            mockedAxios.post.mockRejectedValueOnce('Erro inesperado');

            await expect(aiService.processMessage(projectId, userMessage))
                .rejects
                .toThrow('Erro inesperado ao processar mensagem');
        });
    });

    describe('Validação de Formato de Análise', () => {
        it('deve validar formato de análise válido', () => {
            const validAnalysis = {
                detectedPhase: 'DVP',
                detectedFields: [
                    {
                        phase: 'DVP',
                        field: 'vision',
                        value: 'Sistema de documentação',
                        confidence: 0.95
                    }
                ],
                suggestions: [
                    {
                        type: 'field_update',
                        description: 'Detalhar visão do projeto',
                        confidence: 0.9
                    }
                ],
                nextQuestion: 'Qual é o escopo do projeto?'
            };

            const isValid = (aiService as any).isValidAnalysisFormat(validAnalysis);
            expect(isValid).toBe(true);
        });

        it('deve rejeitar análise sem campos obrigatórios', () => {
            const invalidAnalysis = {
                detectedPhase: 'DVP',
                // Faltando detectedFields
                suggestions: []
            };

            const isValid = (aiService as any).isValidAnalysisFormat(invalidAnalysis);
            expect(isValid).toBe(false);
        });

        it('deve rejeitar análise com fase inválida', () => {
            const invalidAnalysis = {
                detectedPhase: 'INVALID_PHASE',
                detectedFields: [],
                suggestions: []
            };

            const isValid = (aiService as any).isValidAnalysisFormat(invalidAnalysis);
            expect(isValid).toBe(false);
        });

        it('deve rejeitar análise com tipo de sugestão inválido', () => {
            const invalidAnalysis = {
                detectedPhase: 'DVP',
                detectedFields: [],
                suggestions: [
                    {
                        type: 'invalid_type',
                        description: 'Descrição',
                        confidence: 0.9
                    }
                ]
            };

            const isValid = (aiService as any).isValidAnalysisFormat(invalidAnalysis);
            expect(isValid).toBe(false);
        });

        it('deve aceitar análise sem fase detectada', () => {
            const validAnalysis = {
                detectedFields: [],
                suggestions: [
                    {
                        type: 'field_update',
                        description: 'Detalhar visão do projeto',
                        confidence: 0.9
                    }
                ]
            };

            const isValid = (aiService as any).isValidAnalysisFormat(validAnalysis);
            expect(isValid).toBe(true);
        });

        it('deve validar campos detectados corretamente', () => {
            const analysisWithFields = {
                detectedFields: [
                    {
                        phase: 'DVP',
                        field: 'vision',
                        value: 'Sistema de documentação',
                        confidence: 0.95
                    },
                    {
                        phase: 'DRS',
                        field: 'requirements',
                        value: ['req1', 'req2'],
                        confidence: 0.85
                    }
                ],
                suggestions: []
            };

            const isValid = (aiService as any).isValidAnalysisFormat(analysisWithFields);
            expect(isValid).toBe(true);
        });

        it('deve rejeitar campos detectados com formato inválido', () => {
            const invalidFields = {
                detectedFields: [
                    {
                        // Faltando phase
                        field: 'vision',
                        value: 'Sistema de documentação'
                        // Faltando confidence
                    }
                ],
                suggestions: []
            };

            const isValid = (aiService as any).isValidAnalysisFormat(invalidFields);
            expect(isValid).toBe(false);
        });
    });

    describe('Cálculo de Confiança', () => {
        it('deve calcular confiança média dos campos detectados', () => {
            const analysis = {
                detectedFields: [
                    { phase: 'DVP', field: 'vision', value: 'Sistema', confidence: 0.9 },
                    { phase: 'DVP', field: 'scope', value: 'Escopo', confidence: 0.8 }
                ],
                suggestions: []
            };

            const confidence = (aiService as any).calculateConfidence(analysis);
            expect(confidence).toBeCloseTo(0.85, 2); // Média de (0.9 + 0.8) / 2
        });

        it('deve retornar confiança padrão quando não há campos detectados', () => {
            const analysis = {
                detectedFields: [],
                suggestions: []
            };

            const confidence = (aiService as any).calculateConfidence(analysis);
            expect(confidence).toBeCloseTo(0.5, 2); // Valor padrão
        });

        it('deve lidar com campos sem confiança definida', () => {
            const analysis = {
                detectedFields: [
                    { phase: 'DVP', field: 'vision', value: 'Sistema', confidence: 0.9 },
                    { phase: 'DVP', field: 'scope', value: 'Escopo' } // Sem confidence
                ],
                suggestions: []
            };

            const confidence = (aiService as any).calculateConfidence(analysis);
            expect(confidence).toBeCloseTo(0.45, 2); // (0.9 + 0) / 2
        });

        it('deve garantir que a confiança esteja entre 0 e 1', () => {
            const analysisHigh = {
                detectedFields: [
                    { phase: 'DVP', field: 'vision', value: 'Sistema', confidence: 1.5 }
                ],
                suggestions: []
            };

            const analysisLow = {
                detectedFields: [
                    { phase: 'DVP', field: 'vision', value: 'Sistema', confidence: -0.5 }
                ],
                suggestions: []
            };

            const confidenceHigh = (aiService as any).calculateConfidence(analysisHigh);
            const confidenceLow = (aiService as any).calculateConfidence(analysisLow);

            expect(confidenceHigh).toBeCloseTo(1, 2); // Limitado a 1
            expect(confidenceLow).toBeCloseTo(0, 2); // Limitado a 0
        });

        it('deve calcular confiança com múltiplos campos', () => {
            const analysis = {
                detectedFields: [
                    { phase: 'DVP', field: 'vision', value: 'Sistema', confidence: 0.9 },
                    { phase: 'DVP', field: 'scope', value: 'Escopo', confidence: 0.8 },
                    { phase: 'DVP', field: 'goals', value: 'Objetivos', confidence: 0.7 }
                ],
                suggestions: []
            };

            const confidence = (aiService as any).calculateConfidence(analysis);
            expect(confidence).toBeCloseTo(0.8, 2); // Média de (0.9 + 0.8 + 0.7) / 3
        });
    });

    describe('Atualização de Campos', () => {
        const projectId = 'test-project';
        const phase = 'DVP' as const;
        
        beforeEach(async () => {
            // Mock da resposta inicial para startConversation
            const mockWelcomeResponse: ClaudeResponse = {
                id: 'welcome-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Olá! Sou seu assistente do Project Manager.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 10, output_tokens: 20 }
            };

            mockedAxios.post.mockResolvedValueOnce({ data: mockWelcomeResponse, status: 200 });
            await aiService.startConversation(projectId, phase);
            jest.clearAllMocks();
        });

        it('deve marcar campo como completo quando confiança > 0.8', async () => {
            const userMessage = 'A visão do projeto é criar um sistema de documentação';
            
            // Mock da análise de contexto
            const mockAnalysisResponse: ClaudeResponse = {
                id: 'analysis-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [
                        {
                            phase: 'DVP',
                            field: 'vision',
                            value: 'Sistema de documentação',
                            confidence: 0.95
                        }
                    ],
                    suggestions: []
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            // Mock da resposta final
            const mockFinalResponse: ClaudeResponse = {
                id: 'response-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Entendi que a visão do projeto é criar um sistema de documentação.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            mockedAxios.post
                .mockResolvedValueOnce({ data: mockAnalysisResponse, status: 200 })
                .mockResolvedValueOnce({ data: mockFinalResponse, status: 200 });

            await aiService.processMessage(projectId, userMessage);
            const conversation = (aiService as any).conversations.get(projectId);

            expect(conversation.context.completedFields).toContain('vision');
            expect(conversation.context.pendingFields).not.toContain('vision');
        });

        it('não deve marcar campo como completo quando confiança <= 0.8', async () => {
            const userMessage = 'Talvez a visão seja criar um sistema de documentação';
            
            // Mock da análise de contexto
            const mockAnalysisResponse: ClaudeResponse = {
                id: 'analysis-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [
                        {
                            phase: 'DVP',
                            field: 'vision',
                            value: 'Sistema de documentação',
                            confidence: 0.6
                        }
                    ],
                    suggestions: []
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            // Mock da resposta final
            const mockFinalResponse: ClaudeResponse = {
                id: 'response-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Parece que você está falando sobre a visão do projeto.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            mockedAxios.post
                .mockResolvedValueOnce({ data: mockAnalysisResponse, status: 200 })
                .mockResolvedValueOnce({ data: mockFinalResponse, status: 200 });

            await aiService.processMessage(projectId, userMessage);
            const conversation = (aiService as any).conversations.get(projectId);

            expect(conversation.context.completedFields).not.toContain('vision');
        });

        it('deve manter campo como completo após múltiplas detecções', async () => {
            const userMessage1 = 'A visão do projeto é criar um sistema de documentação';
            const userMessage2 = 'Além da visão, precisamos definir o escopo';
            
            // Mock das respostas com detecções sucessivas do mesmo campo
            const mockAnalysisResponse1: ClaudeResponse = {
                id: 'analysis-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [
                        {
                            phase: 'DVP',
                            field: 'vision',
                            value: 'Sistema de documentação',
                            confidence: 0.95
                        }
                    ],
                    suggestions: []
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            const mockFinalResponse1: ClaudeResponse = {
                id: 'response-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Entendi que a visão do projeto é criar um sistema de documentação.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            const mockAnalysisResponse2: ClaudeResponse = {
                id: 'analysis-124',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [
                        {
                            phase: 'DVP',
                            field: 'vision',
                            value: 'Sistema de documentação',
                            confidence: 0.85
                        }
                    ],
                    suggestions: []
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            const mockFinalResponse2: ClaudeResponse = {
                id: 'response-124',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Vamos falar sobre o escopo do projeto.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            mockedAxios.post
                .mockResolvedValueOnce({ data: mockAnalysisResponse1, status: 200 })
                .mockResolvedValueOnce({ data: mockFinalResponse1, status: 200 })
                .mockResolvedValueOnce({ data: mockAnalysisResponse2, status: 200 })
                .mockResolvedValueOnce({ data: mockFinalResponse2, status: 200 });

            await aiService.processMessage(projectId, userMessage1);
            await aiService.processMessage(projectId, userMessage2);
            
            const conversation = (aiService as any).conversations.get(projectId);

            expect(conversation.context.completedFields).toContain('vision');
            expect(conversation.context.completedFields.filter((f: string) => f === 'vision')).toHaveLength(1);
        });

        it('deve remover campo dos pendentes quando marcado como completo', async () => {
            const userMessage = 'A visão do projeto é criar um sistema de documentação';
            
            // Adicionar campo aos pendentes antes do teste
            const conversation = (aiService as any).conversations.get(projectId);
            conversation.context.pendingFields.push('vision');
            
            // Mock da análise de contexto
            const mockAnalysisResponse: ClaudeResponse = {
                id: 'analysis-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    detectedPhase: 'DVP',
                    detectedFields: [
                        {
                            phase: 'DVP',
                            field: 'vision',
                            value: 'Sistema de documentação',
                            confidence: 0.95
                        }
                    ],
                    suggestions: []
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            // Mock da resposta final
            const mockFinalResponse: ClaudeResponse = {
                id: 'response-123',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Entendi que a visão do projeto é criar um sistema de documentação.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: { input_tokens: 20, output_tokens: 30 }
            };

            mockedAxios.post
                .mockResolvedValueOnce({ data: mockAnalysisResponse, status: 200 })
                .mockResolvedValueOnce({ data: mockFinalResponse, status: 200 });

            await aiService.processMessage(projectId, userMessage);

            expect(conversation.context.completedFields).toContain('vision');
            expect(conversation.context.pendingFields).not.toContain('vision');
        });
    });
});
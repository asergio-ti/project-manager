import axios from 'axios';
import { ClaudeService } from '../claude.service';
import { ClaudeMessage, ClaudeResponse } from '../../types/claude.types';
import { AIServiceConfig } from '../../types';

// Mock do axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ClaudeService', () => {
    let service: ClaudeService;
    const mockConfig: AIServiceConfig = {
        model: 'claude-3-sonnet',
        temperature: 0.7,
        maxTokens: 2000,
        apiKey: 'test-api-key'
    };

    beforeEach(() => {
        service = new ClaudeService(mockConfig);
        jest.clearAllMocks();
    });

    describe('construtor', () => {
        it('deve lançar erro se API key não for fornecida', () => {
            expect(() => new ClaudeService({
                ...mockConfig,
                apiKey: ''
            })).toThrow('API Key do Claude não configurada');
        });

        it('deve criar instância com configuração válida', () => {
            expect(service).toBeInstanceOf(ClaudeService);
        });
    });

    describe('sendMessage', () => {
        const mockMessages: ClaudeMessage[] = [
            { role: 'user', content: 'Olá' }
        ];

        const mockResponse: ClaudeResponse = {
            id: 'msg_123',
            model: 'claude-3-sonnet',
            role: 'assistant',
            content: 'Olá! Como posso ajudar?',
            stop_reason: 'end_turn',
            stop_sequence: null,
            usage: {
                input_tokens: 10,
                output_tokens: 20
            }
        };

        it('deve enviar mensagem com sucesso', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            });

            const response = await service.sendMessage(mockMessages);

            expect(response).toEqual(mockResponse);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/messages'),
                expect.objectContaining({
                    model: mockConfig.model,
                    messages: mockMessages,
                    temperature: mockConfig.temperature,
                    max_tokens: mockConfig.maxTokens
                }),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'x-api-key': mockConfig.apiKey,
                        'anthropic-version': '2023-06-01'
                    })
                })
            );
        });

        it('deve incluir system prompt quando fornecido', async () => {
            const systemPrompt = 'Você é um assistente útil';
            mockedAxios.post.mockResolvedValueOnce({
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            });

            await service.sendMessage(mockMessages, systemPrompt);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    system: systemPrompt
                }),
                expect.any(Object)
            );
        });

        it('deve tratar erro da API corretamente', async () => {
            const errorMessage = 'Invalid API key';
            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    data: {
                        type: 'auth_error',
                        message: errorMessage
                    }
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow(`Erro na API do Claude: ${errorMessage}`);
        });

        it('deve tratar erro de rede corretamente', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro ao comunicar com a API do Claude');
        });
    });

    describe('analyzeContext', () => {
        const mockContent = 'Preciso documentar a fase DVP';
        const mockHistory: ClaudeMessage[] = [];

        it('deve analisar contexto com sucesso', async () => {
            const mockResponse: ClaudeResponse = {
                id: 'msg_456',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: JSON.stringify({
                    phase: 'DVP',
                    detectedFields: [],
                    suggestions: []
                }),
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: {
                    input_tokens: 15,
                    output_tokens: 25
                }
            };

            mockedAxios.post.mockResolvedValueOnce({
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            });

            const response = await service.analyzeContext(mockContent, mockHistory);

            expect(response).toEqual(mockResponse);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    messages: expect.arrayContaining([
                        expect.objectContaining({
                            content: mockContent
                        })
                    ]),
                    system: expect.stringContaining('análise de contexto')
                }),
                expect.any(Object)
            );
        });
    });

    describe('generateResponse', () => {
        const mockContent = 'Como começo a documentação?';
        const mockAnalysis = '{"phase": "DVP"}';
        const mockHistory: ClaudeMessage[] = [];

        it('deve gerar resposta com sucesso', async () => {
            const mockResponse: ClaudeResponse = {
                id: 'msg_789',
                model: 'claude-3-sonnet',
                role: 'assistant',
                content: 'Vamos começar pela visão geral do projeto.',
                stop_reason: 'end_turn',
                stop_sequence: null,
                usage: {
                    input_tokens: 20,
                    output_tokens: 30
                }
            };

            mockedAxios.post.mockResolvedValueOnce({
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            });

            const response = await service.generateResponse(mockContent, mockAnalysis, mockHistory);

            expect(response).toEqual(mockResponse);
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    messages: expect.arrayContaining([
                        expect.objectContaining({ content: mockContent }),
                        expect.objectContaining({ content: expect.stringContaining(mockAnalysis) })
                    ]),
                    system: expect.stringContaining('documentação de projetos')
                }),
                expect.any(Object)
            );
        });
    });
}); 
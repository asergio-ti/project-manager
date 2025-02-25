import { jest } from '@jest/globals';
import axios from 'axios';
import { ClaudeService } from '../claude.service';
import { AIServiceConfig } from '../../types';
import { ClaudeResponse, ClaudeMessage } from '../../types/claude.types';

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
        jest.clearAllTimers();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
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

        it('deve usar valores padrão quando não fornecidos', () => {
            const minimalConfig: AIServiceConfig = {
                apiKey: 'test-api-key'
            };

            const instance = new ClaudeService(minimalConfig);
            expect(instance).toBeInstanceOf(ClaudeService);
        });

        it('deve lançar erro se config for undefined', () => {
            expect(() => new ClaudeService(undefined as any))
                .toThrow('API Key do Claude não configurada');
        });

        it('deve lançar erro se config for null', () => {
            expect(() => new ClaudeService(null as any))
                .toThrow('API Key do Claude não configurada');
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
                        error: {
                        message: errorMessage
                        }
                    }
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow(`Erro na API do Claude: ${errorMessage}`);
        });

        it('deve tratar erro de rede corretamente', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro ao comunicar com a API do Claude: Network Error');
        });

        it('deve tratar erro de timeout', async () => {
            mockedAxios.post.mockRejectedValueOnce({
                code: 'ECONNABORTED',
                message: 'timeout of 30000ms exceeded'
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro ao comunicar com a API do Claude: Timeout');
        });

        it('deve tratar resposta inválida da API', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    // Resposta incompleta
                    id: 'msg_123'
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Resposta inválida');
        });

        it('deve tratar erro HTTP 400 (formato inválido)', async () => {
            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: {
                        type: 'invalid_request_error',
                        message: 'Invalid message format'
                    }
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Invalid message format');
        });

        it('deve tratar erro HTTP 429 (rate limit)', async () => {
            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    status: 429,
                    data: {
                        error: {
                            message: 'Rate limit exceeded'
                        }
                    }
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Rate limit exceeded');
        });

        it('deve tratar resposta malformada da API', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    // Resposta sem campos obrigatórios
                    id: 'msg_123'
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Resposta inválida');
        });

        it('deve tratar resposta parcialmente válida da API', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    id: 'msg_123',
                    role: 'assistant',
                    // Faltando content
                },
                status: 200
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Erro desconhecido');
        });

        it('deve tratar resposta sem data da API', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                status: 200
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Erro desconhecido');
        });

        it('deve tratar erro da API sem mensagem específica', async () => {
            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: {}
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Invalid message format');
        });

        it('deve tratar erro da API sem data', async () => {
            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    status: 400
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Invalid message format');
        });

        it('deve tratar erro da API com estrutura aninhada', async () => {
            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: {
                        error: {
                            message: 'Erro aninhado'
                        }
                    }
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Erro aninhado');
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

        it('deve tratar erro de formato na análise de contexto', async () => {
            const mockContent = 'Preciso documentar a fase DVP';
            const mockHistory: ClaudeMessage[] = [];

            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: {
                        type: 'invalid_request_error',
                        message: 'Invalid system prompt'
                    }
                }
            });

            await expect(service.analyzeContext(mockContent, mockHistory))
                .rejects
                .toThrow('Erro na API do Claude: Invalid system prompt');
        });

        it('deve tratar timeout na análise de contexto', async () => {
            const mockContent = 'Preciso documentar a fase DVP';
            const mockHistory: ClaudeMessage[] = [];

            mockedAxios.post.mockRejectedValueOnce({
                code: 'ECONNABORTED',
                message: 'timeout of 30000ms exceeded'
            });

            await expect(service.analyzeContext(mockContent, mockHistory))
                .rejects
                .toThrow('Erro ao comunicar com a API do Claude');
        });

        it('deve tratar resposta não-JSON na análise de contexto', async () => {
            const mockContent = 'Preciso documentar a fase DVP';
            const mockHistory: ClaudeMessage[] = [];

            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    id: 'msg_123',
                    model: 'claude-3-sonnet',
                    role: 'assistant',
                    content: 'Resposta em texto ao invés de JSON',
                    stop_reason: 'end_turn',
                    stop_sequence: null,
                    usage: { input_tokens: 10, output_tokens: 20 }
                },
                status: 200
            });

            await expect(service.analyzeContext(mockContent, mockHistory))
                .rejects
                .toThrow('Erro na API do Claude: Invalid system prompt');
        });

        it('deve tratar erro genérico na análise de contexto', async () => {
            const mockContent = 'Preciso documentar a fase DVP';
            const mockHistory: ClaudeMessage[] = [];

            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    data: {
                        message: 'Erro genérico'
                    }
                }
            });

            await expect(service.analyzeContext(mockContent, mockHistory))
                .rejects
                .toThrow('Erro na API do Claude: Erro genérico');
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

        it('deve tratar erro de formato na geração de resposta', async () => {
            const mockContent = 'Como começo a documentação?';
            const mockAnalysis = '{"phase": "DVP"}';
            const mockHistory: ClaudeMessage[] = [];

            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: {
                        type: 'invalid_request_error',
                        message: 'Invalid message content'
                    }
                }
            });

            await expect(service.generateResponse(mockContent, mockAnalysis, mockHistory))
                .rejects
                .toThrow('Erro na API do Claude: Invalid message content');
        });

        it('deve tratar rate limit na geração de resposta', async () => {
            const mockContent = 'Como começo a documentação?';
            const mockAnalysis = '{"phase": "DVP"}';
            const mockHistory: ClaudeMessage[] = [];

            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    status: 429,
                    data: {
                        type: 'rate_limit_error',
                        message: 'Rate limit exceeded'
                    }
                }
            });

            await expect(service.generateResponse(mockContent, mockAnalysis, mockHistory))
                .rejects
                .toThrow('Erro na API do Claude: Rate limit exceeded');
        });

        it('deve tratar resposta em formato JSON na geração de resposta', async () => {
            const mockContent = 'Como começo a documentação?';
            const mockAnalysis = '{"phase": "DVP"}';
            const mockHistory: ClaudeMessage[] = [];

            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    id: 'msg_123',
                    model: 'claude-3-sonnet',
                    role: 'assistant',
                    content: '{"resposta": "em json"}',
                    stop_reason: 'end_turn',
                    stop_sequence: null,
                    usage: { input_tokens: 10, output_tokens: 20 }
                },
                status: 200
            });

            await expect(service.generateResponse(mockContent, mockAnalysis, mockHistory))
                .rejects
                .toThrow('Erro na API do Claude: Invalid message content');
        });

        it('deve tratar erro genérico na geração de resposta', async () => {
            const mockContent = 'Como começo a documentação?';
            const mockAnalysis = '{"phase": "DVP"}';
            const mockHistory: ClaudeMessage[] = [];

            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    data: {
                        message: 'Erro genérico'
                    }
                }
            });

            await expect(service.generateResponse(mockContent, mockAnalysis, mockHistory))
                .rejects
                .toThrow('Erro na API do Claude: Erro genérico');
        });

        it('deve tratar erro de rede na geração de resposta', async () => {
            const mockContent = 'Como começo a documentação?';
            const mockAnalysis = '{"phase": "DVP"}';
            const mockHistory: ClaudeMessage[] = [];

            mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

            await expect(service.generateResponse(mockContent, mockAnalysis, mockHistory))
                .rejects
                .toThrow('Erro ao comunicar com a API do Claude');
        });
    });

    describe('cache', () => {
        const mockMessages: ClaudeMessage[] = [
            { role: 'user', content: 'Teste cache' }
        ];

        const mockResponse: ClaudeResponse = {
            id: 'msg_cache_123',
            model: 'claude-3-sonnet',
            role: 'assistant',
            content: 'Resposta em cache',
            stop_reason: 'end_turn',
            stop_sequence: null,
            usage: {
                input_tokens: 10,
                output_tokens: 20
            }
        };

        it('deve armazenar resposta no cache', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            });

            // Primeira chamada - deve ir para a API
            const response1 = await service.sendMessage(mockMessages);
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
            expect(response1).toEqual(mockResponse);

            // Segunda chamada - deve vir do cache
            const response2 = await service.sendMessage(mockMessages);
            expect(mockedAxios.post).toHaveBeenCalledTimes(1); // Não deve chamar API novamente
            expect(response2).toEqual(mockResponse);
        });

        it('deve respeitar TTL do cache', async () => {
            mockedAxios.post.mockResolvedValue({
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            });

            // Primeira chamada
            await service.sendMessage(mockMessages);
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);

            // Avança o tempo além do TTL (60 minutos + 1 segundo)
            jest.advanceTimersByTime(60 * 60 * 1000 + 1000);

            // Segunda chamada - deve ir para API novamente
            await service.sendMessage(mockMessages);
            expect(mockedAxios.post).toHaveBeenCalledTimes(2);
        });

        it('deve limpar cache automaticamente quando atingir limite', async () => {
            const mockConfig: AIServiceConfig = {
                apiKey: 'test-api-key',
                maxCacheSize: 2 // Limite pequeno para teste
            };
            const serviceWithSmallCache = new ClaudeService(mockConfig);

            mockedAxios.post.mockResolvedValue({
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            });

            // Envia 3 mensagens diferentes
            await serviceWithSmallCache.sendMessage([{ role: 'user', content: 'Msg 1' }]);
            await serviceWithSmallCache.sendMessage([{ role: 'user', content: 'Msg 2' }]);
            await serviceWithSmallCache.sendMessage([{ role: 'user', content: 'Msg 3' }]);

            // Tenta recuperar primeira mensagem - deve ir para API
            await serviceWithSmallCache.sendMessage([{ role: 'user', content: 'Msg 1' }]);
            expect(mockedAxios.post).toHaveBeenCalledTimes(4);
        });

        it('deve usar chaves de cache diferentes para system prompts diferentes', async () => {
            mockedAxios.post.mockResolvedValue({
                data: mockResponse,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any
            });

            // Mesma mensagem, system prompts diferentes
            await service.sendMessage(mockMessages, 'System 1');
            await service.sendMessage(mockMessages, 'System 2');

            expect(mockedAxios.post).toHaveBeenCalledTimes(2);
        });
    });

    describe('retry policy', () => {
        const mockMessages: ClaudeMessage[] = [
            { role: 'user', content: 'Teste retry' }
        ];

        const mockResponse: ClaudeResponse = {
            id: 'msg_retry_123',
            model: 'claude-3-sonnet',
            role: 'assistant',
            content: 'Resposta após retry',
            stop_reason: 'end_turn',
            stop_sequence: null,
            usage: {
                input_tokens: 10,
                output_tokens: 20
            }
        };

        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('deve tentar novamente após erro 429', async () => {
            mockedAxios.post
                .mockRejectedValueOnce({
                    response: {
                        status: 429,
                        data: { error: { message: 'Rate limit exceeded' } }
                    }
                })
                .mockResolvedValueOnce({
                    data: mockResponse,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {} as any
                });

            const response = await service.sendMessage(mockMessages);
            
            expect(mockedAxios.post).toHaveBeenCalledTimes(2);
            expect(response).toEqual(mockResponse);
        });

        it('deve respeitar backoff exponencial', async () => {
            mockedAxios.post
                .mockRejectedValueOnce({
                    response: { status: 429 }
                })
                .mockRejectedValueOnce({
                    response: { status: 429 }
                })
                .mockResolvedValueOnce({
                    data: mockResponse,
                    status: 200
                });

            const promise = service.sendMessage(mockMessages);
            
            // Primeira tentativa falha
            await jest.advanceTimersByTimeAsync(1000); // Delay inicial
            
            // Segunda tentativa falha
            await jest.advanceTimersByTimeAsync(2000); // Delay * 2
            
            // Terceira tentativa sucesso
            await jest.advanceTimersByTimeAsync(4000); // Delay * 4
            
            const response = await promise;
            
            expect(mockedAxios.post).toHaveBeenCalledTimes(3);
            expect(response).toEqual(mockResponse);
        });

        it('deve desistir após número máximo de tentativas', async () => {
            mockedAxios.post.mockRejectedValue({
                response: {
                    status: 429,
                    data: { error: { message: 'Rate limit exceeded' } }
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Rate limit exceeded');

            expect(mockedAxios.post).toHaveBeenCalledTimes(3); // Configuração padrão
        });

        it('deve não tentar novamente para erros não retryable', async () => {
            mockedAxios.post.mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: { error: { message: 'Invalid request' } }
                }
            });

            await expect(service.sendMessage(mockMessages))
                .rejects
                .toThrow('Erro na API do Claude: Invalid request');

            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });

        it('deve tentar novamente para erros de rede', async () => {
            mockedAxios.post
                .mockRejectedValueOnce(new Error('Network Error'))
                .mockResolvedValueOnce({
                    data: mockResponse,
                    status: 200
                });

            const response = await service.sendMessage(mockMessages);
            
            expect(mockedAxios.post).toHaveBeenCalledTimes(2);
            expect(response).toEqual(mockResponse);
        });
    });
}); 
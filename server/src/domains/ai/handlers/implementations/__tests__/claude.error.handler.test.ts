import {
    NetworkErrorHandler,
    RateLimitHandler,
    ValidationHandler,
    ResponseHandler,
    FallbackHandler,
    ClaudeErrorHandler
} from '../claude.error.handler';

import {
    ClaudeNetworkError,
    ClaudeTimeoutError,
    ClaudeRateLimitError,
    ClaudeValidationError,
    ClaudeResponseError
} from '../../../types/errors';

describe('Claude Error Handlers', () => {
    describe('NetworkErrorHandler', () => {
        const handler = new NetworkErrorHandler();

        it('deve identificar erros sem resposta', () => {
            expect(handler.canHandle(new Error())).toBe(true);
            expect(handler.canHandle({ response: {} })).toBe(false);
        });

        it('deve criar erro de timeout', () => {
            const error = {
                code: 'ECONNABORTED',
                message: 'timeout of 30000ms exceeded'
            };

            const result = handler.handle(error);
            expect(result).toBeInstanceOf(ClaudeTimeoutError);
            expect(result.message).toBe('Erro ao comunicar com a API do Claude: Timeout');
        });

        it('deve criar erro de rede', () => {
            const error = new Error('Network Error');
            const result = handler.handle(error);
            expect(result).toBeInstanceOf(ClaudeNetworkError);
            expect(result.message).toBe('Erro ao comunicar com a API do Claude: Network Error');
        });
    });

    describe('RateLimitHandler', () => {
        const handler = new RateLimitHandler();

        it('deve identificar erro de rate limit', () => {
            expect(handler.canHandle({ response: { status: 429 } })).toBe(true);
            expect(handler.canHandle({ response: { status: 400 } })).toBe(false);
        });

        it('deve criar erro com metadata', () => {
            const error = {
                response: {
                    status: 429,
                    data: { error: { message: 'Rate limit exceeded' } }
                }
            };

            const result = handler.handle(error);
            expect(result).toBeInstanceOf(ClaudeRateLimitError);
            expect(result.message).toBe('Erro na API do Claude: Rate limit exceeded');
            expect(result.metadata).toEqual(expect.objectContaining({
                code: 'RATE_LIMIT',
                status: 429
            }));
        });
    });

    describe('ValidationHandler', () => {
        const handler = new ValidationHandler();

        it('deve identificar erro de validação', () => {
            expect(handler.canHandle({ response: { status: 400 } })).toBe(true);
            expect(handler.canHandle({ response: { status: 500 } })).toBe(false);
        });

        it('deve identificar erro de system prompt', () => {
            const error = {
                response: {
                    status: 400,
                    data: { error: { message: 'Invalid system prompt' } }
                }
            };

            const result = handler.handle(error);
            expect(result).toBeInstanceOf(ClaudeValidationError);
            expect(result.message).toBe('Erro na API do Claude: Invalid system prompt');
            expect(result.metadata).toEqual(expect.objectContaining({
                code: 'VALIDATION_ERROR',
                status: 400
            }));
        });

        it('deve identificar erro de message content', () => {
            const error = {
                response: {
                    status: 400,
                    data: { error: { message: 'Invalid message content' } }
                }
            };

            const result = handler.handle(error);
            expect(result).toBeInstanceOf(ClaudeValidationError);
            expect(result.message).toBe('Erro na API do Claude: Invalid message content');
        });
    });

    describe('ResponseHandler', () => {
        const handler = new ResponseHandler();

        it('deve identificar erro com resposta', () => {
            expect(handler.canHandle({ response: {} })).toBe(true);
            expect(handler.canHandle({})).toBe(false);
        });

        it('deve criar erro com mensagem específica', () => {
            const error = {
                response: {
                    status: 500,
                    data: { error: { message: 'Erro específico' } }
                }
            };

            const result = handler.handle(error);
            expect(result).toBeInstanceOf(ClaudeResponseError);
            expect(result.message).toBe('Erro na API do Claude: Erro específico');
            expect(result.metadata).toEqual(expect.objectContaining({
                code: 'RESPONSE_ERROR',
                status: 500
            }));
        });

        it('deve criar erro genérico para resposta vazia', () => {
            const error = { response: { data: {} } };
            const result = handler.handle(error);
            expect(result).toBeInstanceOf(ClaudeResponseError);
            expect(result.message).toBe('Erro na API do Claude: Erro desconhecido');
        });
    });

    describe('FallbackHandler', () => {
        const handler = new FallbackHandler();

        it('deve aceitar qualquer erro', () => {
            expect(handler.canHandle(new Error())).toBe(true);
            expect(handler.canHandle(null)).toBe(true);
            expect(handler.canHandle(undefined)).toBe(true);
        });

        it('deve criar erro genérico', () => {
            const result = handler.handle('erro qualquer');
            expect(result).toBeInstanceOf(ClaudeResponseError);
            expect(result.message).toBe('Erro na API do Claude: Erro desconhecido');
            expect(result.metadata).toEqual(expect.objectContaining({
                code: 'UNKNOWN_ERROR',
                status: 500
            }));
        });
    });

    describe('ClaudeErrorHandler', () => {
        const handler = new ClaudeErrorHandler();

        it('deve usar handler apropriado para cada tipo de erro', () => {
            // Network error
            const networkError = new Error('Network Error');
            expect(handler.handle(networkError)).toBeInstanceOf(ClaudeNetworkError);

            // Rate limit error
            const rateLimitError = {
                response: { status: 429 }
            };
            expect(handler.handle(rateLimitError)).toBeInstanceOf(ClaudeRateLimitError);

            // Validation error
            const validationError = {
                response: { status: 400 }
            };
            expect(handler.handle(validationError)).toBeInstanceOf(ClaudeValidationError);

            // Response error
            const responseError = {
                response: { status: 500 }
            };
            expect(handler.handle(responseError)).toBeInstanceOf(ClaudeResponseError);
        });

        it('deve usar fallback para erros desconhecidos', () => {
            const result = handler.handle('erro desconhecido');
            expect(result).toBeInstanceOf(ClaudeResponseError);
            expect(result.message).toBe('Erro na API do Claude: Erro desconhecido');
        });
    });
}); 
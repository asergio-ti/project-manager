import { errorPipeline } from '../error.pipeline';
import {
    ClaudeNetworkError,
    ClaudeTimeoutError,
    ClaudeRateLimitError,
    ClaudeValidationError,
    ClaudeResponseError
} from '../../types/errors';

describe('Error Pipeline', () => {
    describe('handleNetworkError', () => {
        it('deve identificar erro de timeout', () => {
            const error = {
                code: 'ECONNABORTED',
                message: 'timeout of 30000ms exceeded'
            };

            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeTimeoutError);
            expect(result.message).toBe('Erro ao comunicar com a API do Claude: Timeout');
        });

        it('deve identificar erro de rede', () => {
            const error = new Error('Network Error');
            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeNetworkError);
            expect(result.message).toBe('Erro ao comunicar com a API do Claude: Network Error');
        });

        it('deve identificar erro genérico de rede', () => {
            const error = { message: 'Outro erro de rede' };
            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeNetworkError);
            expect(result.message).toBe('Erro ao comunicar com a API do Claude');
        });
    });

    describe('handleRateLimit', () => {
        it('deve identificar erro de rate limit', () => {
            const error = {
                response: {
                    status: 429,
                    data: { error: { message: 'Rate limit exceeded' } }
                }
            };

            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeRateLimitError);
            expect(result.message).toBe('Erro na API do Claude: Rate limit exceeded');
        });
    });

    describe('handleValidation', () => {
        it('deve identificar erro de system prompt inválido', () => {
            const error = {
                response: {
                    status: 400,
                    data: {
                        error: { message: 'Invalid system prompt' }
                    }
                }
            };

            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeValidationError);
            expect(result.message).toBe('Erro na API do Claude: Invalid system prompt');
        });

        it('deve identificar erro de conteúdo inválido', () => {
            const error = {
                response: {
                    status: 400,
                    data: {
                        error: { message: 'Invalid message content' }
                    }
                }
            };

            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeValidationError);
            expect(result.message).toBe('Erro na API do Claude: Invalid message content');
        });

        it('deve identificar erro genérico de formato', () => {
            const error = {
                response: {
                    status: 400
                }
            };

            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeValidationError);
            expect(result.message).toBe('Erro na API do Claude: Invalid message format');
        });
    });

    describe('handleResponse', () => {
        it('deve identificar erro de resposta sem dados', () => {
            const error = {
                response: {}
            };

            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeResponseError);
            expect(result.message).toBe('Erro na API do Claude: Erro desconhecido');
        });

        it('deve identificar erro com mensagem específica', () => {
            const error = {
                response: {
                    data: {
                        error: { message: 'Erro específico' }
                    }
                }
            };

            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeResponseError);
            expect(result.message).toBe('Erro na API do Claude: Erro específico');
        });

        it('deve identificar resposta vazia', () => {
            const error = {
                response: {
                    data: {}
                }
            };

            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeResponseError);
            expect(result.message).toBe('Erro na API do Claude: Erro desconhecido');
        });
    });

    describe('fallback', () => {
        it('deve retornar erro genérico para casos não tratados', () => {
            const error = 'erro não estruturado';
            const result = errorPipeline(error);
            expect(result).toBeInstanceOf(ClaudeResponseError);
            expect(result.message).toBe('Erro na API do Claude: Erro desconhecido');
        });
    });
}); 
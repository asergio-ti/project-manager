import { 
    ClaudeNetworkError,
    ClaudeTimeoutError,
    ClaudeRateLimitError,
    ClaudeValidationError,
    ClaudeResponseError 
} from '../types/errors';

export interface ErrorHandler {
    (error: any): Error | null;
}

const handleNetworkError: ErrorHandler = (error: any) => {
    if (!error.response) {
        if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
            return new ClaudeTimeoutError('Erro ao comunicar com a API do Claude: Timeout');
        }
        if (error.message === 'Network Error') {
            return new ClaudeNetworkError('Erro ao comunicar com a API do Claude: Network Error');
        }
        return new ClaudeNetworkError('Erro ao comunicar com a API do Claude');
    }
    return null;
};

const handleRateLimit: ErrorHandler = (error: any) => {
    if (error?.response?.status === 429) {
        return new ClaudeRateLimitError('Erro na API do Claude: Rate limit exceeded');
    }
    return null;
};

const handleValidation: ErrorHandler = (error: any) => {
    if (error?.response?.status === 400) {
        const message = error?.response?.data?.error?.message;
        if (message?.includes('system prompt')) {
            return new ClaudeValidationError('Erro na API do Claude: Invalid system prompt');
        }
        if (message?.includes('message content')) {
            return new ClaudeValidationError('Erro na API do Claude: Invalid message content');
        }
        return new ClaudeValidationError('Erro na API do Claude: Invalid message format');
    }
    return null;
};

const handleResponse: ErrorHandler = (error: any) => {
    if (!error?.response?.data) {
        return new ClaudeResponseError('Erro na API do Claude: Erro desconhecido');
    }

    if (error.response.data.error?.message) {
        return new ClaudeResponseError(`Erro na API do Claude: ${error.response.data.error.message}`);
    }

    if (error.response.data && Object.keys(error.response.data).length === 0) {
        return new ClaudeResponseError('Erro na API do Claude: Erro desconhecido');
    }

    return new ClaudeResponseError('Erro na API do Claude: Erro genérico');
};

export const errorPipeline = (error: any): Error => {
    // Pipeline de tratamento de erros
    const handlers: ErrorHandler[] = [
        handleNetworkError,
        handleRateLimit,
        handleValidation,
        handleResponse
    ];

    // Executa cada handler até encontrar um que retorne um erro
    for (const handler of handlers) {
        const result = handler(error);
        if (result) return result;
    }

    // Fallback para erro genérico
    return new ClaudeResponseError('Erro na API do Claude: Erro desconhecido');
}; 
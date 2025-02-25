import { ErrorHandler, ErrorMetadata } from '../../../../core/interfaces/handler.interface';
import {
    ClaudeNetworkError,
    ClaudeTimeoutError,
    ClaudeRateLimitError,
    ClaudeValidationError,
    ClaudeResponseError
} from '../../types/errors';

export class NetworkErrorHandler implements ErrorHandler {
    canHandle(error: unknown): boolean {
        return !this.hasResponse(error);
    }

    handle(error: unknown): ClaudeNetworkError | ClaudeTimeoutError {
        if (this.isTimeout(error)) {
            return new ClaudeTimeoutError('Erro ao comunicar com a API do Claude: Timeout');
        }
        if (this.isNetworkError(error)) {
            return new ClaudeNetworkError('Erro ao comunicar com a API do Claude: Network Error');
        }
        return new ClaudeNetworkError('Erro ao comunicar com a API do Claude');
    }

    private hasResponse(error: any): boolean {
        return !!error?.response;
    }

    private isTimeout(error: any): boolean {
        return error?.code === 'ECONNABORTED' || 
               error?.message?.toLowerCase().includes('timeout');
    }

    private isNetworkError(error: any): boolean {
        return error?.message === 'Network Error';
    }
}

export class RateLimitHandler implements ErrorHandler {
    canHandle(error: unknown): boolean {
        return this.isRateLimit(error);
    }

    handle(error: unknown): ClaudeRateLimitError {
        const metadata: ErrorMetadata = {
            code: 'RATE_LIMIT',
            status: 429,
            timestamp: new Date()
        };

        return new ClaudeRateLimitError('Erro na API do Claude: Rate limit exceeded', metadata);
    }

    private isRateLimit(error: any): boolean {
        return error?.response?.status === 429;
    }
}

export class ValidationHandler implements ErrorHandler {
    canHandle(error: unknown): boolean {
        return this.isValidationError(error);
    }

    handle(error: unknown): ClaudeValidationError {
        const message = this.getValidationMessage(error);
        const metadata: ErrorMetadata = {
            code: 'VALIDATION_ERROR',
            status: 400,
            timestamp: new Date()
        };

        return new ClaudeValidationError(message, metadata);
    }

    private isValidationError(error: any): boolean {
        return error?.response?.status === 400;
    }

    private getValidationMessage(error: any): string {
        const message = error?.response?.data?.error?.message;
        if (message?.includes('system prompt')) {
            return 'Erro na API do Claude: Invalid system prompt';
        }
        if (message?.includes('message content')) {
            return 'Erro na API do Claude: Invalid message content';
        }
        return 'Erro na API do Claude: Invalid message format';
    }
}

export class ResponseHandler implements ErrorHandler {
    canHandle(error: unknown): boolean {
        return this.hasResponse(error);
    }

    handle(error: unknown): ClaudeResponseError {
        const message = this.getErrorMessage(error);
        const metadata: ErrorMetadata = {
            code: 'RESPONSE_ERROR',
            status: this.getErrorStatus(error),
            timestamp: new Date()
        };

        return new ClaudeResponseError(message, metadata);
    }

    private hasResponse(error: any): boolean {
        return error && typeof error === 'object' && 'response' in error;
    }

    private getErrorStatus(error: any): number {
        return error?.response?.status || 500;
    }

    private getErrorMessage(error: any): string {
        if (!error?.response?.data) {
            return 'Erro na API do Claude: Erro desconhecido';
        }

        if (error.response.data.error?.message) {
            return `Erro na API do Claude: ${error.response.data.error.message}`;
        }

        if (Object.keys(error.response.data).length === 0) {
            return 'Erro na API do Claude: Erro desconhecido';
        }

        return 'Erro na API do Claude: Erro genérico';
    }
}

export class FallbackHandler implements ErrorHandler {
    canHandle(error: unknown): boolean {
        return true; // Sempre aceita qualquer erro como fallback
    }

    handle(error: unknown): ClaudeResponseError {
        const metadata: ErrorMetadata = {
            code: 'UNKNOWN_ERROR',
            status: 500,
            timestamp: new Date()
        };

        return new ClaudeResponseError('Erro na API do Claude: Erro desconhecido', metadata);
    }
}

export class ClaudeErrorHandler implements ErrorHandler {
    private handlers: ErrorHandler[];

    constructor() {
        this.handlers = [
            new NetworkErrorHandler(),
            new RateLimitHandler(),
            new ValidationHandler(),
            new ResponseHandler(),
            new FallbackHandler()
        ];
    }

    canHandle(error: unknown): boolean {
        return true; // Pode lidar com qualquer erro
    }

    handle(error: unknown): ClaudeNetworkError | ClaudeTimeoutError | ClaudeRateLimitError | ClaudeValidationError | ClaudeResponseError {
        for (const handler of this.handlers) {
            if (handler.canHandle(error)) {
                return handler.handle(error);
            }
        }
        
        // Nunca deve chegar aqui devido ao FallbackHandler
        return new ClaudeResponseError('Erro na API do Claude: Erro desconhecido');
    }
} 
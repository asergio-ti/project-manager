import { ErrorMetadata } from '../../../core/interfaces/handler.interface';

export class ClaudeNetworkError extends Error {
    metadata?: ErrorMetadata;

    constructor(message: string, metadata?: ErrorMetadata) {
        super(message);
        this.name = 'ClaudeNetworkError';
        this.metadata = metadata;
    }
}

export class ClaudeTimeoutError extends Error {
    metadata?: ErrorMetadata;

    constructor(message: string, metadata?: ErrorMetadata) {
        super(message);
        this.name = 'ClaudeTimeoutError';
        this.metadata = metadata;
    }
}

export class ClaudeRateLimitError extends Error {
    metadata?: ErrorMetadata;

    constructor(message: string, metadata?: ErrorMetadata) {
        super(message);
        this.name = 'ClaudeRateLimitError';
        this.metadata = metadata;
    }
}

export class ClaudeValidationError extends Error {
    metadata?: ErrorMetadata;

    constructor(message: string, metadata?: ErrorMetadata) {
        super(message);
        this.name = 'ClaudeValidationError';
        this.metadata = metadata;
    }
}

export class ClaudeResponseError extends Error {
    metadata?: ErrorMetadata;

    constructor(message: string, metadata?: ErrorMetadata) {
        super(message);
        this.name = 'ClaudeResponseError';
        this.metadata = metadata;
    }
} 
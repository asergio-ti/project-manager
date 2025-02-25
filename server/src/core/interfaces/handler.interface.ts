export interface ErrorMetadata {
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
    timestamp?: Date;
}

export interface BaseError extends Error {
    name: string;
    message: string;
    metadata?: ErrorMetadata;
}

export interface ErrorHandler<T extends BaseError = BaseError> {
    handle(error: unknown): T;
    canHandle(error: unknown): boolean;
}

export interface ErrorPipeline {
    addHandler(handler: ErrorHandler): this;
    process(error: unknown): BaseError;
}

export interface ErrorFactory {
    create(message: string, metadata?: ErrorMetadata): BaseError;
} 
export interface ValidationResult {
    isValid: boolean;
    error?: string;
    metadata?: Record<string, unknown>;
}

export interface Validator<T> {
    validate(data: unknown): ValidationResult;
    isValid(data: unknown): boolean;
    getErrors(): string[];
}

export interface ValidatorChain {
    add(validator: Validator<unknown>): this;
    validate(data: unknown): ValidationResult;
}

export interface ValidatorFactory {
    createValidator<T>(type: string): Validator<T>;
    registerValidator<T>(type: string, validator: Validator<T>): void;
} 
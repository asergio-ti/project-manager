import { BaseDocument, ValidationResult } from './core';

export interface SchemaValidator {
    validate(document: Partial<BaseDocument>): ValidationResult;
    validateStructure(document: Partial<BaseDocument>): ValidationResult;
    validateTypes(document: Partial<BaseDocument>): ValidationResult;
}

export interface ValidationOptions {
    strict?: boolean;
    ignoreFields?: string[];
    customValidators?: CustomValidator[];
}

export interface CustomValidator {
    name: string;
    validate(value: any): boolean;
    errorMessage: string;
}

export interface ValidationContext {
    schema: string;
    version: string;
    environment: 'development' | 'production';
    options: ValidationOptions;
}

export interface ValidationService {
    validateDocument(document: BaseDocument, context: ValidationContext): Promise<ValidationResult>;
    validateBatch(documents: BaseDocument[], context: ValidationContext): Promise<ValidationResult[]>;
} 
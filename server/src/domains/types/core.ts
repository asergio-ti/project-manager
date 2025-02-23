export interface BaseDocument {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
} 
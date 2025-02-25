export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export interface ResponseValidator {
    validate(response: any): ValidationResult;
    isEmpty(response: any): boolean;
    isPartial(response: any): boolean;
    hasRequiredFields(response: any): boolean;
    hasValidRole(response: any): boolean;
} 
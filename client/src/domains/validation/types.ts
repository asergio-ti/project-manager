export interface ValidationResult {
    isValid: boolean;
    feedback: string;
    errors?: string[];
    warnings?: string[];
    suggestions?: string[];
}

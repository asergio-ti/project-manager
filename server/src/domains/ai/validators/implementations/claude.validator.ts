import { ResponseValidator, ValidationResult } from '../interfaces/validator.interface';
import { ClaudeResponse } from '../../types/claude.types';

export class ClaudeResponseValidator implements ResponseValidator {
    isEmpty(response: any): boolean {
        return !response?.data || Object.keys(response?.data || {}).length === 0;
    }

    isPartial(response: any): boolean {
        const { data } = response || {};
        return data && Object.keys(data).length > 0 && (!data.content || !data.role);
    }

    hasRequiredFields(response: any): boolean {
        const requiredFields = ['content', 'role'];
        return requiredFields.every(field => response?.data?.[field]);
    }

    hasValidRole(response: any): boolean {
        return response?.data?.role === 'assistant';
    }

    validate(response: any): ValidationResult {
        if (this.isEmpty(response)) {
            return {
                isValid: false,
                error: 'Erro na API do Claude: Resposta inválida'
            };
        }

        if (this.isPartial(response)) {
            return {
                isValid: false,
                error: 'Erro na API do Claude: Erro desconhecido'
            };
        }

        if (!this.hasRequiredFields(response)) {
            return {
                isValid: false,
                error: 'Erro na API do Claude: Resposta inválida'
            };
        }

        if (!this.hasValidRole(response)) {
            return {
                isValid: false,
                error: 'Erro na API do Claude: Resposta inválida'
            };
        }

        return { isValid: true };
    }

    extractResponse(response: any): ClaudeResponse {
        const { content, id, model, role, stop_reason, stop_sequence, usage } = response.data;
        return { content, id, model, role, stop_reason, stop_sequence, usage };
    }
} 
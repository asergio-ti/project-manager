import { ClaudeResponse } from '../types/claude.types';

export interface ResponseValidationResult {
    isValid: boolean;
    error?: string;
}

export const responseValidator = {
    isEmpty: (response: any): boolean => 
        !response?.data || Object.keys(response?.data || {}).length === 0,

    isPartial: (response: any): boolean => {
        const { data } = response || {};
        return data && Object.keys(data).length > 0 && (!data.content || !data.role);
    },

    hasRequiredFields: (response: any): boolean => {
        const requiredFields = ['content', 'role'];
        return requiredFields.every(field => response?.data?.[field]);
    },

    hasValidRole: (response: any): boolean =>
        response?.data?.role === 'assistant',

    validate: (response: any): ResponseValidationResult => {
        if (responseValidator.isEmpty(response)) {
            return {
                isValid: false,
                error: 'Erro na API do Claude: Resposta inválida'
            };
        }

        if (responseValidator.isPartial(response)) {
            return {
                isValid: false,
                error: 'Erro na API do Claude: Erro desconhecido'
            };
        }

        if (!responseValidator.hasRequiredFields(response)) {
            return {
                isValid: false,
                error: 'Erro na API do Claude: Resposta inválida'
            };
        }

        if (!responseValidator.hasValidRole(response)) {
            return {
                isValid: false,
                error: 'Erro na API do Claude: Resposta inválida'
            };
        }

        return { isValid: true };
    },

    extractResponse: (response: any): ClaudeResponse => {
        const { content, id, model, role, stop_reason, stop_sequence, usage } = response.data;
        return { content, id, model, role, stop_reason, stop_sequence, usage };
    }
}; 
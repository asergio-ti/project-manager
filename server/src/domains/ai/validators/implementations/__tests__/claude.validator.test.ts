import { ClaudeResponseValidator } from '../claude.validator';

describe('ClaudeResponseValidator', () => {
    let validator: ClaudeResponseValidator;

    beforeEach(() => {
        validator = new ClaudeResponseValidator();
    });

    describe('isEmpty', () => {
        test.each([
            [null, true],
            [undefined, true],
            [{}, true],
            [{ data: {} }, true],
            [{ data: { content: 'test' } }, false],
            [{ data: { role: 'assistant' } }, false]
        ])('deve retornar %s para input %o', (input, expected) => {
            expect(validator.isEmpty(input)).toBe(expected);
        });
    });

    describe('isPartial', () => {
        test.each([
            [{ data: { content: 'test' } }, true],
            [{ data: { role: 'assistant' } }, true],
            [{ data: { content: 'test', role: 'assistant' } }, false],
            [{ data: {} }, false],
            [null, false],
            [undefined, false]
        ])('deve retornar %s para input %o', (input, expected) => {
            expect(validator.isPartial(input)).toBe(expected);
        });
    });

    describe('hasRequiredFields', () => {
        test.each([
            [{ data: { content: 'test', role: 'assistant' } }, true],
            [{ data: { content: 'test' } }, false],
            [{ data: { role: 'assistant' } }, false],
            [{ data: {} }, false],
            [null, false],
            [undefined, false]
        ])('deve retornar %s para input %o', (input, expected) => {
            expect(validator.hasRequiredFields(input)).toBe(expected);
        });
    });

    describe('hasValidRole', () => {
        test.each([
            [{ data: { role: 'assistant' } }, true],
            [{ data: { role: 'user' } }, false],
            [{ data: {} }, false],
            [null, false],
            [undefined, false]
        ])('deve retornar %s para input %o', (input, expected) => {
            expect(validator.hasValidRole(input)).toBe(expected);
        });
    });

    describe('validate', () => {
        it('deve retornar erro para resposta vazia', () => {
            const result = validator.validate({});
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Erro na API do Claude: Resposta inválida');
        });

        it('deve retornar erro para resposta parcial', () => {
            const result = validator.validate({
                data: { content: 'test' }
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Erro na API do Claude: Erro desconhecido');
        });

        it('deve retornar erro para resposta sem campos obrigatórios', () => {
            const result = validator.validate({
                data: { other: 'field' }
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Erro na API do Claude: Resposta inválida');
        });

        it('deve retornar erro para role inválido', () => {
            const result = validator.validate({
                data: { content: 'test', role: 'user' }
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Erro na API do Claude: Resposta inválida');
        });

        it('deve retornar sucesso para resposta válida', () => {
            const result = validator.validate({
                data: {
                    content: 'test',
                    role: 'assistant',
                    id: '123',
                    model: 'claude-3'
                }
            });
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    describe('extractResponse', () => {
        it('deve extrair campos corretamente', () => {
            const mockResponse = {
                data: {
                    content: 'test',
                    id: '123',
                    model: 'claude-3',
                    role: 'assistant',
                    stop_reason: 'end',
                    stop_sequence: null,
                    usage: { tokens: 10 }
                }
            };

            const result = validator.extractResponse(mockResponse);
            expect(result).toEqual(mockResponse.data);
        });
    });
}); 
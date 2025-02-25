import { responseValidator } from '../response.validator';

describe('Response Validator', () => {
    describe('isEmpty', () => {
        test.each([
            [null, true],
            [undefined, true],
            [{}, true],
            [{ data: {} }, true],
            [{ data: { content: 'test' } }, false],
            [{ data: { role: 'assistant' } }, false]
        ])('deve retornar %s para input %o', (input, expected) => {
            expect(responseValidator.isEmpty(input)).toBe(expected);
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
            expect(responseValidator.isPartial(input)).toBe(expected);
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
            expect(responseValidator.hasRequiredFields(input)).toBe(expected);
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
            expect(responseValidator.hasValidRole(input)).toBe(expected);
        });
    });

    describe('validate', () => {
        it('deve retornar erro para resposta vazia', () => {
            const result = responseValidator.validate({});
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Erro na API do Claude: Resposta inválida');
        });

        it('deve retornar erro para resposta parcial', () => {
            const result = responseValidator.validate({
                data: { content: 'test' }
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Erro na API do Claude: Erro desconhecido');
        });

        it('deve retornar erro para resposta sem campos obrigatórios', () => {
            const result = responseValidator.validate({
                data: { other: 'field' }
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Erro na API do Claude: Resposta inválida');
        });

        it('deve retornar erro para role inválido', () => {
            const result = responseValidator.validate({
                data: { content: 'test', role: 'user' }
            });
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Erro na API do Claude: Resposta inválida');
        });

        it('deve retornar sucesso para resposta válida', () => {
            const result = responseValidator.validate({
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

            const result = responseValidator.extractResponse(mockResponse);
            expect(result).toEqual(mockResponse.data);
        });
    });
}); 
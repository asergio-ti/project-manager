# Nova Abordagem de Arquitetura e Testes

## 1. Visão Geral
Sistema guiado por IA para construção de documentação de software, com foco em:
- Arquitetura modular e testável
- Funções puras para validação
- Pipeline de tratamento de erros
- Sistema de cache distribuído
- Testes unitários independentes

## 2. Nova Estrutura
```typescript
project-manager/
├── server/                # Backend Node.js + Express
│   └── src/
│       ├── domains/
│       │   ├── ai/       # Integração com IA
│       │   │   ├── validators/
│       │   │   ├── handlers/
│       │   │   ├── cache/
│       │   │   └── services/
│       │   ├── docs/     # Gestão de Documentação
│       │   │   ├── validators/
│       │   │   ├── services/
│       │   │   └── controllers/
│       │   └── projects/ # Gestão de Projetos
│       └── shared/
           ├── errors/
           └── types/
└── client/               # Frontend React
    └── src/
        ├── features/     # Feature-based Structure
        │   ├── docs/     # Documentação
        │   │   ├── components/
        │   │   ├── hooks/
        │   │   └── tests/
        │   └── chat/     # Interface com IA
        │       ├── components/
        │       ├── hooks/
        │       └── tests/
        ├── shared/       # Componentes Compartilhados
        │   ├── components/
        │   ├── hooks/
        │   └── tests/
        └── services/     # Chamadas à API
            ├── api/
            └── tests/
```

## 3. Princípios da Nova Arquitetura

### 3.1 Backend: Validação como Funções Puras
```typescript
// response.validator.ts
export const validateResponse = {
    isEmpty: (response: any): boolean => !response?.data,
    isPartial: (response: any): boolean => 
        response?.data && !hasAllRequiredFields(response.data),
    hasValidRole: (response: any): boolean => 
        response?.data?.role === 'assistant'
};
```

### 3.2 Backend: Pipeline de Erros
```typescript
// error.pipeline.ts
export const errorPipeline = pipe(
    handleNetworkError,
    handleRateLimit,
    handleValidation,
    handleResponse
);
```

### 3.3 Backend: Cache Distribuído
```typescript
interface CacheStrategy<T> {
    get(key: string): Promise<CacheEntry<T> | undefined>;
    set(key: string, value: T, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}
```

### 3.4 Frontend: Componentes Puros
```typescript
// DocumentEditor.tsx
export const DocumentEditor: React.FC<Props> = memo(({ document, onSave }) => {
    // Componente puro sem efeitos colaterais
    return (/* ... */);
});
```

### 3.5 Frontend: Hooks Customizados
```typescript
// useDocument.ts
export const useDocument = (documentId: string) => {
    // Lógica isolada de gerenciamento de estado
    return {
        document,
        isLoading,
        error,
        save,
        update
    };
};
```

## 4. Nova Estratégia de Testes

### 4.1 Backend: Testes Unitários
```typescript
// Exemplo: Teste de Validador
describe('Response Validator', () => {
    describe('isEmpty', () => {
        test.each([
            [null, true],
            [{}, true],
            [{ data: {} }, true],
            [{ data: { content: 'test' } }, false]
        ])('deve retornar %s para input %o', (input, expected) => {
            expect(validateResponse.isEmpty(input)).toBe(expected);
        });
    });
});
```

### 4.2 Backend: Testes de Integração
```typescript
describe('Claude Integration', () => {
    const mockAxios = new MockAdapter(axios);
    
    beforeEach(() => {
        mockAxios.reset();
    });

    test('fluxo completo de mensagem', async () => {
        const result = await claudeService.sendMessage(mockMessages);
        expect(result).toMatchSnapshot();
    });
});
```

### 4.3 Frontend: Testes de Componentes
```typescript
describe('DocumentEditor', () => {
    it('deve renderizar corretamente', () => {
        render(<DocumentEditor document={mockDoc} />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('deve chamar onSave ao salvar', async () => {
        const onSave = jest.fn();
        render(<DocumentEditor document={mockDoc} onSave={onSave} />);
        
        await userEvent.click(screen.getByText('Salvar'));
        expect(onSave).toHaveBeenCalled();
    });
});
```

### 4.4 Frontend: Testes de Hooks
```typescript
describe('useDocument', () => {
    it('deve carregar documento', async () => {
        const { result } = renderHook(() => useDocument('123'));
        
        await waitFor(() => {
            expect(result.current.document).toBeDefined();
            expect(result.current.isLoading).toBe(false);
        });
    });
});
```

### 4.5 Testes E2E
```typescript
describe('Fluxo de Documentação', () => {
    it('deve criar e editar documento', async () => {
        // Simula fluxo completo do usuário
        await page.goto('/documents/new');
        await page.fill('input[name="title"]', 'Novo Documento');
        await page.click('button[type="submit"]');
        
        expect(page.url()).toMatch(/documents\/[\w-]+/);
    });
});
```

## 5. Métricas e Objetivos

### 5.1 Qualidade de Código
- Cobertura de testes > 90%
- Complexidade ciclomática < 5
- Duplicação de código < 3%
- Tempo médio de resposta < 200ms

### 5.2 Monitoramento
- Taxa de sucesso/erro
- Latência de respostas
- Uso de cache
- Taxa de retry
- Performance de renderização
- Tempo de carregamento inicial

## 6. Próximos Passos

### 6.1 Backend
1. [x] Validadores puros
2. [x] Pipeline de erros
3. [ ] Sistema de cache modular
4. [ ] Refatorar ClaudeService
5. [ ] Testes unitários por módulo
6. [ ] Testes de integração

### 6.2 Frontend
1. [ ] Migrar para estrutura baseada em features
2. [ ] Implementar componentes puros
3. [ ] Criar hooks customizados
4. [ ] Testes de componentes
5. [ ] Testes de hooks
6. [ ] Testes E2E 
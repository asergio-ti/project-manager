# Plano de Refatoração V2 - Project Manager

## 1. Visão Geral do Sistema

### 1.1 Objetivo
Sistema guiado por IA para construção de documentação de software, focando em:
- Documentação PRÉ-IMPLEMENTAÇÃO
- Estrutura sequencial: DVP → DRS → DAS → DADI
- Interface conversacional com IA (Claude)
- Preenchimento implícito de schemas

### 1.2 Arquitetura Proposta
```
project-manager/
├── server/                # Backend Node.js + Express
│   └── src/
│       ├── domains/      # Domínios de negócio
│       │   ├── ai/      # Integração com Claude
│       │   ├── projects/ # Gestão de projetos
│       │   └── docs/    # Documentação
│       └── schemas/      # Schemas JSON
└── client/               # Frontend React
    └── src/
        ├── features/     # Features principais
        ├── components/   # Componentes React
        └── services/     # Chamadas à API
```

## 2. Status da Migração

### 2.1 Concluído ✅
1. **Preparação e Backup**
   - Scripts de backup implementados
   - Validação de ambiente configurada
   - Estrutura de diretórios criada

2. **Migração de Schemas**
   - Schemas movidos para nova estrutura
   - Imports atualizados
   - Estrutura validada

3. **Domínio de IA**
   - Tipos base definidos (`ChatMessage`, `MessageContext`, etc)
   - Integração com Claude implementada
   - Sistema de análise de contexto
   - Gerenciamento de conversas

4. **Domínio de Documentação**
   - Tipos base implementados (`Document`, `DocumentSection`, etc)
   - Serviço de documentação com operações CRUD
   - Sistema de versionamento
   - Validação de documentos e seções
   - Exportação em múltiplos formatos
   - Controller REST com rotas completas
   - Testes unitários implementados
     - Criação e atualização de documentos
     - Gestão de seções
     - Versionamento
     - Validação
     - Cálculo de progresso

### 2.2 Em Andamento 🔄
1. **Testes Unitários**
   - [x] Testes do domínio de IA
     - [x] ClaudeService
       - [x] Testes de construtor
       - [x] Testes de envio de mensagens
       - [x] Testes de análise de contexto
       - [x] Testes de geração de resposta
       - [x] Testes de tratamento de erros
     - [x] AIService
       - [x] Testes de inicialização de conversa
       - [x] Testes de processamento de mensagens
       - [x] Testes de atualização de estado
       - [x] Testes de tratamento de erros
     - [x] AIController
       - [x] Testes de rotas de conversa
       - [x] Testes de rotas de mensagens
       - [x] Testes de validação de parâmetros
       - [x] Testes de tratamento de erros
   - [x] Testes do domínio de documentação
     - [x] Testes de CRUD de documentos
     - [x] Testes de gestão de seções
     - [x] Testes de versionamento
     - [x] Testes de validação
     - [x] Testes de exportação
   - [ ] Testes de integração
     - [ ] Integração AIService-ClaudeService
       - [ ] Fluxo completo de conversa
       - [ ] Análise de contexto e resposta
       - [ ] Tratamento de erros de API
     - [ ] Integração AIController-AIService
       - [ ] Ciclo de vida da conversa
       - [ ] Processamento de mensagens
       - [ ] Validação de respostas

### 2.3 Pendente ⏳
1. **Refatoração Frontend**
2. **Documentação Final**
3. **Testes de Integração**
   - [ ] Testes E2E do fluxo de documentação
   - [ ] Testes E2E do fluxo de IA
   - [ ] Testes de performance

## 3. Detalhes Técnicos

### 3.1 Integração com Claude
```typescript
// Tipos principais
interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ClaudeRequest {
    model: string;
    messages: ClaudeMessage[];
    temperature?: number;
    max_tokens?: number;
    system?: string;
}

// Serviços implementados
class ClaudeService {
    sendMessage(messages: ClaudeMessage[], systemPrompt?: string): Promise<ClaudeResponse>;
    analyzeContext(content: string, history: ClaudeMessage[]): Promise<ClaudeResponse>;
    generateResponse(content: string, analysis: string, history: ClaudeMessage[]): Promise<ClaudeResponse>;
}

class AIService {
    startConversation(projectId: string, phase: Phase): Promise<ConversationState>;
    processMessage(projectId: string, content: string): Promise<ChatMessage>;
}
```

### 3.2 Sistema de Documentação
```typescript
// Tipos principais
interface Document extends BaseDocument {
    projectId: string;
    phase: 'DVP' | 'DRS' | 'DAS' | 'DADI';
    sections: DocumentSection[];
    versions: DocumentVersion[];
    status: DocumentStatus;
}

interface DocumentSection {
    id: string;
    title: string;
    content: string;
    status: 'draft' | 'review' | 'approved';
}

// Serviços implementados
class DocumentationService {
    // Operações básicas
    createDocument(projectId: string, phase: string): Promise<Document>;
    updateDocument(id: string, updates: Partial<Document>): Promise<Document>;
    
    // Versionamento
    createVersion(documentId: string, changes: string[]): Promise<DocumentVersion>;
    
    // Validação
    validateDocument(documentId: string): Promise<DocumentValidationResult>;
}

// Rotas REST
POST   /api/docs                          // Criar documento
GET    /api/docs/:id                      // Obter documento
PATCH  /api/docs/:id                      // Atualizar documento
DELETE /api/docs/:id                      // Excluir documento
POST   /api/docs/:id/sections             // Adicionar seção
PATCH  /api/docs/:id/sections/:sectionId  // Atualizar seção
DELETE /api/docs/:id/sections/:sectionId  // Remover seção
POST   /api/docs/:id/versions             // Criar versão
GET    /api/docs/:id/versions             // Listar versões
GET    /api/docs/:id/validate             // Validar documento
POST   /api/docs/:id/export               // Exportar documento
```

### 3.3 Testes Implementados
```typescript
// Testes do DocumentationService - 100% Implementados ✅
describe('DocumentationService', () => {
    // Criação de Documentos
    it('deve criar um novo documento com os campos obrigatórios'); ✅
    it('deve criar um documento com template quando especificado'); ✅

    // Gestão de Seções
    it('deve adicionar uma nova seção ao documento'); ✅
    it('deve calcular ordem correta para nova seção'); ✅
    it('deve atualizar uma seção existente'); ✅
    it('deve validar seção sem título'); ✅

    // Versionamento
    it('deve criar uma nova versão do documento'); ✅
    it('deve incrementar número da versão corretamente'); ✅
    it('deve listar versões em ordem'); ✅

    // Validação
    it('deve validar documento vazio'); ✅
    it('deve validar documento com seções'); ✅
    it('deve gerar warnings para seções vazias'); ✅

    // Cálculo de Progresso
    it('deve calcular 0% para documento sem seções'); ✅
    it('deve calcular progresso baseado em seções aprovadas'); ✅
});

// Testes do ClaudeService - 100% Implementados ✅
describe('ClaudeService', () => {
    // Construtor
    it('deve lançar erro se API key não for fornecida'); ✅
    it('deve criar instância com configuração válida'); ✅

    // Envio de Mensagens
    it('deve enviar mensagem com sucesso'); ✅
    it('deve incluir system prompt quando fornecido'); ✅
    it('deve tratar erro da API corretamente'); ✅
    it('deve tratar erro de rede corretamente'); ✅

    // Análise de Contexto
    it('deve analisar contexto com sucesso'); ✅

    // Geração de Resposta
    it('deve gerar resposta com sucesso'); ✅
});

// Testes do AIService - 100% Implementados ✅
describe('AIService', () => {
    // Inicialização de Conversa
    it('deve iniciar uma nova conversa com estado inicial correto'); ✅
    it('deve incluir mensagem inicial do assistente'); ✅

    // Processamento de Mensagens
    it('deve processar mensagem do usuário corretamente'); ✅
    it('deve atualizar o estado da conversa após processamento'); ✅
    it('deve lançar erro se conversa não existir'); ✅
    it('deve tratar erros do Claude corretamente'); ✅
});

// Testes do AIController - 100% Implementados ✅
describe('AIController', () => {
    // Rotas de Conversa
    it('deve criar uma nova conversa com sucesso'); ✅
    it('deve retornar erro 400 se projectId não for fornecido'); ✅
    it('deve retornar erro 400 se phase não for fornecida'); ✅
    it('deve retornar erro 500 se houver erro ao criar conversa'); ✅

    // Rotas de Mensagens
    it('deve processar mensagem com sucesso'); ✅
    it('deve retornar erro 400 se content não for fornecido'); ✅
    it('deve retornar erro 404 se conversa não for encontrada'); ✅
    it('deve retornar erro 500 se houver erro ao processar mensagem'); ✅
});

// Cobertura de Testes do AIController
- Statements: 96.29% ✅
- Branches: 100% ✅
- Functions: 80% ✅
- Lines: 96.29% ✅
```

### 3.4 Scripts de Teste
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage"
  }
}
```

### 3.5 Fluxo de Documentação
1. **Criação de Documento**
   - Definição de projeto e fase
   - Estrutura inicial com metadados
   - Versionamento automático

2. **Gestão de Seções**
   - Adição/remoção dinâmica
   - Controle de status
   - Validação de conteúdo

3. **Versionamento**
   - Controle de versões semântico
   - Histórico de mudanças
   - Recuperação de versões

4. **Exportação**
   - Múltiplos formatos (PDF, HTML, Markdown)
   - Personalização via templates
   - Inclusão de metadados

## 4. Próximos Passos

### 4.1 Domínio de IA
1. **Testes Unitários**
   - [ ] ClaudeService
     - [ ] Testes de integração com API
     - [ ] Testes de análise de contexto
     - [ ] Testes de geração de resposta
   - [ ] AIService
     - [ ] Testes de gestão de conversas
     - [ ] Testes de processamento de mensagens
     - [ ] Testes de análise de contexto
   - [ ] AIController
     - [ ] Testes de rotas
     - [ ] Testes de validação de parâmetros
     - [ ] Testes de tratamento de erros

2. **Melhorias de Integração**
   - [ ] Mock da API do Claude para testes
   - [ ] Validação de respostas da API
   - [ ] Tratamento de erros de rede
   - [ ] Cache de respostas

3. **Documentação**
   - [ ] Documentação da API
   - [ ] Exemplos de uso
   - [ ] Guia de troubleshooting

### 4.2 Frontend
1. **Componentes**
   - [ ] Chat interface
   - [ ] Document preview
   - [ ] Progress tracking

2. **Estado**
   - [ ] Context providers
   - [ ] Custom hooks
   - [ ] Type definitions

## 5. Considerações de Segurança

### 5.1 API do Claude
- Chaves de API em variáveis de ambiente
- Validação de tokens
- Rate limiting
- Sanitização de inputs/outputs

### 5.2 Dados do Projeto
- Validação de schemas
- Sanitização de conteúdo
- Backup automático
- Versionamento de documentos

## 6. Timeline Atualizada

1. ✅ **Preparação e Backup**: 1 dia
   - Setup completo
   - Scripts funcionais
   - Ambiente validado

2. ✅ **Migração de Schemas**: 2 dias
   - Estrutura organizada
   - Imports atualizados
   - Validações implementadas

3. ✅ **Integração IA**: 2 dias
   - Claude integrado
   - Análise contextual
   - Gestão de conversas

4. ✅ **Documentação Base**: 2 dias
   - Tipos definidos
   - Serviços implementados
   - Testes unitários completos

5. 🔄 **Testes de IA**: 2 dias
   - Em progresso
   - ClaudeService
   - AIService
   - AIController
   - Integração com API

6. ⏳ **Frontend**: 3 dias
   - Pendente
   - Componentes planejados
   - Integrações mapeadas

7. ⏳ **Documentação Final**: 1 dia
   - Pendente
   - API docs
   - Guias de uso
   - Exemplos

## 7. Logs e Monitoramento

### 7.1 Logs Implementados
- Conversas com Claude
- Análises de contexto
- Atualizações de estado
- Erros e exceções

### 7.2 Métricas
- Tempo de resposta da API
- Taxa de sucesso de análise
- Progresso dos projetos
- Uso de recursos

## 8. Novas Funcionalidades

### 8.1 Sistema de Chat Inteligente
```typescript
interface ChatSystem {
  // Análise de Contexto
  analyzeUserResponse(response: string): Promise<ContextAnalysis>;
  
  // Geração de Perguntas
  generateNextQuestion(context: ChatContext): Promise<Question>;
  
  // Processamento de Respostas
  processResponse(response: string): Promise<ProcessedFields[]>;
}
```

### 8.2 Gerenciamento de Fases
```typescript
interface PhaseManager {
  // Controle de Progresso
  calculateProgress(phase: Phase): Progress;
  
  // Validação de Campos
  validateFields(fields: Field[]): ValidationResult;
  
  // Sugestões Contextuais
  generateSuggestions(context: PhaseContext): Suggestion[];
}
```

## 9. Pontos de Atenção

### 9.1 Segurança
- [ ] Implementar autenticação
- [ ] Validar inputs
- [ ] Sanitizar outputs
- [ ] Proteger rotas sensíveis

### 9.2 Performance
- [ ] Implementar caching
- [ ] Otimizar queries
- [ ] Lazy loading de componentes
- [ ] Compressão de respostas

### 9.3 UX/UI
- [ ] Feedback visual de progresso
- [ ] Indicadores de loading
- [ ] Mensagens de erro amigáveis
- [ ] Tooltips de ajuda

## 10. Documentação

### 10.1 Documentação Técnica
- [ ] Arquitetura do sistema
- [ ] Fluxos de integração
- [ ] Contratos de API
- [ ] Modelos de dados

### 10.2 Documentação de Usuário
- [ ] Guia de uso
- [ ] FAQ
- [ ] Exemplos práticos
- [ ] Troubleshooting

## 11. Critérios de Aceitação

### 11.1 Funcionalidades
- [ ] Chat funcional com IA
- [ ] Visualização de fases
- [ ] Preenchimento automático
- [ ] Validações em tempo real

### 11.2 Técnicos
- [ ] Cobertura de testes > 80%
- [ ] Tempo de resposta < 2s
- [ ] Zero erros de TypeScript
- [ ] Documentação completa 
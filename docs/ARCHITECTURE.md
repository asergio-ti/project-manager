# Arquitetura do Project Manager

## 🏗️ Visão Geral da Arquitetura

### Camadas Principais
```
┌─────────────────────────────────────────┐
│              Apresentação               │
├─────────────────────────────────────────┤
│ React + Vite + TypeScript + Tailwind   │
└─────────────────────────────────────────┘
                   ↕
┌─────────────────────────────────────────┐
│         Gerenciamento de Estado         │
├─────────────────────────────────────────┤
│    Zustand + React Query + TypeScript   │
└─────────────────────────────────────────┘
                   ↕
┌─────────────────────────────────────────┐
│        Lógica de Negócios (Core)        │
├─────────────────────────────────────────┤
│   Schemas + Validação + Distribuição    │
└─────────────────────────────────────────┘
                   ↕
┌─────────────────────────────────────────┐
│        Integração e Persistência        │
├─────────────────────────────────────────┤
│    File System + Claude API + GitHub    │
└─────────────────────────────────────────┘
```

## 🔧 Componentes Técnicos

### 1. Frontend (client/)
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Roteamento**: React Router 6
- **Estado**: 
  - Zustand para estado global
  - React Query para cache e sincronização

### 2. Ambiente de Desenvolvimento
- **Container**: GitHub Codespaces + Docker
- **IDE**: Cursor com suporte SSH
- **DevTools**:
  - ESLint + Prettier
  - TypeScript
  - Vite Dev Server
  - Hot Module Replacement (HMR)

### 3. Schemas e Validação
- **Formato**: JSON Schema
- **Validação**: Zod + TypeScript
- **Distribuição**: Sistema próprio de análise
- **Versionamento**: Git + JSON Diff

## 🔄 Fluxo de Dados

### 1. Entrevista e Coleta
```typescript
interface InterviewFlow {
  session: {
    currentPhase: Phase;
    context: ProjectContext;
    history: Message[];
  };
  
  analysis: {
    extractors: DataExtractor[];
    validators: SchemaValidator[];
    distributors: InfoDistributor[];
  };
}
```

### 2. Processamento e Distribuição
```typescript
interface DataProcessor {
  analyze(response: string): Analysis;
  distribute(analysis: Analysis): void;
  validate(schemas: Schema[]): ValidationResult;
  update(schemas: Schema[], data: any): void;
}
```

### 3. Persistência e Sincronização
```typescript
interface StorageManager {
  saveProject(project: Project): Promise<void>;
  loadProject(id: string): Promise<Project>;
  syncChanges(changes: Change[]): Promise<void>;
  createSnapshot(): Promise<Snapshot>;
}
```

## 🔐 Segurança e Integridade

### 1. Validação de Dados
- Validação de tipos em tempo de compilação
- Validação de schema em runtime
- Sanitização de inputs
- Verificação de consistência

### 2. Controle de Versão
- Versionamento semântico
- Histórico de alterações
- Snapshots automáticos
- Diff de schemas

### 3. Backup e Recuperação
- Persistência local
- Sincronização com GitHub
- Recuperação de estados anteriores
- Logs de auditoria

## 📦 Estrutura de Diretórios
```
project-manager/
├── .devcontainer/          # Configuração GitHub Codespaces
├── .cursor/                # Configurações Cursor IDE
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/         # Custom Hooks
│   │   ├── stores/        # Estado Global
│   │   └── types/         # TypeScript Types
├── docker/                 # Configuração Docker
├── docs/                   # Documentação
│   ├── schemas/           # JSON Schemas
│   └── templates/         # Templates
└── workspace/             # Área de trabalho
    └── projects/         # Projetos gerenciados
```

## 🔄 Ciclo de Desenvolvimento

### 1. Ambiente Local
```bash
# Desenvolvimento
npm run dev         # Inicia Vite Dev Server
npm run test       # Executa testes
npm run lint       # Verifica código

# Build
npm run build      # Gera build otimizado
npm run preview    # Visualiza build
```

### 2. Ambiente Codespaces
```bash
# Inicialização
gh codespace create  # Cria novo codespace
gh codespace ssh     # Conecta via SSH

# Desenvolvimento
npm run dev         # Inicia servidor com HMR
```

## 📈 Monitoramento e Métricas

### 1. Performance
- Tempo de resposta
- Uso de memória
- Tempo de build
- Métricas de HMR

### 2. Qualidade
- Cobertura de testes
- Análise estática
- Complexidade ciclomática
- Dependências desatualizadas

### 3. UX
- Tempo de interação
- Erros de usuário
- Uso de recursos
- Feedback do usuário 
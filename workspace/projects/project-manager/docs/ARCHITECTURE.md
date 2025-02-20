# Arquitetura do Project Manager

## 📋 Sumário
1. [Visão Geral](#visão-geral)
2. [Tecnologias](#tecnologias)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Componentes](#componentes)
5. [Gerenciamento de Estado](#gerenciamento-de-estado)
6. [Testes](#testes)
7. [Integração com Claude](#integração-com-claude)

## 🎯 Visão Geral

O Project Manager é uma plataforma de documentação guiada que:
- Oferece interface dividida com timeline, visualizador de documentos e chat
- Utiliza IA (Claude) para conduzir entrevistas estruturadas
- Permite visualização e comentários em documentos
- Suporta referências diretas a seções de documentos no chat
- Gerencia progresso de fases e documentos

## 🛠️ Tecnologias

### Frontend
```typescript
interface TechStack {
  framework: 'React 18';
  language: 'TypeScript';
  buildTool: 'Vite';
  styling: 'TailwindCSS';
  testing: {
    framework: 'Jest';
    libraries: ['@testing-library/react', '@testing-library/user-event'];
  };
  stateManagement: 'React Context';
  routing: 'React Router v6';
}
```

### Backend
```typescript
interface BackendStack {
  runtime: 'Node.js';
  framework: 'Express';
  language: 'TypeScript';
  fileSystem: 'Node.js fs/promises';
}
```

## 📁 Estrutura do Projeto

```
project-manager/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/              # Componentes do chat
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── ChatHeader.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── MessageBubble.tsx
│   │   │   ├── Layout/           # Componentes de layout
│   │   │   │   └── SplitLayout.tsx
│   │   │   ├── ProjectList/      # Lista de projetos
│   │   │   │   └── ProjectList.tsx
│   │   │   └── ui/              # Componentes reutilizáveis
│   │   │       ├── Spinner.tsx
│   │   │       └── ErrorMessage.tsx
│   │   ├── contexts/            # Contextos React
│   │   │   ├── ProjectContext.tsx
│   │   │   └── ChatContext.tsx
│   │   ├── services/           # Serviços de API
│   │   │   └── ProjectService.ts
│   │   └── types/             # Definições de tipos
│   │       ├── project.ts
│   │       └── chat.ts
│   └── tests/                # Testes unitários
│       └── __mocks__/
├── server/
│   └── src/
│       └── index.ts         # Servidor Express
└── workspace/
    └── projects/           # Projetos gerenciados
        └── [project-name]/
            ├── docs/       # Documentação
            ├── metadata/   # Metadados
            └── prototypes/ # Protótipos
```

## 🔧 Componentes

### ProjectList
```typescript
/**
 * Lista de projetos disponíveis no workspace
 * - Carrega e exibe todos os projetos
 * - Mostra status de cada fase
 * - Permite navegação para projeto específico
 */
interface ProjectListProps {
  // Componente não requer props
}
```

### ChatInterface
```typescript
/**
 * Interface de chat com o assistente
 * - Exibe histórico de mensagens
 * - Permite envio de mensagens
 * - Mostra estados de loading
 * - Gerencia erros
 */
interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

### SplitLayout
```typescript
/**
 * Layout dividido com painéis redimensionáveis
 */
interface SplitLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}
```

## 📊 Gerenciamento de Estado

### ProjectContext
```typescript
interface ProjectContextData {
  currentProject: Project | null;
  projectMetadata: ProgressState | null;
  projectTimeline: TimelineState | null;
  loading: boolean;
  error: string | null;
  setCurrentProject: (project: Project) => void;
  loadProjectData: (projectId: string) => Promise<void>;
}
```

### ChatContext
```typescript
interface ChatContextData {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}
```

## 🧪 Testes

### Configuração
```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
}
```

### Cobertura de Testes
- Componentes principais
- Contextos
- Serviços
- Casos de sucesso e erro
- Estados de loading
- Interações do usuário

### Exemplos de Testes
```typescript
describe('ProjectList', () => {
  it('deve mostrar loading ao iniciar');
  it('deve mostrar a lista de projetos quando carregada');
  it('deve mostrar erro quando falhar');
  it('deve navegar para o projeto ao clicar');
});

describe('ChatInterface', () => {
  it('deve mostrar a mensagem inicial do assistente');
  it('deve permitir enviar uma mensagem');
  it('não deve enviar mensagem vazia');
  it('deve desabilitar input durante loading');
});
```

## 🤖 Integração com Claude

### Fluxo de Mensagens
```typescript
interface ChatFlow {
  userMessage: {
    type: 'user';
    content: string;
    context?: {
      projectId: string;
      currentPhase: string;
      documentReference?: string;
    };
  };
  
  assistantResponse: {
    type: 'assistant';
    content: string;
    actions?: {
      updateDocument?: DocumentUpdate;
      changePhase?: PhaseTransition;
      requestInfo?: InfoRequest;
    };
  };
}
```

### Próximos Passos
1. **Implementação da API do Claude**
   - Integração com o serviço
   - Gerenciamento de contexto
   - Processamento de ações

2. **Sistema de Documentos**
   - Editor de documentos
   - Controle de versão
   - Referências no chat

3. **Melhorias de UX**
   - Feedback em tempo real
   - Atalhos de teclado
   - Temas claro/escuro

4. **Expansão de Testes**
   - Testes E2E
   - Testes de integração
   - Métricas de cobertura 
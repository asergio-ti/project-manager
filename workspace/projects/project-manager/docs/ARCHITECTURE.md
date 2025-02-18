# Arquitetura do Project Manager

## 📋 Sumário
1. [Visão Geral](#visão-geral)
2. [Ambiente de Desenvolvimento](#ambiente-de-desenvolvimento)
3. [Interface do Usuário](#interface-do-usuário)
4. [Estrutura de Dados](#estrutura-de-dados)
5. [Componentes](#componentes)
6. [Integração com Claude](#integração-com-claude)

## 🎯 Visão Geral

O Project Manager é uma plataforma de documentação guiada que:
- Oferece interface dividida com timeline, visualizador de documentos e chat
- Utiliza IA (Claude) para conduzir entrevistas estruturadas
- Permite visualização e comentários em documentos
- Suporta referências diretas a seções de documentos no chat
- Gerencia progresso de fases e documentos

## 🛠️ Ambiente de Desenvolvimento

### Arquitetura de Desenvolvimento
```typescript
interface DevelopmentEnvironment {
  codespaces: {
    workspace: string;
    ssh: {
      host: string;
      port: number;
      user: string;
    };
    containers: {
      dev: Container;
      services: Container[];
    };
  };
  cursorIDE: {
    connection: SSHConfig;
    workspace: LocalPath;
    settings: VSCodeSettings;
  };
  docker: {
    compose: DockerCompose;
    dev: Dockerfile;
  };
}
```

### Fluxo de Desenvolvimento
1. **GitHub Codespaces**
   - Ambiente principal de desenvolvimento
   - Containers Docker nativos
   - Integração com serviços externos
   - Configurações VSCode compartilhadas

2. **Cursor IDE**
   - Conexão SSH com Codespaces
   - Desenvolvimento local
   - Sincronização em tempo real
   - Herança de configurações VSCode

3. **Configurações VSCode/Cursor**
   - Extensões padrão para desenvolvimento
   - Configurações de terminal integrado
   - Exclusões de arquivos para watch
   - Perfis de terminal otimizados

4. **Integração Contínua**
   - Build automatizado
   - Testes integrados
   - Deploy contínuo

## 🖥️ Interface do Usuário

### Layout Principal
```typescript
interface ProjectManager {
  leftPanel: {
    width: number;
    content: Timeline | DocumentViewer;
  };
  rightPanel: {
    content: Chat;
  };
  divider: ResizablePanel;
}
```

### Estrutura de Documentos
```typescript
interface Document {
  id: string;
  name: string;
  phase: DocumentPhase; // 'DVP' | 'DRS' | 'DAS'
  status: DocumentStatus; // 'pending' | 'in-progress' | 'completed'
  progress: number;
  content?: {
    title: string;
    description: string;
    sections: {
      title: string;
      content: string;
      subsections?: {
        title: string;
        content: string;
      }[];
    }[];
  };
}
```

### Sistema de Chat
```typescript
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  reference?: string; // Referência a seções do documento
}
```

## 🔧 Componentes

### 1. Timeline
- Exibe fases do projeto (DVP, DRS, DAS)
- Mostra progresso geral de cada fase
- Lista documentos com progresso individual
- Permite navegação para visualização de documentos

### 2. DocumentViewer
- Visualização detalhada de documentos
- Suporte a modo tela cheia
- Sistema de comentários por seção
- Estrutura hierárquica de conteúdo
- Referências diretas para o chat

### 3. Chat
- Interface de comunicação com Claude
- Suporte a referências de documentos
- Histórico de mensagens estilizado
- Input expansível com preview de referências

## 🎨 Estilização

### Tema Base
```css
:root {
  /* Cores do Tema Claro */
  --background: rgb(243 244 246); /* gray-100 */
  --foreground: rgb(255 255 255); /* white */
  --text: rgb(17 24 39); /* gray-900 */
  --border: rgb(229 231 235); /* gray-200 */
  --primary: rgb(59 130 246); /* blue-500 */
}

.dark {
  /* Cores do Tema Escuro */
  --background: rgb(17 24 39); /* gray-900 */
  --foreground: rgb(31 41 55); /* gray-800 */
  --text: rgb(255 255 255); /* white */
  --border: rgb(75 85 99); /* gray-600 */
  --primary: rgb(59 130 246); /* blue-500 */
}
```

### Componentes Visuais
- Cards com sombras e bordas arredondadas
- Barras de progresso animadas
- Transições suaves em interações
- Feedback visual em elementos interativos
- Ícones consistentes do Lucide

## 🔄 Fluxo de Trabalho

1. **Navegação de Documentos**
   ```typescript
   Timeline -> DocumentViewer -> Comentários -> Chat
   ```

2. **Sistema de Referências**
   ```typescript
   DocumentViewer -> Comentário -> Chat (com referência) -> Resposta
   ```

3. **Progresso do Projeto**
   ```typescript
   Fase -> Documentos -> Progresso Individual -> Progresso da Fase
   ```

## 🛠️ Próximos Passos

1. **Migração para GitPod**
   - Configurar ambiente de desenvolvimento
   - Adaptar scripts de build
   - Configurar variáveis de ambiente
   - Preparar containers Docker

2. **Integrações**
   - API do Claude
   - Sistema de persistência
   - Autenticação
   - Controle de versão de documentos

3. **Melhorias Futuras**
   - Exportação de documentos
   - Templates personalizados
   - Histórico de alterações
   - Colaboração em tempo real

## 📁 Estrutura de Diretórios

```
project-manager/
├── client/
│   └── src/
│       ├── components/
│       │   ├── Layout/
│       │   │   ├── SplitLayout.tsx        # Layout dividido
│       │   │   ├── Timeline.tsx           # Timeline do projeto
│       │   │   └── ChatInterface.tsx      # Interface com Claude
│       │   │
│       │   ├── Documentation/
│       │   │   ├── SchemaViewer.tsx       # Visualizador humanizado
│       │   │   └── PrototypeViewer.tsx    # Visualizador de protótipos
│       │   │
│       │   └── Navigation/
│       │       └── PhaseNavigator.tsx     # Navegação entre fases
│       │
│       ├── domains/
│       │   ├── interview/
│       │   │   ├── ClaudeIntegration.ts   # Integração com IA
│       │   │   └── InterviewManager.ts    # Gestão de entrevistas
│       │   │
│       │   ├── documentation/
│       │   │   ├── SchemaManager.ts       # Gestão de schemas
│       │   │   └── Distributor.ts         # Distribuição de informações
│       │   │
│       │   └── validation/
│       │       ├── SchemaValidator.ts     # Validação de schemas
│       │       └── PrototypeValidator.ts  # Validação de protótipos
│       │
│       └── state/
│           ├── ProjectContext.ts          # Estado do projeto
│           └── TimelineContext.ts         # Estado da timeline
│
└── workspace/
    └── managed-projects/
        └── [project-name]/
            ├── docs/                      # Documentação
            │   ├── dvp/
            │   ├── drs/
            │   ├── das/
            │   └── dadi/
            │
            ├── prototypes/                # Protótipos React
            │   └── react/
            │
            └── metadata/                  # Metadados
                ├── timeline.json          # Estado da timeline
                └── progress.json          # Progresso do projeto
```

## 🔧 Componentes do Sistema

### Gerenciador de Timeline
```typescript
class TimelineManager {
  phases: Phase[];
  currentPhase: Phase;
  
  async navigateToPhase(phaseId: string): Promise<void> {
    const phase = this.phases.find(p => p.id === phaseId);
    await this.loadPhaseContent(phase);
    await this.updateChatContext(phase);
  }
  
  async updateProgress(phase: Phase): Promise<void> {
    const progress = await this.calculateProgress(phase);
    await this.updateUI(progress);
  }
}
```

### Visualizador Humanizado
```typescript
class HumanizedViewer {
  async renderSchema(schema: Schema): Promise<ReactNode> {
    const humanized = await this.transformToHuman(schema);
    return this.createInteractiveView(humanized);
  }
  
  async updateSchema(updates: Partial<Schema>): Promise<void> {
    await this.validateUpdates(updates);
    await this.applyUpdates(updates);
    await this.refreshView();
  }
}
```

### Validador de Protótipos
```typescript
class PrototypeValidator {
  async validateAgainstDocs(
    prototype: ReactComponent
  ): Promise<ValidationResult> {
    const docs = await this.getRelatedDocs(prototype);
    const analysis = await this.analyzePrototype(prototype);
    
    return this.compareWithDocs(analysis, docs);
  }
}
```

## 🤖 Integração com Claude

### Gerenciador de Entrevistas
```typescript
class ClaudeInterviewManager {
  async conductInterview(): Promise<void> {
    // Inicialização
    await this.showWelcome();
    const project = await this.handleProjectSelection();
    
    // Processo de entrevista
    while (!this.isComplete()) {
      const question = await this.generateNextQuestion();
      const response = await this.getResponse(question);
      
      await this.processResponse(response);
      await this.updateTimeline();
    }
  }
  
  private async processResponse(response: string): Promise<void> {
    const analysis = await this.analyzeResponse(response);
    await this.distributeToSchemas(analysis);
    await this.validateConsistency();
  }
}
```

### Distribuidor de Informações
```typescript
class InformationDistributor {
  async distribute(
    information: Information,
    context: Context
  ): Promise<void> {
    // Identificar schemas relevantes
    const schemas = await this.identifyRelevantSchemas(information);
    
    // Distribuir informações
    for (const schema of schemas) {
      await this.updateSchema(schema, information);
    }
    
    // Validar consistência
    await this.validateUpdates();
    
    // Atualizar timeline
    await this.updateProgress();
  }
}
``` 
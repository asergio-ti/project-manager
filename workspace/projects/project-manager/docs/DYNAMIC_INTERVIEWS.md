# Sistema de Entrevistas Dinâmicas

## 📋 Visão Geral

O sistema de entrevistas dinâmicas é a interface principal do Project Manager, consistindo em:
- Interface moderna construída com React + Vite
- Interação guiada com o agente Claude
- Visualização humanizada de documentos
- Navegação intuitiva entre fases
- Validação em tempo real

## 🖥️ Interface Principal

### Layout Dividido
```typescript
interface ProjectManagerLayout {
  leftPanel: {
    timeline: ProjectTimeline;      // Cronograma/roteiro do projeto
    documentViewer: SchemaViewer;   // Visualizador de documentos
  };
  rightPanel: {
    chatInterface: ClaudeChat;      // Interface de chat com Claude
  };
}
```

### Timeline do Projeto
```typescript
interface ProjectTimeline {
  phases: {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed';
    documents: {
      schema: Schema;
      completion: number;
      status: DocumentStatus;
    }[];
  }[];
}
```

## 🔄 Fluxo de Interação

### 1. Inicialização do Ambiente
```typescript
class EnvironmentSetup {
  async initialize(): Promise<void> {
    // Verificar ambiente
    const env = await this.detectEnvironment();
    
    // Configurar Codespaces se necessário
    if (env.type === 'codespaces') {
      await this.setupCodespaces();
    }
    
    // Iniciar servidor Vite
    await this.startDevServer();
    
    // Configurar conexão SSH para Cursor
    await this.setupSSH();
  }
  
  private async setupCodespaces(): Promise<void> {
    // Configurar ambiente de desenvolvimento
    await this.configureDevContainer();
    
    // Instalar extensões necessárias
    await this.installExtensions();
    
    // Configurar variáveis de ambiente
    await this.setupEnvVars();
  }
}
```

### 2. Condução da Entrevista
```typescript
class InterviewConductor {
  async conduct(): Promise<void> {
    // Contexto inicial
    if (this.isNewProject()) {
      await this.gatherInitialContext();
    }
    
    // Loop principal
    while (!this.isComplete()) {
      // Obter próxima pergunta baseada no contexto
      const question = await this.getNextQuestion();
      
      // Apresentar pergunta e coletar resposta
      const response = await this.askQuestion(question);
      
      // Processar resposta
      await this.processResponse(response);
      
      // Atualizar timeline e documentos
      await this.updateProjectState();
    }
  }
  
  private async processResponse(response: string): Promise<void> {
    // Analisar resposta
    const analysis = await this.analyzeResponse(response);
    
    // Distribuir informações para schemas relevantes
    await this.distributeInformation(analysis);
    
    // Validar consistência
    await this.validateDocuments();
    
    // Atualizar progresso
    await this.updateProgress();
  }
}
```

## 📦 Distribuição de Informações

### Análise e Distribuição
```typescript
class InformationDistributor {
  async distribute(response: string): Promise<void> {
    // Analisar resposta
    const analysis = await this.analyzeResponse(response);
    
    // Identificar schemas relevantes
    const targets = await this.identifyTargetSchemas(analysis);
    
    // Distribuir informações
    for (const schema of targets) {
      await this.updateSchema(schema, analysis);
    }
    
    // Validar consistência
    await this.validateConsistency();
    
    // Atualizar interface
    await this.refreshUI();
  }
}
```

### Validação de Consistência
```typescript
class ConsistencyValidator {
  async validate(schemas: Schema[]): Promise<ValidationResult> {
    const results = await Promise.all([
      this.validateInternalConsistency(schemas),
      this.validateCrossReferences(schemas),
      this.validateCompleteness(schemas)
    ]);
    
    return this.aggregateResults(results);
  }
}
```

## 🔄 Integração com Vite

### Hot Module Replacement
```typescript
class ViteIntegration {
  setupHMR(): void {
    if (import.meta.hot) {
      import.meta.hot.accept(module => {
        // Recarregar componentes
        this.reloadComponents(module);
        
        // Manter estado
        this.preserveState();
        
        // Atualizar interface
        this.refreshUI();
      });
    }
  }
  
  private preserveState(): void {
    // Salvar estado atual
    const state = this.store.getState();
    
    // Registrar para restauração
    this.hmr.register(state);
  }
}
```

### Otimização de Build
```typescript
class BuildOptimizer {
  async optimize(): Promise<void> {
    await this.vite.build({
      // Configurações de build
      build: {
        target: 'esnext',
        minify: 'esbuild',
        rollupOptions: {
          output: {
            manualChunks: this.defineChunks()
          }
        }
      },
      
      // Otimizações de dependências
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'zustand',
          'tailwindcss'
        ]
      }
    });
  }
}
```

## 🔍 Monitoramento e Métricas

### Performance
```typescript
class PerformanceMonitor {
  track(): void {
    // Métricas de build
    this.trackBuildMetrics();
    
    // Métricas de HMR
    this.trackHMRMetrics();
    
    // Métricas de runtime
    this.trackRuntimeMetrics();
  }
  
  private trackBuildMetrics(): void {
    vite.build.onProgress(progress => {
      this.metrics.record('build', {
        duration: progress.duration,
        chunks: progress.chunks,
        assets: progress.assets
      });
    });
  }
}
```

### Análise de Uso
```typescript
class UsageAnalytics {
  analyze(): void {
    // Tracking de interações
    this.trackInteractions();
    
    // Análise de performance
    this.analyzePerformance();
    
    // Feedback do usuário
    this.collectFeedback();
  }
}
``` 
# Sistema de Entrevistas Dinâmicas

## 📋 Visão Geral

O sistema de entrevistas dinâmicas é a interface principal do Project Manager, consistindo em:
- Interface dividida com timeline e chat
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

## 🤖 Fluxo de Interação

### 1. Boas-Vindas e Inicialização
```typescript
class WelcomeFlow {
  async start(): Promise<void> {
    // Mensagem inicial
    await this.showWelcomeMessage();
    
    // Opções iniciais
    const choice = await this.askUserChoice([
      'Criar novo projeto',
      'Acessar projeto existente'
    ]);
    
    if (choice === 'novo') {
      const name = await this.askProjectName();
      await this.createProject(name);
    } else {
      await this.showProjectSelector();
    }
  }
  
  private async createProject(name: string): Promise<Project> {
    // Criar estrutura base
    const project = await this.initializeProject(name);
    
    // Configurar timeline
    await this.setupTimeline(project);
    
    // Iniciar entrevista
    await this.startInterview(project);
    
    return project;
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

### 3. Visualização de Documentos
```typescript
class DocumentViewer {
  async renderDocument(schema: Schema): Promise<ReactNode> {
    // Transformar schema em formato humanizado
    const humanized = await this.humanizeSchema(schema);
    
    // Criar visualização interativa
    return this.createInteractiveView(humanized, {
      onEdit: this.handleEdit,
      onValidate: this.handleValidate,
      onNavigate: this.handleNavigate
    });
  }
  
  private async humanizeSchema(schema: Schema): Promise<HumanizedView> {
    return {
      sections: await this.transformSections(schema),
      navigation: await this.createNavigation(schema),
      metadata: await this.extractMetadata(schema)
    };
  }
}
```

## �� Distribuição de Informações

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
  
  private async identifyTargetSchemas(
    analysis: Analysis
  ): Promise<Schema[]> {
    return this.schemas.filter(schema => 
      this.isRelevant(schema, analysis)
    );
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

## 🔄 Integração de Protótipos

### Validação Bidirecional
```typescript
class PrototypeIntegration {
  async validatePrototype(
    prototype: ReactComponent
  ): Promise<ValidationResult> {
    // Extrair informações do protótipo
    const prototypeInfo = await this.analyzePrototype(prototype);
    
    // Carregar documentação relacionada
    const docs = await this.getRelatedDocs(prototypeInfo);
    
    // Validar consistência
    return this.validateConsistency(prototypeInfo, docs);
  }
  
  async generatePrototype(
    docs: Schema[]
  ): Promise<ReactComponent> {
    // Analisar requisitos
    const requirements = await this.extractRequirements(docs);
    
    // Gerar protótipo
    return this.prototypeGenerator.generate(requirements);
  }
}
```

## 📊 Monitoramento de Progresso

### Tracking de Progresso
```typescript
class ProgressTracker {
  async updateProgress(phase: Phase): Promise<void> {
    // Calcular progresso
    const progress = await this.calculateProgress(phase);
    
    // Atualizar timeline
    await this.timeline.updatePhase(phase.id, progress);
    
    // Verificar completude
    if (await this.isPhaseComplete(phase)) {
      await this.handlePhaseCompletion(phase);
    }
  }
  
  private async calculateProgress(
    phase: Phase
  ): Promise<number> {
    const schemas = await this.getPhaseSchemas(phase);
    const completions = await Promise.all(
      schemas.map(s => this.calculateSchemaCompletion(s))
    );
    
    return this.aggregateCompletions(completions);
  }
}
```

### Validação de Completude
```typescript
class CompletenessValidator {
  async validatePhase(phase: Phase): Promise<ValidationResult> {
    const schemas = await this.getPhaseSchemas(phase);
    
    return {
      isComplete: await this.areAllSchemasComplete(schemas),
      missingFields: await this.identifyMissingFields(schemas),
      recommendations: await this.generateRecommendations(schemas)
    };
  }
}
```

## 🔒 Segurança e Persistência

### Gerenciamento de Dados
```typescript
class DataManager {
  async saveProject(project: Project): Promise<void> {
    // Salvar schemas
    await this.saveSchemas(project.schemas);
    
    // Salvar protótipos
    await this.savePrototypes(project.prototypes);
    
    // Salvar metadados
    await this.saveMetadata({
      timeline: project.timeline,
      progress: project.progress,
      history: project.history
    });
  }
}
```

### Controle de Versão
```typescript
class VersionControl {
  async createSnapshot(project: Project): Promise<Snapshot> {
    return {
      timestamp: new Date(),
      schemas: await this.snapshotSchemas(project.schemas),
      prototypes: await this.snapshotPrototypes(project.prototypes),
      metadata: await this.snapshotMetadata(project.metadata)
    };
  }
}
``` 
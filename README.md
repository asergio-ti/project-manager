# Project Manager

## 🎯 Visão Geral

O Project Manager é uma ferramenta avançada de planejamento e documentação de projetos de software, projetada para trabalhar em conjunto com a IDE Cursor. Seu objetivo principal é criar uma base documental robusta e estruturada que possa ser interpretada por IA para futura automação de implementação.

## 🏗️ Propósito

- Criar documentação estruturada e padronizada
- Estabelecer base para automação futura
- Garantir conformidade com padrões e boas práticas
- Facilitar a interpretação por IA
- Manter rastreabilidade de decisões

## 📁 Estrutura do Projeto

```
project-manager/
├── .vscode/             # Configurações compartilhadas VSCode/Cursor
├── .devcontainer/       # Configurações do GitHub Codespaces
├── client/             # Frontend React
├── docker/             # Configurações Docker
├── workspace/          # Área de trabalho
│   ├── _templates/     # Templates e schemas
│   └── projects/       # Projetos gerenciados
└── scripts/           # Scripts de automação
```

### 📂 Detalhamento dos Diretórios

#### .vscode/
- Configurações compartilhadas entre ambientes
- Extensões recomendadas
- Configurações de terminal
- Exclusões de watch
- Perfis de desenvolvimento

#### .devcontainer/
- Configurações do GitHub Codespaces
- Definições de container de desenvolvimento
- Configurações de ambiente
- Integrações com serviços

#### .cursor/
- Contém as regras e configurações para a IDE Cursor
- Define o fluxo de entrevistas
- Estabelece regras de inferência
- Configura análise contextual

#### guides/
- Documentação sobre uso do sistema
- Guias de entrevista estruturada
- Melhores práticas
- Exemplos de uso

#### managed-projects/
- Armazena os projetos gerenciados
- Cada projeto possui sua própria estrutura
- Mantém histórico de decisões
- Documentação específica do projeto

#### schemas/
Conjunto de schemas JSON para validação e estruturação:

##### core/
- Schemas fundamentais
- Definições base
- Tipos comuns
- Validações básicas

##### dadi/
- Documentação de API
- Especificações de interfaces
- Definições de endpoints
- Modelos de dados

##### das/
- Decisões arquiteturais
- Visões arquiteturais
- Componentes e interfaces
- Padrões e qualidade
- Segurança e performance
- Deployment e infraestrutura

##### drs/
- Requisitos de desenvolvimento
- Especificações técnicas
- Restrições de implementação
- Padrões de código

##### dvp/
- Documentação de visão
- Proposta de solução
- Contexto do projeto
- Objetivos e escopo

##### iso/
- Conformidade com ISO
- Padrões internacionais
- Requisitos de qualidade
- Normas específicas

#### scripts/
Scripts de automação e gerenciamento:

##### managers/
- Gerenciadores específicos
- Inicializadores de projeto
- Validadores de schema
- Analisadores de contexto

##### Scripts Principais:
- `contextAnalyzer.ts`: Análise de contexto do projeto
- `projectInterviewer.ts`: Condução de entrevistas
- `create-project.ts`: Criação de novos projetos
- `schemaWatcher.ts`: Monitoramento de schemas

## 🔄 Fluxo de Trabalho

### 1. Fase Inicial - DVP (Documentação de Visão e Proposta)
1. Entrevista inicial
2. Documentação da visão
3. Definição da proposta
4. Análise contextual
5. Definição de objetivos e escopo

### 2. Fase de Requisitos - DRS (Documento de Requisitos de Software)
1. Levantamento de requisitos funcionais
2. Definição de requisitos não-funcionais
3. Restrições técnicas
4. Regras de negócio
5. Validação com stakeholders

### 3. Fase de Arquitetura - DAS (Documento de Arquitetura de Software)
1. Decisões arquiteturais
2. Definição de componentes
3. Especificação de interfaces
4. Padrões de design
5. Aspectos de qualidade (performance, segurança, escalabilidade)

### 4. Fase de API - DADI (Documento de Arquitetura e Design de Interfaces)
1. Especificação de APIs
2. Definição de endpoints
3. Modelos de dados
4. Protocolos de comunicação
5. Documentação de interfaces

## 🤖 Integração com IA

### Preparação para Automação
- Documentação estruturada
- Schemas validados
- Relacionamentos explícitos
- Contexto completo

### Pontos de Automação Futura
- Geração de código
- Configuração de infraestrutura
- Setup de ambiente
- Implementação de padrões

## 📊 Funcionalidades Principais

### Sistema de Entrevistas
- Entrevistas guiadas
- Extração de informações
- Validação de respostas
- Análise contextual

### Gestão de Documentação
- Geração automática
- Validação contínua
- Versionamento
- Rastreabilidade

### Análise Contextual
- Identificação de padrões
- Sugestões contextuais
- Inferência de requisitos
- Validação de decisões

### Conformidade
- Validação ISO
- Padrões internacionais
- Boas práticas
- Qualidade assegurada

## 🛠️ Uso do Sistema

### Inicialização
```typescript
const projectManager = new ProjectManager();
await projectManager.initialize();
```

### Criação de Projeto
```typescript
const project = await projectManager.createProject({
  name: "novo-projeto",
  type: "web-application",
  context: "e-commerce"
});
```

### Condução de Entrevista
```typescript
const interviewer = new ProjectInterviewer(project);
await interviewer.startInterview();
```

## 📋 Requisitos do Sistema

- Node.js 14+
- TypeScript 4.9+
- IDE Cursor
- Git

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch de feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. 

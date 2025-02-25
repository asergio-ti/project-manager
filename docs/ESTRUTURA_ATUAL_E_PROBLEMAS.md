# Estrutura Atual e Problemas

## Estrutura Atual

```
server/src/
├── core/           # Interfaces base
├── domains/        # Lógica de negócio
├── routes/         # Rotas da API
├── schemas/        # Schemas de validação
├── test/          # Configuração de testes
└── shared/         # Utilitários compartilhados
```

## Problemas Identificados

### 1. Duplicidade de Responsabilidades

#### Problema: Schemas vs Validators
```
# Atual
/schemas/
└── phases/         # Schemas de validação de fases
    └── dadi/
        └── schema.json

/domains/documentation/
└── validators/     # Também valida documentos
    └── schema.validator.ts
```

**Duplicidade**: Temos validação tanto em `schemas/` quanto em `domains/*/validators/`

### 2. Rotas Desconectadas

#### Problema: Rotas fora dos Domínios
```
# Atual
/routes/
└── schemas.ts      # Rotas de schemas

/domains/documentation/
└── controllers/    # Também tem endpoints
    └── docs.controller.ts
```

**Duplicidade**: Endpoints espalhados entre `routes/` e `domains/*/controllers/`

### 3. Testes Descentralizados

#### Problema: Configuração vs Implementação
```
# Atual
/test/
└── setup.ts       # Configuração global de testes

/domains/ai/handlers/__tests__/
└── error.pipeline.test.ts  # Testes específicos
```

**Duplicidade**: Estrutura de testes dividida entre `/test` e `__tests__` nos domínios

## Sugestão de Reorganização

### 1. Schemas e Validação

```typescript
// Proposta: Mover schemas para dentro dos domínios
domains/
└── documentation/
    ├── schemas/           # Schemas JSON
    │   └── phases/
    │       └── dadi.json
    └── validators/        # Validadores
        └── schema.validator.ts
```

### 2. Rotas e Controllers

```typescript
// Proposta: Cada domínio gerencia suas próprias rotas
domains/
└── documentation/
    ├── controllers/      # Lógica do controller
    │   └── docs.controller.ts
    └── routes/          # Definição de rotas
        └── docs.routes.ts
```

### 3. Testes

```typescript
// Proposta: Estrutura clara de testes
test/
├── setup/              # Configuração global
│   └── jest.setup.ts
└── helpers/           # Helpers de teste compartilhados
    └── mocks.ts

domains/
└── ai/
    └── __tests__/     # Testes específicos do domínio
        └── services/
            └── claude.service.test.ts
```

## Plano de Migração

1. **Fase 1: Consolidar Schemas**
   - Mover schemas para seus respectivos domínios
   - Atualizar importações
   - Remover diretório `/schemas`

2. **Fase 2: Reorganizar Rotas**
   - Criar `routes/` em cada domínio
   - Migrar rotas do diretório global
   - Remover diretório `/routes`

3. **Fase 3: Estruturar Testes**
   - Manter apenas configuração global em `/test`
   - Garantir que cada domínio tenha seus próprios testes
   - Padronizar estrutura de testes

## Benefícios da Nova Estrutura

1. **Clareza**
   - Cada domínio é completamente autocontido
   - Schemas, rotas e testes junto com seu código
   - Menos confusão sobre onde colocar as coisas

2. **Manutenibilidade**
   - Tudo relacionado a um domínio está no mesmo lugar
   - Mais fácil de encontrar e modificar código
   - Menos chance de conflitos

3. **Escalabilidade**
   - Novos domínios já seguem o padrão estabelecido
   - Mais fácil de adicionar novas funcionalidades
   - Estrutura consistente em todo o projeto

## Exemplo de Domínio Completo

```
domains/documentation/
├── schemas/                    # Schemas JSON
│   └── phases/
│       └── dadi.schema.json
├── validators/                 # Validadores
│   └── schema.validator.ts
├── controllers/               # Controllers
│   └── docs.controller.ts
├── routes/                   # Rotas
│   └── docs.routes.ts
├── services/                 # Serviços
│   └── docs.service.ts
└── __tests__/               # Testes
    ├── controllers/
    ├── services/
    └── validators/
``` 
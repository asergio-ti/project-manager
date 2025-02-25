# Estrutura do Projeto

## Estrutura Atual (Problemática)
```
src/
├── core/              # Core global
│   └── interfaces/    # Interfaces duplicadas
│
└── domains/
    ├── core/         # Core dos domínios
    │   └── interfaces/
    │
    ├── ai/
    ├── documentation/
    └── projects/
```

## Estrutura Proposta
```
src/
├── core/              # Core global do sistema
│   ├── interfaces/    # Interfaces base do sistema
│   ├── types/        # Tipos base do sistema
│   ├── errors/       # Erros base do sistema
│   └── utils/        # Utilitários globais
│
└── domains/          # Domínios específicos
    ├── ai/
    │   ├── interfaces/     # Interfaces específicas de AI
    │   ├── implementations/
    │   └── ...
    │
    ├── documentation/
    └── projects/
```

## Regras de Organização

1. **Core Global (`/src/core/`)**
   - Contém interfaces, tipos e utilidades base do sistema
   - Não deve depender de nenhum domínio específico
   - Deve ser o mais genérico possível
   - Pode ser extraído como uma biblioteca separada no futuro

2. **Domínios (`/src/domains/`)**
   - Cada domínio tem sua própria estrutura
   - Podem depender do core global
   - Não devem depender de outros domínios diretamente
   - Devem implementar suas próprias interfaces específicas

3. **Dependências**
   ```
   domains/ai -> core
   domains/documentation -> core
   domains/projects -> core
   ```

## Próximos Passos para Reorganização

1. **Fase 1: Consolidação do Core**
   - [ ] Mover interfaces base para `/src/core/interfaces`
   - [ ] Remover `/src/domains/core`
   - [ ] Atualizar importações em todos os arquivos

2. **Fase 2: Reorganização dos Domínios**
   - [ ] Mover interfaces específicas para cada domínio
   - [ ] Atualizar estrutura de pastas dos domínios
   - [ ] Verificar e corrigir dependências

3. **Fase 3: Validação**
   - [ ] Verificar todas as importações
   - [ ] Executar testes
   - [ ] Verificar build do projeto

## Benefícios

1. **Clareza**
   - Estrutura mais clara e intuitiva
   - Separação explícita entre core e domínios
   - Responsabilidades bem definidas

2. **Manutenibilidade**
   - Menos duplicação de código
   - Dependências mais claras
   - Mais fácil de evoluir

3. **Escalabilidade**
   - Facilita adição de novos domínios
   - Permite extrair core como biblioteca
   - Suporta crescimento do projeto 
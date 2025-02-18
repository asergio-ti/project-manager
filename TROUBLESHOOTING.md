# Project Manager - Registro de Problemas e Soluções

## Nova Estratégia de Desenvolvimento (GitHub Codespaces + Cursor IDE)

### Motivação
Após análise dos problemas recorrentes, decidimos migrar para uma solução baseada em GitHub Codespaces com suporte do Cursor IDE, resolvendo:
- Problemas de compatibilidade entre ambientes
- Questões de configuração do WSL2
- Dificuldades com Docker no Windows
- Integração entre ferramentas de desenvolvimento

### Nova Arquitetura
1. **Ambiente Principal (GitHub Codespaces)**:
   - Workspace cloud-based
   - Containers Docker nativos
   - Integração SSH para Cursor IDE
   - Ambiente Node.js pré-configurado
   - Configurações VSCode compartilhadas

2. **Desenvolvimento Local (Cursor IDE)**:
   - Conexão SSH com Codespaces
   - Suporte a WSL2 quando necessário
   - Edição local com sincronização remota
   - Herança de configurações VSCode

3. **Estrutura do Projeto**:
   ```
   project-manager/
   ├── .vscode/          # Configurações compartilhadas VSCode/Cursor
   ├── client/           # Frontend React
   ├── docker/           # Configurações Docker
   ├── workspace/        # Área de trabalho
   │   ├── _templates/   # Templates e schemas
   │   └── projects/     # Projetos gerenciados
   └── scripts/         # Scripts de automação
   ```

### Fluxo de Trabalho
1. **Inicialização**:
   ```bash
   # No GitHub Codespaces
   # 1. Criar novo codespace do repositório
   # 2. Aguardar inicialização do ambiente
   
   # No Cursor IDE
   # Conectar via SSH usando dados fornecidos pelo Codespaces
   ```

2. **Desenvolvimento**:
   - Edição de código via Cursor IDE
   - Execução de comandos no terminal do Codespace
   - Build e testes no ambiente cloud

3. **Deploy**:
   - Build em container Docker
   - Testes automatizados
   - Deploy via CI/CD

## Histórico de Problemas Anteriores

### 1. Versão do Node.js Incompatível
**Problema:** Versão do Node.js (v22.13.1) muito recente causando incompatibilidades.
**Solução:** 
- Especificado range de versão no `package.json`: `"node": ">=16.0.0 <19.0.0"`
- Criado script `update-env.ps1` para configurar variáveis de ambiente
- Documentado processo de instalação da versão correta do Node.js

### 2. Variáveis de Ambiente
**Problema:** Problemas com PATH e reconhecimento de comandos npm/node
**Solução:**
```powershell
# Script update-env.ps1 criado para configurar automaticamente
- Adição dos caminhos do Node.js ao PATH do sistema
- Configuração do npm global
- Verificação automática da instalação
```

### 3. Erro SSL_CRT_FILE e Ambiente Node.js
**Problema:** Múltiplos problemas detectados ao tentar iniciar a aplicação:
1. Erro SSL_CRT_FILE ao tentar `npm start`
2. Comando `npm` não reconhecido mesmo após configuração do PATH

**Detectado em:** 16/02/2024
**Status:** Em Resolução
**Prioridade:** Crítico
**Impacto:** Impede completamente o desenvolvimento

**Análise Detalhada:**
1. SSL_CRT_FILE:
   - Variável de ambiente configurada incorretamente
   - Caminho do arquivo sendo interpretado como "false"
   - Relacionado à configuração de certificados SSL

2. Comando npm não reconhecido:
   - Mesmo após configuração do PATH, o sistema não reconhece o comando
   - Possível necessidade de reinicialização do PowerShell
   - Possível problema na instalação do Node.js

**Tentativas de Solução:**
1. ❌ Tentativa de remover SSL_CRT_FILE manualmente:
   ```powershell
   $env:SSL_CRT_FILE=$null; npm start
   ```
   Resultado: Falhou - npm não reconhecido

2. ✅ Criação de scripts de automação:
   - `setup-environment.ps1`: Script principal que:
     - Limpa variáveis SSL
     - Instala/configura Node.js
     - Configura PATH
     - Reinstala dependências
   - `run-setup.bat`: Script auxiliar para executar como administrador

### 4. Erro de Diretório do NPM
**Problema:** NPM tentando acessar `C:\Windows\system32\package.json` ao invés do diretório do projeto
**Detectado em:** 16/02/2024
**Status:** Em Resolução
**Prioridade:** Alto
**Impacto:** Impede a instalação de dependências e início do projeto

**Análise:**
1. NPM não está reconhecendo o diretório correto do projeto
2. Tentando acessar package.json no diretório do sistema
3. Possível problema com o diretório de trabalho atual

**Solução Implementada:**
1. Adicionado código para garantir diretório correto:
   ```powershell
   $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
   Set-Location $scriptPath
   ```

2. Verificação de package.json:
   ```powershell
   if (-not (Test-Path "package.json")) {
       Write-Error "package.json nao encontrado em $scriptPath"
       Exit 1
   }
   ```

3. Forçar npm a usar o diretório correto:
   ```powershell
   npm config set prefix "$env:USERPROFILE\AppData\Roaming\npm"
   npm --prefix "$scriptPath" install
   npm --prefix "$scriptPath" start
   ```

**Próximos Passos:**
1. Executar script atualizado
2. Verificar se o npm reconhece o diretório correto
3. Confirmar instalação das dependências
4. Tentar iniciar o projeto

## Estrutura do Projeto

### 1. Centralização do Ambiente React
**Problema:** Ambiente React inicialmente dentro do projeto chatConnect
**Solução:**
- Movido para `/client` na raiz do projeto
- Configurado para acessar recursos de outros projetos
- Mantida organização modular dos projetos em `managed-projects`

### 2. Acesso a Arquivos Externos
**Problema:** Create React App (CRA) restringe importações fora do `src`
**Solução:**
- Implementado CRACO para sobrescrever configurações do webpack
- Removido ModuleScopePlugin
- Configurados aliases para importações mais limpas

## Configuração do Build

### 1. Webpack e CRA
**Problema:** Restrições do Create React App para importações externas
**Solução:**
```javascript
// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove restrição de importações
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      );
      // Configura aliases
      webpackConfig.resolve.alias = {
        '@': path.resolve(__dirname, 'src'),
        '@managed-projects': path.resolve(__dirname, '../managed-projects'),
        '@schemas': path.resolve(__dirname, '../schemas'),
        '@scripts': path.resolve(__dirname, '../scripts')
      };
      return webpackConfig;
    }
  }
}
```

### 2. TypeScript Paths
**Problema:** Conflito entre paths absolutos e expectativas do CRA
**Solução:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@managed-projects/*": ["../../managed-projects/*"],
      "@schemas/*": ["../../schemas/*"],
      "@scripts/*": ["../../scripts/*"]
    }
  }
}
```

## Dependências

### 1. Conflitos de Pacotes
**Problema:** Conflitos com workbox-build e dependências de service worker
**Solução:**
- Removidas dependências não essenciais
- Mantido conjunto mínimo de dependências:
  - React e React DOM
  - TypeScript
  - Tailwind CSS
  - CRACO para configuração

### 2. Tipagem React
**Problema:** Erros de tipagem em componentes React
**Solução:**
- Instaladas versões corretas de @types/react e @types/react-dom
- Configurado tsconfig.json para suporte adequado a JSX
- Mantida consistência entre versões de pacotes

## Comandos Úteis

### Limpeza e Reinstalação
```powershell
cd client
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install
```

### Verificação de Ambiente
```powershell
node -v
npm -v
npm list react
```

## Próximos Passos e Melhorias Pendentes

1. [ ] Implementar sistema de carregamento dinâmico de protótipos
2. [ ] Adicionar suporte a visualização de documentação
3. [ ] Melhorar sistema de feedback de erros
4. [ ] Implementar testes automatizados
5. [ ] Adicionar documentação de desenvolvimento

### 5. Problemas com WSL e Docker
**Problema:** Scripts tentando reinstalar WSL quando já está instalado
**Detectado em:** 16/02/2024
**Status:** Resolvido
**Solução:** 
1. Verificar corretamente o estado do WSL:
```powershell
# Verificar WSL e Ubuntu
$wslOutput = wsl -l -v
if ($wslOutput -match "Ubuntu.*Running") {
    Write-Host "WSL2 está ativo e Ubuntu está rodando."
}
```

### 6. Autenticação Sudo no WSL
**Problema:** Dificuldades com autenticação sudo em scripts automatizados
**Detectado em:** 16/02/2024
**Status:** Resolvido
**Solução:**
1. Criar função helper para comandos sudo:
```bash
sudo_exec() {
    echo "senha_aqui" | sudo -S $@
}
```
2. Usar a função para comandos que precisam de sudo:
```bash
sudo_exec service docker start
```

### 7. Inicialização do Docker no WSL
**Problema:** Serviço Docker não iniciando automaticamente no WSL
**Detectado em:** 16/02/2024
**Status:** Resolvido
**Solução:**
1. Verificar estado atual do Docker:
```bash
service docker status
```
2. Iniciar serviço manualmente:
```bash
sudo service docker start
```
3. Para automação, adicionar ao script de inicialização:
```bash
if ! service docker status | grep -q "is running"; then
    sudo service docker start
fi
```

### 8. Integração Windows-WSL
**Problema:** Dificuldades na execução de comandos WSL a partir do Windows
**Detectado em:** 16/02/2024
**Status:** Resolvido
**Solução:**
1. Usar o comando `wsl` corretamente:
```powershell
# Executar comando único
wsl -e bash -c "comando_aqui"

# Executar múltiplos comandos
wsl -e bash -c @"
comando1
comando2
"@
```

### 9. Ambiente de Desenvolvimento WSL
**Problema:** Necessidade de manter consistência entre ambientes Windows e WSL
**Detectado em:** 16/02/2024
**Status:** Resolvido
**Solução:**
1. Estrutura de diretórios padronizada:
```
Windows (Cursor Workspace):
C:\projetos\.manager\project-manager\
├── client/           # Frontend React
├── docker/           # Configurações Docker
├── managed-projects/ # Projetos gerenciados
└── schemas/          # Schemas JSON

WSL (Ubuntu):
/home/ajunior/projetos/project-manager/
└── docker/          # Scripts de gerenciamento
```

2. Variáveis de ambiente consistentes:
```powershell
[System.Environment]::SetEnvironmentVariable("CURSOR_WSL_PROJECT_PATH", "/home/ajunior/projetos/project-manager", "User")
[System.Environment]::SetEnvironmentVariable("CURSOR_PROJECT_PATH", "C:\projetos\.manager\project-manager", "User")
```

### Boas Práticas Estabelecidas

1. **Verificação de Ambiente:**
   - Sempre verificar estado atual antes de tentar instalação
   - Usar comandos apropriados para cada ambiente (Windows/WSL)
   - Validar permissões e requisitos antes de executar comandos

2. **Automação:**
   - Criar scripts idempotentes (seguros para executar múltiplas vezes)
   - Incluir tratamento de erros e feedback visual
   - Documentar passos e comandos importantes

3. **Integração:**
   - Manter consistência entre ambientes Windows e WSL
   - Usar caminhos relativos quando possível
   - Documentar dependências e requisitos

4. **Segurança:**
   - Não expor senhas em logs
   - Usar variáveis de ambiente para informações sensíveis
   - Validar permissões antes de executar comandos privilegiados

### 10. Execução de Scripts no Ambiente Correto
**Problema:** Scripts sendo executados no PowerShell quando deveriam ser no WSL
**Detectado em:** 16/02/2024
**Status:** Resolvido
**Impacto:** Alto - Comandos Linux não funcionam no PowerShell

**Análise:**
1. Tentativas de executar comandos Linux (`sudo`, `service`) diretamente no PowerShell
2. Confusão entre ambientes Windows e WSL
3. Problemas com caminhos e permissões

**Solução:**
1. **Identificar o Ambiente Atual:**
```bash
# No WSL (funciona)
$ pwd
/mnt/c/projetos/.manager/project-manager

# No PowerShell (não funciona)
PS> sudo service docker start
```

2. **Executar no Ambiente Correto:**
```bash
# Se já estiver no WSL:
sudo service docker start

# Se estiver no PowerShell e precisar executar no WSL:
wsl -e bash -c "sudo service docker start"
```

3. **Boas Práticas:**
   - Verificar primeiro em qual ambiente está (`wsl.exe` vs terminal WSL)
   - Usar o terminal WSL diretamente quando possível
   - Evitar alternar entre ambientes desnecessariamente

### 11. Gerenciamento de Serviços no WSL
**Problema:** Dificuldade em gerenciar serviços (como Docker) no WSL
**Detectado em:** 16/02/2024
**Status:** Resolvido
**Impacto:** Alto - Afeta inicialização de containers

**Solução:**
1. **Verificação Correta do Serviço:**
```bash
# Direto no WSL
service docker status

# Via PowerShell
wsl -e bash -c "service docker status"
```

2. **Inicialização do Serviço:**
```bash
# Direto no WSL
sudo service docker start

# Verificar se está rodando
docker ps
```

3. **Automação de Serviços:**
```bash
# Adicionar ao ~/.bashrc para verificar Docker ao iniciar WSL
if service docker status 2>&1 | grep -q "is not running"; then
    sudo service docker start
fi
```

### 12. Integração Cursor IDE com WSL
**Problema:** Necessidade de manter ambiente de desenvolvimento consistente entre Cursor e WSL
**Detectado em:** 16/02/2024
**Status:** Resolvido
**Impacto:** Médio - Afeta workflow de desenvolvimento

**Solução:**
1. **Configuração do Cursor:**
   - Usar terminal integrado WSL
   - Manter workspace no Windows
   - Acessar arquivos via `/mnt/c/...`

2. **Workflow Recomendado:**
```bash
# 1. Abrir Cursor no diretório do projeto
C:\projetos\.manager\project-manager

# 2. No terminal integrado WSL do Cursor
cd /mnt/c/projetos/.manager/project-manager

# 3. Executar comandos Docker
sudo service docker start
docker ps
```

3. **Estrutura de Arquivos:**
   - Manter código-fonte no Windows (para o Cursor)
   - Manter configurações Docker no WSL
   - Usar caminhos relativos em scripts

### Recomendações Atualizadas

1. **Ambiente de Desenvolvimento:**
   - Usar Cursor IDE para edição de código
   - Usar terminal WSL para comandos Docker/Linux
   - Manter consistência entre ambientes

2. **Execução de Scripts:**
   - Verificar ambiente antes de executar
   - Usar comandos apropriados para cada ambiente
   - Documentar requisitos de ambiente

3. **Gerenciamento de Serviços:**
   - Iniciar serviços no ambiente correto
   - Verificar status antes de executar comandos
   - Manter logs de erros e soluções

### 13. Execução de Comandos WSL via PowerShell
**Problema:** Tentativas de executar comandos WSL através do PowerShell resultando em comportamento inconsistente
**Detectado em:** 16/02/2024
**Status:** Resolvido
**Impacto:** Alto - Afeta execução de comandos e configuração do ambiente

**Análise:**
1. Tentativas de executar comandos WSL via PowerShell usando `wsl -e bash -c "comando"`:
   - Comportamento inconsistente
   - Problemas com aspas e caracteres especiais
   - Dificuldade em manter estado entre comandos

2. Problemas identificados:
   - Perda de contexto entre comandos
   - Dificuldade em acessar recursos do WSL
   - Complexidade desnecessária na execução

**Solução:**
1. **Abordagem Direta:**
   - Usar terminal WSL diretamente ao invés de comandos via PowerShell
   - Acessar WSL através do comando `wsl` no terminal
   - Navegar para o diretório correto: `/mnt/c/projetos/.manager/project-manager`

2. **Boas Práticas:**
   - Executar comandos Linux diretamente no ambiente WSL
   - Manter sessão WSL ativa para operações relacionadas
   - Evitar intermediação desnecessária do PowerShell

3. **Workflow Recomendado:**
   ```bash
   # No PowerShell: Abrir WSL
   wsl

   # No terminal WSL
   cd /mnt/c/projetos/.manager/project-manager
   # Executar comandos normalmente
   ```

### 14. Importância da Análise Lógica nas Decisões
**Problema:** Necessidade de estabelecer prioridade na tomada de decisões técnicas
**Detectado em:** 16/02/2024
**Status:** Implementado
**Impacto:** Alto - Afeta qualidade e eficiência das soluções

**Análise:**
1. Hierarquia de Decisão:
   - Lógica técnica como princípio primário
   - Análise de sugestões externas como secundário
   - Validação cruzada de propostas

2. Processo de Avaliação:
   - Avaliar viabilidade técnica primeiro
   - Considerar contexto e limitações
   - Validar sugestões contra princípios estabelecidos

**Implementação:**
1. **Processo de Decisão:**
   ```
   1. Análise Técnica
      - Avaliar viabilidade
      - Considerar limitações
      - Verificar dependências

   2. Avaliação de Sugestões
      - Comparar com análise técnica
      - Validar pressupostos
      - Identificar possíveis problemas

   3. Decisão Final
      - Baseada em evidências técnicas
      - Considerando contexto completo
      - Documentando justificativa
   ```

2. **Critérios de Validação:**
   - Consistência com ambiente atual
   - Viabilidade técnica
   - Eficiência da solução
   - Manutenibilidade

3. **Documentação:**
   - Registrar decisões e justificativas
   - Manter histórico de análises
   - Atualizar documentação conforme necessário

### 15. Gerenciamento de Estado de Terminais
**Problema:** Necessidade de manter controle sobre instâncias de terminal e seus estados
**Detectado em:** 16/02/2024
**Status:** Em Implementação
**Impacto:** Alto - Afeta consistência de operações e rastreabilidade de comandos

**Análise:**
1. Problemas Identificados:
   - Perda de contexto entre chamadas de terminal
   - Dificuldade em rastrear qual terminal está sendo usado
   - Inconsistência no estado do ambiente entre chamadas

2. Requisitos:
   - Rastrear terminal atual (WSL vs PowerShell)
   - Manter histórico de comandos por sessão
   - Preservar estado do ambiente entre chamadas

**Solução:**
1. **Estrutura de Dados para Controle:**
   ```typescript
   interface TerminalState {
     id: string;
     type: 'wsl' | 'powershell';
     currentDirectory: string;
     lastCommand: string;
     environmentVars: Record<string, string>;
     startTime: Date;
     isActive: boolean;
   }

   interface TerminalManager {
     activeTerminals: Map<string, TerminalState>;
     currentTerminal: string | null;
     
     trackTerminal(state: TerminalState): void;
     switchTerminal(id: string): void;
     updateState(id: string, updates: Partial<TerminalState>): void;
     clearTerminal(id: string): void;
   }
   ```

2. **Regras de Gerenciamento:**
   - Criar nova instância apenas quando necessário
   - Reutilizar terminal existente quando possível
   - Registrar mudanças de estado
   - Limpar terminais inativos

3. **Workflow de Uso:**
   ```typescript
   // Exemplo de uso
   const terminalManager = new TerminalManager();

   // Registrar novo terminal
   terminalManager.trackTerminal({
     id: 'wsl-1',
     type: 'wsl',
     currentDirectory: '/mnt/c/projetos/.manager/project-manager',
     lastCommand: null,
     environmentVars: process.env,
     startTime: new Date(),
     isActive: true
   });

   // Atualizar estado após comando
   terminalManager.updateState('wsl-1', {
     lastCommand: 'docker ps',
     currentDirectory: '/mnt/c/projetos/.manager/project-manager/docker'
   });
   ```

4. **Boas Práticas:**
   - Verificar terminal ativo antes de executar comandos
   - Manter registro de mudanças de diretório
   - Documentar alterações de ambiente
   - Limpar recursos não utilizados

**Implementação em Prompt:**
1. **Tracking de Estado:**
   ```typescript
   let currentTerminal: TerminalState | null = null;
   let terminalHistory: TerminalState[] = [];

   function updateTerminalState(command: string, directory: string) {
     if (currentTerminal) {
       currentTerminal.lastCommand = command;
       currentTerminal.currentDirectory = directory;
       terminalHistory.push({...currentTerminal});
     }
   }
   ```

2. **Validação de Ambiente:**
   ```typescript
   function validateTerminalState() {
     if (!currentTerminal) {
       throw new Error('Terminal state not initialized');
     }
     
     if (currentTerminal.type === 'wsl' && 
         !currentTerminal.currentDirectory.startsWith('/mnt')) {
       throw new Error('Invalid WSL directory path');
     }
   }
   ```

3. **Registro de Operações:**
   ```typescript
   function logTerminalOperation(operation: string) {
     console.log(`[${new Date().toISOString()}] ${operation} in ${currentTerminal?.type}`);
   }
   ```

### 16. Problemas de Conexão Cursor-Gitpod
**Problema:** Erro ao tentar conectar Cursor ao Gitpod via botão "Open in Cursor"
**Detectado em:** 17/02/2024
**Status:** Em Resolução
**Impacto:** Alto - Impede a integração direta entre Cursor e Gitpod

**Nova Solução (Método Oficial Gitpod Flex):**
1. **Instalar Gitpod CLI:**
   ```powershell
   # No PowerShell como administrador
   winget install Gitpod.GitpodCLI
   ```

2. **Abrir Ambiente no Cursor:**
   ```powershell
   # Substituir ENV_ID pelo ID do seu ambiente
   gitpod environment open ENV_ID --editor=cursor
   ```

3. **Localizar ID do Ambiente:**
   - O ID está na URL do Gitpod: `app.gitpod.io/details/[ENV_ID]`
   - Ou usar o botão "Copy ID" no ambiente Gitpod

**Solução Alternativa (Se o método oficial falhar):**
1. **Obter Configuração SSH do Gitpod:**
   ```bash
   # No terminal do Gitpod
   gp ssh-config
   ```

2. **Configurar Manualmente no Cursor:**
   - Go → Connect to SSH Host → Add New SSH Host
   - Usar dados fornecidos pelo comando `gp ssh-config`

**Próximos Passos:**
1. Verificar se o Gitpod CLI está instalado corretamente
2. Confirmar que o ambiente está rodando no Gitpod
3. Tentar ambos os métodos de conexão

### 17. Migração de Gitpod para GitHub Codespaces
**Problema:** Dificuldades persistentes com a integração Gitpod-Cursor levando à necessidade de mudança de estratégia
**Detectado em:** Atual
**Status:** Em Implementação
**Impacto:** Alto - Mudança fundamental na estratégia de desenvolvimento

**Análise:**
1. Problemas com Gitpod:
   - Dificuldades na integração com Cursor IDE
   - Problemas de conexão recorrentes
   - Complexidade adicional desnecessária

2. Vantagens do GitHub Codespaces:
   - Integração nativa com GitHub
   - Suporte oficial para conexões SSH
   - Melhor estabilidade e documentação
   - Recursos mais consistentes

**Nova Estratégia (GitHub Codespaces):**
1. **Configuração:**
   ```bash
   # No GitHub Codespaces
   # Acessar através do repositório GitHub
   # Usar opção "Open in Codespace"
   
   # No Cursor IDE
   # Conectar via SSH usando dados do Codespace
   # Menu: Go → Connect to SSH Host
   ```

2. **Benefícios:**
   - Simplificação do workflow
   - Melhor integração com GitHub
   - Suporte mais robusto
   - Documentação oficial extensa

**Próximos Passos:**
1. Criar Codespace para o repositório
2. Configurar ambiente de desenvolvimento
3. Migrar configurações relevantes
4. Atualizar documentação do projeto

---
*Última atualização: 16/02/2024* 
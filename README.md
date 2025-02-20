# Project Manager

## 🚀 Visão Geral
Project Manager é uma ferramenta moderna para gerenciamento de projetos de software, integrando:
- Sistema de entrevistas dinâmicas com IA
- Geração e validação de documentação
- Prototipagem rápida
- Análise de requisitos em tempo real

## 🛠️ Tecnologias
- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Documentação**: Markdown + JSON Schemas
- **Ambiente**: GitHub Codespaces + Docker
- **IDE**: Cursor (com suporte SSH)

## 🔄 Dinâmica de Trabalho

### Ambientes

#### 1. Ambiente Local (Windows)
- **Propósito**: Gerenciamento de código e versionamento
- **Ações Permitidas**:
  - Commits e pushes para o repositório
  - Edição de código
  - Atualização de configurações
  - Edição manual do package.json
- **Ações NÃO Permitidas**:
  - Instalação de dependências (npm install)
  - Execução de builds
  - Execução de testes

#### 2. GitHub Codespace
- **Propósito**: Desenvolvimento e testes
- **Ações Permitidas**:
  - Instalação de dependências (`npm ci`)
  - Execução de builds
  - Execução de testes
  - Desenvolvimento e debug
  - Verificação de atualizações de pacotes

### Fluxo de Trabalho

1. **Gestão de Dependências**:
   ```bash
   # No Codespace (NUNCA no ambiente local):
   npm ci  # Em vez de npm install
   ```

2. **Atualização de Pacotes**:
   ```bash
   # No Codespace:
   npm outdated  # Verifica pacotes desatualizados
   npm install --package-lock-only nome-do-pacote  # Adiciona novo pacote sem instalar
   ```
   - Anote as versões desejadas
   - Atualize manualmente o package.json no ambiente local
   - Faça commit das alterações
   - No Codespace: `git pull && npm ci`

3. **Desenvolvimento**:
   - Codificação no ambiente local
   - Commits e pushes no ambiente local
   - Testes e builds no Codespace

4. **Atualização de Dependências**:
   - Editar package.json no ambiente local
   - Commit e push das alterações
   - Pull e `npm ci` no Codespace

5. **Sincronização**:
   ```bash
   # No Codespace:
   git pull origin main
   npm ci  # Para garantir dependências corretas
   ```

### Boas Práticas
- Manter package.json e package-lock.json sempre versionados
- Usar `npm ci` em vez de `npm install` no Codespace
- Fazer commits atômicos e descritivos
- Testar todas as alterações no Codespace antes de fazer merge
- Ao adicionar/atualizar pacotes:
  1. Verificar compatibilidade no Codespace
  2. Atualizar package.json no ambiente local
  3. Commitar ambos package.json e package-lock.json
  4. Testar novamente no Codespace com `npm ci`

## 🏗️ Arquitetura
```
project-manager/
├── .devcontainer/    # Configuração GitHub Codespaces
├── client/           # Frontend React + Vite
├── docker/           # Configurações Docker
├── docs/            # Documentação
│   ├── schemas/     # JSON Schemas
│   └── templates/   # Templates
└── workspace/       # Área de trabalho
    └── projects/    # Projetos gerenciados
```

## 🚀 Início Rápido

### Usando GitHub Codespaces (Recomendado)
1. Abra o repositório no GitHub
2. Clique em "Code" > "Open with Codespaces"
3. Aguarde a configuração automática
4. Execute:
   ```bash
   cd client
   npm ci  # Use ci em vez de install
   npm run dev
   ```
5. Conecte o Cursor IDE via SSH (instruções abaixo)

### Desenvolvimento Local (Windows)
1. Clone o repositório
2. Configure o Cursor IDE
3. NÃO execute npm install localmente
4. Use o ambiente apenas para gestão de código

### Conexão com Cursor IDE
1. No Codespace, obtenha as credenciais SSH:
```bash
gh codespace ssh --config
```
2. No Cursor IDE:
   - Configure a conexão SSH usando as credenciais
   - Conecte ao ambiente remoto

## 📚 Documentação
- [Arquitetura](./docs/ARCHITECTURE.md)
- [Entrevistas Dinâmicas](./docs/DYNAMIC_INTERVIEWS.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Regras e Configurações](./.cursor/rules.json)

## 🔧 Scripts Disponíveis (Apenas no Codespace)
- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera build de produção
- `npm run preview`: Visualiza build local
- `npm run test`: Executa testes
- `npm run lint`: Verifica código

## 🤝 Contribuindo
1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Desenvolva no ambiente local
4. Teste no Codespace
5. Commit suas mudanças (`git commit -m 'Add: amazing feature'`)
6. Push para a branch (`git push origin feature/AmazingFeature`)
7. Abra um Pull Request

## 📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

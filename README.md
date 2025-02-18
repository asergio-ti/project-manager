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
4. Conecte o Cursor IDE via SSH (instruções abaixo)

### Desenvolvimento Local
1. Clone o repositório
2. Configure Docker e Node.js
3. Execute:
```bash
cd client
npm install
npm run dev
```

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

## 🔧 Scripts Disponíveis
- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera build de produção
- `npm run preview`: Visualiza build local
- `npm run test`: Executa testes
- `npm run lint`: Verifica código

## 🤝 Contribuindo
1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

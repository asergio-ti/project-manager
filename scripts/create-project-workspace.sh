#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se nome do projeto foi fornecido
if [ -z "$1" ]; then
    echo -e "${RED}Por favor, forneça o nome do projeto${NC}"
    echo "Uso: create-project-workspace.sh nome-do-projeto"
    exit 1
fi

PROJECT_NAME=$1
WORKSPACE_DIR="/workspace/projects-workspace/$PROJECT_NAME"

echo -e "${YELLOW}Criando ambiente para o projeto $PROJECT_NAME...${NC}"

# Criar diretório do projeto
mkdir -p $WORKSPACE_DIR

# Criar estrutura básica
cd $WORKSPACE_DIR
mkdir -p {src,docker,docs,tests}

# Criar docker-compose.yml básico
cat > docker/docker-compose.yml << EOF
version: '3.8'

services:
  dev:
    build:
      context: ..
      dockerfile: docker/Dockerfile.dev
    volumes:
      - ../src:/app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    init: true
    tty: true
    stdin_open: true
EOF

# Criar Dockerfile.dev básico
cat > docker/Dockerfile.dev << EOF
FROM node:18.19.1-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF

# Criar package.json básico
cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  }
}
EOF

# Criar arquivo de configuração do VS Code
mkdir -p .vscode
cat > .vscode/settings.json << EOF
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
EOF

# Criar .gitignore
cat > .gitignore << EOF
node_modules/
dist/
.env
*.log
EOF

# Criar README.md básico
cat > README.md << EOF
# $PROJECT_NAME

## Descrição
Projeto criado através do Project Manager.

## Desenvolvimento
1. Clone o repositório
2. Execute: \`cd docker && docker-compose up --build\`
3. Acesse: http://localhost:3000
EOF

echo -e "${GREEN}Ambiente criado com sucesso em $WORKSPACE_DIR${NC}"
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. cd $WORKSPACE_DIR"
echo "2. Personalize os arquivos conforme necessário"
echo "3. Execute: cd docker && docker-compose up --build" 
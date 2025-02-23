#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Validando ambiente de desenvolvimento..."

# Função para verificar comando
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 não encontrado${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 encontrado${NC}"
        return 0
    fi
}

# Função para verificar versão do Node
check_node_version() {
    required_version="16.0.0"
    current_version=$(node -v | cut -d'v' -f2)
    
    if [ "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" = "$required_version" ]; then 
        echo -e "${GREEN}✓ Node.js versão $current_version (>= $required_version)${NC}"
        return 0
    else
        echo -e "${RED}❌ Node.js versão $current_version < $required_version${NC}"
        return 1
    fi
}

# Função para verificar ambiente Gitpod
check_gitpod() {
    if [ -n "$GITPOD_WORKSPACE_ID" ]; then
        echo -e "${GREEN}✓ Executando no Gitpod (ID: $GITPOD_WORKSPACE_ID)${NC}"
        
        # Verificar se estamos no diretório correto
        if [[ "$PWD" == *"/workspace/project-manager"* ]]; then
            echo -e "${GREEN}✓ Diretório de trabalho correto${NC}"
        else
            echo -e "${RED}❌ Diretório de trabalho incorreto${NC}"
            echo -e "${YELLOW}ℹ️  Você deve estar em /workspace/project-manager${NC}"
            return 1
        fi

        # Verificar se a workspace está ativa
        if curl -s "https://$GITPOD_WORKSPACE_ID.ws-us117.gitpod.io" > /dev/null; then
            echo -e "${GREEN}✓ Workspace Gitpod está ativa${NC}"
        else
            echo -e "${RED}❌ Workspace Gitpod não está ativa${NC}"
            echo -e "${YELLOW}ℹ️  Mantenha a aba do Gitpod aberta no browser para manter a conexão SSH${NC}"
            return 1
        fi
        
        return 0
    else
        echo -e "${RED}❌ Não está executando no Gitpod${NC}"
        return 1
    fi
}

# Função para verificar conexão Git
check_git_config() {
    if git config --get remote.origin.url > /dev/null; then
        echo -e "${GREEN}✓ Repositório Git configurado: $(git config --get remote.origin.url)${NC}"
        return 0
    else
        echo -e "${RED}❌ Repositório Git não configurado${NC}"
        return 1
    fi
}

# Função para verificar estrutura do projeto
check_project_structure() {
    local errors=0
    
    # Verificar diretórios principais
    for dir in "client" "server" "docs" "scripts"; do
        if [ -d "$dir" ]; then
            echo -e "${GREEN}✓ Diretório $dir encontrado${NC}"
        else
            echo -e "${RED}❌ Diretório $dir não encontrado${NC}"
            errors=$((errors + 1))
        fi
    done
    
    # Verificar arquivos essenciais
    for file in "package.json" "tsconfig.json"; do
        if [ -f "client/$file" ]; then
            echo -e "${GREEN}✓ $file do cliente encontrado${NC}"
        else
            echo -e "${RED}❌ $file do cliente não encontrado${NC}"
            errors=$((errors + 1))
        fi
        
        if [ -f "server/$file" ]; then
            echo -e "${GREEN}✓ $file do servidor encontrado${NC}"
        else
            echo -e "${RED}❌ $file do servidor não encontrado${NC}"
            errors=$((errors + 1))
        fi
    done
    
    return $errors
}

# Verificar comandos necessários
echo -e "\n📋 Verificando comandos necessários..."
check_command "node" || exit 1
check_command "npm" || exit 1
check_command "git" || exit 1

# Verificar versão do Node
echo -e "\n📋 Verificando versão do Node.js..."
check_node_version || exit 1

# Verificar ambiente Gitpod
echo -e "\n📋 Verificando ambiente Gitpod..."
check_gitpod || exit 1

# Verificar configuração Git
echo -e "\n📋 Verificando configuração Git..."
check_git_config || exit 1

# Verificar estrutura do projeto
echo -e "\n📋 Verificando estrutura do projeto..."
check_project_structure

# Verificar node_modules
echo -e "\n📋 Verificando node_modules..."
if [ -d "client/node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules encontrado no cliente - considere remover e usar 'npm ci'${NC}"
fi

if [ -d "server/node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules encontrado no servidor - considere remover e usar 'npm ci'${NC}"
fi

# Verificar conexão SSH
echo -e "\n📋 Verificando conexão SSH..."
if [ -n "$SSH_CONNECTION" ]; then
    echo -e "${GREEN}✓ Conectado via SSH${NC}"
else
    echo -e "${YELLOW}⚠️  Não conectado via SSH - algumas funcionalidades podem estar limitadas${NC}"
fi

echo -e "\n✅ Validação do ambiente concluída!" 
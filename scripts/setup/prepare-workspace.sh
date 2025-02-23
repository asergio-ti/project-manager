#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Preparando workspace..."

# Função para executar comando com tratamento de erro
run_command() {
    echo -e "\n📋 Executando: $1"
    if eval $1; then
        echo -e "${GREEN}✓ Comando executado com sucesso${NC}"
        return 0
    else
        echo -e "${RED}❌ Erro ao executar comando${NC}"
        return 1
    fi
}

# Verificar se está no Gitpod
if [ -z "$GITPOD_WORKSPACE_ID" ]; then
    echo -e "${RED}❌ Este script deve ser executado apenas no Gitpod${NC}"
    exit 1
fi

# Criar estrutura de diretórios
echo -e "\n📁 Criando estrutura de diretórios..."
mkdir -p scripts/{setup,migration,rollback}
mkdir -p server/src/{domains/{core,documentation,validation}/types,schemas/{core,iso,phases}}

# Limpar node_modules se existir
echo -e "\n🧹 Limpando node_modules..."
if [ -d "client/node_modules" ]; then
    run_command "rm -rf client/node_modules" || exit 1
fi

if [ -d "server/node_modules" ]; then
    run_command "rm -rf server/node_modules" || exit 1
fi

# Instalar dependências do cliente
echo -e "\n📦 Instalando dependências do cliente..."
cd client
run_command "npm ci" || exit 1

# Instalar dependências do servidor
echo -e "\n📦 Instalando dependências do servidor..."
cd ../server
run_command "npm ci" || exit 1

# Voltar para o diretório raiz
cd ..

# Dar permissão de execução aos scripts
echo -e "\n🔒 Configurando permissões dos scripts..."
chmod +x scripts/setup/*.sh
chmod +x scripts/migration/*.sh
chmod +x scripts/rollback/*.sh

echo -e "\n✅ Workspace preparado com sucesso!"
echo -e "\n📋 Próximos passos:"
echo -e "1. Execute os scripts de migração para mover os schemas"
echo -e "2. Valide a estrutura do projeto"
echo -e "3. Inicie o desenvolvimento" 
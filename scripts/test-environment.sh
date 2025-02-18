#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Função para testar componentes
test_component() {
    echo -e "${YELLOW}Testando $1...${NC}"
    if eval $2; then
        echo -e "${GREEN}✓ $1 OK${NC}"
        return 0
    else
        echo -e "${RED}✗ $1 FALHOU${NC}"
        return 1
    fi
}

# Função para verificar portas
check_port() {
    nc -z localhost $1
}

echo -e "${YELLOW}Iniciando testes do ambiente...${NC}\n"

# 1. Testar Node.js
test_component "Node.js" "node -v"

# 2. Testar NPM
test_component "NPM" "npm -v"

# 3. Testar Docker
test_component "Docker" "docker info"

# 4. Testar Docker Compose
test_component "Docker Compose" "docker-compose version"

# 5. Testar SSH
test_component "SSH Server" "service ssh status"

# 6. Verificar diretórios essenciais
echo -e "\n${YELLOW}Verificando diretórios...${NC}"
directories=(
    "client"
    "workspace/projects"
    "workspace/_templates/schemas"
    "docker"
    "scripts"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ $dir existe${NC}"
    else
        echo -e "${RED}✗ $dir não encontrado${NC}"
    fi
done

# 7. Testar portas necessárias
echo -e "\n${YELLOW}Verificando portas...${NC}"
ports=(3000 9229 22)

for port in "${ports[@]}"; do
    if check_port $port; then
        echo -e "${GREEN}✓ Porta $port está disponível${NC}"
    else
        echo -e "${RED}✗ Porta $port não está disponível${NC}"
    fi
done

# 8. Verificar variáveis de ambiente do GitPod
echo -e "\n${YELLOW}Verificando variáveis do GitPod...${NC}"
if [ ! -z "$GITPOD_WORKSPACE_URL" ]; then
    echo -e "${GREEN}✓ GITPOD_WORKSPACE_URL está definida${NC}"
else
    echo -e "${RED}✗ GITPOD_WORKSPACE_URL não está definida${NC}"
fi

if [ ! -z "$GITPOD_WORKSPACE_ID" ]; then
    echo -e "${GREEN}✓ GITPOD_WORKSPACE_ID está definida${NC}"
else
    echo -e "${RED}✗ GITPOD_WORKSPACE_ID não está definida${NC}"
fi

# 9. Testar acesso ao container React
echo -e "\n${YELLOW}Verificando container React...${NC}"
if docker-compose -f docker/docker-compose.yml ps | grep -q "dev"; then
    echo -e "${GREEN}✓ Container React está rodando${NC}"
else
    echo -e "${RED}✗ Container React não está rodando${NC}"
fi

echo -e "\n${YELLOW}Teste de ambiente concluído!${NC}" 
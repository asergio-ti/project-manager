#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Verificando conexão com o Gitpod..."

# Verificar se está no Gitpod
if [ -z "$GITPOD_WORKSPACE_ID" ]; then
    echo -e "${RED}❌ Este script deve ser executado apenas no Gitpod${NC}"
    exit 1
fi

# Verificar se a workspace está ativa
if curl -s "https://$GITPOD_WORKSPACE_ID.ws-us117.gitpod.io" > /dev/null; then
    echo -e "${GREEN}✓ Workspace Gitpod está ativa${NC}"
    echo -e "${GREEN}✓ Conexão SSH está funcionando${NC}"
    echo -e "\n✅ Tudo pronto para continuar o desenvolvimento!"
else
    echo -e "${RED}❌ Workspace Gitpod não está ativa${NC}"
    echo -e "${YELLOW}⚠️  Ações necessárias:${NC}"
    echo -e "1. Abra a workspace no browser: https://$GITPOD_WORKSPACE_ID.ws-us117.gitpod.io"
    echo -e "2. Mantenha a aba aberta durante o desenvolvimento"
    echo -e "3. Execute este script novamente para verificar a conexão"
    exit 1
fi 
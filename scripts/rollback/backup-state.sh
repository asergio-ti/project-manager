#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Obter timestamp atual
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$TIMESTAMP"

echo "📦 Criando backup do estado atual..."

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

# Criar diretório de backup
echo -e "\n📁 Criando diretório de backup..."
mkdir -p "$BACKUP_DIR"

# Função para fazer backup de um diretório
backup_directory() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo -e "\n📦 Fazendo backup de $dir..."
        run_command "tar --exclude='node_modules' --exclude='.git' -czf '$BACKUP_DIR/${name}_backup.tar.gz' $dir" || return 1
    else
        echo -e "${YELLOW}⚠️ Diretório $dir não encontrado - pulando...${NC}"
    fi
}

# Backup dos diretórios principais
backup_directory "client" "client" || exit 1
backup_directory "server" "server" || exit 1
backup_directory "workspace" "workspace" || exit 1
backup_directory "docs" "docs" || exit 1

# Backup dos arquivos de configuração
echo -e "\n📄 Fazendo backup dos arquivos de configuração..."
mkdir -p "$BACKUP_DIR/config"
for file in package.json package-lock.json tsconfig.json .env* .gitignore; do
    if [ -f "$file" ]; then
        run_command "cp $file '$BACKUP_DIR/config/'" || exit 1
    fi
done

# Criar arquivo de metadados do backup
echo -e "\n📝 Criando metadados do backup..."
cat > "$BACKUP_DIR/metadata.json" << EOF
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "gitpod_workspace_id": "$GITPOD_WORKSPACE_ID",
    "git_branch": "$(git rev-parse --abbrev-ref HEAD)",
    "git_commit": "$(git rev-parse HEAD)"
}
EOF

# Criar arquivo de instruções de restauração
cat > "$BACKUP_DIR/RESTORE.md" << EOF
# Instruções de Restauração

Este backup foi criado em $(date) e contém:

1. \`client_backup.tar.gz\`: Código do cliente
2. \`server_backup.tar.gz\`: Código do servidor
3. \`workspace_backup.tar.gz\`: Workspace
4. \`docs_backup.tar.gz\`: Documentação
5. \`config/\`: Arquivos de configuração

## Para restaurar:

1. Extraia os arquivos:
   \`\`\`bash
   tar -xzf client_backup.tar.gz
   tar -xzf server_backup.tar.gz
   tar -xzf workspace_backup.tar.gz
   tar -xzf docs_backup.tar.gz
   \`\`\`

2. Copie os arquivos de configuração:
   \`\`\`bash
   cp config/* ./
   \`\`\`

3. Instale as dependências:
   \`\`\`bash
   cd client && npm ci
   cd ../server && npm ci
   \`\`\`
EOF

# Criar arquivo de log
echo -e "\n📝 Criando log do backup..."
{
    echo "Backup criado em: $(date)"
    echo "Workspace ID: $GITPOD_WORKSPACE_ID"
    echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "Commit: $(git rev-parse HEAD)"
    echo -e "\nArquivos incluídos:"
    ls -lR "$BACKUP_DIR"
} > "$BACKUP_DIR/backup.log"

echo -e "\n✅ Backup concluído com sucesso!"
echo -e "📁 Localização: $BACKUP_DIR"
echo -e "\n📋 Para restaurar este backup:"
echo -e "1. Use o script restore-state.sh"
echo -e "2. Ou siga as instruções em $BACKUP_DIR/RESTORE.md" 
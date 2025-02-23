#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔄 Restaurando backup..."

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

# Verificar se o diretório de backup foi especificado
if [ -z "$1" ]; then
    echo -e "${RED}❌ Especifique o diretório de backup${NC}"
    echo "Uso: $0 <diretório_backup>"
    exit 1
fi

BACKUP_DIR=$1

# Verificar se o diretório de backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Diretório de backup não encontrado: $BACKUP_DIR${NC}"
    exit 1
fi

# Verificar se os arquivos necessários existem
for file in client_backup.tar.gz server_backup.tar.gz workspace_backup.tar.gz docs_backup.tar.gz; do
    if [ ! -f "$BACKUP_DIR/$file" ]; then
        echo -e "${RED}❌ Arquivo de backup não encontrado: $file${NC}"
        exit 1
    fi
done

# Criar backup do estado atual antes de restaurar
echo -e "\n📦 Criando backup do estado atual antes da restauração..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEMP_BACKUP_DIR="backups/pre_restore_$TIMESTAMP"
mkdir -p "$TEMP_BACKUP_DIR"

# Backup rápido do estado atual
for dir in client server workspace docs; do
    if [ -d "$dir" ]; then
        run_command "tar --exclude='node_modules' --exclude='.git' -czf '$TEMP_BACKUP_DIR/${dir}_current.tar.gz' $dir" || exit 1
    fi
done

# Limpar diretórios existentes
echo -e "\n🧹 Limpando diretórios existentes..."
for dir in client server workspace docs; do
    if [ -d "$dir" ]; then
        run_command "rm -rf $dir/*" || exit 1
    else
        mkdir -p "$dir"
    fi
done

# Restaurar arquivos dos backups
echo -e "\n📦 Restaurando arquivos..."
for file in client server workspace docs; do
    echo -e "\n🔄 Restaurando $file..."
    run_command "tar -xzf '$BACKUP_DIR/${file}_backup.tar.gz'" || exit 1
done

# Restaurar arquivos de configuração
echo -e "\n📄 Restaurando arquivos de configuração..."
if [ -d "$BACKUP_DIR/config" ]; then
    run_command "cp $BACKUP_DIR/config/* ./" || exit 1
fi

# Limpar node_modules se existir
echo -e "\n🧹 Limpando node_modules..."
if [ -d "client/node_modules" ]; then
    run_command "rm -rf client/node_modules" || exit 1
fi

if [ -d "server/node_modules" ]; then
    run_command "rm -rf server/node_modules" || exit 1
fi

# Instalar dependências
echo -e "\n📦 Instalando dependências do cliente..."
cd client
run_command "npm ci" || exit 1

echo -e "\n📦 Instalando dependências do servidor..."
cd ../server
run_command "npm ci" || exit 1

# Voltar para o diretório raiz
cd ..

# Criar arquivo de log da restauração
echo -e "\n📝 Criando log da restauração..."
{
    echo "Restauração realizada em: $(date)"
    echo "Backup restaurado de: $BACKUP_DIR"
    echo "Backup temporário em: $TEMP_BACKUP_DIR"
    echo "Workspace ID: $GITPOD_WORKSPACE_ID"
    echo -e "\nMetadados do backup restaurado:"
    cat "$BACKUP_DIR/metadata.json"
} > "restore_$TIMESTAMP.log"

echo -e "\n✅ Restauração concluída com sucesso!"
echo -e "📝 Log da restauração: restore_$TIMESTAMP.log"
echo -e "⚠️  Backup do estado anterior à restauração: $TEMP_BACKUP_DIR" 
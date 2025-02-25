#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Validando estrutura após migração..."

# Função para verificar diretório
check_directory() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ Diretório $name encontrado${NC}"
        
        # Verificar se tem arquivos
        if [ -n "$(ls -A $dir)" ]; then
            echo -e "${GREEN}✓ Diretório $name contém arquivos${NC}"
            return 0
        else
            echo -e "${RED}❌ Diretório $name está vazio${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Diretório $name não encontrado${NC}"
        return 1
    fi
}

# Função para verificar arquivo
check_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ Arquivo $name encontrado${NC}"
        return 0
    else
        echo -e "${RED}❌ Arquivo $name não encontrado${NC}"
        return 1
    fi
}

# Verificar estrutura principal
echo -e "\n📁 Verificando estrutura principal..."
check_directory "server/src/schemas" "schemas"
check_directory "server/src/domains" "domains"

# Verificar schemas
echo -e "\n📁 Verificando schemas..."
check_directory "server/src/schemas/core" "core schemas"
check_directory "server/src/schemas/iso" "iso schemas"
check_directory "server/src/schemas/phases" "phases schemas"

# Verificar subdiretórios ISO
echo -e "\n📁 Verificando subdiretórios ISO..."
for dir in software lifecycle quality assurance; do
    check_directory "server/src/schemas/iso/$dir" "iso/$dir"
done

# Verificar subdiretórios Phases
echo -e "\n📁 Verificando subdiretórios Phases..."
for dir in dvp drs das dadi; do
    check_directory "server/src/schemas/phases/$dir" "phases/$dir"
done

# Verificar domínios
echo -e "\n📁 Verificando domínios..."
for domain in core documentation validation; do
    check_directory "server/src/domains/$domain" "domain/$domain"
    check_directory "server/src/domains/$domain/types" "domain/$domain/types"
done

# Verificar arquivos essenciais
echo -e "\n📄 Verificando arquivos essenciais..."
check_file "server/src/schemas/index.ts" "schemas/index.ts"
check_file "server/src/domains/core/types/index.ts" "core/types/index.ts"

# Verificar log de migração
echo -e "\n📄 Verificando log de migração..."
check_file "migration_log.md" "migration_log.md"

echo -e "\n✅ Validação da estrutura concluída!" 
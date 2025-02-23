#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔄 Iniciando migração dos schemas..."

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

# Criar estrutura de diretórios no servidor
echo -e "\n📁 Criando estrutura de diretórios no servidor..."
mkdir -p server/src/schemas/{core,iso/{software,lifecycle,quality,assurance},phases/{dvp,drs,das,dadi}}
mkdir -p server/src/domains/{core,documentation,validation}/types

# Função para mover e registrar schemas
move_schemas() {
    local source_dir=$1
    local target_dir=$2
    local schema_type=$3
    
    if [ -d "$source_dir" ]; then
        echo -e "\n📦 Movendo schemas $schema_type..."
        
        # Criar diretório de destino se não existir
        mkdir -p "$target_dir"
        
        # Copiar schemas
        if cp -r "$source_dir"/* "$target_dir/" 2>/dev/null; then
            echo -e "${GREEN}✓ Schemas $schema_type movidos com sucesso${NC}"
            
            # Registrar schemas movidos
            echo -e "\n📝 Schemas $schema_type movidos:" >> migration_log.md
            ls -R "$target_dir" >> migration_log.md
            echo -e "\n---\n" >> migration_log.md
        else
            echo -e "${YELLOW}⚠️ Nenhum schema encontrado em $source_dir${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Diretório $source_dir não encontrado${NC}"
    fi
}

# Iniciar log de migração
echo -e "# Log de Migração dos Schemas\n\nData: $(date)\n" > migration_log.md

# Mover schemas do workspace
if [ -d "workspace/_templates/schemas" ]; then
    # Core schemas
    move_schemas "workspace/_templates/schemas/core" "server/src/schemas/core" "core"
    
    # ISO schemas
    for category in software lifecycle quality assurance; do
        move_schemas "workspace/_templates/schemas/iso/$category" "server/src/schemas/iso/$category" "iso/$category"
    done
    
    # Phases schemas - agora movendo da raiz
    for phase in dvp drs das dadi; do
        move_schemas "workspace/_templates/schemas/$phase" "server/src/schemas/phases/$phase" "phases/$phase"
    done
else
    echo -e "${RED}❌ Diretório de schemas não encontrado em workspace/_templates/schemas${NC}"
    exit 1
fi

# Criar arquivo de índice para os schemas
echo -e "\n📝 Criando arquivo de índice para os schemas..."
cat > server/src/schemas/index.ts << EOF
// Core Schemas
export * from './core';

// ISO Schemas
export * from './iso/software';
export * from './iso/lifecycle';
export * from './iso/quality';
export * from './iso/assurance';

// Phases Schemas
export * from './phases/dvp';
export * from './phases/drs';
export * from './phases/das';
export * from './phases/dadi';
EOF

# Criar arquivo de tipos base
echo -e "\n📝 Criando arquivo de tipos base..."
cat > server/src/domains/core/types/index.ts << EOF
export interface BaseDocument {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}
EOF

echo -e "\n✅ Migração dos schemas concluída!"
echo -e "\n📋 Próximos passos:"
echo -e "1. Verifique o arquivo migration_log.md para detalhes da migração"
echo -e "2. Execute o script de validação da estrutura"
echo -e "3. Execute o script de atualização de imports" 
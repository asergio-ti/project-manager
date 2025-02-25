#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔄 Atualizando imports..."

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

# Criar arquivo de log
LOG_FILE="import_updates.md"
echo -e "# Log de Atualização de Imports\n\nData: $(date)\n" > $LOG_FILE

# Função para encontrar arquivos TypeScript
find_ts_files() {
    local dir=$1
    find "$dir" -type f -name "*.ts" -o -name "*.tsx"
}

# Função para atualizar imports em um arquivo
update_imports() {
    local file=$1
    echo -e "\n## Atualizando $file\n" >> $LOG_FILE
    
    # Backup do arquivo original
    cp "$file" "${file}.bak"
    
    # Atualizar imports dos schemas
    sed -i 's|from "\.\.\/\.\.\/_templates\/schemas\/|from "@server\/schemas\/|g' "$file"
    sed -i 's|from "\.\.\/_templates\/schemas\/|from "@server\/schemas\/|g' "$file"
    sed -i 's|from "\.\/_templates\/schemas\/|from "@server\/schemas\/|g' "$file"
    
    # Atualizar imports dos tipos
    sed -i 's|from "\.\.\/types\/|from "@server\/domains\/core\/types\/|g' "$file"
    sed -i 's|from "\.\./validation\/types\/|from "@server\/domains\/validation\/types\/|g' "$file"
    sed -i 's|from "\.\./documentation\/types\/|from "@server\/domains\/documentation\/types\/|g' "$file"
    
    # Registrar mudanças
    echo "\`\`\`diff" >> $LOG_FILE
    diff "${file}.bak" "$file" >> $LOG_FILE
    echo "\`\`\`" >> $LOG_FILE
    
    # Remover backup se não houver erros
    rm "${file}.bak"
}

# Atualizar tsconfig.json para adicionar paths
echo -e "\n📝 Atualizando tsconfig.json..."
cat > server/tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "lib": ["es2017", "es7", "es6"],
    "declaration": true,
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@server/*": ["src/*"],
      "@schemas/*": ["src/schemas/*"],
      "@domains/*": ["src/domains/*"],
      "@types/*": ["src/domains/*/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Atualizar imports no servidor
echo -e "\n📦 Atualizando imports no servidor..."
server_files=$(find_ts_files "server/src")
for file in $server_files; do
    echo -e "\n🔍 Processando: $file"
    update_imports "$file"
done

# Atualizar imports no cliente
echo -e "\n📦 Atualizando imports no cliente..."
client_files=$(find_ts_files "client/src")
for file in $client_files; do
    echo -e "\n🔍 Processando: $file"
    update_imports "$file"
done

# Verificar se houve erros
if [ -f "$LOG_FILE" ]; then
    echo -e "\n✅ Atualização de imports concluída!"
    echo -e "📝 Log das alterações: $LOG_FILE"
    echo -e "\n📋 Próximos passos:"
    echo -e "1. Verifique o arquivo $LOG_FILE para revisar as alterações"
    echo -e "2. Execute 'npm run build' no servidor para validar os imports"
    echo -e "3. Execute 'npm run build' no cliente para validar os imports"
else
    echo -e "\n${RED}❌ Erro ao atualizar imports${NC}"
    exit 1
fi 
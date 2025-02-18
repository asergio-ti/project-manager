#!/bin/bash
set -e

# Configurar permissões SSH
if [ -d "/home/node/.ssh" ]; then
    chmod 700 /home/node/.ssh
    if [ -f "/home/node/.ssh/authorized_keys" ]; then
        chmod 600 /home/node/.ssh/authorized_keys
    fi
fi

# Iniciar o servidor SSH em background
sudo service ssh start

# Se existir um package.json no diretório atual, instalar dependências
if [ -f "package.json" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Se estiver em modo de desenvolvimento, iniciar o servidor de desenvolvimento
if [ "$NODE_ENV" = "development" ]; then
    if [ -f "package.json" ]; then
        echo "Starting development server..."
        npm run dev
    fi
fi

# Manter o container rodando
tail -f /dev/null 
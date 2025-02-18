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

# Se existir um package.json no diretório client, instalar dependências
if [ -f "client/package.json" ]; then
    echo "Installing client dependencies..."
    cd client
    npm install
    
    # Se estiver em modo de desenvolvimento, iniciar o servidor Vite
    if [ "$NODE_ENV" = "development" ]; then
        echo "Starting Vite development server..."
        npm run dev
    fi
    cd ..
fi

# Manter o container rodando
tail -f /dev/null 
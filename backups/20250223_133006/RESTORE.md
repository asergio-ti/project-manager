# Instruções de Restauração

Este backup foi criado em Sun Feb 23 01:30:06 PM UTC 2025 e contém:

1. `client_backup.tar.gz`: Código do cliente
2. `server_backup.tar.gz`: Código do servidor
3. `workspace_backup.tar.gz`: Workspace
4. `docs_backup.tar.gz`: Documentação
5. `config/`: Arquivos de configuração

## Para restaurar:

1. Extraia os arquivos:
   ```bash
   tar -xzf client_backup.tar.gz
   tar -xzf server_backup.tar.gz
   tar -xzf workspace_backup.tar.gz
   tar -xzf docs_backup.tar.gz
   ```

2. Copie os arquivos de configuração:
   ```bash
   cp config/* ./
   ```

3. Instale as dependências:
   ```bash
   cd client && npm ci
   cd ../server && npm ci
   ```

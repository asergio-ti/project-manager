# Guia de Trabalho: Ambiente Local x Codespace

## 📋 Índice
1. [Configuração Inicial](#configuração-inicial)
2. [Fluxo Diário](#fluxo-diário)
3. [Gerenciamento de Dependências](#gerenciamento-de-dependências)
4. [Resolução de Problemas](#resolução-de-problemas)

## Configuração Inicial

### No Ambiente Local (Windows)

Existem duas abordagens para configurar o ambiente local:

#### Opção 1: Usando Diretório Local Existente (Nossa Abordagem Atual)
1. Estrutura do diretório:
   ```
   C:/projetos/.manager/project-manager/
   ```
   
Vantagens:
- Mantém organização personalizada de diretórios
- Facilita backup local
- Permite múltiplos projetos relacionados no mesmo diretório raiz
- Maior controle sobre a estrutura de pastas

#### Opção 2: Usando Git Clone
1. Clone o repositório:
   ```bash
   git clone https://github.com/asergio-ti/project-manager.git
   cd project-manager
   ```

Vantagens:
- Garante cópia limpa do repositório
- Configura automaticamente o remote origin
- Traz todo histórico do Git
- Mais fácil para novos colaboradores iniciarem

Em ambos os casos:
1. Configure o Cursor IDE:
   - Instale o Cursor IDE
   - Configure o Git no Cursor
   - NÃO execute npm install
   - Verifique as configurações do Git:
     ```bash
     git config --list
     git remote -v  # Confirme que o remote está correto
     ```

2. Boas Práticas para Ambiente Local:
   - Mantenha backups regulares
   - Use .gitignore apropriado
   - Mantenha as configurações do Git atualizadas
   - Documente qualquer configuração especial necessária

### No GitHub Codespace
1. Acesse o repositório no GitHub
2. Clique em "Code" > "Open with Codespaces"
3. No terminal do Codespace:
   ```bash
   cd client
   npm ci
   ```

## Fluxo Diário

### 1. Início do Trabalho
No Ambiente Local:
1. Pull das alterações mais recentes:
   ```bash
   git pull origin main
   ```

No Codespace:
1. Pull das alterações:
   ```bash
   git pull origin main
   npm ci  # Sempre após um pull
   ```

### 2. Durante o Desenvolvimento
No Ambiente Local:
- Edite o código
- Faça commits frequentes
- Push das alterações

No Codespace:
- Execute os testes
- Faça o build
- Verifique as alterações em tempo real

### 3. Ao Adicionar/Atualizar Pacotes

No Codespace:
1. Verifique pacotes desatualizados:
   ```bash
   npm outdated
   ```

2. Para adicionar novo pacote (sem instalar):
   ```bash
   npm install --package-lock-only nome-do-pacote
   ```

No Ambiente Local:
1. Atualize manualmente o package.json com as novas versões
2. Commit das alterações:
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: atualiza dependências"
   git push origin main
   ```

No Codespace:
1. Atualize após o push:
   ```bash
   git pull origin main
   npm ci
   ```

## Gerenciamento de Dependências

### Adicionando Nova Dependência

1. No Codespace:
   ```bash
   # Verifique a versão mais recente
   npm view nome-do-pacote versions
   
   # Atualize package-lock sem instalar
   npm install --package-lock-only nome-do-pacote
   ```

2. No Ambiente Local:
   - Adicione a dependência manualmente no package.json
   - Commit e push das alterações

3. No Codespace:
   ```bash
   git pull
   npm ci
   npm test  # Verifique se tudo funciona
   ```

### Atualizando Dependências

1. No Codespace:
   ```bash
   npm outdated  # Lista pacotes desatualizados
   ```

2. No Ambiente Local:
   - Atualize as versões no package.json
   - Commit e push

3. No Codespace:
   ```bash
   git pull
   npm ci
   npm test
   ```

## Resolução de Problemas

### Conflitos no package.json

1. No Ambiente Local:
   - Resolva os conflitos manualmente no package.json
   - NÃO execute npm install
   - Commit da resolução

2. No Codespace:
   ```bash
   git pull
   rm -rf node_modules
   npm ci
   ```

### Erros após Atualização

1. No Codespace:
   - Identifique o erro
   - Reverta para versão anterior no package.json local

2. No Ambiente Local:
   ```bash
   git checkout -- package.json
   # ou
   git revert <commit-hash>
   ```

### Dicas Importantes

1. NUNCA no Ambiente Local:
   - ❌ npm install
   - ❌ npm update
   - ❌ npm audit fix

2. SEMPRE no Codespace:
   - ✅ npm ci
   - ✅ npm test
   - ✅ npm run build

3. Mantenha Versionado:
   - package.json
   - package-lock.json
   - .npmrc (se existir)

4. Commits Claros:
   - feat: nova funcionalidade
   - fix: correção de bug
   - chore: atualização de dependências
   - docs: atualização de documentação

### Casos Especiais

#### Sincronização Inicial do package-lock.json
Quando houver uma dessincronização entre `package.json` e `package-lock.json`:

1. **Exceção Única**: Execute no ambiente local:
   ```bash
   # Apenas uma vez, quando houver dessincronização
   npm install --package-lock-only
   ```
   Este comando:
   - Atualiza apenas o package-lock.json
   - NÃO instala módulos
   - NÃO modifica node_modules

2. **Commit das Alterações**:
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: sincroniza package-lock.json com novas dependências"
   git push origin main
   ```

3. **No Codespace**:
   ```bash
   git pull
   npm ci  # Agora funcionará corretamente
   ```

⚠️ IMPORTANTE: Esta é uma exceção à regra de "não executar npm no ambiente local" e deve ser usada apenas neste caso específico de dessincronização. 
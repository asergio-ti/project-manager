#!/usr/bin/env pwsh

# Configurar encoding UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Iniciando setup do Project Manager..."

# Função para criar diretório se não existir
function EnsureDirectory {
    param([string]$path)
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Criado diretorio: $path"
    }
}

# Função para criar arquivo com conteúdo
function CreateFile {
    param(
        [string]$path,
        [string]$content
    )
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force | Out-Null
        Set-Content -Path $path -Value $content -Encoding UTF8
        Write-Host "Criado arquivo: $path"
    }
}

# Função para fazer backup
function CreateBackup {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backup_$timestamp"
    
    Write-Host "Criando backup..."
    
    # Criar diretório de backup
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Backup de arquivos importantes
    if (Test-Path "schemas") {
        Copy-Item -Path "schemas" -Destination "$backupDir/schemas" -Recurse -Force
    }
    if (Test-Path "workspace/managed-projects") {
        Copy-Item -Path "workspace/managed-projects" -Destination "$backupDir/managed-projects" -Recurse -Force
    }
    
    Write-Host "Backup criado em: $backupDir"
    return $backupDir
}

# Estrutura de diretórios unificada
$directories = @(
    # Client (Aplicação React)
    "client/src/components/Layout",
    "client/src/components/Documentation",
    "client/src/components/Navigation",
    "client/src/domains/interview",
    "client/src/domains/documentation",
    "client/src/domains/validation",
    "client/src/state",
    
    # Workspace
    "workspace/_templates/schemas",
    "workspace/_templates/docs/dvp",
    "workspace/_templates/docs/drs",
    "workspace/_templates/docs/das",
    "workspace/_templates/docs/dadi",
    "workspace/_templates/prototypes/react",
    "workspace/_templates/metadata",
    "workspace/projects",
    
    # Documentação
    "docs"
)

# Criar backup
$backupDir = CreateBackup

# Criar estrutura de diretórios
foreach ($dir in $directories) {
    EnsureDirectory $dir
}

# Mover documentação para pasta docs
Get-ChildItem -Path "*.md" | ForEach-Object {
    if ($_.Name -ne "README.md") {
        Move-Item $_.FullName -Destination "docs/" -Force
        Write-Host "Movido para docs/: $($_.Name)"
    }
}

# Mover schemas para workspace/_templates
if (Test-Path "schemas") {
    Copy-Item -Path "schemas/*" -Destination "workspace/_templates/schemas" -Recurse -Force
    Write-Host "Schemas copiados para workspace/_templates/schemas"
}

# Mover projetos existentes
if (Test-Path "managed-projects") {
    Get-ChildItem -Path "managed-projects" -Directory | ForEach-Object {
        $projectName = $_.Name
        if ($projectName -ne "_template") {
            $destination = "workspace/projects/$projectName"
            $source = $_.FullName
            
            # Garantir que o diretório de destino existe
            EnsureDirectory $destination
            
            # Copiar todo o conteúdo do projeto
            Get-ChildItem -Path $source -Recurse | ForEach-Object {
                $targetPath = $_.FullName.Replace($source, $destination)
                if ($_.PSIsContainer) {
                    EnsureDirectory $targetPath
                } else {
                    Copy-Item -Path $_.FullName -Destination $targetPath -Force
                    Write-Host "Copiado: $($_.Name) -> $targetPath"
                }
            }
            Write-Host "Projeto movido para workspace/projects/: $projectName"
        }
    }
}

# Configuração do workspace
$workspaceConfig = @{
    name = "project-manager"
    version = "0.1.0"
    workspace = @{
        templatesPath = "workspace/_templates"
        projectsPath = "workspace/projects"
        schemasPath = "workspace/_templates/schemas"
    }
    phases = @("DVP", "DRS", "DAS")
    templates = @{
        dvp = "workspace/_templates/docs/dvp"
        drs = "workspace/_templates/docs/drs"
        das = "workspace/_templates/docs/das"
    }
} | ConvertTo-Json -Depth 10

Set-Content -Path "workspace/config.json" -Value $workspaceConfig

Write-Host "`nSetup concluido com sucesso!`n"
Write-Host "Estrutura do projeto:"
Write-Host "   client/               # Aplicacao React"
Write-Host "   └── src/"
Write-Host "       ├── components/   # Componentes React"
Write-Host "       ├── domains/      # Logica de dominio"
Write-Host "       └── state/        # Gerenciamento de estado"
Write-Host ""
Write-Host "   workspace/            # Area de trabalho"
Write-Host "   ├── _templates/      # Templates e schemas"
Write-Host "   └── projects/        # Projetos gerenciados"
Write-Host ""
Write-Host "   docs/                # Documentacao"
Write-Host ""
Write-Host "Notas importantes:"
Write-Host "1. Backup criado em: $backupDir"
Write-Host "2. Schemas originais mantidos e copiados para workspace/_templates/schemas"
Write-Host "3. Documentacao centralizada em docs/"
Write-Host "4. Configuracao do workspace em workspace/config.json"
Write-Host ""
Write-Host "Proximos passos:"
Write-Host "1. Verificar a estrutura criada"
Write-Host "2. Atualizar importacoes no codigo"
Write-Host "3. Executar testes" 
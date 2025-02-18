# Script para copiar projetos
$sourceDir = "managed-projects"
$destDir = "workspace/projects"

# Criar diretório de destino se não existir
if (!(Test-Path -Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
}

# Copiar cada projeto
Get-ChildItem -Path $sourceDir -Directory | ForEach-Object {
    $projectName = $_.Name
    $sourcePath = Join-Path $sourceDir $projectName
    $destPath = Join-Path $destDir $projectName
    
    Write-Host "Copiando projeto $projectName..."
    
    # Criar diretório de destino para o projeto
    if (!(Test-Path -Path $destPath)) {
        New-Item -ItemType Directory -Path $destPath | Out-Null
    }
    
    # Copiar todos os arquivos e subdiretórios
    Copy-Item -Path "$sourcePath\*" -Destination $destPath -Recurse -Force
    
    Write-Host "Projeto $projectName copiado com sucesso para $destPath"
}

Write-Host "Cópia de projetos concluída!" 
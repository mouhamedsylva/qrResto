# Script de démarrage du serveur QR-Order API
# Usage: .\start-server.ps1

Write-Host "🚀 Démarrage du serveur QR-Order API..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si le port 3000 est déjà utilisé
$port = 3000
$processOnPort = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($processOnPort) {
    Write-Host "⚠️  Le port $port est déjà utilisé!" -ForegroundColor Yellow
    Write-Host "Voulez-vous arrêter le processus existant? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "O" -or $response -eq "o") {
        $pid = $processOnPort.OwningProcess | Select-Object -First 1
        Stop-Process -Id $pid -Force
        Write-Host "✅ Processus arrêté" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } else {
        Write-Host "❌ Démarrage annulé" -ForegroundColor Red
        exit
    }
}

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# Nettoyer et recompiler si nécessaire
if (Test-Path "dist") {
    Write-Host "🧹 Nettoyage du dossier dist..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force dist
}

Write-Host "🔨 Compilation du projet..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilation réussie!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Démarrage du serveur sur http://localhost:3000" -ForegroundColor Cyan
    Write-Host "📚 Documentation API: http://localhost:3000/api/docs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Gray
    Write-Host ""
    
    # Démarrer le serveur
    npm run start:dev
} else {
    Write-Host "❌ Erreur de compilation!" -ForegroundColor Red
    Write-Host "Vérifiez les erreurs ci-dessus" -ForegroundColor Red
    exit 1
}

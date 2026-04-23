# Script de vérification du serveur QR-Order API
# Usage: .\check-server.ps1

Write-Host "🔍 Vérification du serveur QR-Order API..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si le port 3000 est utilisé
$port = 3000
$processOnPort = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($processOnPort) {
    $pid = $processOnPort.OwningProcess | Select-Object -First 1
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    
    Write-Host "✅ Serveur en cours d'exécution" -ForegroundColor Green
    Write-Host "   Port: $port" -ForegroundColor Gray
    Write-Host "   PID: $pid" -ForegroundColor Gray
    Write-Host "   Processus: $($process.ProcessName)" -ForegroundColor Gray
    Write-Host ""
    
    # Tester la connexion HTTP
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ API accessible" -ForegroundColor Green
        Write-Host "   URL: http://localhost:3000/api/v1" -ForegroundColor Gray
        Write-Host "   Documentation: http://localhost:3000/api/docs" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  Le serveur est démarré mais l'API ne répond pas" -ForegroundColor Yellow
        Write-Host "   Vérifiez les logs du serveur" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Serveur non démarré" -ForegroundColor Red
    Write-Host "   Démarrez le serveur avec: npm run start:dev" -ForegroundColor Gray
    Write-Host "   Ou utilisez: .\start-server.ps1" -ForegroundColor Gray
}

Write-Host ""

# Vérifier MySQL
Write-Host "🔍 Vérification de MySQL..." -ForegroundColor Cyan
$mysqlProcess = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue

if ($mysqlProcess) {
    Write-Host "✅ MySQL en cours d'exécution" -ForegroundColor Green
} else {
    Write-Host "⚠️  MySQL ne semble pas démarré" -ForegroundColor Yellow
    Write-Host "   Démarrez MySQL avant de lancer le serveur" -ForegroundColor Gray
}

Write-Host ""

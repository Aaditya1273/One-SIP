# Sphira OneChain Deployment Script
# Deploys Move smart contracts to OneChain

Write-Host "🚀 Sphira OneChain Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if OneChain CLI is installed
Write-Host "Checking OneChain CLI..." -ForegroundColor Yellow
$oneVersion = & one --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ OneChain CLI not found!" -ForegroundColor Red
    Write-Host "Please install it first:" -ForegroundColor Yellow
    Write-Host "cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing" -ForegroundColor White
    exit 1
}
Write-Host "✅ OneChain CLI found: $oneVersion" -ForegroundColor Green
Write-Host ""

# Check wallet
Write-Host "Checking wallet..." -ForegroundColor Yellow
$address = & one client active-address 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No active wallet found!" -ForegroundColor Red
    Write-Host "Please run: one client" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Active address: $address" -ForegroundColor Green
Write-Host ""

# Check balance
Write-Host "Checking OCT balance..." -ForegroundColor Yellow
$balance = & one client gas 2>&1
Write-Host $balance
Write-Host ""

# Build contracts
Write-Host "Building Move contracts..." -ForegroundColor Yellow
Set-Location contracts
$buildResult = & one move build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host $buildResult
    Set-Location ..
    exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Run tests
Write-Host "Running tests..." -ForegroundColor Yellow
$testResult = & one move test 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Tests failed!" -ForegroundColor Yellow
    Write-Host $testResult
    Write-Host ""
    $continue = Read-Host "Continue with deployment? (y/N)"
    if ($continue -ne "y") {
        Set-Location ..
        exit 1
    }
} else {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
}
Write-Host ""

# Deploy
Write-Host "Deploying to OneChain..." -ForegroundColor Yellow
Write-Host "This will cost gas. Continue? (y/N)" -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    Set-Location ..
    exit 0
}

Write-Host "Publishing package..." -ForegroundColor Cyan
$deployResult = & one client publish --gas-budget 100000000 2>&1
Write-Host $deployResult

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Copy the Package IDs from the output above" -ForegroundColor White
    Write-Host "2. Update your .env file with the Package IDs" -ForegroundColor White
    Write-Host "3. Restart your development server" -ForegroundColor White
    Write-Host ""
    Write-Host "Example .env:" -ForegroundColor Yellow
    Write-Host "NEXT_PUBLIC_SIP_MANAGER_PACKAGE_ID=0x..." -ForegroundColor Gray
    Write-Host "NEXT_PUBLIC_YIELD_ROUTER_PACKAGE_ID=0x..." -ForegroundColor Gray
    Write-Host "NEXT_PUBLIC_LOCK_VAULT_PACKAGE_ID=0x..." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the error message above." -ForegroundColor Yellow
}

Set-Location ..
Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor Cyan

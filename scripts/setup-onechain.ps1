# OneChain Setup Script
# Helps set up OneChain development environment

Write-Host "🔧 OneChain Setup Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check Rust
Write-Host "Checking Rust installation..." -ForegroundColor Yellow
$rustVersion = & rustc --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Rust not found!" -ForegroundColor Red
    Write-Host "Installing Rust..." -ForegroundColor Yellow
    Write-Host "Please run this command manually:" -ForegroundColor White
    Write-Host "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh" -ForegroundColor Cyan
    exit 1
}
Write-Host "✅ Rust found: $rustVersion" -ForegroundColor Green
Write-Host ""

# Check Cargo
Write-Host "Checking Cargo..." -ForegroundColor Yellow
$cargoVersion = & cargo --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cargo not found!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Cargo found: $cargoVersion" -ForegroundColor Green
Write-Host ""

# Check OneChain CLI
Write-Host "Checking OneChain CLI..." -ForegroundColor Yellow
$oneVersion = & one --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ OneChain CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing OneChain CLI..." -ForegroundColor Yellow
    Write-Host "This may take several minutes..." -ForegroundColor Gray
    
    $installCmd = "cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing"
    Write-Host "Running: $installCmd" -ForegroundColor Cyan
    
    Invoke-Expression $installCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ OneChain CLI installed!" -ForegroundColor Green
        
        # Move binary
        $cargoBin = "$env:USERPROFILE\.cargo\bin"
        if (Test-Path "$cargoBin\one_chain.exe") {
            Move-Item "$cargoBin\one_chain.exe" "$cargoBin\one.exe" -Force
            Write-Host "✅ Binary moved to 'one'" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Installation failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ OneChain CLI found: $oneVersion" -ForegroundColor Green
}
Write-Host ""

# Setup wallet
Write-Host "Setting up OneChain wallet..." -ForegroundColor Yellow
$address = & one client active-address 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "No wallet found. Let's create one!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Save your recovery phrase securely!" -ForegroundColor Red
    Write-Host ""
    
    & one client
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Wallet created!" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Wallet already configured: $address" -ForegroundColor Green
}
Write-Host ""

# Request test tokens
Write-Host "Do you want to request test OCT tokens? (y/N)" -ForegroundColor Yellow
$requestTokens = Read-Host
if ($requestTokens -eq "y") {
    Write-Host "Requesting test OCT..." -ForegroundColor Cyan
    & one client faucet
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test OCT requested!" -ForegroundColor Green
        Write-Host "Check your balance with: one client gas" -ForegroundColor Gray
    }
}
Write-Host ""

# Install Node dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
}
Write-Host ""

# Setup .env
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created!" -ForegroundColor Green
    Write-Host "⚠️  Remember to update it with your API keys!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Build contracts: cd contracts && one move build" -ForegroundColor White
Write-Host "2. Test contracts: one move test" -ForegroundColor White
Write-Host "3. Deploy contracts: one client publish --gas-budget 100000000" -ForegroundColor White
Write-Host "4. Update .env with Package IDs" -ForegroundColor White
Write-Host "5. Run dev server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "- Check balance: one client gas" -ForegroundColor Gray
Write-Host "- Get address: one client active-address" -ForegroundColor Gray
Write-Host "- Request faucet: one client faucet" -ForegroundColor Gray
Write-Host "- Switch network: one client switch --env testnet" -ForegroundColor Gray
Write-Host ""

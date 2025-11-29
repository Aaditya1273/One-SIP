# 🚀 Sphira OneChain - Quick Start Guide

## TL;DR - Get Started in 5 Minutes

```bash
# 1. Setup (Windows)
.\scripts\setup-onechain.ps1

# 2. Deploy contracts
.\scripts\deploy-onechain.ps1

# 3. Update .env with Package IDs

# 4. Run app
npm run dev
```

## What You Need

- ✅ Windows PC (PowerShell scripts included)
- ✅ Node.js 18+
- ✅ Rust & Cargo
- ✅ 10 minutes

## Step-by-Step

### 1️⃣ Install OneChain CLI

**Option A: Automated (Windows)**
```powershell
.\scripts\setup-onechain.ps1
```

**Option B: Manual**
```bash
cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing
mv ~/.cargo/bin/one_chain ~/.cargo/bin/one
```

Verify:
```bash
one --version
# Should show: one_chain 1.0.1-daffaeca2930
```

### 2️⃣ Create Wallet

```bash
one client
```

Follow the prompts:
- Press Enter for Testnet
- Choose key scheme: `0` (ed25519)
- **SAVE YOUR RECOVERY PHRASE!** ⚠️

Your address will look like: `0xb9c83a8b40d3263c9ba40d551514fbac1f8c12e98a4005a0dac072d3549c2442`

### 3️⃣ Get Test OCT

```bash
one client faucet
```

Check balance:
```bash
one client gas
```

### 4️⃣ Install Project Dependencies

```bash
npm install
```

### 5️⃣ Build Smart Contracts

```bash
cd contracts
one move build
```

Expected output:
```
INCLUDING DEPENDENCY One
INCLUDING DEPENDENCY MoveStdlib
BUILDING sphira_defi
```

### 6️⃣ Test Contracts

```bash
one move test
```

Expected output:
```
Running Move unit tests
[ PASS    ] sphira_defi::sip_manager::...
[ PASS    ] sphira_defi::yield_router::...
[ PASS    ] sphira_defi::lock_vault::...
Test result: OK
```

### 7️⃣ Deploy to Testnet

**Option A: Automated (Windows)**
```powershell
cd ..
.\scripts\deploy-onechain.ps1
```

**Option B: Manual**
```bash
one client publish --gas-budget 100000000
```

**Save the Package IDs from output!**

Example output:
```
Published Objects:
  ┌──
  │ PackageID: 0x1234567890abcdef...
  │ Version: 1
  │ Digest: ABC123...
  │ Modules: sip_manager, yield_router, lock_vault
  └──
```

### 8️⃣ Configure Environment

```bash
# Copy example
cp .env.example .env
```

Edit `.env`:
```env
NEXT_PUBLIC_SIP_MANAGER_PACKAGE_ID=0x1234...  # Your Package ID
NEXT_PUBLIC_YIELD_ROUTER_PACKAGE_ID=0x1234... # Same Package ID
NEXT_PUBLIC_LOCK_VAULT_PACKAGE_ID=0x1234...   # Same Package ID
GOOGLE_GEMINI_API_KEY=your_key_here
```

### 9️⃣ Run Application

```bash
npm run dev
```

Open: http://localhost:3000

### 🔟 Connect Wallet

1. Click "Connect OneWallet"
2. Install OneWallet or Sui Wallet extension if needed
3. Approve connection
4. Start using Sphira!

## Features to Test

### ✅ Create SIP
1. Go to SIPs page
2. Click "Create SIP"
3. Set amount: 100 OCT
4. Set frequency: Weekly
5. Confirm transaction

### ✅ Lock Funds
1. Go to Vault page
2. Click "Lock Funds"
3. Amount: 1000 OCT
4. Duration: 7 days
5. Reason: "Emergency Fund"
6. Confirm transaction

### ✅ Optimize Yield
1. Go to Yield page
2. View available pools
3. Deposit to optimal pool
4. Track performance

### ✅ AI Chat
1. Go to Chat page
2. Ask: "What's my portfolio balance?"
3. Try: "/help" for commands

## Troubleshooting

### ❌ "one: command not found"
```bash
# Add to PATH
export PATH="$HOME/.cargo/bin:$PATH"
```

### ❌ "Insufficient gas"
```bash
# Request more test OCT
one client faucet
```

### ❌ "Wallet not connected"
- Install OneWallet or Sui Wallet browser extension
- Refresh page
- Try connecting again

### ❌ "Build failed"
```bash
# Update Rust
rustup update stable

# Clean and rebuild
cd contracts
rm -rf build
one move build
```

### ❌ "Transaction failed"
- Check gas balance: `one client gas`
- Verify Package IDs in .env
- Check network: `one client envs`

## Useful Commands

```bash
# Check version
one --version

# View address
one client active-address

# Check balance
one client gas

# Request faucet
one client faucet

# Switch network
one client switch --env testnet

# View objects
one client objects

# Build contracts
cd contracts && one move build

# Test contracts
one move test

# Deploy contracts
one client publish --gas-budget 100000000
```

## Network Info

### Testnet (Default)
- RPC: https://rpc-testnet.onelabs.cc:443
- Faucet: https://faucet-testnet.onelabs.cc/v1/gas
- Explorer: https://testnet-explorer.onechain.network

### Mainnet
- RPC: https://rpc-mainnet.onelabs.cc:443
- Explorer: https://explorer.onechain.network

## Resources

- 📖 [Full Migration Guide](./MIGRATION_GUIDE.md)
- 📝 [Smart Contract Docs](./contracts/README.md)
- 🔗 [OneChain Docs](https://docs.onechain.network)
- 💬 [Discord Support](https://discord.gg/sphira)

## Next Steps

1. ✅ Deploy to testnet
2. ✅ Test all features
3. ✅ Get Gemini API key for AI chat
4. ✅ Deploy to mainnet
5. ✅ Launch! 🚀

---

**Need help?** Open an issue or join our Discord!

**Ready to launch?** See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for production deployment.

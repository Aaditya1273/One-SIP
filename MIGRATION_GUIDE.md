# Sphira Migration Guide: Stellar → OneChain

## Overview
This guide covers the complete migration from Stellar blockchain to OneChain blockchain.

## Changes Summary

### 1. Framework Upgrade
- **Next.js 14 → Next.js 15**
- **React 18 → React 19**
- Modern App Router with improved performance

### 2. Blockchain Migration
- **Stellar → OneChain**
- **Freighter Wallet → OneWallet (Sui dApp Kit compatible)**
- **Rust/WASM (Soroban) → Move smart contracts**
- **XLM/USDC → OCT token**

### 3. SDK Changes
- **@stellar/stellar-sdk → @mysten/sui**
- **@creit.tech/stellar-wallets-kit → @mysten/dapp-kit**

## Installation Steps

### 1. Install OneChain CLI

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install OneChain CLI
cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing

# Move binary to PATH
mv ~/.cargo/bin/one_chain ~/.cargo/bin/one
```

### 2. Configure OneChain Client

```bash
# Initialize client
one client

# Connect to testnet (press Enter when prompted)
# Select key scheme: 0 for ed25519

# Save your recovery phrase securely!
```

### 3. Request Test OCT Tokens

```bash
# Get your address
one client active-address

# Request test tokens
one client faucet

# Check balance
one client gas
```

### 4. Install Project Dependencies

```bash
# Install Node.js dependencies
npm install

# Or with yarn
yarn install
```

### 5. Build Smart Contracts

```bash
# Navigate to contracts directory
cd contracts

# Build Move contracts
one move build

# Run tests
one move test
```

### 6. Deploy Smart Contracts

```bash
# Deploy to testnet
one client publish --gas-budget 100000000

# Save the Package IDs from the output
# Update .env file with the Package IDs
```

### 7. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Update with your values:
# - Package IDs from deployment
# - Gemini API key
# - Network configuration
```

### 8. Run Development Server

```bash
# Start Next.js dev server
npm run dev

# Open http://localhost:3000
```

## Smart Contract Architecture

### SIP Manager (`sip_manager.move`)
- Handles systematic investment plans
- Supports daily, weekly, monthly frequencies
- Pause/resume/cancel functionality

### Yield Router (`yield_router.move`)
- Routes funds to optimal DeFi pools
- Tracks APY and risk scores
- Auto-allocation based on risk tolerance

### Lock Vault (`lock_vault.move`)
- Time-locked emergency funds
- Multi-sig emergency unlock (3/5 guardians)
- Secure fund protection

## Wallet Integration

### OneWallet Connection
```typescript
import { connectWallet, getPublicKey } from '@/lib/onechain-wallet'

// Connect wallet
const address = await connectWallet()

// Get current address
const publicKey = await getPublicKey()
```

### Transaction Signing
```typescript
import { Transaction } from '@mysten/sui/transactions'
import { signAndExecuteTransaction } from '@/lib/onechain-wallet'

const tx = new Transaction()
// ... add transaction commands
const result = await signAndExecuteTransaction(tx)
```

## Key Differences

### Stellar vs OneChain

| Feature | Stellar | OneChain |
|---------|---------|----------|
| Smart Contract Language | Rust/WASM | Move |
| Wallet | Freighter | OneWallet/Sui Wallet |
| Native Token | XLM | OCT |
| SDK | @stellar/stellar-sdk | @mysten/sui |
| Transaction Finality | 3-5 seconds | 3-5 seconds |
| Gas Fees | ~$0.00001 | ~$0.00001 |

### Code Migration Examples

#### Before (Stellar)
```typescript
import { connectWallet } from '@/lib/stellar-wallet'
const address = await connectWallet()
```

#### After (OneChain)
```typescript
import { connectWallet } from '@/lib/onechain-wallet'
const address = await connectWallet()
```

## Testing

### Test Smart Contracts
```bash
cd contracts
one move test
```

### Test Frontend
```bash
npm run dev
# Connect wallet and test features
```

## Deployment

### Testnet
```bash
# Deploy contracts
cd contracts
one client publish --gas-budget 100000000

# Deploy frontend
npm run build
npm start
```

### Mainnet
```bash
# Switch to mainnet
one client switch --env mainnet

# Deploy contracts
one client publish --gas-budget 100000000

# Update .env with mainnet Package IDs
# Deploy frontend to production
```

## Troubleshooting

### OneChain CLI Issues
```bash
# Check version
one --version

# Reconnect to network
one client switch --env testnet
```

### Wallet Connection Issues
- Ensure OneWallet or Sui-compatible wallet is installed
- Check browser console for errors
- Clear localStorage and reconnect

### Contract Deployment Issues
- Ensure sufficient OCT balance for gas
- Check Move.toml dependencies
- Verify contract syntax with `one move build`

## Resources

- [OneChain Documentation](https://docs.onechain.network)
- [Move Language Book](https://move-language.github.io/move/)
- [Sui dApp Kit](https://sdk.mystenlabs.com/dapp-kit)
- [OneChain GitHub](https://github.com/one-chain-labs/onechain)

## Support

For issues or questions:
- GitHub Issues: [Your Repo]
- Discord: [Your Discord]
- Email: support@sphira.finance

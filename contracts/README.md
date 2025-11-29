# Sphira Smart Contracts (Move)

Move smart contracts for the Sphira DeFi platform on OneChain.

## Contracts

### 1. SIP Manager (`sip_manager.move`)
Handles systematic investment plans with automated recurring deposits.

**Features:**
- Create SIP with custom amount and frequency
- Execute scheduled deposits
- Pause/resume/cancel SIPs
- Track investment history

**Functions:**
```move
public fun create_sip(amount: u64, frequency: u64, clock: &Clock, ctx: &mut TxContext): SIP
public fun execute_sip(sip: &mut SIP, payment: Coin<OCT>, clock: &Clock, ctx: &mut TxContext)
public fun pause_sip(sip: &mut SIP, ctx: &mut TxContext)
public fun resume_sip(sip: &mut SIP, clock: &Clock, ctx: &mut TxContext)
public fun cancel_sip(sip: SIP, ctx: &mut TxContext)
```

### 2. Yield Router (`yield_router.move`)
Routes funds to optimal DeFi pools based on APY and risk.

**Features:**
- Add/manage DeFi pools
- Auto-allocate to best performing pools
- Track portfolio allocations
- Risk-adjusted returns

**Functions:**
```move
public fun add_pool(router: &mut YieldRouter, pool_address: address, apy: u64, risk_score: u8, ctx: &mut TxContext)
public fun create_portfolio(ctx: &mut TxContext): Portfolio
public fun deposit(router: &mut YieldRouter, portfolio: &mut Portfolio, payment: Coin<OCT>, target_pool: address, ctx: &mut TxContext)
public fun get_optimal_pool(router: &YieldRouter, max_risk: u8): address
```

### 3. Lock Vault (`lock_vault.move`)
Secure time-locked vaults with multi-sig emergency unlock.

**Features:**
- Time-locked fund protection
- Multi-sig emergency unlock (3/5 guardians)
- Governance-based emergency access
- Audit trail for all operations

**Functions:**
```move
public fun lock_funds(payment: Coin<OCT>, unlock_duration: u64, reason: vector<u8>, clock: &Clock, ctx: &mut TxContext): LockedVault
public fun unlock_vault(vault: &mut LockedVault, clock: &Clock, ctx: &mut TxContext)
public fun create_emergency_proposal(manager: &VaultManager, vault_id: address, clock: &Clock, ctx: &mut TxContext): EmergencyProposal
public fun approve_emergency_unlock(manager: &VaultManager, proposal: &mut EmergencyProposal, ctx: &mut TxContext)
public fun execute_emergency_unlock(proposal: &mut EmergencyProposal, vault: &mut LockedVault, ctx: &mut TxContext)
```

## Build & Test

### Prerequisites
- OneChain CLI installed (`one --version`)
- Rust toolchain
- Active OneChain wallet

### Build
```bash
one move build
```

### Test
```bash
one move test
```

### Deploy to Testnet
```bash
one client publish --gas-budget 100000000
```

### Deploy to Mainnet
```bash
# Switch to mainnet
one client switch --env mainnet

# Deploy
one client publish --gas-budget 100000000
```

## Usage Examples

### Create a SIP
```bash
one client ptb \
  --move-call <PACKAGE_ID>::sip_manager::create_sip 100000000 86400 @<CLOCK> \
  --gas-budget 10000000
```

### Lock Funds in Vault
```bash
one client ptb \
  --split-coins gas "[1000000000]" \
  --assign coin \
  --move-call <PACKAGE_ID>::lock_vault::lock_funds coin 604800 "Emergency Fund" @<CLOCK> \
  --gas-budget 10000000
```

### Add DeFi Pool
```bash
one client ptb \
  --move-call <PACKAGE_ID>::yield_router::add_pool @<ROUTER> @<POOL_ADDRESS> 1500 5 \
  --gas-budget 10000000
```

## Contract Addresses

After deployment, update these in your `.env` file:

```env
NEXT_PUBLIC_SIP_MANAGER_PACKAGE_ID=0x...
NEXT_PUBLIC_YIELD_ROUTER_PACKAGE_ID=0x...
NEXT_PUBLIC_LOCK_VAULT_PACKAGE_ID=0x...
```

## Security

- All contracts use proper access control
- Time-locks prevent premature withdrawals
- Multi-sig for emergency operations
- Event emission for transparency

## Testing

Run comprehensive tests:
```bash
one move test --coverage
```

## License

MIT License - see LICENSE file for details

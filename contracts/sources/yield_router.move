/// Yield Router - AI-Powered Yield Optimization
/// Routes funds to optimal DeFi pools on OneChain
module sphira_defi::yield_router;

use one::coin::{Self, Coin};
use one::oct::OCT;
use one::object::{Self, UID};
use one::transfer;
use one::tx_context::{Self, TxContext};
use one::event;
use one::vec_map::{Self, VecMap};

/// Error codes
const E_NOT_AUTHORIZED: u64 = 1;
const E_POOL_NOT_FOUND: u64 = 2;
const E_INSUFFICIENT_BALANCE: u64 = 3;
const E_INVALID_ALLOCATION: u64 = 4;

/// DeFi Pool
public struct Pool has store, copy, drop {
    pool_address: address,
    current_apy: u64,      // APY in basis points (e.g., 1500 = 15%)
    risk_score: u8,        // 1-10 risk rating
    tvl: u64,              // Total Value Locked
    is_active: bool,
}

/// Yield Router
public struct YieldRouter has key {
    id: UID,
    admin: address,
    pools: VecMap<address, Pool>,
    total_deposits: u64,
}

/// User Portfolio
public struct Portfolio has key, store {
    id: UID,
    owner: address,
    total_balance: u64,
    allocations: VecMap<address, u64>,
}

/// Events
public struct PoolAdded has copy, drop {
    pool_address: address,
    apy: u64,
}

public struct FundsDeposited has copy, drop {
    user: address,
    amount: u64,
    pool: address,
}

public struct YieldHarvested has copy, drop {
    user: address,
    amount: u64,
}

/// Initialize
fun init(ctx: &mut TxContext) {
    let router = YieldRouter {
        id: object::new(ctx),
        admin: tx_context::sender(ctx),
        pools: vec_map::empty(),
        total_deposits: 0,
    };
    transfer::share_object(router);
}

/// Add a new pool (admin only)
public fun add_pool(
    router: &mut YieldRouter,
    pool_address: address,
    apy: u64,
    risk_score: u8,
    ctx: &mut TxContext
) {
    assert!(router.admin == tx_context::sender(ctx), E_NOT_AUTHORIZED);
    
    let pool = Pool {
        pool_address,
        current_apy: apy,
        risk_score,
        tvl: 0,
        is_active: true,
    };
    
    vec_map::insert(&mut router.pools, pool_address, pool);
    
    event::emit(PoolAdded {
        pool_address,
        apy,
    });
}

/// Create user portfolio
public fun create_portfolio(ctx: &mut TxContext): Portfolio {
    Portfolio {
        id: object::new(ctx),
        owner: tx_context::sender(ctx),
        total_balance: 0,
        allocations: vec_map::empty(),
    }
}

/// Deposit funds and auto-allocate to best pool
public fun deposit(
    router: &mut YieldRouter,
    portfolio: &mut Portfolio,
    payment: Coin<OCT>,
    target_pool: address,
    ctx: &mut TxContext
) {
    assert!(portfolio.owner == tx_context::sender(ctx), E_NOT_AUTHORIZED);
    assert!(vec_map::contains(&router.pools, &target_pool), E_POOL_NOT_FOUND);
    
    let amount = coin::value(&payment);
    
    // Update portfolio
    portfolio.total_balance = portfolio.total_balance + amount;
    
    if (vec_map::contains(&portfolio.allocations, &target_pool)) {
        let current = vec_map::get_mut(&mut portfolio.allocations, &target_pool);
        *current = *current + amount;
    } else {
        vec_map::insert(&mut portfolio.allocations, target_pool, amount);
    };
    
    // Update router stats
    router.total_deposits = router.total_deposits + amount;
    
    // Update pool TVL
    let pool = vec_map::get_mut(&mut router.pools, &target_pool);
    pool.tvl = pool.tvl + amount;
    
    // Transfer to pool (simplified - in production, interact with actual DeFi protocol)
    transfer::public_transfer(payment, target_pool);
    
    event::emit(FundsDeposited {
        user: tx_context::sender(ctx),
        amount,
        pool: target_pool,
    });
}

/// Get optimal pool (highest APY with acceptable risk)
public fun get_optimal_pool(router: &YieldRouter, max_risk: u8): address {
    let pools = &router.pools;
    let keys = vec_map::keys(pools);
    let size = vec_map::size(pools);
    
    let mut best_pool = *vector::borrow(keys, 0);
    let mut best_apy = 0u64;
    let mut i = 0;
    
    while (i < size) {
        let pool_addr = *vector::borrow(keys, i);
        let pool = vec_map::get(pools, &pool_addr);
        
        if (pool.is_active && pool.risk_score <= max_risk && pool.current_apy > best_apy) {
            best_apy = pool.current_apy;
            best_pool = pool_addr;
        };
        
        i = i + 1;
    };
    
    best_pool
}

/// Getters
public fun get_total_balance(portfolio: &Portfolio): u64 { portfolio.total_balance }
public fun get_pool_apy(router: &YieldRouter, pool_addr: address): u64 {
    let pool = vec_map::get(&router.pools, &pool_addr);
    pool.current_apy
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}

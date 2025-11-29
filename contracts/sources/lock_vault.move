/// Lock Vault - Emergency Fund Protection System
/// Secure time-locked vaults with multi-sig emergency unlock
module sphira_defi::lock_vault;

use one::coin::{Self, Coin};
use one::oct::OCT;
use one::object::{Self, UID};
use one::transfer;
use one::tx_context::{Self, TxContext};
use one::clock::{Self, Clock};
use one::event;
use one::vec_set::{Self, VecSet};

/// Error codes
const E_NOT_AUTHORIZED: u64 = 1;
const E_VAULT_LOCKED: u64 = 2;
const E_INSUFFICIENT_APPROVALS: u64 = 3;
const E_ALREADY_APPROVED: u64 = 4;
const E_INVALID_UNLOCK_TIME: u64 = 5;

/// Lock status
const STATUS_LOCKED: u8 = 0;
const STATUS_UNLOCKED: u8 = 1;
const STATUS_EMERGENCY_UNLOCK: u8 = 2;

/// Minimum lock duration (7 days in seconds)
const MIN_LOCK_DURATION: u64 = 604800;

/// Required approvals for emergency unlock
const REQUIRED_APPROVALS: u64 = 3;

/// Locked Vault
public struct LockedVault has key, store {
    id: UID,
    owner: address,
    balance: u64,
    unlock_time: u64,
    status: u8,
    reason: vector<u8>,
    created_at: u64,
}

/// Emergency Unlock Proposal
public struct EmergencyProposal has key, store {
    id: UID,
    vault_id: address,
    proposer: address,
    approvals: VecSet<address>,
    executed: bool,
    created_at: u64,
}

/// Vault Manager
public struct VaultManager has key {
    id: UID,
    admin: address,
    guardians: VecSet<address>,
    total_vaults: u64,
}

/// Events
public struct VaultCreated has copy, drop {
    vault_id: address,
    owner: address,
    amount: u64,
    unlock_time: u64,
}

public struct VaultUnlocked has copy, drop {
    vault_id: address,
    owner: address,
    amount: u64,
}

public struct EmergencyUnlockProposed has copy, drop {
    proposal_id: address,
    vault_id: address,
    proposer: address,
}

public struct EmergencyUnlockExecuted has copy, drop {
    vault_id: address,
    approvals: u64,
}

/// Initialize
fun init(ctx: &mut TxContext) {
    let manager = VaultManager {
        id: object::new(ctx),
        admin: tx_context::sender(ctx),
        guardians: vec_set::empty(),
        total_vaults: 0,
    };
    transfer::share_object(manager);
}

/// Add guardian (admin only)
public fun add_guardian(
    manager: &mut VaultManager,
    guardian: address,
    ctx: &mut TxContext
) {
    assert!(manager.admin == tx_context::sender(ctx), E_NOT_AUTHORIZED);
    vec_set::insert(&mut manager.guardians, guardian);
}

/// Lock funds in vault
public fun lock_funds(
    payment: Coin<OCT>,
    unlock_duration: u64,
    reason: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext
): LockedVault {
    assert!(unlock_duration >= MIN_LOCK_DURATION, E_INVALID_UNLOCK_TIME);
    
    let amount = coin::value(&payment);
    let current_time = clock::timestamp_ms(clock) / 1000;
    let unlock_time = current_time + unlock_duration;
    
    let vault = LockedVault {
        id: object::new(ctx),
        owner: tx_context::sender(ctx),
        balance: amount,
        unlock_time,
        status: STATUS_LOCKED,
        reason,
        created_at: current_time,
    };
    
    // Store the coins (simplified - in production, hold in vault)
    transfer::public_transfer(payment, tx_context::sender(ctx));
    
    event::emit(VaultCreated {
        vault_id: object::uid_to_address(&vault.id),
        owner: tx_context::sender(ctx),
        amount,
        unlock_time,
    });
    
    vault
}

/// Unlock vault (time-based)
public fun unlock_vault(
    vault: &mut LockedVault,
    clock: &Clock,
    ctx: &mut TxContext
) {
    assert!(vault.owner == tx_context::sender(ctx), E_NOT_AUTHORIZED);
    assert!(vault.status == STATUS_LOCKED, E_VAULT_LOCKED);
    
    let current_time = clock::timestamp_ms(clock) / 1000;
    assert!(current_time >= vault.unlock_time, E_VAULT_LOCKED);
    
    vault.status = STATUS_UNLOCKED;
    
    event::emit(VaultUnlocked {
        vault_id: object::uid_to_address(&vault.id),
        owner: vault.owner,
        amount: vault.balance,
    });
}

/// Create emergency unlock proposal
public fun create_emergency_proposal(
    manager: &VaultManager,
    vault_id: address,
    clock: &Clock,
    ctx: &mut TxContext
): EmergencyProposal {
    let sender = tx_context::sender(ctx);
    assert!(vec_set::contains(&manager.guardians, &sender), E_NOT_AUTHORIZED);
    
    let current_time = clock::timestamp_ms(clock) / 1000;
    let mut approvals = vec_set::empty();
    vec_set::insert(&mut approvals, sender);
    
    let proposal = EmergencyProposal {
        id: object::new(ctx),
        vault_id,
        proposer: sender,
        approvals,
        executed: false,
        created_at: current_time,
    };
    
    event::emit(EmergencyUnlockProposed {
        proposal_id: object::uid_to_address(&proposal.id),
        vault_id,
        proposer: sender,
    });
    
    proposal
}

/// Approve emergency unlock
public fun approve_emergency_unlock(
    manager: &VaultManager,
    proposal: &mut EmergencyProposal,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    assert!(vec_set::contains(&manager.guardians, &sender), E_NOT_AUTHORIZED);
    assert!(!vec_set::contains(&proposal.approvals, &sender), E_ALREADY_APPROVED);
    
    vec_set::insert(&mut proposal.approvals, sender);
}

/// Execute emergency unlock
public fun execute_emergency_unlock(
    proposal: &mut EmergencyProposal,
    vault: &mut LockedVault,
    ctx: &mut TxContext
) {
    assert!(!proposal.executed, E_NOT_AUTHORIZED);
    assert!(vec_set::size(&proposal.approvals) >= REQUIRED_APPROVALS, E_INSUFFICIENT_APPROVALS);
    assert!(object::uid_to_address(&vault.id) == proposal.vault_id, E_NOT_AUTHORIZED);
    
    vault.status = STATUS_EMERGENCY_UNLOCK;
    proposal.executed = true;
    
    event::emit(EmergencyUnlockExecuted {
        vault_id: proposal.vault_id,
        approvals: vec_set::size(&proposal.approvals),
    });
}

/// Getters
public fun get_balance(vault: &LockedVault): u64 { vault.balance }
public fun get_unlock_time(vault: &LockedVault): u64 { vault.unlock_time }
public fun get_status(vault: &LockedVault): u8 { vault.status }

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}

/// SIP Manager - Systematic Investment Plan Module
/// Handles automated recurring investments on OneChain
module sphira_defi::sip_manager;

use one::coin::{Self, Coin};
use one::oct::OCT;
use one::object::{Self, UID};
use one::transfer;
use one::tx_context::{Self, TxContext};
use one::clock::{Self, Clock};
use one::event;

/// SIP Status
const STATUS_ACTIVE: u8 = 0;
const STATUS_PAUSED: u8 = 1;
const STATUS_CANCELLED: u8 = 2;
const STATUS_COMPLETED: u8 = 3;

/// Error codes
const E_NOT_AUTHORIZED: u64 = 1;
const E_INVALID_AMOUNT: u64 = 2;
const E_INVALID_FREQUENCY: u64 = 3;
const E_SIP_NOT_ACTIVE: u64 = 4;
const E_INSUFFICIENT_BALANCE: u64 = 5;

/// SIP Frequency (in seconds)
const FREQUENCY_DAILY: u64 = 86400;        // 24 hours
const FREQUENCY_WEEKLY: u64 = 604800;      // 7 days
const FREQUENCY_MONTHLY: u64 = 2592000;    // 30 days

/// Systematic Investment Plan
public struct SIP has key, store {
    id: UID,
    owner: address,
    amount_per_deposit: u64,
    frequency: u64,
    next_execution: u64,
    total_deposits: u64,
    total_invested: u64,
    status: u8,
    created_at: u64,
}

/// SIP Manager - holds all SIPs
public struct SIPManager has key {
    id: UID,
    total_sips: u64,
}

/// Events
public struct SIPCreated has copy, drop {
    sip_id: address,
    owner: address,
    amount: u64,
    frequency: u64,
}

public struct SIPExecuted has copy, drop {
    sip_id: address,
    amount: u64,
    timestamp: u64,
}

public struct SIPCancelled has copy, drop {
    sip_id: address,
    owner: address,
}

/// Initialize the module
fun init(ctx: &mut TxContext) {
    let manager = SIPManager {
        id: object::new(ctx),
        total_sips: 0,
    };
    transfer::share_object(manager);
}

/// Create a new SIP
public fun create_sip(
    amount_per_deposit: u64,
    frequency: u64,
    clock: &Clock,
    ctx: &mut TxContext
): SIP {
    assert!(amount_per_deposit > 0, E_INVALID_AMOUNT);
    assert!(
        frequency == FREQUENCY_DAILY || 
        frequency == FREQUENCY_WEEKLY || 
        frequency == FREQUENCY_MONTHLY,
        E_INVALID_FREQUENCY
    );

    let current_time = clock::timestamp_ms(clock) / 1000;
    let sip = SIP {
        id: object::new(ctx),
        owner: tx_context::sender(ctx),
        amount_per_deposit,
        frequency,
        next_execution: current_time + frequency,
        total_deposits: 0,
        total_invested: 0,
        status: STATUS_ACTIVE,
        created_at: current_time,
    };

    event::emit(SIPCreated {
        sip_id: object::uid_to_address(&sip.id),
        owner: tx_context::sender(ctx),
        amount: amount_per_deposit,
        frequency,
    });

    sip
}

/// Execute SIP deposit
public fun execute_sip(
    sip: &mut SIP,
    payment: Coin<OCT>,
    clock: &Clock,
    ctx: &mut TxContext
) {
    assert!(sip.status == STATUS_ACTIVE, E_SIP_NOT_ACTIVE);
    assert!(sip.owner == tx_context::sender(ctx), E_NOT_AUTHORIZED);
    
    let current_time = clock::timestamp_ms(clock) / 1000;
    assert!(current_time >= sip.next_execution, E_INVALID_FREQUENCY);

    let payment_amount = coin::value(&payment);
    assert!(payment_amount >= sip.amount_per_deposit, E_INSUFFICIENT_BALANCE);

    // Update SIP state
    sip.total_deposits = sip.total_deposits + 1;
    sip.total_invested = sip.total_invested + sip.amount_per_deposit;
    sip.next_execution = current_time + sip.frequency;

    // Transfer payment to yield router (simplified - in production route to yield optimizer)
    transfer::public_transfer(payment, sip.owner);

    event::emit(SIPExecuted {
        sip_id: object::uid_to_address(&sip.id),
        amount: sip.amount_per_deposit,
        timestamp: current_time,
    });
}

/// Pause SIP
public fun pause_sip(sip: &mut SIP, ctx: &mut TxContext) {
    assert!(sip.owner == tx_context::sender(ctx), E_NOT_AUTHORIZED);
    assert!(sip.status == STATUS_ACTIVE, E_SIP_NOT_ACTIVE);
    sip.status = STATUS_PAUSED;
}

/// Resume SIP
public fun resume_sip(sip: &mut SIP, clock: &Clock, ctx: &mut TxContext) {
    assert!(sip.owner == tx_context::sender(ctx), E_NOT_AUTHORIZED);
    assert!(sip.status == STATUS_PAUSED, E_SIP_NOT_ACTIVE);
    
    let current_time = clock::timestamp_ms(clock) / 1000;
    sip.status = STATUS_ACTIVE;
    sip.next_execution = current_time + sip.frequency;
}

/// Cancel SIP
public fun cancel_sip(sip: SIP, ctx: &mut TxContext) {
    assert!(sip.owner == tx_context::sender(ctx), E_NOT_AUTHORIZED);
    
    event::emit(SIPCancelled {
        sip_id: object::uid_to_address(&sip.id),
        owner: sip.owner,
    });

    let SIP { id, owner: _, amount_per_deposit: _, frequency: _, 
              next_execution: _, total_deposits: _, total_invested: _, 
              status: _, created_at: _ } = sip;
    object::delete(id);
}

/// Getters
public fun get_amount(sip: &SIP): u64 { sip.amount_per_deposit }
public fun get_frequency(sip: &SIP): u64 { sip.frequency }
public fun get_total_deposits(sip: &SIP): u64 { sip.total_deposits }
public fun get_total_invested(sip: &SIP): u64 { sip.total_invested }
public fun get_status(sip: &SIP): u8 { sip.status }
public fun get_next_execution(sip: &SIP): u64 { sip.next_execution }

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}

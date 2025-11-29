import { SuiClient, SuiEvent, SuiEventFilter } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'

// OneChain RPC endpoints
const ONECHAIN_RPC = {
  mainnet: 'https://rpc-mainnet.onelabs.cc:443',
  testnet: 'https://rpc-testnet.onelabs.cc:443',
  devnet: 'https://rpc-devnet.onelabs.cc:443',
}

// Use testnet by default
const ACTIVE_NETWORK = process.env.NEXT_PUBLIC_ONECHAIN_NETWORK || 'testnet'
const RPC_URL = ONECHAIN_RPC[ACTIVE_NETWORK as keyof typeof ONECHAIN_RPC]

// Initialize OneChain client
export const oneChainClient = new SuiClient({ url: RPC_URL })

// Package IDs (will be set after deployment)
export const PACKAGE_ID = process.env.NEXT_PUBLIC_SIP_MANAGER_PACKAGE_ID || '0x0'

// Convert MIST to OCT (1 OCT = 1,000,000,000 MIST)
export function mistToOct(mist: string | number): string {
  const amount = BigInt(mist)
  return (Number(amount) / 1_000_000_000).toFixed(2)
}

// Convert OCT to MIST
export function octToMist(oct: string | number): string {
  const amount = Number(oct) * 1_000_000_000
  return Math.floor(amount).toString()
}

// Get all SIPs owned by an address
export async function getUserSIPs(ownerAddress: string) {
  try {
    const objects = await oneChainClient.getOwnedObjects({
      owner: ownerAddress,
      filter: {
        StructType: `${PACKAGE_ID}::sip_manager::SIP`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    })

    return objects.data.map((obj: any) => {
      const fields = obj.data?.content?.fields
      return {
        id: obj.data.objectId,
        owner: fields?.owner,
        amountPerDeposit: mistToOct(fields?.amount_per_deposit || '0'),
        frequency: fields?.frequency,
        nextExecution: fields?.next_execution,
        totalDeposits: fields?.total_deposits,
        totalInvested: mistToOct(fields?.total_invested || '0'),
        status: fields?.status,
        createdAt: fields?.created_at,
      }
    })
  } catch (error) {
    console.error('Error fetching user SIPs:', error)
    return []
  }
}

// Get SIP events for a user
export async function getSIPEvents(ownerAddress: string, limit = 50) {
  try {
    const filter: SuiEventFilter = {
      MoveEventType: `${PACKAGE_ID}::sip_manager::SIPCreated`,
    }

    const events = await oneChainClient.queryEvents({
      query: filter,
      limit,
      order: 'descending',
    })

    return events.data
      .filter((event: SuiEvent) => {
        const parsedJson = event.parsedJson as any
        return parsedJson?.owner === ownerAddress
      })
      .map((event: SuiEvent) => ({
        type: 'SIPCreated',
        timestamp: event.timestampMs,
        txDigest: event.id.txDigest,
        data: event.parsedJson,
      }))
  } catch (error) {
    console.error('Error fetching SIP events:', error)
    return []
  }
}

// Get user's OCT balance
export async function getOCTBalance(address: string): Promise<string> {
  try {
    const balance = await oneChainClient.getBalance({
      owner: address,
      coinType: '0x2::oct::OCT',
    })
    return mistToOct(balance.totalBalance)
  } catch (error) {
    console.error('Error fetching OCT balance:', error)
    return '0'
  }
}

// Get all events for a user (SIP, Yield, Vault)
export async function getAllUserEvents(ownerAddress: string, limit = 100) {
  try {
    const eventTypes = [
      'SIPCreated',
      'SIPExecuted',
      'SIPCancelled',
      'YieldEarned',
      'FundsLocked',
      'FundsUnlocked',
    ]

    const allEvents = await Promise.all(
      eventTypes.map(async (eventType) => {
        try {
          const filter: SuiEventFilter = {
            MoveEventType: `${PACKAGE_ID}::sip_manager::${eventType}`,
          }

          const events = await oneChainClient.queryEvents({
            query: filter,
            limit: Math.floor(limit / eventTypes.length),
            order: 'descending',
          })

          return events.data
            .filter((event: SuiEvent) => {
              const parsedJson = event.parsedJson as any
              // Only return events that belong to this user
              return parsedJson?.owner === ownerAddress
            })
            .map((event: SuiEvent) => ({
              type: eventType,
              timestamp: event.timestampMs,
              txDigest: event.id.txDigest,
              data: event.parsedJson,
            }))
        } catch {
          return []
        }
      })
    )

    // Flatten and sort by timestamp
    return allEvents
      .flat()
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
  } catch (error) {
    console.error('Error fetching user events:', error)
    return []
  }
}

// Get transaction details
export async function getTransaction(txDigest: string) {
  try {
    return await oneChainClient.getTransactionBlock({
      digest: txDigest,
      options: {
        showEffects: true,
        showEvents: true,
        showInput: true,
        showObjectChanges: true,
      },
    })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return null
  }
}

// Calculate portfolio stats
export async function getPortfolioStats(ownerAddress: string) {
  try {
    const [sips, balance, events] = await Promise.all([
      getUserSIPs(ownerAddress),
      getOCTBalance(ownerAddress),
      getAllUserEvents(ownerAddress, 50),
    ])

    const activeSIPs = sips.filter((sip) => sip.status === 0).length
    const totalInvested = sips.reduce(
      (sum, sip) => sum + parseFloat(sip.totalInvested),
      0
    )

    // Calculate yield from events
    const yieldEvents = events.filter((e) => e.type === 'YieldEarned')
    const totalYield = yieldEvents.reduce((sum, event: any) => {
      const amount = event.data?.amount || '0'
      return sum + parseFloat(mistToOct(amount))
    }, 0)

    return {
      totalValue: parseFloat(balance) + totalInvested,
      currentBalance: parseFloat(balance),
      activeSIPs,
      totalInvested,
      totalYield,
      returnPercentage:
        totalInvested > 0 ? ((totalYield / totalInvested) * 100) : 0,
    }
  } catch (error) {
    console.error('Error calculating portfolio stats:', error)
    return {
      totalValue: 0,
      currentBalance: 0,
      activeSIPs: 0,
      totalInvested: 0,
      totalYield: 0,
      returnPercentage: 0,
    }
  }
}

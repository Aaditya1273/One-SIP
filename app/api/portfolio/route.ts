import { NextRequest, NextResponse } from 'next/server'
import { SuiClient } from '@mysten/sui/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address required' },
        { status: 400 }
      )
    }

    // Create server-side OneChain client
    const client = new SuiClient({
      url: process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443'
    })

    // Get package ID from environment
    const packageId = process.env.NEXT_PUBLIC_SIP_MANAGER_PACKAGE_ID!

    // Fetch SIP objects owned by the user
    const objects = await client.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${packageId}::sip_manager::SIP`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    })

    // Get wallet balance
    const balance = await client.getBalance({
      owner: userAddress,
      coinType: '0x2::oct::OCT', // OneChain native token
    })
    const walletBalance = parseInt(balance.totalBalance) / 1_000_000_000

    // Parse SIP data and calculate stats
    let activeSIPs = 0
    let totalInvested = 0

    for (const obj of objects.data) {
      if (obj.data?.content && 'fields' in obj.data.content) {
        const fields = obj.data.content.fields as any
        const status = parseInt(fields.status)
        const invested = parseInt(fields.total_invested) / 1_000_000_000

        if (status === 0) { // Active
          activeSIPs++
        }
        totalInvested += invested
      }
    }

    // Total portfolio value = wallet balance + invested in SIPs
    const totalValue = walletBalance + totalInvested
    const totalReturn = 0 // No yield calculation yet
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        totalValue,
        currentBalance: walletBalance,
        activeSIPs,
        totalInvested,
        totalReturn,
        returnPercentage,
        totalLocked: 0, // Vault not implemented yet
      },
    })
  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getUserSIPs } from '@/lib/onechain-client'

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

    // Get real SIP data from OneChain
    const sips = await getUserSIPs(userAddress)

    return NextResponse.json({
      success: true,
      data: sips.map((sip) => ({
        id: sip.id,
        name: `SIP #${sip.id.slice(0, 8)}`,
        token: 'OCT',
        amount: sip.amountPerDeposit,
        frequency: sip.frequency === 86400 ? 'daily' : sip.frequency === 604800 ? 'weekly' : 'monthly',
        status: sip.status === 0 ? 'active' : sip.status === 1 ? 'paused' : sip.status === 2 ? 'cancelled' : 'completed',
        nextExecution: new Date(Number(sip.nextExecution) * 1000).toISOString(),
        totalInvested: sip.totalInvested,
        totalDeposits: sip.totalDeposits,
        createdAt: new Date(Number(sip.createdAt) * 1000).toISOString(),
      })),
    })
  } catch (error) {
    console.error('SIPs API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SIPs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, name, token, amount, frequency } = body

    if (!userAddress || !amount || !frequency) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Return transaction data for client to sign
    // The actual transaction will be signed and executed on the client side
    return NextResponse.json({
      success: true,
      requiresSignature: true,
      message: 'Please sign the transaction in your wallet to create the SIP',
      data: {
        name,
        token,
        amount,
        frequency,
      },
    })
  } catch (error) {
    console.error('Create SIP API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create SIP' },
      { status: 500 }
    )
  }
}

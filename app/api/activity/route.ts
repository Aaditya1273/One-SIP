import { NextRequest, NextResponse } from "next/server"
import { getAllUserEvents, mistToOct } from '@/lib/onechain-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("userAddress")

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: "User address required" },
        { status: 400 }
      )
    }

    // Get real activity data from OneChain
    const events = await getAllUserEvents(userAddress, 50)

    const activities = events.map((event, index) => {
      const data = event.data as any
      
      let title = ''
      let description = ''
      let amount = '0'
      
      switch (event.type) {
        case 'SIPCreated':
          title = 'SIP Created'
          description = 'New systematic investment plan created'
          amount = mistToOct(data?.amount || '0')
          break
        case 'SIPExecuted':
          title = 'SIP Executed'
          description = 'Automated investment executed successfully'
          amount = mistToOct(data?.amount || '0')
          break
        case 'SIPCancelled':
          title = 'SIP Cancelled'
          description = 'Investment plan cancelled'
          amount = '0'
          break
        case 'YieldEarned':
          title = 'Yield Earned'
          description = 'Earned yield from DeFi pools'
          amount = mistToOct(data?.amount || '0')
          break
        case 'FundsLocked':
          title = 'Funds Locked'
          description = 'Funds secured in emergency vault'
          amount = mistToOct(data?.amount || '0')
          break
        case 'FundsUnlocked':
          title = 'Funds Unlocked'
          description = 'Funds released from vault'
          amount = mistToOct(data?.amount || '0')
          break
        default:
          title = 'Transaction'
          description = 'Blockchain transaction'
      }

      return {
        id: index + 1,
        type: event.type.toLowerCase(),
        title,
        description,
        amount,
        token: 'OCT',
        timestamp: new Date(Number(event.timestamp)).toISOString(),
        status: 'success',
        txDigest: event.txDigest,
      }
    })

    return NextResponse.json({
      success: true,
      data: activities,
    })
  } catch (error) {
    console.error("Activity API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity" },
      { status: 500 }
    )
  }
}

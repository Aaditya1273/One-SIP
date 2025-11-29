import { NextRequest, NextResponse } from 'next/server'
import { getAllUserEvents, mistToOct } from '@/lib/onechain-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address required' },
        { status: 400 }
      )
    }

    // Get real events from OneChain blockchain
    const events = await getAllUserEvents(userAddress, limit)

    // Convert events to notifications
    const notifications = events.map((event, index) => {
      const data = event.data as any
      const eventType = event.type

      return {
        id: index + 1,
        type: getNotificationType(eventType),
        title: getEventTitle(eventType),
        message: getEventMessage(eventType, data),
        timestamp: new Date(Number(event.timestamp)).toISOString(),
        read: false, // All new notifications are unread
        priority: getPriority(eventType),
        data: {
          txDigest: event.txDigest,
          amount: data?.amount ? mistToOct(data.amount) : null,
          token: 'OCT',
        },
      }
    })

    // Count unread notifications
    const unreadCount = notifications.filter((n) => !n.read).length

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, action } = body

    if (action === 'markRead') {
      // In a real app, you'd store read status in a database
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Notifications POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// Helper functions
function getNotificationType(eventType: string): string {
  const typeMap: { [key: string]: string } = {
    SIPCreated: 'sip_created',
    SIPExecuted: 'sip_execution',
    SIPCancelled: 'sip_cancelled',
    YieldEarned: 'yield_earned',
    FundsLocked: 'vault_locked',
    FundsUnlocked: 'vault_unlocked',
  }
  return typeMap[eventType] || 'transaction'
}

function getEventTitle(eventType: string): string {
  const titleMap: { [key: string]: string } = {
    SIPCreated: 'SIP Created',
    SIPExecuted: 'SIP Executed',
    SIPCancelled: 'SIP Cancelled',
    YieldEarned: 'Yield Earned',
    FundsLocked: 'Funds Locked',
    FundsUnlocked: 'Funds Unlocked',
  }
  return titleMap[eventType] || 'Blockchain Event'
}

function getEventMessage(eventType: string, data: any): string {
  const amount = data?.amount ? mistToOct(data.amount) : '0'

  switch (eventType) {
    case 'SIPCreated':
      return `New SIP created for ${amount} OCT`
    case 'SIPExecuted':
      return `SIP executed with ${amount} OCT invested`
    case 'SIPCancelled':
      return 'Your SIP has been cancelled'
    case 'YieldEarned':
      return `Earned ${amount} OCT in yield from DeFi pools`
    case 'FundsLocked':
      return `Locked ${amount} OCT in emergency vault`
    case 'FundsUnlocked':
      return `Unlocked ${amount} OCT from vault`
    default:
      return 'Blockchain transaction completed'
  }
}

function getPriority(eventType: string): 'normal' | 'high' | 'urgent' {
  const urgentEvents = ['SIPCancelled', 'FundsUnlocked']
  const highEvents = ['YieldEarned', 'FundsLocked']

  if (urgentEvents.includes(eventType)) return 'urgent'
  if (highEvents.includes(eventType)) return 'high'
  return 'normal'
}

import { type NextRequest, NextResponse } from "next/server"
import { getOneChainClient } from "@/lib/onechain-wallet"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sipId = params.id
    
    if (!sipId) {
      return NextResponse.json({ success: false, error: "Invalid SIP ID" }, { status: 400 })
    }

    // Get SIP data from OneChain blockchain
    const client = getOneChainClient()
    const object = await client.getObject({
      id: sipId,
      options: {
        showContent: true,
        showType: true,
      },
    })

    if (!object.data?.content || !('fields' in object.data.content)) {
      return NextResponse.json({ success: false, error: "SIP not found on blockchain" }, { status: 404 })
    }

    const fields = object.data.content.fields as any
    
    // Format SIP data
    const sipData = {
      id: sipId,
      sip_id: sipId,
      user_address: fields.owner,
      amount: (parseInt(fields.amount_per_deposit || '0') / 1e9).toString(),
      frequency: fields.frequency === '86400' ? 'Daily' : fields.frequency === '604800' ? 'Weekly' : 'Monthly',
      status: fields.status === 0 ? 'Active' : fields.status === 1 ? 'Paused' : 'Cancelled',
      created_at: new Date(parseInt(fields.created_at || '0') * 1000).toISOString(),
      next_execution: new Date(parseInt(fields.next_execution || '0') * 1000).toISOString(),
      total_deposits: fields.total_deposits?.toString() || '0',
      total_invested: (parseInt(fields.total_invested || '0') / 1e9).toString(),
      execution_count: parseInt(fields.total_deposits || '0'),
      apy_target: 12.5,
      token_symbol: 'OCT',
    }

    return NextResponse.json({
      success: true,
      data: sipData,
    })
  } catch (error) {
    console.error("Error fetching SIP from blockchain:", error)
    return NextResponse.json({ success: false, error: "SIP not found" }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sipId = params.id
    const body = await request.json()
    const { status } = body

    if (!sipId) {
      return NextResponse.json({ success: false, error: "Invalid SIP ID" }, { status: 400 })
    }

    // Return success - actual transaction will be built on frontend
    return NextResponse.json({
      success: true,
      data: {
        sipId,
        newStatus: status,
      },
      message: `SIP status update to ${status} will be processed on frontend`,
    })
  } catch (error) {
    console.error("Error preparing SIP update:", error)
    return NextResponse.json({ success: false, error: "Failed to prepare SIP update" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sipId = params.id

    if (!sipId) {
      return NextResponse.json({ success: false, error: "Invalid SIP ID" }, { status: 400 })
    }

    // Return success - actual transaction will be built on frontend
    return NextResponse.json({
      success: true,
      data: {
        sipId,
      },
      message: "SIP cancellation will be processed on frontend",
    })
  } catch (error) {
    console.error("Error preparing SIP cancellation:", error)
    return NextResponse.json({ success: false, error: "Failed to prepare SIP cancellation" }, { status: 500 })
  }
}
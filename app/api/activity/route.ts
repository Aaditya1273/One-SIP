import { type NextRequest, NextResponse } from "next/server"
import { onechainService } from "@/lib/onechain-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("userAddress")

    if (!userAddress) {
      return NextResponse.json({ success: false, error: "User address required" }, { status: 400 })
    }

    // Get user's SIPs to build activity feed
    const sipIds = await onechainService.getUserSIPs(userAddress)
    
    const activities = []
    
    // Get details for each SIP and create activity entries
    for (const sipId of sipIds.slice(0, 10)) { // Limit to 10 most recent
      const sipDetails = await onechainService.getSIPDetails(sipId) as any
      if (sipDetails) {
        activities.push({
          id: `sip-${sipId}`,
          title: "SIP Created",
          description: `${sipDetails.name || `SIP #${sipId}`} - ${sipDetails.token || 'OCT'}`,
          amount: `${sipDetails.amount || 0} ${sipDetails.token || 'OCT'}`,
          time: sipDetails.created_at ? new Date(sipDetails.created_at).toLocaleDateString() : 'Recently',
          icon: "TrendingUp",
          iconColor: "text-green-600",
          badge: "Active",
          badgeVariant: "default"
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: activities,
    })
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json({ 
      success: true, 
      data: [] // Return empty array on error so UI doesn't break
    })
  }
}

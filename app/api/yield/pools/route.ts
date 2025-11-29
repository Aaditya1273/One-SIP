import { type NextRequest, NextResponse } from "next/server"
import { SuiClient } from '@mysten/sui/client'



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("userAddress")
    const token = searchParams.get("token")
    const minApy = Number.parseFloat(searchParams.get("minApy") || "0")
    const maxRisk = Number.parseInt(searchParams.get("maxRisk") || "10")
    const sortBy = searchParams.get("sortBy") || "apy"

    // Get user balance
    let balance = "0.00"
    let totalYield = "0.00"
    if (userAddress) {
      try {
        // TODO: Implement balance fetching from OneChain
        balance = "0.00"
      } catch (error) {
        console.error("Error getting balance:", error)
      }
    }

    // Create server-side OneChain client
    const client = new SuiClient({
      url: process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL || 'https://rpc-testnet.onelabs.cc:443'
    })

    // Get package ID from environment
    const yieldRouterPackage = process.env.NEXT_PUBLIC_YIELD_ROUTER_PACKAGE_ID!

    let pools: any[] = []

    try {
      // Fetch yield pool objects from OneChain blockchain
      // Note: This assumes yield pools are stored as objects on-chain
      // If they're not deployed yet, this will return empty array
      const objects = await client.getOwnedObjects({
        owner: yieldRouterPackage,
        options: {
          showContent: true,
          showType: true,
        },
      })

      // Parse pool data from blockchain objects
      for (const obj of objects.data) {
        if (obj.data?.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any
          pools.push({
            id: obj.data.objectId,
            name: fields.name || 'OneChain Pool',
            protocol: fields.protocol || 'OneChain',
            apy: parseFloat(fields.apy || '0') / 100,
            tvl: parseInt(fields.tvl || '0'),
            riskScore: parseInt(fields.risk_score || '3'),
            verified: true,
            tokens: fields.tokens || ['OCT'],
            contractAddress: obj.data.objectId,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching yield pools from blockchain:', error)
      // Return empty array if blockchain fetch fails
      pools = []
    }

    // Apply filters
    let filteredPools = [...pools]

    // Filter by token
    if (token) {
      filteredPools = filteredPools.filter((pool: any) =>
        pool.tokens.some((t: string) => t.toUpperCase() === token.toUpperCase())
      )
    }

    // Filter by minimum APY
    if (minApy > 0) {
      filteredPools = filteredPools.filter((pool: any) => pool.apy >= minApy)
    }

    // Filter by maximum risk score
    if (maxRisk < 10) {
      filteredPools = filteredPools.filter((pool: any) => pool.riskScore <= maxRisk)
    }

    // Sort pools
    filteredPools.sort((a: any, b: any) => {
      switch (sortBy) {
        case "apy":
          return b.apy - a.apy
        case "tvl":
          return b.tvl - a.tvl
        case "risk":
          return a.riskScore - b.riskScore
        default:
          return b.apy - a.apy
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        pools: filteredPools,
        balance,
        totalYield
      },
      total: filteredPools.length,
      filters: {
        token,
        minApy,
        maxRisk,
        sortBy,
      },
    })
  } catch (error) {
    console.error("Error fetching yield pools:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch yield pools" }, { status: 500 })
  }
}



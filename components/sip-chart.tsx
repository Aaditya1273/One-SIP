"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Wallet } from "lucide-react"

export function SIPChart() {
  const currentAccount = useCurrentAccount()
  // Generate last 6 months dynamically
  const generateEmptyData = () => {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      months.push({ month: monthName, value: 0, yieldEarned: 0 })
    }
    
    return months
  }

  const [data, setData] = useState(generateEmptyData())
  const [loading, setLoading] = useState(true)
  const [hasRealData, setHasRealData] = useState(false)

  useEffect(() => {
    if (currentAccount) {
      loadRealSIPData()
    } else {
      setLoading(false)
    }
  }, [currentAccount])

  const loadRealSIPData = async () => {
    try {
      setLoading(true)
      
      // Fetch real SIP data from API
      const response = await fetch(`/api/sips?userAddress=${currentAccount?.address}`)
      const result = await response.json()
      
      if (result.success && result.data.length > 0) {
        // Process real SIP data into chart format
        const sipData = result.data
        console.log('📊 SIP Data for chart:', sipData)
        const chartData = generateChartFromSIPs(sipData)
        console.log('📈 Generated chart data:', chartData)
        setData(chartData)
        setHasRealData(true)
      } else {
        // No real SIPs found - show empty state
        setData(generateEmptyData())
        setHasRealData(false)
      }
    } catch (error) {
      console.error("Failed to load real SIP data:", error)
      setHasRealData(false)
    } finally {
      setLoading(false)
    }
  }

  const generateChartFromSIPs = (sips: any[]) => {
    const now = new Date()
    const chartData = []
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
      
      // Calculate cumulative value based on real SIP executions
      let totalValue = 0
      let totalYield = 0
      
      sips.forEach(sip => {
        const sipStartDate = new Date(sip.created_at)
        const sipCreatedMonth = new Date(sipStartDate.getFullYear(), sipStartDate.getMonth(), 1)
        
        // Only show data for months after SIP was created
        if (monthDate >= sipCreatedMonth) {
          // Calculate how many executions would have happened by this month
          const monthsDiff = (monthDate.getFullYear() - sipStartDate.getFullYear()) * 12 + 
                            (monthDate.getMonth() - sipStartDate.getMonth())
          
          const executionsPerMonth = sip.frequency === 'DAILY' ? 30 : 
                                   sip.frequency === 'WEEKLY' ? 4 : 
                                   sip.frequency === 'Daily' ? 30 :
                                   sip.frequency === 'Weekly' ? 4 : 1
          
          // For current month, use actual execution count
          const isCurrentMonth = monthDate.getMonth() === now.getMonth() && 
                                monthDate.getFullYear() === now.getFullYear()
          
          let actualExecutions
          if (isCurrentMonth) {
            // Use actual execution count for current month
            actualExecutions = sip.execution_count || 1 // At least 1 for the initial deposit
          } else {
            // Estimate for past months
            const estimatedExecutions = Math.max(0, monthsDiff * executionsPerMonth)
            actualExecutions = Math.min(estimatedExecutions, sip.execution_count || 0)
          }
          
          totalValue += actualExecutions * parseFloat(sip.amount || 0)
          totalYield += totalValue * ((sip.apy_target || 12.5) / 100 / 12) // Monthly yield
        }
      })
      
      chartData.push({
        month: monthName,
        value: Math.round(totalValue * 100) / 100,
        yieldEarned: Math.round(totalYield * 100) / 100
      })
    }
    
    return chartData
  }

  if (!currentAccount) {
    return (
      <Card className="bg-white border border-slate-200 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Wallet className="h-16 w-16 text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-slate-900">Connect Wallet Required</h3>
          <p className="text-slate-600 mb-6 max-w-md">
            Connect your wallet to view real SIP performance data from blockchain
          </p>
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Real Blockchain Data Only
          </Badge>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="bg-white border border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <TrendingUp className="h-5 w-5 animate-pulse" />
            SIP Performance
          </CardTitle>
          <CardDescription>Loading real SIP data from blockchain...</CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-900 text-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              SIP Performance
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm mt-1">
              Your systematic investment plan growth over time
            </CardDescription>
          </div>
          <Badge 
            variant={hasRealData ? "default" : "secondary"}
            className={hasRealData ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
          >
            {hasRealData ? "Real Data" : "No SIPs"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasRealData ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">No SIP Data Yet</h3>
              <p className="text-slate-600 text-sm max-w-md">
                Create your first SIP to start tracking performance. Real blockchain data will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">Portfolio Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600">Yield Earned</span>
              </div>
            </div>

            {/* Chart */}
            <ChartContainer
              config={{
                value: {
                  label: "Portfolio Value",
                  color: "#3b82f6",
                },
                yieldEarned: {
                  label: "Yield Earned",
                  color: "#10b981",
                },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dx={-10}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      labelFormatter={(value) => `Month: ${value}`}
                      formatter={(value, name) => [
                        `${value} OCT`,
                        name === 'value' ? 'Portfolio Value' : 'Yield Earned'
                      ]}
                    />} 
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="yieldEarned"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorYield)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

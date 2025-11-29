"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Zap, Lock, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"

type ChangeType = "positive" | "negative" | "neutral"

export function OverviewCards() {
  const [stats, setStats] = useState([
    {
      title: "Total Portfolio Value",
      value: "0.00",
      change: "+0%",
      changeType: "neutral" as ChangeType,
      icon: DollarSign,
      description: "Across all SIPs and yield pools",
    },
    {
      title: "Active SIPs",
      value: "0",
      change: "Connect wallet",
      changeType: "neutral" as ChangeType,
      icon: TrendingUp,
      description: "Automated investment plans",
    },
    {
      title: "Yield Earned",
      value: "0.00",
      change: "+0%",
      changeType: "neutral" as ChangeType,
      icon: Zap,
      description: "Total yield from optimization",
    },
    {
      title: "Emergency Funds",
      value: "0.00",
      change: "Not locked",
      changeType: "neutral" as ChangeType,
      icon: Lock,
      description: "Secured in emergency vault",
    },
  ])
  const [loading, setLoading] = useState(true)
  const currentAccount = useCurrentAccount()

  useEffect(() => {
    if (currentAccount) {
      loadRealData()
    } else {
      setLoading(false)
    }
  }, [currentAccount])

  const loadRealData = async () => {
    try {
      setLoading(true)
      // Fetch real data from API with user address
      const response = await fetch(`/api/portfolio?userAddress=${currentAccount?.address}`)
      const data = await response.json()
      
      if (data.success) {
        const portfolio = data.data
        
        setStats([
          {
            title: "Total Portfolio Value",
            value: `${portfolio.totalValue.toFixed(2)}`,
            change: `${portfolio.returnPercentage > 0 ? '+' : ''}${portfolio.returnPercentage.toFixed(1)}%`,
            changeType: portfolio.returnPercentage > 0 ? "positive" : portfolio.returnPercentage < 0 ? "negative" : "neutral",
            icon: DollarSign,
            description: "Across all SIPs and yield pools",
          },
          {
            title: "Active SIPs",
            value: portfolio.activeSIPs.toString(),
            change: `${portfolio.activeSIPs} running`,
            changeType: portfolio.activeSIPs > 0 ? "positive" : "neutral",
            icon: TrendingUp,
            description: "Automated investment plans",
          },
          {
            title: "Yield Earned",
            value: `${portfolio.totalReturn.toFixed(2)}`,
            change: `${portfolio.totalReturn > 0 ? 'Earning' : 'No yield'}`,
            changeType: portfolio.totalReturn > 0 ? "positive" : "neutral",
            icon: Zap,
            description: "Total yield from optimization",
          },
          {
            title: "Emergency Funds",
            value: `${portfolio.totalLocked.toFixed(2)}`,
            change: portfolio.totalLocked > 0 ? "Locked" : "Available",
            changeType: portfolio.totalLocked > 0 ? "neutral" : "positive",
            icon: Lock,
            description: "Secured in emergency vault",
          },
        ])
      }
    } catch (error) {
      console.error("Failed to load real data:", error)
      // Keep default values on error
    } finally {
      setLoading(false)
    }
  }

  if (!currentAccount) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6 bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-600 font-medium">{stat.title}</span>
              <stat.icon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900">--</div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-500">Connect Wallet</span>
              </div>
              <p className="text-xs text-slate-500">Connect to view data</p>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6 bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-600 font-medium">{stat.title}</span>
            <stat.icon className="w-5 h-5 text-[#00D382]" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-slate-900">
              {loading ? <Loader2 className="h-8 w-8 animate-spin text-slate-400" /> : stat.value}
            </div>
            <div className="flex items-center space-x-2">
              {stat.changeType === "positive" && <TrendingUp className="h-4 w-4 text-[#00D382]" />}
              {stat.changeType === "negative" && <TrendingDown className="h-4 w-4 text-red-500" />}
              <span className={`text-sm font-semibold ${
                stat.changeType === "positive" ? "text-[#00D382]" : 
                stat.changeType === "negative" ? "text-red-500" : 
                "text-slate-500"
              }`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : stat.change}
              </span>
            </div>
            <p className="text-xs text-slate-500">{stat.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
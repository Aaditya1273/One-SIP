"use client"

import { useState, useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowUpRight, ArrowDownRight, Zap, Lock, TrendingUp, Loader2 } from "lucide-react"

export function RecentActivity() {
  const currentAccount = useCurrentAccount()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      if (!currentAccount) {
        setLoading(false)
        return
      }

      try {
        // Fetch real activity data from API
        const response = await fetch(`/api/activity?userAddress=${currentAccount.address}`)
        const result = await response.json()
        
        if (result.success) {
          setActivities(result.data || [])
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()

    // Listen for SIP creation events to refresh activity
    const handleSIPCreated = () => {
      fetchActivities()
    }

    window.addEventListener('sipCreated', handleSIPCreated)
    return () => window.removeEventListener('sipCreated', handleSIPCreated)
  }, [currentAccount])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest transactions and automated actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentAccount ? "Start investing to see your activity here" : "Connect your wallet to see your activity"}
              </p>
            </div>
          ) : (
            activities.map((activity) => {
              // Determine icon based on activity type
              const getIcon = (type: string) => {
                switch (type) {
                  case 'sipcreated':
                    return <Zap className="h-5 w-5 text-green-600" />
                  case 'sipexecuted':
                    return <ArrowUpRight className="h-5 w-5 text-blue-600" />
                  case 'sipcancelled':
                    return <ArrowDownRight className="h-5 w-5 text-red-600" />
                  case 'yieldearned':
                    return <TrendingUp className="h-5 w-5 text-emerald-600" />
                  case 'fundslocked':
                  case 'fundsunlocked':
                    return <Lock className="h-5 w-5 text-purple-600" />
                  default:
                    return <Zap className="h-5 w-5 text-gray-600" />
                }
              }

              const formatTime = (timestamp: string) => {
                const date = new Date(timestamp)
                const now = new Date()
                const diffMs = now.getTime() - date.getTime()
                const diffMins = Math.floor(diffMs / 60000)
                const diffHours = Math.floor(diffMs / 3600000)
                const diffDays = Math.floor(diffMs / 86400000)

                if (diffMins < 1) return 'Just now'
                if (diffMins < 60) return `${diffMins}m ago`
                if (diffHours < 24) return `${diffHours}h ago`
                if (diffDays < 7) return `${diffDays}d ago`
                return date.toLocaleDateString()
              }

              return (
                <div
                  key={activity.id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (activity.txDigest) {
                      window.open(`https://onescan.cc/testnet/transactionBlocksDetail?digest=${activity.txDigest}`, '_blank')
                    }
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted">
                      {getIcon(activity.type)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {activity.amount !== '0' ? `${activity.amount} ${activity.token}` : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

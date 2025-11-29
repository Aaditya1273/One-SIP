"use client"

import { useState, useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MoreHorizontal, Play, Pause, Square, TrendingUp, Calendar, DollarSign, Wallet, Loader2, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateSIPDialog } from "@/components/create-sip-dialog"

export function SIPList() {
  const [sips, setSips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [sipToCancel, setSipToCancel] = useState<any>(null)
  const [selectedSip, setSelectedSip] = useState<any>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const currentAccount = useCurrentAccount()

  useEffect(() => {
    if (currentAccount) {
      fetchSIPs()
    } else {
      setLoading(false)
    }

    // Listen for SIP creation events
    const handleSIPCreated = () => {
      if (currentAccount) {
        fetchSIPs()
      }
    }

    window.addEventListener('sipCreated', handleSIPCreated)
    return () => window.removeEventListener('sipCreated', handleSIPCreated)
  }, [currentAccount])

  const fetchSIPs = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Import OneChain client
      const { getOneChainClient } = await import('@/lib/onechain-wallet')
      const client = getOneChainClient()
      
      // Get package ID from environment
      const packageId = process.env.NEXT_PUBLIC_SIP_MANAGER_PACKAGE_ID!
      
      if (!packageId || packageId === 'undefined') {
        throw new Error('SIP Manager Package ID not configured. Please check your .env file.')
      }
      
      console.log('🔍 Fetching SIPs for address:', currentAccount!.address)
      console.log('📦 Package ID:', packageId)
      console.log('🔗 Struct Type:', `${packageId}::sip_manager::SIP`)
      
      // Fetch SIP objects owned by the user
      const objects = await client.getOwnedObjects({
        owner: currentAccount!.address,
        filter: {
          StructType: `${packageId}::sip_manager::SIP`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      })

      console.log('📊 Found objects:', objects.data.length)
      console.log('📝 Objects data:', JSON.stringify(objects, null, 2))

      // If no objects found, let's check ALL owned objects to debug
      if (objects.data.length === 0) {
        console.log('⚠️ No SIP objects found. Checking ALL owned objects...')
        const allObjects = await client.getOwnedObjects({
          owner: currentAccount!.address,
          options: {
            showContent: true,
            showType: true,
          },
        })
        console.log('📦 Total owned objects:', allObjects.data.length)
        console.log('📋 All objects:', JSON.stringify(allObjects.data.slice(0, 5), null, 2))
      }

      // Parse SIP data from blockchain objects
      const sipList = []
      for (const obj of objects.data) {
        console.log('🔎 Processing object:', obj.data?.objectId)
        console.log('📄 Object content:', JSON.stringify(obj.data?.content, null, 2))
        
        if (obj.data?.content && 'fields' in obj.data.content) {
          const fields = obj.data.content.fields as any
          
          // Convert frequency to readable format
          const frequencyMap: Record<number, string> = {
            86400: 'Daily',
            604800: 'Weekly',
            2592000: 'Monthly'
          }
          
          // Convert status number to string
          const statusMap: Record<number, string> = {
            0: 'Active',
            1: 'Paused',
            2: 'Cancelled',
            3: 'Completed'
          }
          
          sipList.push({
            id: obj.data.objectId,
            token_symbol: 'OCT',
            amount: (parseInt(fields.amount_per_deposit) / 1_000_000_000).toFixed(2),
            frequency: frequencyMap[parseInt(fields.frequency)] || 'Weekly',
            apy_target: '12.5',
            total_deposits: (parseInt(fields.total_invested) / 1_000_000_000).toFixed(2),
            execution_count: parseInt(fields.total_deposits),
            next_execution: new Date(parseInt(fields.next_execution) * 1000).toISOString(),
            status: statusMap[parseInt(fields.status)] || 'Active',
            created_at: new Date(parseInt(fields.created_at) * 1000).toISOString(),
          })
        }
      }

      console.log('✅ Parsed SIPs:', sipList.length)
      setSips(sipList)
    } catch (error: any) {
      console.error('❌ Failed to fetch SIPs from blockchain:', error)
      console.error('Error details:', error.message, error.stack)
      setError(`Failed to load SIPs: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSIP = async () => {
    if (!sipToCancel) return

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/sips/${sipToCancel.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: currentAccount?.address,
          sipId: sipToCancel.id
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Remove SIP from local state
        setSips(prev => prev.filter(sip => sip.id !== sipToCancel.id))
        setCancelDialogOpen(false)
        setSipToCancel(null)
      } else {
        setError(result.error || "Failed to cancel SIP")
      }
    } catch (error) {
      setError("Failed to cancel SIP. Please try again.")
    } finally {
      setIsCancelling(false)
    }
  }

  const openCancelDialog = (sip: any) => {
    setSipToCancel(sip)
    setCancelDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Paused":
        return "secondary"
      case "Completed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Play className="h-3 w-3" />
      case "Paused":
        return <Pause className="h-3 w-3" />
      case "Completed":
        return <Square className="h-3 w-3" />
      default:
        return <Pause className="h-3 w-3" />
    }
  }

  if (!currentAccount) {
    return (
      <Alert>
        <Wallet className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view your SIPs
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading your SIPs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (sips.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card/80 to-muted/20 backdrop-blur-xl border-0 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center mb-6">
            <TrendingUp className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">No SIPs Found</h3>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            You haven't created any SIPs yet. Create your first SIP to start automated investing on OneChain blockchain.
          </p>
          <CreateSIPDialog />
          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-600 font-medium text-center">✨ Start Your DeFi Journey</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Systematic Investment Plans help you invest regularly with real balance validation
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sips.map((sip, index) => (
        <Card key={sip.id} className="relative bg-white border shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">{sip.token_symbol} SIP #{index + 1}</CardTitle>
                <Badge variant={getStatusColor(sip.status)} className="text-xs">
                  {getStatusIcon(sip.status)}
                  <span className="ml-1">{sip.status}</span>
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem>Pause SIP</DropdownMenuItem>
                  <DropdownMenuItem>View History</DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => openCancelDialog(sip)}
                  >
                    Cancel SIP
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="text-black">
              {sip.amount} {sip.token_symbol} • {sip.frequency} • {sip.apy_target}% Target APY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Invested</span>
                <span className="font-medium text-black">
                  {sip.total_deposits} {sip.token_symbol}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Executions: {sip.execution_count}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-gray-600">
                  <DollarSign className="h-3 w-3" />
                  <span>Per Investment</span>
                </div>
                <p className="font-semibold text-black">{sip.amount} {sip.token_symbol}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-gray-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>Target APY</span>
                </div>
                <p className="font-semibold text-green-600">{sip.apy_target}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Next: {new Date(sip.next_execution).toLocaleDateString()}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedSip(sip)
                  setDetailsDialogOpen(true)
                }}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* SIP Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-white border shadow-lg max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">SIP Details</DialogTitle>
          </DialogHeader>
          {selectedSip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Token</p>
                  <p className="font-semibold text-black">{selectedSip.token_symbol}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={getStatusColor(selectedSip.status)}>
                    {selectedSip.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Amount Per Investment</p>
                  <p className="font-semibold text-black">{selectedSip.amount} {selectedSip.token_symbol}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Frequency</p>
                  <p className="font-semibold text-black">{selectedSip.frequency}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Total Invested</p>
                  <p className="font-semibold text-black">{selectedSip.total_deposits} {selectedSip.token_symbol}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Executions</p>
                  <p className="font-semibold text-black">{selectedSip.execution_count}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Next Execution</p>
                  <p className="font-semibold text-black">{new Date(selectedSip.next_execution).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-semibold text-black">{new Date(selectedSip.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Blockchain Details</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Object ID:</span>
                    <code className="text-xs font-mono text-gray-800">{selectedSip.id.slice(0, 8)}...{selectedSip.id.slice(-6)}</code>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      window.open(`https://onescan.cc/testnet/objectDetails?address=${selectedSip.id}`, '_blank')
                    }}
                  >
                    View on OneChain Explorer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel SIP Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-white border shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cancel SIP
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to cancel this SIP? This action cannot be undone.
            </p>
            {sipToCancel && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SIP Name:</span>
                    <span className="font-medium text-black">{sipToCancel.token_symbol} SIP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-black">{sipToCancel.amount} {sipToCancel.token_symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium text-black">{sipToCancel.frequency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-black">{sipToCancel.status}</span>
                  </div>
                </div>
              </div>
            )}
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Cancelling this SIP will stop all future investments. Any penalty fees may apply.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                Keep SIP
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600"
                onClick={handleCancelSIP}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel SIP"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}



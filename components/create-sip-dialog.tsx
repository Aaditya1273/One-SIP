"use client"

import { useState } from "react"
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertTriangle, Wallet } from "lucide-react"

export function CreateSIPDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    token: "",
    amount: "",
    frequency: "",
    duration: "",
    penalty: "2",
    reason: ""
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  const validateAmount = () => {
    // Balance validation disabled for now - will be implemented with OneChain SDK
    if (!formData.token || !formData.amount) return true
    
    try {
      const requestedAmount = parseFloat(formData.amount)
      return requestedAmount > 0
    } catch {
      return false
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleCreateSIP = async () => {
    if (!currentAccount) {
      setError("Please connect your wallet first")
      return
    }

    if (!formData.name || !formData.token || !formData.amount || !formData.frequency) {
      setError("Please fill in all required fields")
      return
    }

    if (!validateAmount()) {
      setError(`Invalid amount. Please enter a valid positive number.`)
      return
    }

    setIsCreating(true)
    setError("")

    try {
      // Build OneChain transaction using @mysten/sui SDK
      const tx = new Transaction()

      // Get package ID from environment
      const packageId = process.env.NEXT_PUBLIC_SIP_MANAGER_PACKAGE_ID!
      
      // Convert frequency to seconds
      const frequencyMap: Record<string, number> = {
        'daily': 86400,
        'weekly': 604800,
        'monthly': 2592000
      }
      const frequencySeconds = frequencyMap[formData.frequency] || 604800

      // Convert amount to proper format (assuming 9 decimals for OCT)
      const amountInSmallestUnit = Math.floor(parseFloat(formData.amount) * 1_000_000_000)

      // OneChain shared Clock object ID (0x6 is the standard clock object)
      const CLOCK_OBJECT_ID = '0x0000000000000000000000000000000000000000000000000000000000000006'

      // Split coins for the initial payment
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInSmallestUnit)])

      // Call create_sip function from SIP Manager contract with initial payment
      const [sip] = tx.moveCall({
        target: `${packageId}::sip_manager::create_sip`,
        arguments: [
          tx.pure.u64(amountInSmallestUnit), // amount_per_deposit
          tx.pure.u64(frequencySeconds), // frequency in seconds
          paymentCoin, // initial_payment (first deposit)
          tx.object(CLOCK_OBJECT_ID), // clock object
        ],
      })

      // Transfer the created SIP to the user
      tx.transferObjects([sip], tx.pure.address(currentAccount.address))

      // Sign and execute transaction
      signAndExecuteTransaction(
        {
          transaction: tx as any,
        },
        {
          onSuccess: (result) => {
            console.log('🎉 SIP CREATED SUCCESSFULLY!')
            console.log('📝 Transaction Digest:', result.digest)
            console.log('🔗 View on OneChain Explorer:', `https://onescan.cc/testnet/transactionBlocksDetail?digest=${result.digest}`)
            
            // Reset form and close dialog
            setFormData({
              name: "",
              token: "",
              amount: "",
              frequency: "",
              duration: "",
              penalty: "2",
              reason: ""
            })
            setOpen(false)
            setIsCreating(false)
            
            // Dispatch custom event to refresh SIP list
            window.dispatchEvent(new CustomEvent('sipCreated', { detail: result }))
            
            // Show success notification with clickable link
            const explorerUrl = `https://onescan.cc/testnet/transactionBlocksDetail?digest=${result.digest}`
            const message = `✅ SIP Created Successfully!\n\nTransaction Hash: ${result.digest}\n\nClick OK to view on OneChain Explorer`
            
            if (confirm(message)) {
              window.open(explorerUrl, '_blank')
            }
          },
          onError: (error) => {
            console.error('Transaction failed:', error)
            setError(error.message || "Failed to create SIP")
            setIsCreating(false)
          },
        }
      )
    } catch (error: any) {
      console.error('Failed to create SIP:', error)
      setError(error.message || "Failed to create SIP. Please try again.")
      setIsCreating(false)
    }
  }

  const isAmountValid = validateAmount()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create SIP
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border shadow-lg">
        <DialogHeader>
          <DialogTitle>Create New SIP</DialogTitle>
          <DialogDescription>Set up a systematic investment plan to automate your DeFi investments.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!currentAccount && (
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                Please connect your wallet to create a SIP
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="name">SIP Name *</Label>
            <Input 
              id="name" 
              placeholder="e.g., USDC Growth Plan" 
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="token">Token *</Label>
              <Select value={formData.token} onValueChange={(value) => handleInputChange("token", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oct">
                    OCT (OneChain Token)
                  </SelectItem>
                  <SelectItem value="usdc">
                    USDC on OneChain
                  </SelectItem>
                  <SelectItem value="eth">
                    ETH (Bridged)
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.token && (
                <p className="text-xs text-muted-foreground">
                  Balance: -- {formData.token.toUpperCase()} (Balance checking coming soon)
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="500" 
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className={!isAmountValid ? "border-red-500" : ""}
              />
              {formData.amount && !isAmountValid && (
                <p className="text-xs text-red-500">Insufficient balance</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select value={formData.frequency} onValueChange={(value) => handleInputChange("frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (months)</Label>
              <Input 
                id="duration" 
                type="number" 
                placeholder="12" 
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="penalty">Early Withdrawal Penalty (%)</Label>
            <Input 
              id="penalty" 
              type="number" 
              placeholder="2" 
              min="0" 
              max="10" 
              value={formData.penalty}
              onChange={(e) => handleInputChange("penalty", e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="reason">Investment Goal</Label>
            <Textarea 
              id="reason" 
              placeholder="Describe your investment goal..." 
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleCreateSIP}
            disabled={!currentAccount || isCreating || !isAmountValid || !formData.name || !formData.token || !formData.amount || !formData.frequency}
          >
            {isCreating ? "Creating..." : "Create SIP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



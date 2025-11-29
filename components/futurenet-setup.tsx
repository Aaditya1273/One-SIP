"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Copy, Check } from "lucide-react"
import { useState } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"

export function FuturenetSetup() {
  const [copied, setCopied] = useState(false)
  const currentAccount = useCurrentAccount()
  
  // Don't show if already connected
  if (currentAccount) return null
  
  const testnetConfig = {
    name: "OneChain Testnet",
    rpcUrl: "https://rpc-testnet.onelabs.cc:443",
    faucetUrl: "https://faucet-testnet.onelabs.cc/v1/gas"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-orange-500/50 bg-orange-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <CardTitle>OneChain Testnet Setup</CardTitle>
        </div>
        <CardDescription>
          Connect to OneChain Testnet to use this app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Steps:</p>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Install OneWallet or Sui-compatible wallet</li>
            <li>Connect to OneChain Testnet</li>
            <li>Request test OCT tokens from faucet</li>
            <li>Start using the app!</li>
          </ol>
        </div>

        <div className="space-y-3 bg-muted p-4 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Network Name:</p>
            <div className="flex items-center gap-2">
              <code className="text-sm flex-1 bg-background px-2 py-1 rounded">
                {testnetConfig.name}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(testnetConfig.name)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">RPC URL:</p>
            <div className="flex items-center gap-2">
              <code className="text-sm flex-1 bg-background px-2 py-1 rounded break-all">
                {testnetConfig.rpcUrl}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(testnetConfig.rpcUrl)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Faucet URL:</p>
            <div className="flex items-center gap-2">
              <code className="text-sm flex-1 bg-background px-2 py-1 rounded break-all">
                {testnetConfig.faucetUrl}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(testnetConfig.faucetUrl)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 <strong>Get Test OCT:</strong> After connecting, run{" "}
            <code className="bg-blue-500/20 px-2 py-1 rounded">one client faucet</code>
            {" "}to get test OCT tokens
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

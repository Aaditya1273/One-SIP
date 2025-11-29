'use client'

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// OneChain network configuration
const { networkConfig } = createNetworkConfig({
  testnet: { 
    url: 'https://rpc-testnet.onelabs.cc:443',
  },
  mainnet: { 
    url: 'https://rpc-mainnet.onelabs.cc:443',
  },
  devnet: { 
    url: 'https://rpc-devnet.onelabs.cc:443',
  },
})

const queryClient = new QueryClient()

export function OneChainProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}

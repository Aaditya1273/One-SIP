'use client'

import { SuiClient } from '@mysten/sui/client'
import { 
  useCurrentAccount, 
  useDisconnectWallet,
  useSignAndExecuteTransaction,
  useConnectWallet,
  useSuiClient
} from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'

// OneChain network configuration
export const ONECHAIN_NETWORKS = {
  mainnet: 'https://rpc-mainnet.onelabs.cc:443',
  testnet: 'https://rpc-testnet.onelabs.cc:443',
  devnet: 'https://rpc-devnet.onelabs.cc:443',
}

// Default to testnet
const ACTIVE_NETWORK = ONECHAIN_NETWORKS.testnet

// Initialize OneChain client
export const getOneChainClient = () => {
  return new SuiClient({ url: ACTIVE_NETWORK })
}

// Backward compatibility wrapper for useAccount
export const useAccount = () => {
  const currentAccount = useCurrentAccount()
  
  return {
    address: currentAccount?.address || null,
    isConnected: !!currentAccount,
  }
}

// Backward compatibility wrapper for connectWallet
export const connectWallet = async (): Promise<string> => {
  throw new Error('Use the ConnectButton component from @mysten/dapp-kit instead of calling connectWallet directly')
}

// Backward compatibility wrapper for disconnectWallet  
export const disconnectWallet = () => {
  throw new Error('Use the useDisconnectWallet hook from @mysten/dapp-kit instead')
}

// Backward compatibility wrapper for getPublicKey
export const getPublicKey = async (): Promise<string | null> => {
  // This function can't work outside of React context
  // Components should use useCurrentAccount() hook instead
  return null
}

// Backward compatibility wrapper for signAndExecuteTransaction
export const signAndExecuteTransaction = async (
  transaction: Transaction,
  options?: { requestType?: 'WaitForEffectsCert' | 'WaitForLocalExecution' }
): Promise<any> => {
  throw new Error('Use the useSignAndExecuteTransaction hook from @mysten/dapp-kit instead')
}

// Get network info
export const getNetworkInfo = () => {
  return {
    network: 'testnet',
    rpcUrl: ACTIVE_NETWORK,
    faucetUrl: 'https://faucet-testnet.onelabs.cc/v1/gas',
  }
}

// Get OCT balance
export const getOCTBalance = async (address: string): Promise<string> => {
  try {
    const client = getOneChainClient()
    const balance = await client.getBalance({
      owner: address,
      coinType: '0x2::oct::OCT',
    })
    
    // Convert from smallest unit to OCT (assuming 9 decimals like SUI)
    const octBalance = (BigInt(balance.totalBalance) / BigInt(1e9)).toString()
    return octBalance
  } catch (error) {
    console.error('Failed to get OCT balance:', error)
    return '0'
  }
}

// Request test OCT from faucet
export const requestTestOCT = async (address: string): Promise<boolean> => {
  try {
    const response = await fetch('https://faucet-testnet.onelabs.cc/v1/gas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FixedAmountRequest: {
          recipient: address,
        },
      }),
    })
    
    if (!response.ok) {
      throw new Error('Faucet request failed')
    }
    
    return true
  } catch (error) {
    console.error('Failed to request test OCT:', error)
    return false
  }
}

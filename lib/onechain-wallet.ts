'use client'

import { useState, useEffect } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client'

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

// Cache for wallet connection state
let cachedAddress: string | null = null
let cachedConnectionStatus: boolean | null = null
let lastCheckTime = 0
const CACHE_DURATION = 5000 // 5 seconds

// Check if OneWallet is installed
export const isOneWalletInstalled = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  
  try {
    // Check for OneWallet or Sui Wallet in window
    return !!(window as any).oneWallet || !!(window as any).suiWallet
  } catch (error) {
    console.error('OneWallet not detected:', error)
    return false
  }
}

// Connect wallet using Sui dApp Kit pattern
export const connectWallet = async (): Promise<string> => {
  const installed = await isOneWalletInstalled()
  
  if (!installed) {
    throw new Error('OneWallet is not installed. Please install a Sui-compatible wallet.')
  }

  try {
    // Request wallet connection
    const wallet = (window as any).oneWallet || (window as any).suiWallet
    
    if (!wallet) {
      throw new Error('No wallet found')
    }

    // Request account access
    const accounts = await wallet.requestPermissions()
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found')
    }
    
    const address = accounts[0]
    
    // Update cache and localStorage
    cachedAddress = address
    lastCheckTime = Date.now()
    if (typeof window !== 'undefined') {
      localStorage.setItem('onechain_wallet_address', address)
    }
    
    console.log('Connected to OneWallet:', address)
    return address
  } catch (error: any) {
    console.error('Failed to connect wallet:', error)
    
    if (error?.message?.includes('User declined') || error?.message?.includes('rejected')) {
      throw new Error('Connection rejected. Please approve the connection in your wallet.')
    }
    
    throw new Error(error?.message || 'Failed to connect wallet. Please make sure your wallet is unlocked and try again.')
  }
}

// Disconnect wallet
export const disconnectWallet = () => {
  cachedAddress = null
  cachedConnectionStatus = null
  lastCheckTime = 0
  if (typeof window !== 'undefined') {
    localStorage.removeItem('onechain_wallet_address')
  }
  console.log('Wallet disconnected (local state cleared)')
}

// Get current public key
export const getPublicKey = async (): Promise<string | null> => {
  const now = Date.now()
  if (cachedAddress && (now - lastCheckTime) < CACHE_DURATION) {
    return cachedAddress
  }

  if (typeof window !== 'undefined') {
    const storedAddress = localStorage.getItem('onechain_wallet_address')
    if (storedAddress) {
      cachedAddress = storedAddress
      lastCheckTime = now
      return storedAddress
    }
  }

  cachedAddress = null
  lastCheckTime = now
  return null
}

// Sign and execute transaction
export const signAndExecuteTransaction = async (
  transaction: Transaction,
  options?: { requestType?: 'WaitForEffectsCert' | 'WaitForLocalExecution' }
): Promise<any> => {
  const installed = await isOneWalletInstalled()
  if (!installed) {
    throw new Error('OneWallet is not installed')
  }

  try {
    const wallet = (window as any).oneWallet || (window as any).suiWallet
    
    const result = await wallet.signAndExecuteTransactionBlock({
      transactionBlock: transaction,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
      requestType: options?.requestType || 'WaitForLocalExecution',
    })
    
    return result
  } catch (error: any) {
    console.error('Failed to sign transaction:', error)
    throw new Error(error?.message || 'Failed to sign transaction')
  }
}

// Check if wallet is connected
export const isWalletConnected = async (): Promise<boolean> => {
  const installed = await isOneWalletInstalled()
  if (!installed) {
    return false
  }

  try {
    const address = await getPublicKey()
    return !!address
  } catch {
    return false
  }
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

// Hook-like function for compatibility
export const useAccount = () => {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const publicKey = await getPublicKey()
    if (publicKey) {
      setAddress(publicKey)
      setIsConnected(true)
    }
  }

  return { address, isConnected }
}

// Hook-like function for disconnect
export const useDisconnect = () => {
  const disconnect = () => {
    disconnectWallet()
  }

  return { disconnect }
}

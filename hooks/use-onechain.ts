'use client'

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { useState, useEffect } from 'react'

/**
 * Custom hook for OneChain wallet and transaction management
 */
export function useOneChain() {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const [balance, setBalance] = useState<string>('0')

  // Get OCT balance
  useEffect(() => {
    if (currentAccount?.address) {
      fetchBalance()
    }
  }, [currentAccount?.address])

  const fetchBalance = async () => {
    if (!currentAccount?.address) return
    
    try {
      const balance = await suiClient.getBalance({
        owner: currentAccount.address,
        coinType: '0x2::oct::OCT',
      })
      
      // Convert from smallest unit to OCT (9 decimals)
      const octBalance = (BigInt(balance.totalBalance) / BigInt(1e9)).toString()
      setBalance(octBalance)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }

  // Execute transaction
  const executeTransaction = async (transaction: Transaction) => {
    try {
      const result = await signAndExecuteTransaction({
        transaction,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      })
      
      return result
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    }
  }

  // Request test OCT from faucet
  const requestFaucet = async () => {
    if (!currentAccount?.address) {
      throw new Error('No wallet connected')
    }

    try {
      const response = await fetch('https://faucet-testnet.onelabs.cc/v1/gas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FixedAmountRequest: {
            recipient: currentAccount.address,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Faucet request failed')
      }

      // Refresh balance after faucet
      setTimeout(fetchBalance, 2000)
      return true
    } catch (error) {
      console.error('Faucet request failed:', error)
      return false
    }
  }

  return {
    address: currentAccount?.address,
    isConnected: !!currentAccount,
    balance,
    executeTransaction,
    requestFaucet,
    refreshBalance: fetchBalance,
    client: suiClient,
  }
}

'use client'

import { getOneChainClient } from './onechain-wallet'
import { Transaction } from '@mysten/sui/transactions'

/**
 * OneChain Service - Handles blockchain interactions
 */
class OneChainService {
  private client = getOneChainClient()

  /**
   * Get account balance
   */
  async getAccountBalance(address: string) {
    try {
      const balance = await this.client.getBalance({
        owner: address,
        coinType: '0x2::oct::OCT',
      })
      
      const oct = Number(balance.totalBalance) / 1e9
      
      return {
        oct: oct,
        usdc: 0, // TODO: Implement USDC balance
        total: oct,
      }
    } catch (error) {
      console.error('Failed to get balance:', error)
      return { oct: 0, usdc: 0, total: 0 }
    }
  }

  /**
   * Get user's SIPs
   */
  async getUserSIPs(address: string): Promise<string[]> {
    try {
      // TODO: Query OneChain for user's SIP objects
      const objects = await this.client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${process.env.NEXT_PUBLIC_SIP_MANAGER_PACKAGE_ID}::sip_manager::SIP`,
        },
      })
      
      return objects.data.map(obj => obj.data?.objectId || '')
    } catch (error) {
      console.error('Failed to get SIPs:', error)
      return []
    }
  }

  /**
   * Get SIP details
   */
  async getSIPDetails(sipId: string) {
    try {
      const object = await this.client.getObject({
        id: sipId,
        options: {
          showContent: true,
        },
      })
      
      return object.data?.content
    } catch (error) {
      console.error('Failed to get SIP details:', error)
      return null
    }
  }

  /**
   * Build create SIP transaction
   */
  async buildCreateSIPTransaction(
    sender: string,
    params: {
      amount: string
      frequency: string
      token: string
    }
  ): Promise<string> {
    try {
      const tx = new Transaction()
      
      // TODO: Add actual SIP creation logic
      tx.setSender(sender)
      
      // Serialize transaction for signing
      return tx.serialize()
    } catch (error) {
      console.error('Failed to build transaction:', error)
      throw error
    }
  }

  /**
   * Submit signed transaction
   */
  async submitTransaction(signedTx: string) {
    try {
      // TODO: Submit transaction to OneChain
      return {
        success: true,
        hash: '0x' + Math.random().toString(16).slice(2),
      }
    } catch (error) {
      console.error('Failed to submit transaction:', error)
      return {
        success: false,
        error: 'Transaction failed',
      }
    }
  }

  /**
   * Get portfolio data
   */
  async getPortfolioData(address: string) {
    try {
      const balance = await this.getAccountBalance(address)
      const sips = await this.getUserSIPs(address)
      
      return {
        totalBalance: balance.total,
        totalInvested: sips.length * 100, // Placeholder
        totalYield: 0,
        activeSIPs: sips.length,
      }
    } catch (error) {
      console.error('Failed to get portfolio data:', error)
      return {
        totalBalance: 0,
        totalInvested: 0,
        totalYield: 0,
        activeSIPs: 0,
      }
    }
  }
}

export const onechainService = new OneChainService()

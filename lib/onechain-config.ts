'use client'

// OneChain Network Configuration
export const ONECHAIN_CONFIG = {
  mainnet: {
    name: 'OneChain Mainnet',
    rpcUrl: 'https://rpc-mainnet.onelabs.cc:443',
    faucetUrl: null,
    explorerUrl: 'https://explorer.onechain.network',
  },
  testnet: {
    name: 'OneChain Testnet',
    rpcUrl: 'https://rpc-testnet.onelabs.cc:443',
    faucetUrl: 'https://faucet-testnet.onelabs.cc/v1/gas',
    explorerUrl: 'https://testnet-explorer.onechain.network',
  },
  devnet: {
    name: 'OneChain Devnet',
    rpcUrl: 'https://rpc-devnet.onelabs.cc:443',
    faucetUrl: 'https://faucet-devnet.onelabs.cc/v1/gas',
    explorerUrl: 'https://devnet-explorer.onechain.network',
  },
}

// Active network (change this to switch networks)
export const ACTIVE_NETWORK = 'testnet'

export const getNetworkConfig = () => {
  return ONECHAIN_CONFIG[ACTIVE_NETWORK as keyof typeof ONECHAIN_CONFIG]
}

// Package IDs (to be updated after deployment)
export const PACKAGE_IDS = {
  sipManager: process.env.NEXT_PUBLIC_SIP_MANAGER_PACKAGE_ID || '0x0',
  yieldRouter: process.env.NEXT_PUBLIC_YIELD_ROUTER_PACKAGE_ID || '0x0',
  lockVault: process.env.NEXT_PUBLIC_LOCK_VAULT_PACKAGE_ID || '0x0',
}

// OCT Token Configuration
export const OCT_TOKEN = {
  symbol: 'OCT',
  name: 'OneChain Token',
  decimals: 9,
  type: '0x2::oct::OCT',
}

/**
 * Wallet Guard - Prevents EVM wallet extension conflicts
 * 
 * This utility prevents MetaMask and other EVM wallets from causing
 * errors when multiple extensions try to inject window.ethereum
 */

export const initWalletGuard = () => {
  if (typeof window === 'undefined') return

  // Prevent multiple wallet extensions from conflicting
  // This stops the "Cannot redefine property: ethereum" error
  try {
    // Freeze window.ethereum if it exists to prevent redefinition
    if ((window as any).ethereum) {
      Object.freeze((window as any).ethereum)
    }
  } catch (error) {
    // Silently ignore - this is expected when extensions conflict
  }

  // Suppress wallet extension errors in console
  const originalError = console.error
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || ''
    
    // Filter out known wallet extension conflicts
    if (
      message.includes('Cannot redefine property: ethereum') ||
      message.includes('Failed to connect to MetaMask') ||
      message.includes('evmAsk.js') ||
      message.includes('inpage.js')
    ) {
      // Suppress these errors - they're from unused wallet extensions
      return
    }
    
    // Log all other errors normally
    originalError.apply(console, args)
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initWalletGuard()
}

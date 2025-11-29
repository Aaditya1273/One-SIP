'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { OneChainProvider } from '@/components/onechain-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <OneChainProvider>
        {children}
      </OneChainProvider>
    </ThemeProvider>
  )
}

import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { Providers } from "@/components/providers"
import "./globals.css"
import "@mysten/dapp-kit/dist/index.css"

export const metadata: Metadata = {
  title: "Sphira - Grow Fearlessly on Chain",
  description: "Automated Investing Secured Forever by Smart Contracts Globally. Systematic Investment Plans, Yield Optimization, and Emergency Vaults on OneChain blockchain.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import { WalletButton } from "@/components/wallet-button"
import { TrendingUp, Shield, Zap, LogOut, ArrowRight, Check, Lock, BarChart3, Users, Globe, Wallet } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

export function LandingPage() {
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const router = useRouter()
  const [showConnectDialog, setShowConnectDialog] = useState(false)

  const handleDisconnect = () => {
    disconnect()
  }

  const handleGetStarted = () => {
    if (currentAccount) {
      router.push('/dashboard')
    } else {
      setShowConnectDialog(true)
    }
  }

  // Auto-redirect to dashboard when wallet connects
  useEffect(() => {
    if (currentAccount && showConnectDialog) {
      setShowConnectDialog(false)
      router.push('/dashboard')
    }
  }, [currentAccount, showConnectDialog, router])

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Professional & Clean */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="flex items-center justify-between px-6 lg:px-16 py-5 max-w-[1400px] mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Sphira" width={40} height={40} className="w-10 h-10" />
            <span className="font-bold text-xl text-slate-900">Sphira</span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Features
            </a>
            <a href="#why-sphira" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Why Sphira
            </a>
            <a href="#security" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Security
            </a>
            <a href="#about" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
              About
            </a>
          </nav>
          
          {/* CTA */}
          <div className="flex items-center space-x-4">
            {currentAccount ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-2 h-2 bg-[#00D382] rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-slate-700">
                    {currentAccount.address?.slice(0, 6)}...{currentAccount.address?.slice(-4)}
                  </span>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#00D382] hover:bg-[#00BD74] text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <WalletButton />
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Powerful & Detailed */}
      <section className="relative pt-16 pb-24 px-6 lg:px-12 overflow-hidden">
        {/* Soft Blue Accent Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/30 -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Secured by OneChain Blockchain</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight">
                  Grow Fearlessly
                  <br />
                  <span className="text-slate-600">on Chain</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
                  Sphira is your gateway to truly automated global investing & powered by transparent smart contracts, secured forever on the blockchain, and designed to grow your wealth.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-[#00D382] hover:bg-[#00BD74] text-white font-semibold px-8 py-6 text-lg rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  {currentAccount ? 'Open Dashboard' : 'Get started'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {!currentAccount && (
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-8 py-6 text-lg rounded-xl transition-all"
                  >
                    Learn more
                  </Button>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#00D382]" />
                  <span className="text-sm text-slate-600">Non-custodial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#00D382]" />
                  <span className="text-sm text-slate-600">Audited contracts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#00D382]" />
                  <span className="text-sm text-slate-600">24/7 support</span>
                </div>
              </div>
            </div>

            {/* Right: Illustration with Soft Blue Accents */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-50 to-emerald-50 rounded-3xl p-12 border border-blue-100/50 shadow-xl">
                {/* Floating Cards - Professional Design */}
                <div className="space-y-4">
                  {/* Card 1: Portfolio Value */}
                  <Card className="p-6 bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-slate-600 font-medium">Total Portfolio</span>
                      <TrendingUp className="w-5 h-5 text-[#00D382]" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-slate-900">₹12,45,678</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-[#00D382] font-semibold">+23.5%</span>
                        <span className="text-xs text-slate-500">this month</span>
                      </div>
                    </div>
                  </Card>

                  {/* Card 2: Active SIPs */}
                  <Card className="p-6 bg-white border border-blue-200 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-slate-600 font-medium">Active SIPs</span>
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-slate-900">8</div>
                      <div className="text-xs text-slate-500">Next execution in 2 days</div>
                    </div>
                  </Card>

                  {/* Card 3: Vault Status */}
                  <Card className="p-6 bg-white border border-slate-200 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-slate-600 font-medium">Emergency Vault</span>
                      <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-slate-900">₹5,00,000</div>
                      <div className="text-xs text-slate-500">Locked until Dec 2025</div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Professional Grid */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Blockchain at your fingertips
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Long-term or short-term, high risk or low risk. Be the kind of investor you want to be.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "SIPs & Investing",
                description: "Automated systematic investment plans executed on-chain. Set your amount, frequency, and let smart contracts handle the rest.",
                color: "emerald",
                stats: "₹10K+ invested daily"
              },
              {
                icon: Zap,
                title: "Yield Optimization",
                description: "AI-powered strategies that automatically route your funds to the highest-yielding DeFi protocols on OneChain.",
                color: "blue",
                stats: "Up to 12% APY"
              },
              {
                icon: Shield,
                title: "Emergency Vault",
                description: "Time-locked smart contracts that protect your assets. Access only when you need it most, with customizable unlock conditions.",
                color: "amber",
                stats: "100% secure"
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all p-8 rounded-2xl cursor-pointer"
              >
                <div className={`w-14 h-14 bg-${feature.color}-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-7 w-7 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
                  {feature.title}
                  <ArrowRight className="h-5 w-5 ml-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">{feature.description}</p>
                <div className="text-sm font-semibold text-[#00D382]">{feature.stats}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Soft Blue Accent */}
      <section id="about" className="py-20 px-6 lg:px-12 bg-gradient-to-br from-blue-50 to-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "₹100Cr+", label: "Assets Secured", icon: Lock },
              { value: "50K+", label: "Active Users", icon: Users },
              { value: "99.9%", label: "Uptime", icon: Shield },
              { value: "24/7", label: "Support", icon: Globe },
            ].map((stat, index) => (
              <div key={index} className="space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-2">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section - Detailed */}
      <section id="why-sphira" className="py-20 px-6 lg:px-12 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white border border-slate-200 p-12 rounded-3xl shadow-xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Why Sphira?
              </h3>
              <p className="text-lg text-slate-600">
                The most trusted blockchain investment platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "100% On-Chain Transparency",
                  description: "Every transaction is recorded on OneChain blockchain. Verify anytime, anywhere."
                },
                {
                  title: "Smart Contract Security",
                  description: "Audited by leading security firms. Your funds are protected by code, not promises."
                },
                {
                  title: "Non-Custodial Architecture",
                  description: "You own your private keys. We never have access to your funds."
                },
                {
                  title: "AI-Powered Optimization",
                  description: "Machine learning algorithms that maximize your returns automatically."
                },
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                    <Check className="h-5 w-5 text-[#00D382]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">{benefit.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-6 lg:px-12 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full mb-6">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Bank-Grade Security</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Your security is our priority
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Multi-layered security architecture that protects your assets 24/7
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Smart Contract Audits",
                description: "All contracts audited by CertiK and Trail of Bits. Regular security reviews and bug bounties.",
                color: "blue"
              },
              {
                icon: Lock,
                title: "Multi-Sig Protection",
                description: "Critical operations require multiple signatures. No single point of failure.",
                color: "emerald"
              },
              {
                icon: Globe,
                title: "Decentralized Infrastructure",
                description: "Distributed across OneChain validators. No central server to hack.",
                color: "purple"
              },
            ].map((item, index) => (
              <Card key={index} className="bg-white border border-slate-200 p-8 rounded-2xl hover:shadow-lg transition-all">
                <div className={`w-14 h-14 bg-${item.color}-50 rounded-xl flex items-center justify-center mb-6`}>
                  <item.icon className={`h-7 w-7 text-${item.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!currentAccount && (
        <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-emerald-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-4xl font-bold text-slate-900 mb-6">
              Ready to grow fearlessly?
            </h3>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Join thousands of investors who are building wealth on the blockchain. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={handleGetStarted}
                className="bg-[#00D382] hover:bg-[#00BD74] text-white font-semibold px-10 py-6 text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Get started now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-semibold px-10 py-6 text-lg rounded-xl transition-all bg-white"
              >
                Learn more
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer - Professional */}
      <footer className="bg-slate-900 text-white py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/logo.png" alt="Sphira" width={32} height={32} className="w-8 h-8 brightness-0 invert" />
                <span className="font-bold text-xl">Sphira</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6">
                Automated Investing. Secured Forever by Smart Contracts. Trusted Globally.
              </p>
              <div className="text-sm text-slate-500">
                © 2025 Sphira. All rights reserved.
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">SIPs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Yield Optimizer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Emergency Vault</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Portfolio</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trust & Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Shield className="w-4 h-4" />
                <span>Secured by OneChain</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Connect Wallet Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-[#00D382]" />
              Connect Your Wallet
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Connect your OneChain wallet to start investing on the blockchain
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            {/* Benefits */}
            <div className="space-y-3">
              {[
                "Non-custodial - You own your keys",
                "Instant access to all features",
                "Secure smart contract execution",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-[#00D382]" />
                  </div>
                  <span className="text-sm text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Connect Button */}
            <div className="pt-4">
              <WalletButton />
            </div>

            {/* Help Text */}
            <p className="text-xs text-slate-500 text-center">
              Don't have a wallet?{" "}
              <a 
                href="https://docs.onechain.com/wallet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#00D382] hover:underline font-medium"
              >
                Learn how to set up
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

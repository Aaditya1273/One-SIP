import { DashboardLayout } from "@/components/dashboard-layout"
import { YieldOptimizer } from "@/components/yield-optimizer"
import { YieldPools } from "@/components/yield-pools"
import { YieldHistory } from "@/components/yield-history"
import { Zap, Check } from "lucide-react"

export default function YieldPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section - Landing Page Style */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/30 p-12 border border-blue-100/50 shadow-xl">
          <div className="space-y-6">
            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">AI-Powered Optimization</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Yield Optimizer
                <br />
                <span className="text-slate-600">Maximize Returns</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl">
                AI-powered strategies that automatically route your funds to the highest-yielding DeFi protocols on OneChain.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-[#00D382]" />
                <span className="text-sm text-slate-600">Up to 12% APY</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-[#00D382]" />
                <span className="text-sm text-slate-600">Auto-rebalance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-[#00D382]" />
                <span className="text-sm text-slate-600">Low risk</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <YieldOptimizer />
          <YieldPools />
        </div>

        <YieldHistory />
      </div>
    </DashboardLayout>
  )
}

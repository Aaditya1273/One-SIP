import { DashboardLayout } from "@/components/dashboard-layout"
import { OverviewCards } from "@/components/overview-cards"
import { SIPChart } from "@/components/sip-chart"
import { RecentActivity } from "@/components/recent-activity"
import { YieldOptimizer } from "@/components/yield-optimizer"
import { FuturenetSetup } from "@/components/futurenet-setup"
import { Shield, Check } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>
        <div className="space-y-8 pb-20">
          {/* Hero Section - Landing Page Style */}
          <section className="relative pt-8 pb-12 px-6 lg:px-12 overflow-hidden">
            {/* Soft Blue Accent Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/30 -z-10" />
            
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                {/* Trust Badge */}
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Connected to OneChain Blockchain</span>
                </div>

                {/* Main Headline */}
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-tight">
                    Welcome Back
                    <br />
                    <span className="text-slate-600">to Sphira</span>
                  </h1>
                  
                  <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
                    Your DeFi investment dashboard. Monitor your SIPs, optimize yields, and manage your portfolio - all in one place.
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center space-x-8 pt-4">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-[#00D382]" />
                    <span className="text-sm text-slate-600">Real-time data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-[#00D382]" />
                    <span className="text-sm text-slate-600">Automated execution</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-[#00D382]" />
                    <span className="text-sm text-slate-600">Secure vaults</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="px-6 lg:px-12 max-w-7xl mx-auto space-y-8">
            <FuturenetSetup />

            <OverviewCards />

            <div className="grid gap-6 md:grid-cols-2">
              <SIPChart />
              <YieldOptimizer />
            </div>

            <RecentActivity />
          </div>
        </div>
      </DashboardLayout>
  )
}

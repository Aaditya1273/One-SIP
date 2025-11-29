import { DashboardLayout } from "@/components/dashboard-layout"
import { SIPList } from "@/components/sip-list"
import { CreateSIPDialog } from "@/components/create-sip-dialog"
import { SIPStats } from "@/components/sip-stats"
import { TrendingUp, Check } from "lucide-react"

export default function SIPsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section - Landing Page Style */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30 p-12 border border-emerald-100/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Automated Investing</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  My SIPs
                  <br />
                  <span className="text-slate-600">Set & Forget</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl">
                  Systematic Investment Plans executed on-chain. Your investments run automatically, secured by smart contracts.
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#00D382]" />
                  <span className="text-sm text-slate-600">Auto-execute</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#00D382]" />
                  <span className="text-sm text-slate-600">On-chain</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#00D382]" />
                  <span className="text-sm text-slate-600">Transparent</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <CreateSIPDialog />
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <CreateSIPDialog />
        </div>

        <SIPStats />
        <SIPList />
      </div>
    </DashboardLayout>
  )
}

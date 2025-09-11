import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { PortfolioStats } from "@/components/dashboard/portfolio-stats"
import { RecentInvestments } from "@/components/dashboard/recent-investments"
import { AIRecommendations } from "@/components/ai/ai-recommendations"
import { PortfolioAnalysis } from "@/components/ai/portfolio-analysis"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: investments } = await supabase
    .from("user_investments")
    .select(`
      *,
      investment_products (
        name,
        product_type,
        annual_yield
      )
    `)
    .eq("user_id", data.user.id)
    .eq("status", "active")

  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.invested_amount), 0) || 0
  const totalValue = investments?.reduce((sum, inv) => sum + Number(inv.current_value), 0) || 0
  const totalReturns = totalValue - totalInvested
  const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

  const portfolioData = {
    totalValue,
    totalInvested,
    totalReturns,
    activeInvestments: investments?.length || 0,
    returnPercentage,
  }

  const recentInvestments =
    investments?.slice(0, 3).map((inv) => {
      const returns = Number(inv.current_value) - Number(inv.invested_amount)
      const returnPercentage = Number(inv.invested_amount) > 0 ? (returns / Number(inv.invested_amount)) * 100 : 0

      return {
        id: inv.id,
        name: inv.investment_products.name,
        type: inv.investment_products.product_type.toUpperCase(),
        investedAmount: Number(inv.invested_amount),
        currentValue: Number(inv.current_value),
        returns,
        returnPercentage,
        investmentDate: inv.investment_date,
        maturityDate: inv.maturity_date,
      }
    }) || []

  const isAdmin = data.user.email === "prakash.rawat.dev@gmail.com"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investment Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your portfolio overview.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/products">
              <Button className="bg-green-600 hover:bg-green-700">Explore Products</Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent">
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Portfolio Statistics */}
          <PortfolioStats {...portfolioData} />

          {/* Recent Investments and AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RecentInvestments investments={recentInvestments} />
            </div>
            <div>
              <AIRecommendations />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PortfolioAnalysis />
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  )
}

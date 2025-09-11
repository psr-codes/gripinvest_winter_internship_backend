import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview"
import { PortfolioTabs } from "@/components/portfolio/portfolio-tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function PortfolioPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user investments with product details
  const { data: investments, error: investmentsError } = await supabase
    .from("user_investments")
    .select(
      `
      *,
      investment_products (
        name,
        product_type,
        annual_yield
      )
    `,
    )
    .eq("user_id", data.user.id)
    .eq("status", "active")

  if (investmentsError) {
    console.error("Error fetching investments:", investmentsError)
  }

  // Transform data for components
  const investmentData = (investments || []).map((inv) => ({
    id: inv.id,
    product_name: inv.investment_products?.name || "Unknown Product",
    product_type: inv.investment_products?.product_type || "UNKNOWN",
    invested_amount: inv.invested_amount,
    current_value: inv.current_value,
    investment_date: inv.investment_date,
    maturity_date: inv.maturity_date,
    status: inv.status,
  }))

  // Calculate portfolio statistics
  const totalInvested = investmentData.reduce((sum, inv) => sum + inv.invested_amount, 0)
  const totalValue = investmentData.reduce((sum, inv) => sum + inv.current_value, 0)
  const totalReturns = totalValue - totalInvested
  const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

  const portfolioStats = {
    totalValue,
    totalInvested,
    totalReturns,
    activeInvestments: investmentData.length,
    returnPercentage,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investment Portfolio</h1>
            <p className="text-gray-600 mt-1">Track your investments and portfolio performance.</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/products" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Investment
            </Link>
          </Button>
        </div>

        <div className="space-y-8">
          {/* Portfolio Overview */}
          <PortfolioOverview {...portfolioStats} />

          {/* Portfolio Tabs */}
          <PortfolioTabs investments={investmentData} />
        </div>
      </main>
    </div>
  )
}

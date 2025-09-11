import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generatePortfolioAnalysis } from "@/lib/ai"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's investments
    const { data: investments } = await supabase
      .from("user_investments")
      .select(`
        *,
        investment_products (
          name,
          product_type,
          annual_yield,
          risk_level
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")

    // Generate portfolio analysis
    const analysis = await generatePortfolioAnalysisData(investments || [])

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error generating portfolio analysis:", error)
    return NextResponse.json(
      {
        error: "Failed to generate portfolio analysis",
        analysis: {
          overallScore: 0,
          riskScore: 0,
          diversificationScore: 0,
          performanceScore: 0,
          insights: [
            {
              category: "Error",
              score: 0,
              description: "Unable to generate portfolio analysis at this time",
              recommendation: "Please try again later",
            },
          ],
        },
      },
      { status: 500 },
    )
  }
}

async function generatePortfolioAnalysisData(investments: any[]) {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested_amount, 0)
  const currentValue = investments.reduce((sum, inv) => sum + inv.current_value, 0)
  const totalReturns = currentValue - totalInvested
  const returnPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

  // Risk analysis
  const riskDistribution = investments.reduce(
    (acc, inv) => {
      const risk = inv.investment_products?.risk_level || "low"
      acc[risk] = (acc[risk] || 0) + inv.current_value
      return acc
    },
    {} as Record<string, number>,
  )

  const riskScore = calculateRiskScore(riskDistribution, currentValue)

  // Diversification analysis
  const typeDistribution = investments.reduce(
    (acc, inv) => {
      const type = inv.investment_products?.product_type || "UNKNOWN"
      acc[type] = (acc[type] || 0) + inv.current_value
      return acc
    },
    {} as Record<string, number>,
  )

  const diversificationScore = calculateDiversificationScore(typeDistribution)
  const performanceScore = calculatePerformanceScore(returnPercentage)

  let aiInsights = ""
  try {
    if (investments.length > 0) {
      aiInsights = await generatePortfolioAnalysis({
        totalValue: currentValue,
        investments: investments.map((inv) => ({
          name: inv.investment_products?.name || "Unknown",
          amount: inv.invested_amount,
          returns: ((inv.current_value - inv.invested_amount) / inv.invested_amount) * 100,
          type: inv.investment_products?.product_type || "UNKNOWN",
        })),
      })
    } else {
      aiInsights =
        "No active investments found. Consider starting your investment journey with diversified portfolio options."
    }
  } catch (error) {
    console.error("Error generating AI insights:", error)
    aiInsights = "Portfolio analysis completed. Consider reviewing your asset allocation for optimal performance."
  }

  return {
    overallScore: Math.round((riskScore + diversificationScore + performanceScore) / 3),
    riskScore,
    diversificationScore,
    performanceScore,
    insights: [
      {
        category: "Risk Management",
        score: riskScore,
        description: getRiskDescription(riskScore),
        recommendation: getRiskRecommendation(riskScore),
      },
      {
        category: "Diversification",
        score: diversificationScore,
        description: getDiversificationDescription(diversificationScore),
        recommendation: getDiversificationRecommendation(diversificationScore),
      },
      {
        category: "Performance",
        score: performanceScore,
        description: getPerformanceDescription(performanceScore, returnPercentage),
        recommendation: getPerformanceRecommendation(performanceScore),
      },
    ],
    aiInsights,
    riskDistribution,
    typeDistribution,
    totalInvested,
    currentValue,
    totalReturns,
    returnPercentage,
  }
}

function calculateRiskScore(riskDistribution: Record<string, number>, totalValue: number): number {
  if (totalValue === 0) return 50

  const lowRisk = (riskDistribution.low || 0) / totalValue
  const moderateRisk = (riskDistribution.moderate || 0) / totalValue
  const highRisk = (riskDistribution.high || 0) / totalValue

  // Ideal distribution: 40% low, 40% moderate, 20% high
  const idealScore =
    100 - Math.abs(lowRisk - 0.4) * 100 - Math.abs(moderateRisk - 0.4) * 100 - Math.abs(highRisk - 0.2) * 100
  return Math.max(0, Math.min(100, idealScore))
}

function calculateDiversificationScore(typeDistribution: Record<string, number>): number {
  const numTypes = Object.keys(typeDistribution).length
  if (numTypes === 0) return 0
  if (numTypes === 1) return 30
  if (numTypes === 2) return 60
  if (numTypes === 3) return 85
  return 100
}

function calculatePerformanceScore(returnPercentage: number): number {
  if (returnPercentage < 0) return 20
  if (returnPercentage < 5) return 40
  if (returnPercentage < 10) return 60
  if (returnPercentage < 15) return 80
  return 100
}

function getRiskDescription(score: number): string {
  if (score >= 80) return "Your portfolio has an excellent risk balance"
  if (score >= 60) return "Your portfolio has a good risk distribution"
  if (score >= 40) return "Your portfolio risk could be better balanced"
  return "Your portfolio needs better risk management"
}

function getRiskRecommendation(score: number): string {
  if (score >= 80) return "Maintain your current risk allocation"
  if (score >= 60) return "Consider minor adjustments to risk distribution"
  return "Rebalance your portfolio across different risk levels"
}

function getDiversificationDescription(score: number): string {
  if (score >= 80) return "Your portfolio is well diversified across asset classes"
  if (score >= 60) return "Your portfolio has decent diversification"
  return "Your portfolio lacks proper diversification"
}

function getDiversificationRecommendation(score: number): string {
  if (score >= 80) return "Continue maintaining good diversification"
  return "Add investments in different asset classes"
}

function getPerformanceDescription(score: number, returnPercentage: number): string {
  if (score >= 80) return `Excellent returns of ${returnPercentage.toFixed(1)}%`
  if (score >= 60) return `Good returns of ${returnPercentage.toFixed(1)}%`
  if (score >= 40) return `Moderate returns of ${returnPercentage.toFixed(1)}%`
  return `Below average returns of ${returnPercentage.toFixed(1)}%`
}

function getPerformanceRecommendation(score: number): string {
  if (score >= 80) return "Keep up the excellent performance"
  if (score >= 60) return "Consider optimizing for higher returns"
  return "Review and improve your investment strategy"
}

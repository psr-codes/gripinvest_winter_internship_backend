"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, TrendingUp, Shield, Target, Sparkles } from "lucide-react"

interface Recommendation {
  type: string
  title: string
  description: string
  priority: string
  action: string
  products: string[]
}

export function AIInsights() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/recommendations")
      const data = await response.json()
      setRecommendations(data.recommendations?.slice(0, 3) || [])
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      // Fallback to static insights
      setRecommendations([
        {
          type: "diversification",
          title: "Diversify Your Portfolio",
          description: "Consider adding different asset classes to reduce risk",
          priority: "medium",
          action: "Explore mutual funds and bonds",
          products: ["HDFC Large Cap Fund", "Government Bonds"],
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "diversification":
        return <Target className="w-5 h-5 text-blue-600" />
      case "risk_management":
        return <Shield className="w-5 h-5 text-orange-600" />
      case "performance_improvement":
        return <TrendingUp className="w-5 h-5 text-green-600" />
      default:
        return <Lightbulb className="w-5 h-5 text-purple-600" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-lg">AI Portfolio Insights</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRecommendations} disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          ) : (
            "Refresh"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">AI-powered recommendations for your investments</p>
        <div className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              {getRecommendationIcon(recommendation.type)}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">{recommendation.title}</p>
                <p className="text-xs text-gray-600">{recommendation.description}</p>
                <p className="text-xs text-green-600 mt-1">{recommendation.action}</p>
              </div>
            </div>
          ))}
          {recommendations.length === 0 && !isLoading && (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No recommendations available</p>
              <Button variant="outline" size="sm" onClick={fetchRecommendations} className="mt-2 bg-transparent">
                Get AI Recommendations
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

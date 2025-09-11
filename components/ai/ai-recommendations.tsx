"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, TrendingUp, Shield, Target, Sparkles, ChevronRight } from "lucide-react"

interface Recommendation {
  type: string
  title: string
  description: string
  priority: string
  action: string
  products: string[]
}

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/ai/recommendations")
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-lg">AI Recommendations</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRecommendations}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">AI-powered insights to optimize your investment portfolio</p>
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full">{getRecommendationIcon(recommendation.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{recommendation.title}</h3>
                    <Badge className={getPriorityColor(recommendation.priority)}>{recommendation.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                  <p className="text-sm font-medium text-green-600 mb-3">{recommendation.action}</p>
                  {recommendation.products && recommendation.products.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {recommendation.products.map((product, productIndex) => (
                        <Badge key={productIndex} variant="outline" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

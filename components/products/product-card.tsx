"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, TrendingUp } from "lucide-react"

interface ProductCardProps {
  id: string
  name: string
  description: string
  productType: string
  annualYield: number
  riskLevel: string
  minimumInvestment: number
  tenureMonths?: number
  onInvest: (productId: string) => void
}

export function ProductCard({
  id,
  name,
  description,
  productType,
  annualYield,
  riskLevel,
  minimumInvestment,
  tenureMonths,
  onInvest,
}: ProductCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FD":
        return "bg-blue-100 text-blue-800"
      case "MF":
        return "bg-green-100 text-green-800"
      case "BOND":
        return "bg-purple-100 text-purple-800"
      case "ETF":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800"
      case "moderate":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
            <div className="flex gap-2 mb-3">
              <Badge className={getTypeColor(productType)}>{productType}</Badge>
              <Badge className={getRiskColor(riskLevel)}>{riskLevel} risk</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{annualYield}%</div>
            <div className="text-sm text-gray-600">Annual Yield</div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>Min: {formatCurrency(minimumInvestment)}</span>
          </div>
          {tenureMonths && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{tenureMonths} months</span>
            </div>
          )}
        </div>

        <Button onClick={() => onInvest(id)} className="w-full bg-green-600 hover:bg-green-700">
          <TrendingUp className="w-4 h-4 mr-2" />
          Invest Now
        </Button>
      </CardContent>
    </Card>
  )
}

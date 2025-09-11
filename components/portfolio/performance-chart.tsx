import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Investment {
  id: string
  product_name: string
  product_type: string
  invested_amount: number
  current_value: number
  investment_date: string
  maturity_date?: string
  status: string
}

interface PerformanceChartProps {
  investments: Investment[]
}

export function PerformanceChart({ investments }: PerformanceChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Generate mock performance data based on investments
  const generatePerformanceData = () => {
    if (investments.length === 0) return []

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()

    return months.slice(0, currentMonth + 1).map((month, index) => {
      const totalInvested = investments.reduce((sum, inv) => sum + inv.invested_amount, 0)
      const totalCurrent = investments.reduce((sum, inv) => sum + inv.current_value, 0)
      const growth = (totalCurrent - totalInvested) / (currentMonth + 1)

      return {
        month,
        invested: totalInvested,
        current: totalInvested + growth * (index + 1),
      }
    })
  }

  const performanceData = generatePerformanceData()

  if (investments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">No performance data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
        <p className="text-sm text-gray-600">Track your investment growth over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Line type="monotone" dataKey="invested" stroke="#6B7280" strokeWidth={2} name="Invested Amount" />
            <Line type="monotone" dataKey="current" stroke="#10B981" strokeWidth={2} name="Current Value" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

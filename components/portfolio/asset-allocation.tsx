import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

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

interface AssetAllocationProps {
  investments: Investment[]
}

export function AssetAllocation({ investments }: AssetAllocationProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate allocation by product type
  const allocationData = investments.reduce(
    (acc, investment) => {
      const existing = acc.find((item) => item.type === investment.product_type)
      if (existing) {
        existing.value += investment.current_value
        existing.count += 1
      } else {
        acc.push({
          type: investment.product_type,
          value: investment.current_value,
          count: 1,
        })
      }
      return acc
    },
    [] as { type: string; value: number; count: number }[],
  )

  const totalValue = allocationData.reduce((sum, item) => sum + item.value, 0)

  const chartData = allocationData.map((item) => ({
    name: item.type,
    value: item.value,
    percentage: ((item.value / totalValue) * 100).toFixed(1),
    count: item.count,
  }))

  const COLORS = {
    FD: "#3B82F6", // Blue
    MF: "#10B981", // Green
    BOND: "#8B5CF6", // Purple
    ETF: "#F59E0B", // Orange
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "FD":
        return "Fixed Deposits"
      case "MF":
        return "Mutual Funds"
      case "BOND":
        return "Bonds"
      case "ETF":
        return "ETFs"
      default:
        return type
    }
  }

  if (investments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">No investments to show allocation</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <p className="text-sm text-gray-600">Distribution of your investments by asset type</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allocation Breakdown</CardTitle>
          <p className="text-sm text-gray-600">Detailed breakdown by investment type</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }}
                  />
                  <div>
                    <p className="font-medium">{getTypeLabel(item.name)}</p>
                    <p className="text-sm text-gray-600">{item.count} investment(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(item.value)}</p>
                  <p className="text-sm text-gray-600">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvestmentDetails } from "./investment-details"
import { AssetAllocation } from "./asset-allocation"
import { PerformanceChart } from "./performance-chart"

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

interface PortfolioTabsProps {
  investments: Investment[]
}

export function PortfolioTabs({ investments }: PortfolioTabsProps) {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All Investments</TabsTrigger>
        <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="mt-6">
        <InvestmentDetails investments={investments} />
      </TabsContent>
      <TabsContent value="allocation" className="mt-6">
        <AssetAllocation investments={investments} />
      </TabsContent>
      <TabsContent value="performance" className="mt-6">
        <PerformanceChart investments={investments} />
      </TabsContent>
    </Tabs>
  )
}

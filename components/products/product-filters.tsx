"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

interface ProductFiltersProps {
  onSearchChange: (search: string) => void
  onTypeChange: (type: string) => void
  onRiskChange: (risk: string) => void
  onClearFilters: () => void
  searchValue: string
  typeValue: string
  riskValue: string
}

export function ProductFilters({
  onSearchChange,
  onTypeChange,
  onRiskChange,
  onClearFilters,
  searchValue,
  typeValue,
  riskValue,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-lg border">
      <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeValue} onValueChange={onTypeChange}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="FD">Fixed Deposit</SelectItem>
            <SelectItem value="MF">Mutual Fund</SelectItem>
            <SelectItem value="BOND">Bonds</SelectItem>
            <SelectItem value="ETF">ETF</SelectItem>
          </SelectContent>
        </Select>

        <Select value={riskValue} onValueChange={onRiskChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Risk Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="moderate">Moderate Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={onClearFilters} className="flex items-center gap-2 bg-transparent">
        <X className="w-4 h-4" />
        Clear Filters
      </Button>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface InvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    productType: string
    annualYield: number
    riskLevel: string
    minimumInvestment: number
    tenureMonths?: number
  } | null
}

export function InvestmentModal({ isOpen, onClose, product }: InvestmentModalProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleInvest = async () => {
    if (!product || !amount) return

    const investmentAmount = Number.parseFloat(amount)
    if (investmentAmount < product.minimumInvestment) {
      setError(`Minimum investment is ₹${product.minimumInvestment.toLocaleString()}`)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          amount: investmentAmount,
          productName: product.name,
          tenureMonths: product.tenureMonths,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Investment failed")
      }

      onClose()
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!product) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {product.name}</DialogTitle>
          <DialogDescription>Enter the amount you want to invest in this product.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Badge className="bg-blue-100 text-blue-800">{product.productType}</Badge>
            <Badge className="bg-green-100 text-green-800">{product.riskLevel} risk</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Annual Yield:</span>
              <div className="font-semibold text-green-600">{product.annualYield}%</div>
            </div>
            <div>
              <span className="text-gray-600">Minimum Investment:</span>
              <div className="font-semibold">{formatCurrency(product.minimumInvestment)}</div>
            </div>
            {product.tenureMonths && (
              <div className="col-span-2">
                <span className="text-gray-600">Tenure:</span>
                <div className="font-semibold">{product.tenureMonths} months</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Investment Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={product.minimumInvestment}
            />
            <p className="text-xs text-gray-600">Minimum: {formatCurrency(product.minimumInvestment)}</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleInvest}
              disabled={isLoading || !amount}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Processing..." : "Invest Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

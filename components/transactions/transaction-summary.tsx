import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"

interface Transaction {
  id: string
  transaction_type: string
  amount: number
  transaction_date: string
  description: string
}

interface TransactionSummaryProps {
  transactions: Transaction[]
}

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate summary statistics
  const totalInvestments = transactions
    .filter((t) => t.transaction_type === "investment")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalWithdrawals = transactions
    .filter((t) => t.transaction_type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalInterest = transactions
    .filter((t) => t.transaction_type === "interest")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalTransactions = transactions.length

  // Get current month transactions
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const currentMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.transaction_date)
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Investments</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalInvestments)}</p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">Money In</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Withdrawals</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(totalWithdrawals)}</p>
              <div className="flex items-center mt-2 text-red-600">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm">Money Out</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Interest Earned</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(totalInterest)}</p>
              <div className="flex items-center mt-2 text-blue-600">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-sm">Earnings</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{currentMonthTransactions.length}</p>
              <div className="flex items-center mt-2 text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-sm">Transactions</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { TransactionSummary } from "@/components/transactions/transaction-summary"
import { TransactionHistory } from "@/components/transactions/transaction-history"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Transaction {
  id: string
  transaction_type: string
  amount: number
  transaction_date: string
  description: string
  investment_id?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">Complete record of all your investment activities and earnings.</p>
        </div>

        <div className="space-y-8">
          {/* Transaction Summary */}
          <TransactionSummary transactions={transactions} />

          {/* Transaction History */}
          <TransactionHistory transactions={transactions} />
        </div>
      </main>
    </div>
  )
}

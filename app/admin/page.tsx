import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { TransactionLogs } from "@/components/admin/transaction-logs"
import { ProductManagement } from "@/components/admin/product-management"
import { TestCases } from "@/components/admin/test-cases"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  if (data.user.email !== "prakash.rawat.dev@gmail.com") {
    redirect("/dashboard")
  }

  // Fetch transaction logs for admin dashboard
  const { data: transactionLogs } = await supabase
    .from("transaction_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  // Fetch all investment products for management
  const { data: products } = await supabase
    .from("investment_products")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage the investment platform</p>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transaction Logs</TabsTrigger>
            <TabsTrigger value="products">Product Management</TabsTrigger>
            <TabsTrigger value="tests">Test Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <TransactionLogs logs={transactionLogs || []} />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement products={products || []} />
          </TabsContent>

          <TabsContent value="tests">
            <TestCases />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Calendar, TrendingUp, Target, Shield } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()

  // Fetch user investments for AI recommendations
  const { data: investments } = await supabase
    .from("user_investments")
    .select(`
      *,
      investment_products (
        name,
        product_type,
        risk_level,
        annual_yield
      )
    `)
    .eq("user_id", data.user.id)
    .eq("status", "active")

  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.invested_amount), 0) || 0
  const isAdmin = data.user.email === "prakash.rawat.dev@gmail.com"

  // Generate AI recommendations based on profile
  const generateRecommendations = () => {
    const riskLevel = profile?.risk_appetite || "moderate"
    const recommendations = []

    if (riskLevel === "conservative") {
      recommendations.push("Consider increasing allocation to Fixed Deposits and Government Bonds")
      recommendations.push("Your conservative approach is good for capital preservation")
    } else if (riskLevel === "moderate") {
      recommendations.push("Balance your portfolio with 60% equity and 40% debt instruments")
      recommendations.push("Consider adding HDFC Large Cap Fund for stable growth")
    } else {
      recommendations.push("Explore high-growth mutual funds and ETFs")
      recommendations.push("Consider increasing equity allocation for higher returns")
    }

    if (totalInvested < 50000) {
      recommendations.push("Start with SIP investments to build a strong foundation")
    }

    return recommendations
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account details and investment preferences.</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <Shield className="w-4 h-4" />
              Admin User
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={profile?.name || ""} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={data.user.email || ""} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={profile?.phone || ""} />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" defaultValue={profile?.age || ""} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="risk_appetite">Risk Appetite</Label>
                  <Select defaultValue={profile?.risk_appetite || "moderate"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your risk appetite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative - Low risk, stable returns</SelectItem>
                      <SelectItem value="moderate">Moderate - Balanced risk and returns</SelectItem>
                      <SelectItem value="aggressive">Aggressive - High risk, high returns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">Update Profile</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email Verified</p>
                      <p className="font-medium">Yes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium">
                        {new Date(profile?.created_at || data.user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Based on Your Profile</h4>
                    <ul className="space-y-2">
                      {generateRecommendations().map((rec, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <Target className="w-3 h-3 mt-1 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Portfolio Health</h4>
                    <p className="text-sm text-green-800">
                      {investments && investments.length > 0
                        ? `You have ${investments.length} active investments. Consider diversifying across different asset classes.`
                        : "Start your investment journey with our curated products."}
                    </p>
                  </div>

                  <Button variant="outline" className="w-full bg-transparent">
                    Get Detailed Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateProductDescription } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (user.email !== "prakash.rawat.dev@gmail.com") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, type, tenure, annualYield, riskLevel, minInvestment, maxInvestment } = body

    const description = await generateProductDescription({
      name,
      type,
      tenure: Number.parseInt(tenure),
      annualYield: Number.parseFloat(annualYield),
      riskLevel,
      minInvestment: minInvestment ? Number.parseFloat(minInvestment) : undefined,
      maxInvestment: maxInvestment ? Number.parseFloat(maxInvestment) : undefined,
    })

    // Log the API call
    await supabase.from("transaction_logs").insert({
      user_id: user.id,
      endpoint: "/api/ai/product-description",
      http_method: "POST",
      status_code: 200,
      request_data: { name, type, tenure, annualYield, riskLevel },
      response_data: { description: description.substring(0, 100) + "..." },
    })

    return NextResponse.json({ description })
  } catch (error) {
    console.error("Error generating product description:", error)

    // Log the error
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from("transaction_logs").insert({
        user_id: user.id,
        endpoint: "/api/ai/product-description",
        http_method: "POST",
        status_code: 500,
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
    }

    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 })
  }
}

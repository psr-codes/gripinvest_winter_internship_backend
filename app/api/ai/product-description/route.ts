import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProductDescription } from "@/lib/ai";

export async function POST(request: NextRequest) {
    try {
        console.log("🤖 Product Description API called");

        const body = await request.json();
        const {
            name,
            type,
            tenure,
            annualYield,
            riskLevel,
            minInvestment,
            maxInvestment,
        } = body;

        console.log("📝 Generating description for:", {
            name,
            type,
            tenure,
            annualYield,
            riskLevel,
        });

        const description = await generateProductDescription({
            name,
            type,
            tenure: Number.parseInt(tenure),
            annualYield: Number.parseFloat(annualYield),
            riskLevel,
            minInvestment: minInvestment
                ? Number.parseFloat(minInvestment)
                : undefined,
        });

        console.log("✅ Description generated successfully");

        // Optional logging for authenticated users (but don't block if not authenticated)
        try {
            const supabase = await createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                await supabase.from("transaction_logs").insert({
                    user_id: user.id,
                    endpoint: "/api/ai/product-description",
                    http_method: "POST",
                    status_code: 200,
                    request_data: {
                        name,
                        type,
                        tenure,
                        annualYield,
                        riskLevel,
                    },
                    response_data: {
                        description: description.substring(0, 100) + "...",
                    },
                });
                console.log("📊 API call logged for user:", user.email);
            } else {
                console.log(
                    "📊 API call from unauthenticated user - not logged"
                );
            }
        } catch (logError) {
            console.log("⚠️ Logging failed but continuing:", logError);
        }

        return NextResponse.json({ description });
    } catch (error) {
        console.error("❌ Error generating product description:", error);

        // Optional error logging for authenticated users
        try {
            const supabase = await createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                await supabase.from("transaction_logs").insert({
                    user_id: user.id,
                    endpoint: "/api/ai/product-description",
                    http_method: "POST",
                    status_code: 500,
                    error_message:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                });
            }
        } catch (logError) {
            console.log("⚠️ Error logging failed:", logError);
        }

        return NextResponse.json(
            { error: "Failed to generate description" },
            { status: 500 }
        );
    }
}

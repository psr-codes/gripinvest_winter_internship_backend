import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInvestmentRecommendations } from "@/lib/ai";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch user's current investments and profile
        const { data: investments } = await supabase
            .from("investments")
            .select(
                `
        *,
        investment_products (
          name,
          investment_type,
          annual_yield,
          risk_level
        )
      `
            )
            .eq("user_id", user.id)
            .eq("status", "active");

        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        // Generate AI recommendations based on portfolio analysis
        const recommendations = await generateAIRecommendations(
            investments || [],
            profile
        );

        return NextResponse.json({ recommendations });
    } catch (error) {
        console.error("Error generating recommendations:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

async function generateAIRecommendations(investments: any[], profile: any) {
    const totalInvested = investments.reduce(
        (sum, inv) => sum + inv.invested_amount,
        0
    );

    try {
        const recommendationsText = await generateInvestmentRecommendations({
            totalInvestment: totalInvested,
            riskTolerance: profile?.risk_appetite || "moderate",
            investmentGoals: profile?.investment_goals || [
                "wealth building",
                "retirement planning",
            ],
        });

        // Parse the AI response into structured recommendations
        const recommendations = parseRecommendationsText(recommendationsText);
        return recommendations.slice(0, 4); // Return top 4 recommendations
    } catch (error) {
        console.error("Error generating AI recommendations:", error);

        // Fallback to rule-based recommendations
        return generateFallbackRecommendations(investments, totalInvested);
    }
}

function parseRecommendationsText(text: string) {
    // Simple parsing of AI response into structured format
    const lines = text.split("\n").filter((line) => line.trim());
    const recommendations = [];

    for (let i = 0; i < Math.min(4, lines.length); i++) {
        const line = lines[i].trim();
        if (line && line.length > 10) {
            recommendations.push({
                type: "ai_generated",
                title: `Investment Recommendation ${i + 1}`,
                description: line.replace(/^\d+\.\s*/, ""), // Remove numbering
                priority: i < 2 ? "high" : "medium",
                action: "Consider this investment opportunity",
            });
        }
    }

    return recommendations;
}

function generateFallbackRecommendations(
    investments: any[],
    totalInvested: number
) {
    const recommendations = [];

    if (investments.length < 3 && totalInvested > 50000) {
        recommendations.push({
            type: "diversification",
            title: "Diversify Your Portfolio",
            description:
                "Consider adding different asset classes to reduce risk and improve returns.",
            priority: "high",
            action: "Explore mutual funds and bonds to balance your portfolio",
        });
    }

    if (totalInvested < 100000) {
        recommendations.push({
            type: "increase_investment",
            title: "Increase Investment Amount",
            description:
                "Consider increasing your monthly investment to accelerate wealth building.",
            priority: "medium",
            action: "Set up a systematic investment plan",
        });
    }

    return recommendations.slice(0, 4);
}

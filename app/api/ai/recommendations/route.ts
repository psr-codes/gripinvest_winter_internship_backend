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
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        // Generate AI recommendations based on user profile and portfolio
        const recommendations = await generateAIRecommendations(
            user,
            profile,
            investments || []
        );

        console.log("Generated Recommendations:", recommendations);
        return NextResponse.json({ recommendations });
    } catch (error) {
        console.error("Error generating recommendations:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

async function generateAIRecommendations(
    user: any,
    profile: any,
    investments: any[]
) {
    const totalInvested = investments.reduce(
        (sum, inv) => sum + (inv.amount || 0),
        0
    );

    // Create comprehensive user object for AI
    const userForAI = {
        id: user.id,
        email: user.email,
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        age: profile?.age || null,
        risk_appetite: profile?.risk_appetite || "moderate",
        total_balance: profile?.total_balance || 0,
    };

    // Create portfolio data
    const portfolioData = {
        totalInvestment: totalInvested,
        investments: investments.map((inv) => ({
            name: inv.investment_products?.name || "Investment",
            amount: inv.amount || 0,
            type: inv.investment_products?.investment_type || "Unknown",
            annual_yield: inv.investment_products?.annual_yield || null,
        })),
    };

    try {
        const recommendationsText = await generateInvestmentRecommendations(
            userForAI,
            portfolioData
        );

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
    // Split text into lines and clean them
    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    const recommendations = [];

    // Look for actual recommendation patterns
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip headers, preambles, and general text
        if (
            line.includes("Investment Recommendations for") ||
            line.includes("**Investment Recommendations:**") ||
            line.includes("**1. Investment Recommendations:**") ||
            line.includes("Given your") ||
            line.includes("Prakash, given your") ||
            line.includes("Based on your") ||
            line.includes("Here are") ||
            line.includes("suitable investment recommendations") ||
            line.match(
                /^\*\*\d+\.\s*Investment\s*Recommendations?\*\*:?\s*$/i
            ) ||
            line.length < 20 // Skip very short lines
        ) {
            continue;
        }

        // Look for actual recommendations (usually start with bullet points or numbers)
        if (
            line.startsWith("* **") ||
            line.startsWith("• ") ||
            line.startsWith("- ") ||
            line.match(/^\d+\.\s*\*\*/) ||
            line.match(/^\*\*\d+\./) ||
            (line.includes("**") &&
                (line.includes("Fund") ||
                    line.includes("Bond") ||
                    line.includes("Equity") ||
                    line.includes("SIP") ||
                    line.includes("Investment")))
        ) {
            // Extract recommendation details
            let title = "";
            let description = "";

            // Extract title from markdown formatting
            const titleMatch = line.match(/\*\*([^*]+)\*\*/);
            if (titleMatch) {
                title = titleMatch[1].replace(/^\d+\.\s*/, "").trim();
            } else {
                // Fallback: use first part as title
                const parts = line.split(":");
                title = parts[0].replace(/^[\*\-\•\d\.\s]+/, "").trim();
            }

            // Clean up description
            description = line
                .replace(/^\*\*[^*]+\*\*:?\s*/, "") // Remove title part
                .replace(/^[\*\-\•\d\.\s]+/, "") // Remove bullets/numbers
                .trim();

            // If description is empty, use the cleaned line
            if (!description) {
                description = line.replace(/^[\*\-\•\d\.\s]+/, "").trim();
            }

            // Only add if we have meaningful content
            if (title && description && description.length > 30) {
                recommendations.push({
                    type: "ai_generated",
                    title: title,
                    description: description,
                    priority: recommendations.length < 2 ? "high" : "medium",
                    action: "Consider this investment opportunity",
                    products: extractProductNames(description),
                });

                // Limit to 4 recommendations
                if (recommendations.length >= 4) break;
            }
        }
    }

    // If no structured recommendations found, fallback to paragraph parsing
    if (recommendations.length === 0) {
        const paragraphs = text
            .split("\n\n")
            .filter((p) => p.trim().length > 50);
        for (let i = 0; i < Math.min(4, paragraphs.length); i++) {
            const paragraph = paragraphs[i].trim();
            if (
                !paragraph.includes("Investment Recommendations for") &&
                !paragraph.includes("Given your") &&
                (paragraph.includes("invest") ||
                    paragraph.includes("fund") ||
                    paragraph.includes("bond"))
            ) {
                recommendations.push({
                    type: "ai_generated",
                    title: `Investment Recommendation ${
                        recommendations.length + 1
                    }`,
                    description: paragraph.replace(/^\*+\s*/, "").trim(),
                    priority: recommendations.length < 2 ? "high" : "medium",
                    action: "Consider this investment opportunity",
                    products: extractProductNames(paragraph),
                });
            }
        }
    }

    return recommendations;
}

function extractProductNames(text: string): string[] {
    const products = [];

    // Common investment product patterns
    const patterns = [
        /([A-Z][a-zA-Z\s]+(?:Fund|ETF|Bond|Equity|Index))/g,
        /(Nifty\s+\w+)/g,
        /(SBI\s+[A-Z][a-zA-Z\s]+)/g,
        /(Axis\s+[A-Z][a-zA-Z\s]+)/g,
        /(HDFC\s+[A-Z][a-zA-Z\s]+)/g,
        /(Kotak\s+[A-Z][a-zA-Z\s]+)/g,
    ];

    patterns.forEach((pattern) => {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach((match) => {
                const cleaned = match.trim();
                if (cleaned.length > 3 && !products.includes(cleaned)) {
                    products.push(cleaned);
                }
            });
        }
    });

    return products.slice(0, 3); // Limit to 3 products per recommendation
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

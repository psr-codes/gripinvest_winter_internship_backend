import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { generateInvestmentRecommendations } from "@/lib/ai";

export async function GET(request: NextRequest) {
    try {
        console.log("🧠 AI Recommendations API called (GET)");

        // Create Supabase client with proper cookie handling
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll() {
                        // We don't need to set cookies in this API route
                    },
                },
            }
        );

        console.log("🔍 Getting user session...");

        // Get the user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        console.log("👤 User check:", {
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.email,
            authError: authError?.message,
        });

        if (authError || !user) {
            console.log(
                "❌ Authorization failed - using default recommendations"
            );
            // Return default recommendations for unauthenticated users
            const defaultRecommendations = [
                {
                    type: "diversification",
                    title: "Start with Mutual Funds",
                    description:
                        "Begin your investment journey with diversified equity mutual funds for long-term growth.",
                    priority: "high",
                    action: "Explore our curated mutual fund selection",
                },
                {
                    type: "risk_management",
                    title: "Build Emergency Fund",
                    description:
                        "Secure your finances with liquid funds before investing in market-linked products.",
                    priority: "high",
                    action: "Consider liquid funds for emergency corpus",
                },
            ];

            return NextResponse.json({
                recommendations: defaultRecommendations,
                isPersonalized: false,
            });
        }

        console.log(
            "✅ User authenticated, generating personalized recommendations"
        );

        // Generate AI recommendations
        const userProfile = {
            id: user.id,
            email: user.email || "user@example.com",
            first_name: user.user_metadata?.first_name,
            last_name: user.user_metadata?.last_name,
            age: user.user_metadata?.age,
            risk_appetite: user.user_metadata?.risk_appetite,
            total_balance: user.user_metadata?.total_balance,
        };

        const aiResponse = await generateInvestmentRecommendations(userProfile);
        console.log(
            "🤖 AI generated response:",
            aiResponse ? "Success" : "Failed"
        );

        // Parse AI response into structured recommendations
        const recommendations =
            parseAIRecommendations(aiResponse) || getDefaultRecommendations();
        console.log("📋 Parsed recommendations count:", recommendations.length);

        return NextResponse.json({
            recommendations,
            isPersonalized: true,
        });
    } catch (error) {
        console.error("❌ AI Recommendations Error:", error);

        // Return default recommendations on error instead of failing
        const defaultRecommendations = getDefaultRecommendations();
        return NextResponse.json({
            recommendations: defaultRecommendations,
            isPersonalized: false,
            error: "Failed to generate personalized recommendations",
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log("🧠 AI Recommendations API called (POST with token)");

        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: "Token required" },
                { status: 400 }
            );
        }

        // Create Supabase client with token
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get user from token
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser(token);

        console.log("👤 Token user check:", {
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.email,
            authError: authError?.message,
        });

        if (authError || !user) {
            console.log(
                "❌ Token authorization failed - using default recommendations"
            );
            // Return default recommendations
            const defaultRecommendations = [
                {
                    type: "diversification",
                    title: "Start with Mutual Funds",
                    description:
                        "Begin your investment journey with diversified equity mutual funds for long-term growth.",
                    priority: "high",
                    action: "Explore our curated mutual fund selection",
                },
            ];

            return NextResponse.json({
                recommendations: defaultRecommendations,
                isPersonalized: false,
            });
        }

        console.log(
            "✅ User authenticated via token, generating personalized recommendations"
        );

        // Generate AI recommendations
        const userProfile = {
            id: user.id,
            email: user.email || "user@example.com",
            first_name: user.user_metadata?.first_name,
            last_name: user.user_metadata?.last_name,
            age: user.user_metadata?.age,
            risk_appetite: user.user_metadata?.risk_appetite,
            total_balance: user.user_metadata?.total_balance,
        };

        const aiResponse = await generateInvestmentRecommendations(userProfile);
        console.log(
            "🤖 AI generated response:",
            aiResponse ? "Success" : "Failed"
        );

        // Parse AI response into structured recommendations
        const recommendations =
            parseAIRecommendations(aiResponse) || getDefaultRecommendations();
        console.log("📋 Parsed recommendations count:", recommendations.length);

        return NextResponse.json({
            recommendations,
            isPersonalized: true,
        });
    } catch (error) {
        console.error("❌ AI Recommendations Error:", error);

        // Return default recommendations on error instead of failing
        const defaultRecommendations = getDefaultRecommendations();
        return NextResponse.json({
            recommendations: defaultRecommendations,
            isPersonalized: false,
            error: "Failed to generate personalized recommendations",
        });
    }
}

// Default recommendations for unauthenticated users or when errors occur
function getDefaultRecommendations() {
    return [
        {
            type: "diversification",
            title: "Start with Diversified Portfolio",
            description:
                "Begin your investment journey with a well-balanced mix of equity and debt funds to spread risk.",
            priority: "high",
            action: "Consider investing in hybrid funds or balanced advantage funds for beginners.",
        },
        {
            type: "performance_improvement",
            title: "Explore SIP Investments",
            description:
                "Start a Systematic Investment Plan (SIP) to build wealth gradually through disciplined investing.",
            priority: "medium",
            action: "Set up monthly SIPs in large-cap equity funds for steady growth.",
        },
        {
            type: "risk_management",
            title: "Emergency Fund First",
            description:
                "Build an emergency fund covering 6-12 months of expenses before investing in market-linked products.",
            priority: "high",
            action: "Park emergency funds in liquid funds or high-yield savings accounts.",
        },
    ];
}

async function generateAIRecommendations(
    user: any,
    profile: any,
    investments: any[]
) {
    try {
        // Use the existing AI function
        const recommendations = await generateInvestmentRecommendations(user);
        return recommendations;
    } catch (error) {
        console.error("AI generation failed:", error);
        return getDefaultRecommendations();
    }
}

// Parse AI text response into structured recommendation objects
function parseAIRecommendations(aiText: string | null): any[] {
    if (!aiText || typeof aiText !== "string") {
        return [];
    }

    try {
        // Split by bullet points to extract individual recommendations
        const recommendations = [];
        const lines = aiText
            .split("\n")
            .filter((line) => line.trim().length > 0);

        let currentRec = null;

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Check if this is a new recommendation (starts with * or bullet point)
            if (
                trimmedLine.startsWith("*") ||
                trimmedLine.startsWith("•") ||
                trimmedLine.includes("**")
            ) {
                // Save previous recommendation if it exists
                if (currentRec) {
                    recommendations.push(currentRec);
                }

                // Extract title from the line (between ** markers or after bullet)
                const titleMatch =
                    trimmedLine.match(/\*\*([^*]+)\*\*/) ||
                    trimmedLine.match(/\*\s*([^:]+):/);
                const title = titleMatch
                    ? titleMatch[1].trim()
                    : trimmedLine.replace(/^\*+\s*/, "").split(":")[0];

                // Extract description (everything after the title)
                const description = trimmedLine
                    .replace(/^\*+\s*/, "")
                    .replace(/\*\*[^*]+\*\*:\s*/, "")
                    .replace(/^[^:]+:\s*/, "");

                currentRec = {
                    type: "ai_generated",
                    title: title || "Investment Recommendation",
                    description: description || "",
                    priority: "medium",
                    action: `Consider investing in ${
                        title || "this option"
                    } based on your profile`,
                };
            } else if (currentRec && trimmedLine.length > 0) {
                // Continue building the description for the current recommendation
                currentRec.description +=
                    (currentRec.description ? " " : "") + trimmedLine;
            }
        }

        // Add the last recommendation
        if (currentRec) {
            recommendations.push(currentRec);
        }

        return recommendations.length > 0
            ? recommendations
            : getDefaultRecommendations();
    } catch (error) {
        console.error("Error parsing AI recommendations:", error);
        return getDefaultRecommendations();
    }
}

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generatePortfolioAnalysis } from "@/lib/ai";

export async function GET(request: NextRequest) {
    try {
        console.log("📊 Portfolio Analysis API called (GET)");

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
            console.log("❌ Authorization failed - using default analysis");
            // Instead of returning 401, return default analysis for unauthenticated users
            const defaultAnalysis = getDefaultPortfolioAnalysis();
            return NextResponse.json(defaultAnalysis);
        }

        console.log("✅ User authenticated:", user.email);

        // Fetch user's investments and profile
        console.log("📊 Fetching user investments and profile...");

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

        console.log("📈 Data fetched:", {
            investmentCount: investments?.length || 0,
            hasProfile: !!profile,
        });

        // Generate AI analysis based on user profile and portfolio
        const analysis = await generateAIPortfolioAnalysis(
            user,
            profile,
            investments || []
        );

        console.log("🎯 Generated analysis:", !!analysis);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("❌ Portfolio Analysis API Error:", error);

        // Return default analysis on error instead of failing
        const defaultAnalysis = getDefaultPortfolioAnalysis();
        return NextResponse.json(defaultAnalysis);
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log("📊 Portfolio Analysis API called (POST - Token Auth)");

        const body = await request.json();
        const { token } = body;

        if (!token) {
            console.log("❌ No token provided - using default analysis");
            const defaultAnalysis = getDefaultPortfolioAnalysis();
            return NextResponse.json(defaultAnalysis);
        }

        // Create Supabase client with the provided token
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
                cookies: {
                    getAll() {
                        return [];
                    },
                    setAll() {},
                },
            }
        );

        console.log("🔍 Getting user from token...");

        // Get the user using the token
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
                "❌ Token authentication failed - using default analysis"
            );
            const defaultAnalysis = getDefaultPortfolioAnalysis();
            return NextResponse.json(defaultAnalysis);
        }

        console.log("✅ User authenticated via token:", user.email);

        // Fetch user's investments and profile
        console.log("📊 Fetching user investments and profile...");

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

        console.log("📈 Data fetched:", {
            investmentCount: investments?.length || 0,
            hasProfile: !!profile,
        });

        // Generate AI analysis based on user profile and portfolio
        const analysis = await generateAIPortfolioAnalysis(
            user,
            profile,
            investments || []
        );

        console.log("🎯 Generated personalized analysis:", !!analysis);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("❌ Portfolio Analysis API Error (POST):", error);

        // Return default analysis on error instead of failing
        const defaultAnalysis = getDefaultPortfolioAnalysis();
        return NextResponse.json(defaultAnalysis);
    }
}

// Default portfolio analysis for unauthenticated users or when errors occur
function getDefaultPortfolioAnalysis() {
    return {
        overallScore: 75,
        riskScore: 60,
        diversificationScore: 70,
        performanceScore: 80,
        insights: [
            {
                category: "Risk Management",
                score: 60,
                description: "Your portfolio shows moderate risk exposure",
                recommendation:
                    "Consider adding some defensive assets to balance risk",
            },
            {
                category: "Diversification",
                score: 70,
                description: "Portfolio shows good spread across sectors",
                recommendation:
                    "Add international exposure for better diversification",
            },
            {
                category: "Performance",
                score: 80,
                description: "Portfolio performance is above market average",
                recommendation:
                    "Continue with current strategy while monitoring regularly",
            },
        ],
    };
}

async function generateAIPortfolioAnalysis(
    user: any,
    profile: any,
    investments: any[]
) {
    try {
        // Use the existing AI function with both user and profile
        const analysis = await generatePortfolioAnalysis(user, profile);
        return analysis;
    } catch (error) {
        console.error("AI analysis generation failed:", error);
        return getDefaultPortfolioAnalysis();
    }
}

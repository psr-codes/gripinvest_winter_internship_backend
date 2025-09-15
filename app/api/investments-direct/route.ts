import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
    try {
        console.log("🔐 Direct Investment API called");

        // Parse request body first to get the token
        const body = await request.json();
        const { productId, amount, productName, tenureMonths, userToken } =
            body;

        console.log("📊 Request data:", {
            productId,
            amount,
            productName,
            tenureMonths,
            hasToken: !!userToken,
        });

        if (!userToken) {
            return NextResponse.json(
                { error: "Authentication token required" },
                { status: 401 }
            );
        }

        // Create Supabase client with the user's token
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Set the session with the provided token
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser(userToken);

        console.log("👤 Token user check:", {
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.email,
            authError: authError?.message,
        });

        if (authError || !user) {
            console.log("❌ Token authorization failed");
            return NextResponse.json(
                { error: "Invalid authentication token" },
                { status: 401 }
            );
        }

        console.log("✅ User authenticated via token:", user.email);

        if (!productId || !amount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Calculate maturity date if tenure is provided
        const maturityDate = tenureMonths
            ? new Date(Date.now() + tenureMonths * 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
            : null;

        console.log("💰 Creating investment record...");

        // Create investment record
        const { error: investmentError } = await supabase
            .from("investments")
            .insert({
                user_id: user.id,
                product_id: productId,
                amount: amount,
                invested_at: new Date().toISOString(),
                maturity_date: maturityDate,
                status: "active",
                expected_return: amount, // Will be updated based on yield later
            });

        if (investmentError) {
            console.error("❌ Investment creation failed:", investmentError);
            return NextResponse.json(
                { error: investmentError.message },
                { status: 500 }
            );
        }

        console.log("✅ Investment created successfully");

        // Create transaction record
        console.log("📝 Creating transaction record...");

        const { error: transactionError } = await supabase
            .from("transactions")
            .insert({
                user_id: user.id,
                transaction_type: "investment",
                amount: amount,
                description: `Investment in ${productName}`,
            });

        if (transactionError) {
            console.error("❌ Transaction creation failed:", transactionError);
            return NextResponse.json(
                { error: transactionError.message },
                { status: 500 }
            );
        }

        console.log("✅ Transaction created successfully");

        // Log successful transaction
        try {
            await supabase.from("transaction_logs").insert({
                user_id: user.id,
                email: user.email,
                endpoint: "/api/investments-direct",
                http_method: "POST",
                status_code: 200,
                error_message: null,
                created_at: new Date().toISOString(),
            });
        } catch (logError) {
            console.error("Failed to log transaction:", logError);
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("❌ Direct Investment API Error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

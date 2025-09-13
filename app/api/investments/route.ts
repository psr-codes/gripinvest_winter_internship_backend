import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    let userId: string | null = null;
    let userEmail: string | null = null;

    try {
        const supabase = await createClient();

        // Get authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            await logTransaction(
                supabase,
                null,
                null,
                "POST",
                "/api/investments",
                401,
                "Unauthorized"
            );
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        userId = user.id;
        userEmail = user.email || null;

        const body = await request.json();
        const { productId, amount, productName, tenureMonths } = body;

        if (!productId || !amount) {
            await logTransaction(
                supabase,
                userId,
                userEmail,
                "POST",
                "/api/investments",
                400,
                "Missing required fields"
            );
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

        // Create investment record
        const { error: investmentError } = await supabase
            .from("investments")
            .insert({
                user_id: userId,
                product_id: productId,
                amount: amount,
                invested_at: new Date().toISOString(),
                maturity_date: maturityDate,
                status: "active",
                expected_return: amount, // Will be updated based on yield later
            });

        if (investmentError) {
            await logTransaction(
                supabase,
                userId,
                userEmail,
                "POST",
                "/api/investments",
                500,
                investmentError.message
            );
            return NextResponse.json(
                { error: investmentError.message },
                { status: 500 }
            );
        }

        // Create transaction record
        const { error: transactionError } = await supabase
            .from("transactions")
            .insert({
                user_id: userId,
                transaction_type: "investment",
                amount: amount,
                description: `Investment in ${productName}`,
            });

        if (transactionError) {
            await logTransaction(
                supabase,
                userId,
                userEmail,
                "POST",
                "/api/investments",
                500,
                transactionError.message
            );
            return NextResponse.json(
                { error: transactionError.message },
                { status: 500 }
            );
        }

        // Log successful transaction
        await logTransaction(
            supabase,
            userId,
            userEmail,
            "POST",
            "/api/investments",
            200,
            null
        );

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        const supabase = await createClient();
        await logTransaction(
            supabase,
            userId,
            userEmail,
            "POST",
            "/api/investments",
            500,
            errorMessage
        );
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

async function logTransaction(
    supabase: any,
    userId: string | null,
    userEmail: string | null,
    method: string,
    endpoint: string,
    statusCode: number,
    errorMessage: string | null
) {
    try {
        await supabase.from("transaction_logs").insert({
            user_id: userId,
            email: userEmail,
            endpoint,
            http_method: method,
            status_code: statusCode,
            error_message: errorMessage,
            created_at: new Date().toISOString(),
        });
    } catch (logError) {
        console.error("Failed to log transaction:", logError);
    }
}

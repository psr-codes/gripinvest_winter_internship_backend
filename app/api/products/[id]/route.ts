import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
                "PUT",
                `/api/products/${params.id}`,
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

        // Check if user is admin
        if (userEmail !== "prakash.rawat.dev@gmail.com") {
            await logTransaction(
                supabase,
                userId,
                userEmail,
                "PUT",
                `/api/products/${params.id}`,
                403,
                "Forbidden - Admin access required"
            );
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const {
            name,
            investment_type,
            annual_yield,
            risk_level,
            minimum_investment,
            tenure_months,
            description,
        } = body;

        if (
            !name ||
            !investment_type ||
            !annual_yield ||
            !risk_level ||
            !minimum_investment
        ) {
            await logTransaction(
                supabase,
                userId,
                userEmail,
                "PUT",
                `/api/products/${params.id}`,
                400,
                "Missing required fields"
            );
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Update product
        const { error: productError } = await supabase
            .from("investment_products")
            .update({
                name,
                investment_type,
                annual_yield,
                risk_level,
                minimum_investment,
                tenure_months,
                description,
            })
            .eq("id", params.id);

        if (productError) {
            await logTransaction(
                supabase,
                userId,
                userEmail,
                "PUT",
                `/api/products/${params.id}`,
                500,
                productError.message
            );
            return NextResponse.json(
                { error: productError.message },
                { status: 500 }
            );
        }

        // Log successful request
        await logTransaction(
            supabase,
            userId,
            userEmail,
            "PUT",
            `/api/products/${params.id}`,
            200,
            null
        );

        return NextResponse.json(
            { message: "Product updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        const supabase = createClient();
        await logTransaction(
            supabase,
            userId,
            userEmail,
            "PUT",
            `/api/products/${params.id}`,
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
    error: string | null
) {
    try {
        const client = await supabase;
        await client.from("transaction_logs").insert({
            user_id: userId,
            user_email: userEmail,
            method,
            endpoint,
            status_code: statusCode,
            error_message: error,
        });
    } catch (error) {
        console.error("Error logging transaction:", error);
    }
}

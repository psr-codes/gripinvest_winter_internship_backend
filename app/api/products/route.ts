import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    let userId: string | null = null;
    let userEmail: string | null = null;

    try {
        const supabase = await createClient();

        // Get authenticated user (optional for GET products)
        const {
            data: { user },
        } = await supabase.auth.getUser();

        userId = user?.id || null;
        userEmail = user?.email || null;

        // Fetch products
        const { data: products, error } = await supabase
            .from("investment_products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (error) {
            await logTransaction(
                await createClient(),
                userId,
                userEmail,
                "GET",
                "/api/products",
                500,
                error.message
            );
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Log successful request
        await logTransaction(
            supabase,
            userId,
            userEmail,
            "GET",
            "/api/products",
            200,
            null
        );

        return NextResponse.json({ products }, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        const supabase = await createClient();
        await logTransaction(
            supabase,
            userId,
            userEmail,
            "GET",
            "/api/products",
            500,
            errorMessage
        );
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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
                "/api/products",
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
                "POST",
                "/api/products",
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
            min_investment,
            tenure_months,
            description,
        } = body;

        // Log received data
        console.log("Received request body:", body);

        if (
            !name ||
            !investment_type ||
            !annual_yield ||
            !risk_level ||
            !min_investment
        ) {
            const missingFields = [];
            if (!name) missingFields.push("name");
            if (!investment_type) missingFields.push("investment_type");
            if (!annual_yield) missingFields.push("annual_yield");
            if (!risk_level) missingFields.push("risk_level");
            if (!min_investment) missingFields.push("min_investment");

            const errorMessage = `Missing required fields: ${missingFields.join(
                ", "
            )}`;
            console.log(errorMessage);

            await logTransaction(
                supabase,
                userId,
                userEmail,
                "POST",
                "/api/products",
                400,
                errorMessage
            );
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        // Create product
        const { error: productError } = await supabase
            .from("investment_products")
            .insert({
                name,
                investment_type,
                annual_yield,
                risk_level,
                min_investment,
                tenure_months,
                description,
            });

        if (productError) {
            await logTransaction(
                supabase,
                userId,
                userEmail,
                "POST",
                "/api/products",
                500,
                productError.message
            );
            return NextResponse.json(
                { error: productError.message },
                { status: 500 }
            );
        }

        // Log successful creation
        await logTransaction(
            supabase,
            userId,
            userEmail,
            "POST",
            "/api/products",
            201,
            null
        );

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        const supabase = createClient();
        await logTransaction(
            supabase,
            userId,
            userEmail,
            "POST",
            "/api/products",
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
        const client = await createClient();
        await client.from("transaction_logs").insert({
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

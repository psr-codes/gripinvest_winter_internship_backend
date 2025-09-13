import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Test database connection by making a simple query
        const { data, error } = await supabase
            .from("investment_products")
            .select("count")
            .limit(1)
            .single();

        if (error) {
            return NextResponse.json(
                {
                    status: "error",
                    service: "up",
                    database: "down",
                    error: error.message,
                    timestamp: new Date().toISOString(),
                },
                { status: 503 }
            );
        }

        return NextResponse.json({
            status: "healthy",
            service: "up",
            database: "up",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Health check failed:", error);
        return NextResponse.json(
            {
                status: "error",
                service: "degraded",
                database: "unknown",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

// HEAD request for lightweight checks
export async function HEAD(request: NextRequest) {
    return new Response(null, { status: 200 });
}

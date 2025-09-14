import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    console.log("Session API called", { url: request.url });

    // Handle preflight requests
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 200,
            headers: {
                "Access-Control-Allow-Methods": "POST",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Origin": "*",
            },
        });
    }

    try {
        if (!request.body) {
            console.error("No request body provided");
            return NextResponse.json(
                { error: "No request body provided" },
                { status: 400 }
            );
        }

        const body = await request.json().catch(() => null);
        if (!body || !body.session) {
            return NextResponse.json(
                { error: "Invalid request format" },
                { status: 400 }
            );
        }

        const { session } = body;

        // Set session cookie with secure options
        const cookieStore = cookies();
        const sessionStr = JSON.stringify(session);

        cookieStore.set("supabase-auth-token", sessionStr, {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        const response = NextResponse.json({ status: "ok" });

        // Add CORS headers to response
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST");
        response.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );

        return response;
    } catch (error) {
        console.error("Session establishment error:", error);
        const errorResponse = NextResponse.json(
            { error: "Failed to establish session" },
            { status: 500 }
        );

        // Add CORS headers to error response
        errorResponse.headers.set("Access-Control-Allow-Origin", "*");
        errorResponse.headers.set("Access-Control-Allow-Methods", "POST");
        errorResponse.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );

        return errorResponse;
    }
}

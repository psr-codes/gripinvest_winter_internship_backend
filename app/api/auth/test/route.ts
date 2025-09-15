import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        console.log("🧪 Auth test API called");

        const supabase = await createClient();

        // Get session
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        // Get user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        console.log("🧪 Auth test results:", {
            hasSession: !!session,
            hasUser: !!user,
            userEmail: user?.email,
            sessionError: sessionError?.message,
            authError: authError?.message,
        });

        return NextResponse.json({
            authenticated: !!user,
            user: user
                ? {
                      id: user.id,
                      email: user.email,
                  }
                : null,
            hasSession: !!session,
            sessionError: sessionError?.message,
            authError: authError?.message,
        });
    } catch (error) {
        console.error("🧪 Auth test error:", error);
        return NextResponse.json(
            { error: "Auth test failed" },
            { status: 500 }
        );
    }
}

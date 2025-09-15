import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Attempt to refresh the session to handle token refresh
    try {
        await supabase.auth.getSession();
    } catch (error) {
        console.log("Session refresh failed:", error);
    }

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const publicPaths = [
        "/",
        "/auth/login",
        "/auth/signup",
        "/auth/verify-email",
        "/products",
        "/api/products",
        "/_next",
        "/favicon.ico",
        "/public",
    ];

    // Define protected paths that require authentication
    const protectedPaths = [
        "/dashboard",
        "/profile",
        "/portfolio",
        "/transactions",
        "/admin",
    ];

    // Always allow public paths
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    if (isPublicPath) {
        return supabaseResponse;
    }

    // Check if trying to access protected path
    const isProtectedPath = protectedPaths.some((path) =>
        pathname.startsWith(path)
    );

    if (isProtectedPath) {
        if (userError || !user) {
            console.log(
                "Redirecting to login - User error:",
                userError,
                "User:",
                !!user
            );
            // Redirect to login with return URL
            const url = request.nextUrl.clone();
            url.pathname = "/auth/login";
            url.searchParams.set("returnTo", pathname);
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    redirectTo = "/auth/login",
}: ProtectedRouteProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        // Check current session
        const checkAuth = async () => {
            try {
                const {
                    data: { session },
                    error,
                } = await supabase.auth.getSession();

                if (error) {
                    console.error("Auth error:", error);
                    setUser(null);
                } else if (session?.user) {
                    setUser(session.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Session check failed:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state changed:", event, !!session?.user);

            if (session?.user) {
                setUser(session.user);
            } else {
                setUser(null);
                // Only redirect if not already on login page
                if (window.location.pathname !== redirectTo) {
                    const currentPath = window.location.pathname;
                    const returnUrl =
                        currentPath !== "/"
                            ? `?returnTo=${encodeURIComponent(currentPath)}`
                            : "";
                    router.push(`${redirectTo}${returnUrl}`);
                }
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router, redirectTo]);

    // If still loading, show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect will happen in useEffect
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // If authenticated, render children
    return <>{children}</>;
}

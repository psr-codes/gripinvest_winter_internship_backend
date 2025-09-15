"use client";

import type React from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo");

    // Check if user is already logged in
    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (session && !error) {
                console.log("🔍 User already logged in, redirecting...");
                const redirectUrl =
                    returnTo && returnTo !== "/auth/login"
                        ? returnTo
                        : "/dashboard";
                router.push(redirectUrl);
            }
        };

        checkSession();
    }, [router, returnTo]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            console.log("🔐 Starting login process...");

            // Simple login with Supabase's built-in session handling
            const { data, error: loginError } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            console.log("🔍 Login response:", { data, error: loginError });

            if (loginError) throw loginError;

            // Verify the login was successful
            if (data.session && data.user) {
                console.log("✅ Login successful!");
                console.log("📧 User:", data.user.email);
                console.log(
                    "🎫 Session ID:",
                    data.session.access_token.substring(0, 20) + "..."
                );
                console.log("⏰ Session expires:", data.session.expires_at);

                // Wait a bit to ensure session is properly stored
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Let's immediately test if we can retrieve the session
                console.log("🔄 Testing session persistence...");
                const { data: sessionCheck } = await supabase.auth.getSession();
                console.log("🔎 Session check after login:", sessionCheck);

                const { data: userCheck } = await supabase.auth.getUser();
                console.log("👤 User check after login:", userCheck);

                // Check localStorage
                if (typeof window !== "undefined") {
                    const keys = Object.keys(localStorage).filter((key) =>
                        key.includes("supabase")
                    );
                    console.log("💾 LocalStorage supabase keys:", keys);
                    keys.forEach((key) => {
                        console.log(
                            `💾 ${key}:`,
                            localStorage.getItem(key)?.substring(0, 100) + "..."
                        );
                    });
                }

                // Redirect to the original page or dashboard
                const redirectUrl =
                    returnTo && returnTo !== "/auth/login"
                        ? returnTo
                        : "/dashboard";
                console.log("🚀 Redirecting to:", redirectUrl);

                // Use router.push for better Next.js navigation
                router.push(redirectUrl);
            } else {
                throw new Error("Login failed - no session created");
            }
        } catch (error: any) {
            console.error("Login error:", error);
            setError(error.message || "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Sign in to your Grip Investment account
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>
                            Enter your email and password to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                                disabled={isLoading}
                            >
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link
                                    href="/auth/signup"
                                    className="text-green-600 hover:underline"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        By signing in, you agree to our{" "}
                        <Link href="#" className="underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="underline">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

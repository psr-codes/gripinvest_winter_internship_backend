"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    Shield,
    Target,
    Users,
    ArrowRight,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            setUser(user);
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const handleGetStarted = () => {
        if (user) {
            router.push("/dashboard");
        } else {
            router.push("/auth/signup");
        }
    };

    const handleSignIn = () => {
        if (user) {
            router.push("/dashboard");
        } else {
            router.push("/auth/login");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Navigation Header */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="bg-green-600 text-white rounded-lg p-2 mr-3">
                                <span className="font-bold text-lg">G</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900">
                                GripInvest
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <span className="text-gray-600">
                                        Welcome back, {user.email}
                                    </span>
                                    <Button
                                        onClick={() =>
                                            router.push("/dashboard")
                                        }
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Go to Dashboard
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={handleSignIn}
                                        className="cursor-pointer text-gray-600 hover:text-gray-900"
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        onClick={handleGetStarted}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Get Started
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Smart Investing Made
                        <span className="text-green-600 block">Simple</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Start your investment journey with AI-powered
                        recommendations, curated financial products, and expert
                        guidance. Build wealth systematically with GripInvest.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            onClick={handleGetStarted}
                            className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                        >
                            {user ? "Go to Dashboard" : "Start Investing"}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Link href="/products">
                            <Button
                                variant="outline"
                                size="lg"
                                className="text-lg px-8 py-3 border-green-600 text-green-600 hover:bg-green-50"
                            >
                                Explore Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose GripInvest?
                        </h2>
                        <p className="text-lg text-gray-600">
                            Professional investment management with cutting-edge
                            technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <TrendingUp className="w-8 h-8 text-green-600" />
                                </div>
                                <CardTitle>
                                    AI-Powered Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Get personalized investment advice based on
                                    your risk appetite, age, and financial goals
                                    using advanced AI algorithms.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <Shield className="w-8 h-8 text-blue-600" />
                                </div>
                                <CardTitle>Secure & Regulated</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Your investments are protected with
                                    bank-grade security and regulatory
                                    compliance. Trade with confidence.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="text-center">
                            <CardHeader>
                                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <Target className="w-8 h-8 text-purple-600" />
                                </div>
                                <CardTitle>Curated Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Access carefully selected mutual funds,
                                    ETFs, and bonds that match your investment
                                    profile and goals.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-green-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
                        <div>
                            <div className="text-4xl font-bold mb-2">
                                10,000+
                            </div>
                            <div className="text-green-100">
                                Happy Investors
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">
                                ₹100Cr+
                            </div>
                            <div className="text-green-100">
                                Assets Under Management
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">15%+</div>
                            <div className="text-green-100">
                                Average Annual Returns
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to Start Your Investment Journey?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Join thousands of smart investors who trust GripInvest
                        for their financial growth.
                    </p>
                    <Button
                        size="lg"
                        onClick={handleGetStarted}
                        className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                    >
                        {user ? "Access Your Dashboard" : "Create Free Account"}
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-green-600 text-white rounded-lg p-2 mr-3">
                                <span className="font-bold text-lg">G</span>
                            </div>
                            <span className="font-bold text-xl">
                                GripInvest
                            </span>
                        </div>
                        <p className="text-gray-400">
                            © 2025 GripInvest. All rights reserved. Invest
                            wisely, grow consistently.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

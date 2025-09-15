"use client";

import { createClient } from "@/lib/supabase/client";
import { Navigation } from "@/components/navigation";
import { PortfolioStats } from "@/components/dashboard/portfolio-stats";
import { RecentInvestments } from "@/components/dashboard/recent-investments";
import { AIRecommendations } from "@/components/ai/ai-recommendations";
import { PortfolioAnalysis } from "@/components/ai/portfolio-analysis";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [investments, setInvestments] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const checkAuthAndLoadData = async () => {
            const supabase = createClient();

            // Check authentication
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session?.user) {
                console.log("No valid session, redirecting to login");
                router.push("/auth/login?returnTo=/dashboard");
                return;
            }

            setUser(session.user);

            // Load investments data
            try {
                const { data: investmentsData } = await supabase
                    .from("investments")
                    .select(
                        `
                        *,
                        investment_products (
                            name,
                            investment_type,
                            annual_yield
                        )
                        `
                    )
                    .eq("user_id", session.user.id)
                    .eq("status", "active");

                setInvestments(investmentsData || []);
            } catch (error) {
                console.error("Error loading investments:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndLoadData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    const totalInvested =
        investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    const totalValue =
        investments?.reduce(
            (sum, inv) => sum + Number(inv.expected_return),
            0
        ) || 0;
    const totalReturns = totalValue - totalInvested;
    const returnPercentage =
        totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    const portfolioData = {
        totalValue,
        totalInvested,
        totalReturns,
        activeInvestments: investments?.length || 0,
        returnPercentage,
    };

    const recentInvestments =
        investments?.slice(0, 3).map((inv) => {
            const amount = Number(inv.amount || 0);
            const currentValue = Number(inv.expected_return || amount);
            const returns = currentValue - amount;
            const returnPercentage = amount > 0 ? (returns / amount) * 100 : 0;

            return {
                id: inv.id,
                name: inv.investment_products?.name || "Unknown Investment",
                type: (
                    inv.investment_products?.investment_type || "OTHER"
                ).toUpperCase(),
                investedAmount: amount,
                currentValue: currentValue,
                returns,
                returnPercentage,
                investmentDate: inv.invested_at,
                maturityDate: inv.maturity_date,
            };
        }) || [];

    const isAdmin = user.email === "prakash.rawat.dev@gmail.com";

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Investment Dashboard
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back! Here&apos;s your portfolio overview.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/products">
                            <Button className="cursor-pointer bg-green-600 hover:bg-green-700">
                                Explore Products
                            </Button>
                        </Link>
                        {isAdmin && (
                            <Link href="/admin">
                                <Button
                                    variant="outline"
                                    className="cursor-pointer  border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                                >
                                    Admin Panel
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Portfolio Statistics */}
                    <PortfolioStats {...portfolioData} />

                    {/* Recent Investments - Full Width */}
                    <RecentInvestments investments={recentInvestments} />

                    {/* Portfolio Analysis and Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <PortfolioAnalysis />
                        <QuickActions />
                    </div>

                    {/* AI Recommendations - Full Width at Bottom */}
                    <AIRecommendations />
                </div>
            </main>
        </div>
    );
}

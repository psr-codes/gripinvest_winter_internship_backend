"use client";

import { createClient } from "@/lib/supabase/client";
import { Navigation } from "@/components/navigation";
import { PortfolioOverview } from "@/components/portfolio/portfolio-overview";
import { PortfolioTabs } from "@/components/portfolio/portfolio-tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function PortfolioPage() {
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
                router.push("/auth/login?returnTo=/portfolio");
                return;
            }

            setUser(session.user);

            // Fetch user investments with product details
            try {
                const { data: investmentsData, error: investmentsError } =
                    await supabase
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
                        .eq("user_id", session.user.id);

                if (investmentsError) throw investmentsError;
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
                    <p className="mt-4 text-gray-600">Loading portfolio...</p>
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

    // Process investments for display
    console.log("Raw investments data:", investments);

    const processedInvestments = investments.map((investment) => {
        console.log("Processing investment:", investment);

        // Better number parsing with validation
        const amount = investment.amount ? Number(investment.amount) : 0;
        const expectedReturn = investment.expected_return
            ? Number(investment.expected_return)
            : amount;
        const currentValue = expectedReturn || amount;
        const returns = currentValue - amount;
        const returnPercentage = amount > 0 ? (returns / amount) * 100 : 0;

        // Better date formatting
        const investmentDate = investment.invested_at
            ? new Date(investment.invested_at).toLocaleDateString("en-GB")
            : "Invalid Date";
        const maturityDate = investment.maturity_date
            ? new Date(investment.maturity_date).toLocaleDateString("en-GB")
            : "Not specified";

        console.log("Processed values:", {
            amount,
            currentValue,
            returns,
            returnPercentage,
            investmentDate,
            maturityDate,
        });

        return {
            ...investment,
            id: investment.id,
            product_name:
                investment.investment_products?.name || "Unknown Investment",
            investment_type:
                investment.investment_products?.investment_type || "OTHER",
            invested_amount: amount,
            current_value: currentValue,
            investment_date: investmentDate,
            maturity_date: maturityDate,
            status: investment.status || "active",
            // Keep the original properties as well for compatibility
            amount,
            currentValue,
            returns,
            returnPercentage,
            product: investment.investment_products,
        };
    });

    // Calculate portfolio totals
    const totalInvested = processedInvestments.reduce(
        (sum, inv) => sum + inv.amount,
        0
    );
    const totalValue = processedInvestments.reduce(
        (sum, inv) => sum + inv.currentValue,
        0
    );
    const totalReturns = totalValue - totalInvested;
    const overallReturnPercentage =
        totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    const portfolioSummary = {
        totalInvested,
        totalValue,
        totalReturns,
        returnPercentage: overallReturnPercentage,
        totalInvestments: processedInvestments.length,
        activeInvestments: processedInvestments.filter(
            (inv) => inv.status === "active"
        ).length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Portfolio
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Track and manage your investment portfolio
                        </p>
                    </div>
                    <Link href="/products">
                        <Button className="cursor-pointer bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Investment
                        </Button>
                    </Link>
                </div>

                <div className="space-y-8">
                    {/* Portfolio Overview */}
                    <PortfolioOverview
                        totalValue={portfolioSummary.totalValue}
                        totalInvested={portfolioSummary.totalInvested}
                        totalReturns={portfolioSummary.totalReturns}
                        activeInvestments={portfolioSummary.activeInvestments}
                        returnPercentage={portfolioSummary.returnPercentage}
                    />

                    {/* Portfolio Details with Tabs */}
                    <PortfolioTabs investments={processedInvestments} />
                </div>
            </main>
        </div>
    );
}

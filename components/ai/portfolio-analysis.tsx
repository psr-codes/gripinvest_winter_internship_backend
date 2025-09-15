"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Shield, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PortfolioAnalysis {
    overallScore: number;
    riskScore: number;
    diversificationScore: number;
    performanceScore: number;
    insights: Array<{
        category: string;
        score: number;
        description: string;
        recommendation: string;
    }>;
}

export function PortfolioAnalysis() {
    const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const fetchAnalysis = async () => {
        try {
            // Get user session for authentication
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();

            let response;

            // If user is authenticated, send token to get personalized analysis
            if (session?.access_token) {
                response = await fetch("/api/ai/portfolio-analysis", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        token: session.access_token,
                    }),
                });
            } else {
                // Fallback for unauthenticated users
                response = await fetch("/api/ai/portfolio-analysis", {
                    method: "GET",
                    credentials: "include",
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (error) {
            console.error("Error fetching portfolio analysis:", error);
            setAnalysis({
                overallScore: 0,
                riskScore: 0,
                diversificationScore: 0,
                performanceScore: 0,
                insights: [
                    {
                        category: "Error",
                        score: 0,
                        description:
                            "Unable to generate portfolio analysis at this time",
                        recommendation: "Please try again later",
                    },
                ],
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBadgeColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-800";
        if (score >= 60) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Risk Management":
                return <Shield className="w-4 h-4" />;
            case "Diversification":
                return <Target className="w-4 h-4" />;
            case "Performance":
                return <TrendingUp className="w-4 h-4" />;
            default:
                return <BarChart3 className="w-4 h-4" />;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Portfolio Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!analysis) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">No analysis available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">
                        Portfolio Analysis
                    </CardTitle>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchAnalysis}
                    className="cursor-pointer"
                >
                    Refresh
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold mb-2">
                            <span
                                className={getScoreColor(analysis.overallScore)}
                            >
                                {analysis.overallScore}
                            </span>
                            <span className="text-gray-400">/100</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Overall Portfolio Health Score
                        </p>
                    </div>

                    {/* Individual Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <Shield className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium">
                                    Risk
                                </span>
                            </div>
                            <div
                                className={`text-xl font-bold ${getScoreColor(
                                    analysis.riskScore
                                )}`}
                            >
                                {analysis.riskScore}
                            </div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <Target className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium">
                                    Diversification
                                </span>
                            </div>
                            <div
                                className={`text-xl font-bold ${getScoreColor(
                                    analysis.diversificationScore
                                )}`}
                            >
                                {analysis.diversificationScore}
                            </div>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium">
                                    Performance
                                </span>
                            </div>
                            <div
                                className={`text-xl font-bold ${getScoreColor(
                                    analysis.performanceScore
                                )}`}
                            >
                                {analysis.performanceScore}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Insights */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">
                            Detailed Insights
                        </h3>
                        {analysis.insights.map((insight, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getCategoryIcon(insight.category)}
                                        <span className="font-medium">
                                            {insight.category}
                                        </span>
                                    </div>
                                    <Badge
                                        className={getScoreBadgeColor(
                                            insight.score
                                        )}
                                    >
                                        {insight.score}/100
                                    </Badge>
                                </div>
                                <Progress
                                    value={insight.score}
                                    className="mb-2"
                                />
                                <p className="text-sm text-gray-600 mb-2">
                                    {insight.description}
                                </p>
                                <p className="text-sm font-medium text-blue-600">
                                    {insight.recommendation}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

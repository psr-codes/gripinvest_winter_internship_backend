"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Lightbulb,
    TrendingUp,
    Shield,
    Target,
    Sparkles,
    ChevronRight,
    Eye,
    RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Recommendation {
    type: string;
    title: string;
    description: string;
    priority: string;
    action: string;
    products: string[];
}

export function AIRecommendations() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setIsRefreshing(true);
            }

            // Get user session for authentication
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();

            let response;

            // If user is authenticated, send token to get personalized recommendations
            if (session?.access_token) {
                response = await fetch("/api/ai/recommendations", {
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
                response = await fetch("/api/ai/recommendations", {
                    method: "GET",
                    credentials: "include",
                });
            }

            const data = await response.json();

            // Ensure we always have an array to work with
            const recommendationsArray = Array.isArray(data.recommendations)
                ? data.recommendations
                : Array.isArray(data)
                ? data
                : [];

            setRecommendations(recommendationsArray);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            // Set empty array on error to prevent mapping issues
            setRecommendations([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getRecommendationIcon = (type: string) => {
        switch (type) {
            case "diversification":
                return <Target className="w-5 h-5 text-blue-600" />;
            case "risk_management":
                return <Shield className="w-5 h-5 text-orange-600" />;
            case "performance_improvement":
                return <TrendingUp className="w-5 h-5 text-green-600" />;
            default:
                return <Lightbulb className="w-5 h-5 text-purple-600" />;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-600" />
                        AI Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    <CardTitle className="text-lg">
                        AI Recommendations
                    </CardTitle>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchRecommendations(true)}
                    disabled={isRefreshing}
                    className="cursor-pointer"
                >
                    <RefreshCw
                        className={`w-4 h-4 mr-2 ${
                            isRefreshing ? "animate-spin" : ""
                        }`}
                    />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 mb-6">
                    AI-powered insights to optimize your investment portfolio
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recommendations.map((recommendation, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors h-full flex flex-col"
                        >
                            <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 bg-gray-100 rounded-full flex-shrink-0">
                                    {getRecommendationIcon(recommendation.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-medium text-gray-900 truncate text-sm">
                                            {recommendation.title}
                                        </h3>
                                        <Badge
                                            className={`${getPriorityColor(
                                                recommendation.priority
                                            )} text-xs flex-shrink-0`}
                                        >
                                            {recommendation.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                                        {recommendation.description}
                                    </p>
                                    <p className="text-xs font-medium text-green-600 mb-3 line-clamp-1">
                                        {recommendation.action}
                                    </p>
                                    {recommendation.products &&
                                        recommendation.products.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {recommendation.products
                                                    .slice(0, 1)
                                                    .map(
                                                        (
                                                            product,
                                                            productIndex
                                                        ) => (
                                                            <Badge
                                                                key={
                                                                    productIndex
                                                                }
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {product}
                                                            </Badge>
                                                        )
                                                    )}
                                                {recommendation.products
                                                    .length > 1 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        +
                                                        {recommendation.products
                                                            .length - 1}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="flex justify-end mt-3">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="cursor-pointer h-8 text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            View Details
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                {getRecommendationIcon(
                                                    recommendation.type
                                                )}
                                                {recommendation.title}
                                                <Badge
                                                    className={getPriorityColor(
                                                        recommendation.priority
                                                    )}
                                                >
                                                    {recommendation.priority}
                                                </Badge>
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2">
                                                    Description
                                                </h4>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {recommendation.description}
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2">
                                                    Recommended Action
                                                </h4>
                                                <p className="text-sm font-medium text-green-600">
                                                    {recommendation.action}
                                                </p>
                                            </div>
                                            {recommendation.products &&
                                                recommendation.products.length >
                                                    0 && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-2">
                                                            Related Products
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {recommendation.products.map(
                                                                (
                                                                    product,
                                                                    productIndex
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            productIndex
                                                                        }
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        {
                                                                            product
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

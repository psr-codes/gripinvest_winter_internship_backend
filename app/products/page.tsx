"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductCard } from "@/components/products/product-card";
import { InvestmentModal } from "@/components/products/investment-modal";
import { AIRecommendations } from "@/components/ai/ai-recommendations";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    name: string;
    description: string;
    investment_type: string;
    annual_yield: number;
    risk_level: string;
    min_investment: number;
    tenure_months?: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [typeValue, setTypeValue] = useState("all");
    const [riskValue, setRiskValue] = useState("all");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        fetchProducts();
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const supabase = createClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        console.log("🔍 Products page auth check:", {
            hasSession: !!session,
            hasUser: !!user,
            userEmail: user?.email,
            sessionId: session?.access_token?.substring(0, 20),
        });

        // Test server-side auth
        try {
            const authTestResponse = await fetch("/api/auth/test", {
                credentials: "include",
            });
            const authTestData = await authTestResponse.json();
            console.log("🧪 Server auth test:", authTestData);
        } catch (error) {
            console.error("🧪 Server auth test failed:", error);
        }

        setUser(user);
    };

    useEffect(() => {
        filterProducts();
    }, [products, searchValue, typeValue, riskValue]);

    const fetchProducts = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("investment_products")
                .select("*")
                .order("annual_yield", { ascending: false });

            console.log("fetching products...");

            if (error) throw error;
            setProducts(data || []);
            console.log("Fetched products:", data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        // Search filter
        if (searchValue) {
            filtered = filtered.filter(
                (product) =>
                    product.name
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                    product.description
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
            );
        }

        // Type filter
        if (typeValue !== "all") {
            filtered = filtered.filter(
                (product) => product.investment_type === typeValue
            );
        }

        // Risk filter
        if (riskValue !== "all") {
            filtered = filtered.filter(
                (product) => product.risk_level === riskValue
            );
        }

        setFilteredProducts(filtered);
    };

    const handleClearFilters = () => {
        setSearchValue("");
        setTypeValue("all");
        setRiskValue("all");
    };

    const handleInvest = (productId: string) => {
        if (!user) {
            // Redirect to login with return URL
            router.push(`/auth/login?returnTo=/products`);
            return;
        }

        const product = products.find((p) => p.id === productId);
        if (product) {
            setSelectedProduct(product);
            setIsModalOpen(true);
        }
    };

    const toggleRecommendations = () => {
        if (!user) {
            // Redirect to login with return URL
            router.push(`/auth/login?returnTo=/products`);
            return;
        }
        setShowRecommendations(!showRecommendations);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            Loading investment products...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Investment Products
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Discover and invest in carefully curated financial
                            products.
                        </p>
                    </div>
                    <Button
                        onClick={toggleRecommendations}
                        className="cursor-pointer bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                        {showRecommendations ? (
                            <>
                                <X className="w-4 h-4" />
                                Hide AI Recommendations
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Get AI Recommendations
                            </>
                        )}
                    </Button>
                </div>

                <div className="space-y-6">
                    {showRecommendations && (
                        <div className="mb-8">
                            <AIRecommendations />
                        </div>
                    )}

                    <ProductFilters
                        onSearchChange={setSearchValue}
                        onTypeChange={setTypeValue}
                        onRiskChange={setRiskValue}
                        onClearFilters={handleClearFilters}
                        searchValue={searchValue}
                        typeValue={typeValue}
                        riskValue={riskValue}
                    />

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">
                                No products found matching your criteria.
                            </p>
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="mt-4 bg-transparent cursor-pointer"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    description={product.description}
                                    productType={product.investment_type}
                                    annualYield={product.annual_yield}
                                    riskLevel={product.risk_level}
                                    minimumInvestment={product.min_investment}
                                    tenureMonths={product.tenure_months}
                                    onInvest={handleInvest}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <InvestmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
}

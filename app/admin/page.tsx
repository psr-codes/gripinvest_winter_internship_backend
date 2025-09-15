"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navigation } from "@/components/navigation";
import { TransactionLogs } from "@/components/admin/transaction-logs";
import { ProductManagement } from "@/components/admin/product-management";
import { TestCases } from "@/components/admin/test-cases";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [transactionLogs, setTransactionLogs] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const checkAdminAccess = async () => {
            const supabase = createClient();

            const { data, error } = await supabase.auth.getUser();
            console.log("Admin page - data: ", data);
            console.log("Admin page - error: ", error);

            if (error || !data?.user) {
                console.log("Admin page - No user, redirecting to login");
                router.push("/auth/login");
                return;
            }

            console.log("Admin page - data.user.email: ", data.user.email);
            console.log(
                "Admin page - email comparison: ",
                data.user.email === "prakash.rawat.dev@gmail.com"
            );

            if (data.user.email !== "prakash.rawat.dev@gmail.com") {
                console.log(
                    "Admin page - Not admin email, redirecting to dashboard"
                );
                router.push("/dashboard");
                return;
            }

            console.log("Admin page - Admin access granted");
            setUser(data.user);

            // Fetch transaction logs for admin dashboard
            const { data: transactionLogsData } = await supabase
                .from("transaction_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(100);

            // Fetch all investment products for management
            const { data: productsData } = await supabase
                .from("investment_products")
                .select("*")
                .order("created_at", { ascending: false });

            setTransactionLogs(transactionLogsData || []);
            setProducts(productsData || []);
            setIsLoading(false);
        };

        checkAdminAccess();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage the investment platform
                    </p>
                </div>

                <Tabs defaultValue="transactions" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="transactions">
                            Transaction Logs
                        </TabsTrigger>
                        <TabsTrigger value="products">
                            Product Management
                        </TabsTrigger>
                        <TabsTrigger value="tests">Test Cases</TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions">
                        <TransactionLogs logs={transactionLogs || []} />
                    </TabsContent>

                    <TabsContent value="products">
                        <ProductManagement products={products || []} />
                    </TabsContent>

                    <TabsContent value="tests">
                        <TestCases />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

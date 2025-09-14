"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            // Wait for 2 seconds before redirecting
            setTimeout(() => {
                if (user) {
                    router.push("/dashboard");
                } else {
                    router.push("/auth/login");
                }
            }, 2000);
        };

        checkAuth();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-green-600 mb-4">
                    Welcome to GripInvest
                </h1>
                <p className="text-xl text-gray-600">
                    Your journey to smarter investments starts here
                </p>
            </div>
        </div>
    );
}

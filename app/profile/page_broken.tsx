"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    age: number;
    risk_appetite: string;
    total_balance: number;
    created_at: string;
}

interface Investment {
    id: string;
    invested_amount: number;
    investment_products: {
        name: string;
        investment_type: string;
        risk_level: string;
        annual_yield: number;
    };
}
import {
    User as UserIcon,
    Mail,
    Calendar,
    TrendingUp,
    Target,
    Shield,
} from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        age: 0,
        risk_appetite: "moderate",
        total_balance: 0,
    });
    const [updateStatus, setUpdateStatus] = useState({ message: "", type: "" });

    const [investments, setInvestments] = useState<Investment[] | null>(null);
    const [totalInvested, setTotalInvested] = useState(0);

    // Improved session check and auth state listener
    useEffect(() => {
        const supabase = createClient();

        // Initial session check (avoids null on first load)
        const checkSession = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();
            if (error || !session) {
                router.push("/auth/login");
            } else {
                setUser(session.user);
            }
            console.log("Initial session is : ", session);
        };
        checkSession();

        // Listen for future auth changes
        const {
            data: { subscription: authListener },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUser(session.user);
            } else {
                router.push("/auth/login");
            }
            console.log("Auth state change session is : ", session);
        });

        // Clean up listener
        return () => {
            authListener.unsubscribe();
        };
    }, [router]);

    useEffect(() => {
        const supabase = createClient();

        // Initial session check
        const fetchData = async () => {
            const {
                data: { session: currentSession },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !currentSession) {
                router.push("/auth/login");
                return;
            }

            setUser(currentSession.user);

            // Fetch user profile
            const { data: profileData, error: profileError } = await supabase
                .from("users")
                .select("*")
                .eq("id", currentSession.user.id)
                .single();

            if (!profileError && profileData) {
                setProfile(profileData);
                setFormData({
                    first_name: profileData.first_name || "",
                    last_name: profileData.last_name || "",
                    age: profileData.age || 0,
                    risk_appetite: profileData.risk_appetite || "moderate",
                    total_balance: profileData.total_balance || 0,
                });

                // Fetch user investments
                const { data: investmentsData } = await supabase
                    .from("user_investments")
                    .select(
                        `
                        *,
                        investment_products (
                            name,
                            investment_type,
                            risk_level,
                            annual_yield
                        )
                    `
                    )
                    .eq("user_id", currentSession.user.id)
                    .eq("status", "active");

                setInvestments(investmentsData);

                // Calculate total invested
                const total =
                    investmentsData?.reduce(
                        (sum, inv) => sum + Number(inv.invested_amount),
                        0
                    ) || 0;
                setTotalInvested(total);
            }
        };

        fetchData();
    }, [router]);
    const isAdmin = user?.email === "prakash.rawat.dev@gmail.com";

    const handleUpdateProfile = async () => {
        setIsLoading(true);
        setUpdateStatus({ message: "", type: "" });

        try {
            if (!user?.id) {
                throw new Error("User ID not found");
            }

            const supabase = createClient();

            // First check if the user record exists
            const { data: existingUser, error: checkError } = await supabase
                .from("users")
                .select()
                .eq("id", user.id)
                .single();

            if (checkError) {
                // If user doesn't exist, create a new record
                const { error: insertError } = await supabase
                    .from("users")
                    .insert({
                        id: user.id,
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        age: formData.age,
                        risk_appetite: formData.risk_appetite,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });

                if (insertError) throw insertError;
            } else {
                // If user exists, update the record
                const { error: updateError } = await supabase
                    // Reliable client-side session check and auth state listener
                    useEffect(() => {
                        const supabase = createClient();

                        // Initial session check using getUser()
                        const checkUser = async () => {
                            const { data: userData, error } = await supabase.auth.getUser();
                            if (error || !userData?.user) {
                                router.push("/auth/login");
                            } else {
                                setUser(userData.user);
                            }
                            console.log("Initial user is : ", userData?.user);
                        };
                        checkUser();

                        // Listen for future auth changes
                        const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((_event, session) => {
                            if (session && session.user) {
                                setUser(session.user);
                            } else {
                                router.push("/auth/login");
                            }
                            console.log("Auth state change session is : ", session);
                        });

                        // Clean up listener
                        return () => {
                            authListener.unsubscribe();
                        };
                    }, [router]);
                    .update({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        age: formData.age,
                        risk_appetite: formData.risk_appetite,
                        total_balance: formData.total_balance,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", user.id);

                if (updateError) throw updateError;
            }

            setUpdateStatus({
                message: "Profile updated successfully!",
                type: "success",
            });

            // Refresh the profile data
            const { data: newProfile } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();

            if (newProfile) {
                setProfile(newProfile);
            }
        } catch (error: any) {
            console.error("Error updating profile:", error);
            setUpdateStatus({
                message:
                    error.message ||
                    "Failed to update profile. Please try again.",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Generate AI recommendations based on profile
    const generateRecommendations = () => {
        const riskLevel = profile?.risk_appetite || "moderate";
        const recommendations = [];

        if (riskLevel === "conservative") {
            recommendations.push(
                "Consider increasing allocation to Fixed Deposits and Government Bonds"
            );
            recommendations.push(
                "Your conservative approach is good for capital preservation"
            );
        } else if (riskLevel === "moderate") {
            recommendations.push(
                "Balance your portfolio with 60% equity and 40% debt instruments"
            );
            recommendations.push(
                "Consider adding HDFC Large Cap Fund for stable growth"
            );
        } else {
            recommendations.push("Explore high-growth mutual funds and ETFs");
            recommendations.push(
                "Consider increasing equity allocation for higher returns"
            );
        }

        if (totalInvested < 50000) {
            recommendations.push(
                "Start with SIP investments to build a strong foundation"
            );
        }

        return recommendations;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Profile
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage your account details and investment
                            preferences.
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <Shield className="w-4 h-4" />
                            Admin User
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserIcon className="w-5 h-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="first_name">
                                            First Name
                                        </Label>
                                        <Input
                                            id="first_name"
                                            value={formData.first_name}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    first_name: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="last_name"
                                            value={formData.last_name}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    last_name: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={user?.email || ""}
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="age">Age</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            min="0"
                                            max="150"
                                            value={formData.age}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    age:
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="total_balance">
                                            Add Balance (₹)
                                        </Label>
                                        <Input
                                            id="total_balance"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.total_balance}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    total_balance:
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="risk_appetite">
                                        Risk Appetite
                                    </Label>
                                    <Select
                                        value={formData.risk_appetite}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                risk_appetite: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your risk appetite" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="conservative">
                                                Conservative - Low risk, stable
                                                returns
                                            </SelectItem>
                                            <SelectItem value="moderate">
                                                Moderate - Balanced risk and
                                                returns
                                            </SelectItem>
                                            <SelectItem value="aggressive">
                                                Aggressive - High risk, high
                                                returns
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {updateStatus.message && (
                                    <div
                                        className={`text-sm ${
                                            updateStatus.type === "success"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        } mb-2`}
                                    >
                                        {updateStatus.message}
                                    </div>
                                )}
                                <Button
                                    className="cursor-pointer bg-green-600 hover:bg-green-700"
                                    onClick={handleUpdateProfile}
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? "Updating..."
                                        : "Update Profile"}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Account Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Email Verified
                                            </p>
                                            <p className="font-medium">Yes</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Member Since
                                            </p>
                                            <p className="font-medium">
                                                {new Date(
                                                    profile?.created_at ||
                                                        (user?.created_at as string) ||
                                                        new Date()
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Recommendations */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    AI Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">
                                            Based on Your Profile
                                        </h4>
                                        <ul className="space-y-2">
                                            {generateRecommendations().map(
                                                (rec, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-sm text-blue-800 flex items-start gap-2"
                                                    >
                                                        <Target className="w-3 h-3 mt-1 flex-shrink-0" />
                                                        {rec}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>

                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <h4 className="font-medium text-green-900 mb-2">
                                            Portfolio Health
                                        </h4>
                                        <p className="text-sm text-green-800">
                                            {investments &&
                                            investments.length > 0
                                                ? `You have ${
                                                      investments.length
                                                  } active investment${
                                                      investments.length === 1
                                                          ? ""
                                                          : "s"
                                                  }. Consider diversifying across different asset classes.`
                                                : "Start your investment journey with our curated products."}
                                        </p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full bg-transparent"
                                    >
                                        Get Detailed Analysis
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

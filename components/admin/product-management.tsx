"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface InvestmentProduct {
    id: string;
    name: string;
    investment_type: string;
    tenure_months: number;
    annual_yield: number;
    risk_level: string;
    min_investment: number;
    description: string;
    created_at: string;
}

export function ProductManagement() {
    const [products, setProducts] = useState<InvestmentProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] =
        useState<InvestmentProduct | null>(null);
    const [isGeneratingDescription, setIsGeneratingDescription] =
        useState(false);
    const [isAdminChecked, setIsAdminChecked] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        investment_type: "",
        tenure_months: "",
        annual_yield: "",
        risk_level: "",
        min_investment: "",
        description: "",
    });

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const isAdmin = await checkAdmin();
            if (isAdmin) {
                await fetchProducts();
            }
        };
        init();
    }, []);

    const checkAdmin = async () => {
        if (isAdminChecked) return true;

        try {
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError || !session) {
                router.push("/auth/login");
                return false;
            }

            // Check if user is admin
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("email")
                .eq("id", session.user.id)
                .single();

            if (
                userError ||
                !userData ||
                userData.email !== "prakash.rawat.dev@gmail.com"
            ) {
                console.log("Not an admin:", userData?.email);
                router.push("/dashboard");
                return false;
            }

            setIsAdminChecked(true);
            return true;
        } catch (error) {
            console.error("Admin check error:", error);
            router.push("/dashboard");
            return false;
        }
    };

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from("investment_products")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const productData = {
                name: formData.name,
                investment_type: formData.investment_type,
                tenure_months: Number.parseInt(formData.tenure_months),
                annual_yield: Number.parseFloat(formData.annual_yield),
                risk_level: formData.risk_level,
                min_investment: Number.parseFloat(formData.min_investment),
                description: formData.description,
            };

            console.log("Product data being sent to database:", productData);

            let error;
            if (editingProduct) {
                const { error: updateError } = await supabase
                    .from("investment_products")
                    .update(productData)
                    .eq("id", editingProduct.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("investment_products")
                    .insert([productData]);
                error = insertError;
            }

            if (error) {
                console.error("Error:", error);
                throw error;
            }

            await fetchProducts();
            setFormData({
                name: "",
                investment_type: "",
                tenure_months: "",
                annual_yield: "",
                risk_level: "",
                min_investment: "",
                description: "",
            });
            setIsDialogOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error("Error saving product:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "An error occurred while saving the product"
            );
        }
    };

    const handleEdit = (product: InvestmentProduct) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            investment_type: product.investment_type,
            tenure_months: product.tenure_months.toString(),
            annual_yield: product.annual_yield.toString(),
            risk_level: product.risk_level,
            min_investment: product.min_investment.toString(),
            description: product.description,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const { error } = await supabase
                .from("investment_products")
                .delete()
                .eq("id", id);

            if (error) throw error;
            await fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            investment_type: "",
            tenure_months: "",
            annual_yield: "",
            risk_level: "",
            min_investment: "",
            description: "",
        });
        setEditingProduct(null);
    };

    const getRiskBadge = (risk: string) => {
        const colors = {
            low: "bg-green-100 text-green-800",
            moderate: "bg-yellow-100 text-yellow-800",
            high: "bg-red-100 text-red-800",
        };
        return (
            <Badge className={colors[risk as keyof typeof colors]}>
                {risk}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        if (!type) {
            return <Badge className="bg-gray-100 text-gray-800">UNKNOWN</Badge>;
        }

        const colors = {
            fd: "bg-blue-100 text-blue-800",
            mf: "bg-purple-100 text-purple-800",
            bond: "bg-green-100 text-green-800",
            etf: "bg-orange-100 text-orange-800",
            other: "bg-gray-100 text-gray-800",
        };
        return (
            <Badge
                className={
                    colors[type as keyof typeof colors] ||
                    "bg-gray-100 text-gray-800"
                }
            >
                {type.toUpperCase()}
            </Badge>
        );
    };

    const generateDescription = async () => {
        if (
            !formData.name ||
            !formData.investment_type ||
            !formData.tenure_months ||
            !formData.annual_yield ||
            !formData.risk_level ||
            !formData.min_investment
        ) {
            alert(
                "Please fill in all required fields before generating description"
            );
            return;
        }

        setIsGeneratingDescription(true);
        try {
            const response = await fetch("/api/ai/product-description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    type: formData.investment_type,
                    tenure: formData.tenure_months,
                    annualYield: formData.annual_yield,
                    riskLevel: formData.risk_level,
                    minInvestment: formData.min_investment,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate description");
            }

            const data = await response.json();
            setFormData({ ...formData, description: data.description });
        } catch (error) {
            console.error("Error generating description:", error);
            alert("Failed to generate description. Please try again.");
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">Loading products...</div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>
                            Investment Products ({products.length})
                        </CardTitle>
                        <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    onClick={resetForm}
                                    className="cursor-pointer bg-green-600 hover:bg-green-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Product
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingProduct
                                            ? "Edit Product"
                                            : "Add New Product"}
                                    </DialogTitle>
                                </DialogHeader>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">
                                                Product Name
                                            </Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        name: e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="investment_type">
                                                Type
                                            </Label>
                                            <Select
                                                value={formData.investment_type}
                                                onValueChange={(value) =>
                                                    setFormData({
                                                        ...formData,
                                                        investment_type: value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fd">
                                                        Fixed Deposit
                                                    </SelectItem>
                                                    <SelectItem value="mf">
                                                        Mutual Fund
                                                    </SelectItem>
                                                    <SelectItem value="bond">
                                                        Bond
                                                    </SelectItem>
                                                    <SelectItem value="etf">
                                                        ETF
                                                    </SelectItem>
                                                    <SelectItem value="other">
                                                        Other
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="tenure_months">
                                                Tenure (Months)
                                            </Label>
                                            <Input
                                                id="tenure_months"
                                                type="number"
                                                value={formData.tenure_months}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        tenure_months:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="annual_yield">
                                                Annual Yield (%)
                                            </Label>
                                            <Input
                                                id="annual_yield"
                                                type="number"
                                                step="0.01"
                                                value={formData.annual_yield}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        annual_yield:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="risk_level">
                                                Risk Level
                                            </Label>
                                            <Select
                                                value={formData.risk_level}
                                                onValueChange={(value) =>
                                                    setFormData({
                                                        ...formData,
                                                        risk_level: value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select risk" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">
                                                        Low
                                                    </SelectItem>
                                                    <SelectItem value="moderate">
                                                        Moderate
                                                    </SelectItem>
                                                    <SelectItem value="high">
                                                        High
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="min_investment">
                                                Min Investment (₹)
                                            </Label>
                                            <Input
                                                id="min_investment"
                                                type="number"
                                                value={formData.min_investment}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        min_investment:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="description">
                                                Description
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={generateDescription}
                                                disabled={
                                                    isGeneratingDescription
                                                }
                                                className="text-xs bg-transparent"
                                            >
                                                {isGeneratingDescription ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                                                        Generating...
                                                    </>
                                                ) : (
                                                    "✨ Generate with AI"
                                                )}
                                            </Button>
                                        </div>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    description: e.target.value,
                                                })
                                            }
                                            rows={4}
                                            placeholder="Product description will be generated here..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setIsDialogOpen(false)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {editingProduct
                                                ? "Update"
                                                : "Create"}{" "}
                                            Product
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Name</th>
                                    <th className="text-left p-2">Type</th>
                                    <th className="text-left p-2">Yield</th>
                                    <th className="text-left p-2">Risk</th>
                                    <th className="text-left p-2">
                                        Min Investment
                                    </th>
                                    <th className="text-left p-2">Tenure</th>
                                    <th className="text-left p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-2 font-medium">
                                            {product.name}
                                        </td>
                                        <td className="p-2">
                                            {getTypeBadge(
                                                product.investment_type
                                            )}
                                        </td>
                                        <td className="p-2">
                                            {product.annual_yield}%
                                        </td>
                                        <td className="p-2">
                                            {getRiskBadge(product.risk_level)}
                                        </td>
                                        <td className="p-2">
                                            ₹
                                            {product.min_investment?.toLocaleString() ||
                                                "0"}
                                        </td>
                                        <td className="p-2">
                                            {product.tenure_months} months
                                        </td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleEdit(product)
                                                    }
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

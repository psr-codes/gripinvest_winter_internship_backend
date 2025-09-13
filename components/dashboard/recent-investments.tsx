import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

interface Investment {
    id: string;
    name: string;
    type: string;
    investedAmount: number;
    currentValue: number;
    returns: number;
    returnPercentage: number;
    investmentDate: string | null;
    maturityDate?: string | null;
}

interface RecentInvestmentsProps {
    investments: Investment[];
}

export function RecentInvestments({ investments }: RecentInvestmentsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Invalid Date";
        try {
            return new Date(dateString).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch (error) {
            return "Invalid Date";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "FD":
                return "bg-blue-100 text-blue-800";
            case "MF":
                return "bg-green-100 text-green-800";
            case "BOND":
                return "bg-purple-100 text-purple-800";
            case "ETF":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">
                        Recent Investments
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Your latest investment activities
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    View Full Portfolio
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {investments.map((investment) => (
                        <div
                            key={investment.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-medium text-gray-900">
                                        {investment.name}
                                    </h3>
                                    <Badge
                                        className={getTypeColor(
                                            investment.type
                                        )}
                                    >
                                        {investment.type}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            Invested:{" "}
                                            {formatDate(
                                                investment.investmentDate
                                            )}
                                        </span>
                                    </div>
                                    {investment.maturityDate && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                Maturity:{" "}
                                                {formatDate(
                                                    investment.maturityDate
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-600">
                                    Invested
                                </div>
                                <div className="font-medium">
                                    {formatCurrency(investment.investedAmount)}
                                </div>
                            </div>
                            <div className="text-right ml-6">
                                <div className="text-sm text-gray-600">
                                    Current Value
                                </div>
                                <div className="font-medium">
                                    {formatCurrency(investment.currentValue)}
                                </div>
                            </div>
                            <div className="text-right ml-6">
                                <div className="text-sm text-gray-600">
                                    Returns
                                </div>
                                <div
                                    className={`font-medium ${
                                        investment.returns >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    +{formatCurrency(investment.returns)} (
                                    {investment.returnPercentage}%)
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

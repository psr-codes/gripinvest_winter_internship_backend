import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface Investment {
    id: string;
    product_name: string;
    investment_type: string;
    invested_amount: number;
    current_value: number;
    investment_date: string;
    maturity_date?: string;
    status: string;
}

interface InvestmentDetailsProps {
    investments: Investment[];
}

export function InvestmentDetails({ investments }: InvestmentDetailsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
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

    const getRiskColor = (type: string) => {
        switch (type) {
            case "FD":
                return "bg-green-100 text-green-800";
            case "MF":
                return "bg-yellow-100 text-yellow-800";
            case "BOND":
                return "bg-green-100 text-green-800";
            case "ETF":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getRiskLabel = (type: string) => {
        switch (type) {
            case "FD":
                return "low";
            case "MF":
                return "moderate";
            case "BOND":
                return "low";
            case "ETF":
                return "moderate";
            default:
                return "low";
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Investment Details</CardTitle>
                <p className="text-sm text-gray-600">
                    Complete list of your investments with current performance
                </p>
            </CardHeader>
            <CardContent>
                {investments.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                            No investments found
                        </p>
                        <Button className="bg-green-600 hover:bg-green-700">
                            Start Investing
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {investments.map((investment) => {
                            const returns =
                                investment.current_value -
                                investment.invested_amount;
                            const returnPercentage = (
                                (returns / investment.invested_amount) *
                                100
                            ).toFixed(1);
                            const isPositive = returns >= 0;

                            return (
                                <div
                                    key={investment.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-medium text-gray-900">
                                                {investment.product_name}
                                            </h3>
                                            <Badge
                                                className={getTypeColor(
                                                    investment.investment_type
                                                )}
                                            >
                                                {investment.investment_type}
                                            </Badge>
                                            <Badge
                                                className={getRiskColor(
                                                    investment.investment_type
                                                )}
                                            >
                                                {getRiskLabel(
                                                    investment.investment_type
                                                )}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    Invested:{" "}
                                                    {formatDate(
                                                        investment.investment_date
                                                    )}
                                                </span>
                                            </div>
                                            {investment.maturity_date && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        Maturity:{" "}
                                                        {formatDate(
                                                            investment.maturity_date
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
                                            {formatCurrency(
                                                investment.invested_amount
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right ml-6">
                                        <div className="text-sm text-gray-600">
                                            Current Value
                                        </div>
                                        <div className="font-medium">
                                            {formatCurrency(
                                                investment.current_value
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right ml-6">
                                        <div className="text-sm text-gray-600">
                                            Returns
                                        </div>
                                        <div
                                            className={`font-medium flex items-center gap-1 ${
                                                isPositive
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {isPositive ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4" />
                                            )}
                                            <span>
                                                {isPositive ? "+" : ""}
                                                {formatCurrency(returns)} (
                                                {returnPercentage}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

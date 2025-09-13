import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";

interface PortfolioStatsProps {
    totalValue: number;
    totalInvested: number;
    totalReturns: number;
    activeInvestments: number;
    returnPercentage: number;
}

export function PortfolioStats({
    totalValue,
    totalInvested,
    totalReturns,
    activeInvestments,
    returnPercentage,
}: PortfolioStatsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Portfolio Value */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-sm font-medium">
                                Total Portfolio Value
                            </p>
                            <p className="text-3xl font-bold mt-2 text-white">
                                {formatCurrency(totalValue)}
                            </p>
                            <div className="flex items-center mt-2 text-white">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span className="text-sm">
                                    +{returnPercentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total Invested */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">
                                Total Invested
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {formatCurrency(totalInvested)}
                            </p>
                            <div className="flex items-center mt-2 text-gray-500">
                                <DollarSign className="w-4 h-4 mr-1" />
                                <span className="text-sm">
                                    Principal amount
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total Returns */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">
                                Total Returns
                            </p>
                            <p className="text-2xl font-bold text-green-600 mt-2">
                                +{formatCurrency(totalReturns)}
                            </p>
                            <div className="flex items-center mt-2 text-green-600">
                                <Target className="w-4 h-4 mr-1" />
                                <span className="text-sm">Profit earned</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Active Investments */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">
                                Active Investments
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {activeInvestments}
                            </p>
                            <div className="flex items-center mt-2 text-gray-500">
                                <BarChart3 className="w-4 h-4 mr-1" />
                                <span className="text-sm">Products</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

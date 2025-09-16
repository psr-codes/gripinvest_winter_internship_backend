"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign,
    Search,
    Filter,
} from "lucide-react";
import { useState } from "react";

interface Transaction {
    id: string;
    transaction_type: string;
    amount: number;
    transaction_date: string;
    description: string;
    investment_id?: string;
}

interface TransactionHistoryProps {
    transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc");

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
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "investment":
                return <ArrowUpRight className="w-4 h-4 text-green-600" />;
            case "withdrawal":
                return <ArrowDownLeft className="w-4 h-4 text-red-600" />;
            case "interest":
                return <DollarSign className="w-4 h-4 text-blue-600" />;
            default:
                return <DollarSign className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case "investment":
                return "bg-green-100 text-green-800";
            case "withdrawal":
                return "bg-red-100 text-red-800";
            case "interest":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getAmountColor = (type: string) => {
        switch (type) {
            case "investment":
                return "text-green-600";
            case "withdrawal":
                return "text-red-600";
            case "interest":
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
    };

    // Filter and sort transactions
    const filteredTransactions = transactions
        .filter((transaction) => {
            const matchesSearch = transaction.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesType =
                typeFilter === "all" ||
                transaction.transaction_type === typeFilter;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            const dateA = new Date(a.transaction_date).getTime();
            const dateB = new Date(b.transaction_date).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Transaction History</CardTitle>
                <p className="text-sm text-gray-600">
                    Complete record of all your investment transactions
                </p>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-48">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="investment">
                                Investments
                            </SelectItem>
                            <SelectItem value="withdrawal">
                                Withdrawals
                            </SelectItem>
                            <SelectItem value="interest">Interest</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="desc">Newest First</SelectItem>
                            <SelectItem value="asc">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Transaction List */}
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                            No transactions found
                        </p>
                        <Button className="cursor-pointer  bg-green-600 hover:bg-green-700">
                            Start Investing
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-100 rounded-full">
                                        {getTransactionIcon(
                                            transaction.transaction_type
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-900">
                                                {transaction.description}
                                            </h3>
                                            <Badge
                                                className={getTransactionColor(
                                                    transaction.transaction_type
                                                )}
                                            >
                                                {transaction.transaction_type}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(
                                                transaction.transaction_date
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div
                                        className={`text-lg font-semibold ${getAmountColor(
                                            transaction.transaction_type
                                        )}`}
                                    >
                                        {transaction.transaction_type ===
                                        "withdrawal"
                                            ? "-"
                                            : "+"}
                                        {formatCurrency(transaction.amount)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

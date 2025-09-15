"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Search, Filter } from "lucide-react";

interface TransactionLog {
    id: number;
    user_id: string;
    email: string;
    endpoint: string;
    http_method: string;
    status_code: number;
    error_message: string | null;
    created_at: string;
}

interface TransactionLogsProps {
    logs: TransactionLog[];
}

export function TransactionLogs({ logs: initialLogs }: TransactionLogsProps) {
    const [logs] = useState<TransactionLog[]>(initialLogs);
    const [filteredLogs, setFilteredLogs] =
        useState<TransactionLog[]>(initialLogs);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [methodFilter, setMethodFilter] = useState("all");
    const [aiSummary, setAiSummary] = useState("");

    useEffect(() => {
        filterLogs();
    }, [logs, searchTerm, statusFilter, methodFilter]);

    const filterLogs = () => {
        let filtered = logs;

        if (searchTerm) {
            filtered = filtered.filter(
                (log) =>
                    log.email
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    log.endpoint
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    log.error_message
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "all") {
            if (statusFilter === "error") {
                filtered = filtered.filter((log) => log.status_code >= 400);
            } else if (statusFilter === "success") {
                filtered = filtered.filter((log) => log.status_code < 400);
            }
        }

        if (methodFilter !== "all") {
            filtered = filtered.filter(
                (log) => log.http_method === methodFilter
            );
        }

        setFilteredLogs(filtered);
    };

    const generateAISummary = async () => {
        const errorLogs = filteredLogs.filter((log) => log.status_code >= 400);
        if (errorLogs.length === 0) {
            setAiSummary("No errors found in the current filter.");
            return;
        }

        // Mock AI summary - in real app, this would call an AI service
        const commonErrors = errorLogs.reduce((acc, log) => {
            const key = `${log.status_code}-${log.endpoint}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topErrors = Object.entries(commonErrors)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        const summary = `Analysis of ${
            errorLogs.length
        } errors:\n\nTop Issues:\n${topErrors
            .map(([key, count]) => {
                const [status, endpoint] = key.split("-");
                return `• ${count}x ${status} errors on ${endpoint}`;
            })
            .join(
                "\n"
            )}\n\nRecommendation: Focus on fixing the most frequent errors first.`;

        setAiSummary(summary);
    };

    const getStatusBadge = (statusCode: number) => {
        if (statusCode < 300)
            return (
                <Badge className="bg-green-100 text-green-800">Success</Badge>
            );
        if (statusCode < 400)
            return (
                <Badge className="bg-yellow-100 text-yellow-800">
                    Redirect
                </Badge>
            );
        if (statusCode < 500)
            return (
                <Badge className="bg-red-100 text-red-800">Client Error</Badge>
            );
        return <Badge className="bg-red-100 text-red-800">Server Error</Badge>;
    };

    const getMethodBadge = (method: string) => {
        const colors = {
            GET: "bg-blue-100 text-blue-800",
            POST: "bg-green-100 text-green-800",
            PUT: "bg-yellow-100 text-yellow-800",
            DELETE: "bg-red-100 text-red-800",
        };
        return (
            <Badge
                className={
                    colors[method as keyof typeof colors] ||
                    "bg-gray-100 text-gray-800"
                }
            >
                {method}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters & AI Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="success">
                                    Success (2xx)
                                </SelectItem>
                                <SelectItem value="error">
                                    Errors (4xx, 5xx)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={methodFilter}
                            onValueChange={setMethodFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Methods</SelectItem>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={generateAISummary}
                            className="cursor-pointer bg-purple-600 hover:bg-purple-700"
                        >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            AI Error Summary
                        </Button>
                    </div>

                    {aiSummary && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h4 className="font-semibold text-purple-800 mb-2">
                                AI Analysis
                            </h4>
                            <pre className="text-sm text-purple-700 whitespace-pre-wrap">
                                {aiSummary}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transaction Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Transaction Logs ({filteredLogs.length} records)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Timestamp</th>
                                    <th className="text-left p-2">User</th>
                                    <th className="text-left p-2">Method</th>
                                    <th className="text-left p-2">Endpoint</th>
                                    <th className="text-left p-2">Status</th>
                                    <th className="text-left p-2">Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="p-2">
                                            {new Date(
                                                log.created_at
                                            ).toLocaleString()}
                                        </td>
                                        <td className="p-2">
                                            {log.email || "Anonymous"}
                                        </td>
                                        <td className="p-2">
                                            {getMethodBadge(log.http_method)}
                                        </td>
                                        <td className="p-2 font-mono text-xs">
                                            {log.endpoint}
                                        </td>
                                        <td className="p-2">
                                            {getStatusBadge(log.status_code)}
                                        </td>
                                        <td className="p-2 max-w-xs truncate">
                                            {log.error_message || "-"}
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

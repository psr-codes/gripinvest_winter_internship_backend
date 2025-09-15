"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle, XCircle, Clock } from "lucide-react";

interface TestCase {
    id: string;
    name: string;
    description: string;
    status: "pending" | "running" | "passed" | "failed";
    coverage: number;
    lastRun: string;
}

export function TestCases() {
    const [testCases] = useState<TestCase[]>([
        {
            id: "1",
            name: "Authentication Flow",
            description: "Tests user signup, login, and logout functionality",
            status: "passed",
            coverage: 85,
            lastRun: "2024-01-15 10:30:00",
        },
        {
            id: "2",
            name: "Investment Creation",
            description: "Tests investment product selection and purchase flow",
            status: "passed",
            coverage: 78,
            lastRun: "2024-01-15 10:25:00",
        },
        {
            id: "3",
            name: "Portfolio Calculations",
            description: "Tests portfolio value and return calculations",
            status: "failed",
            coverage: 92,
            lastRun: "2024-01-15 10:20:00",
        },
        {
            id: "4",
            name: "Transaction Logging",
            description: "Tests API request logging and error handling",
            status: "passed",
            coverage: 88,
            lastRun: "2024-01-15 10:15:00",
        },
        {
            id: "5",
            name: "Admin Functions",
            description: "Tests admin panel functionality and permissions",
            status: "pending",
            coverage: 65,
            lastRun: "2024-01-14 15:30:00",
        },
        {
            id: "6",
            name: "AI Recommendations",
            description: "Tests AI-powered investment recommendations",
            status: "running",
            coverage: 70,
            lastRun: "2024-01-15 10:35:00",
        },
    ]);

    const [overallCoverage] = useState(79.7);
    const [runningTests, setRunningTests] = useState<Set<string>>(
        new Set(["6"])
    );

    const runTest = (testId: string) => {
        setRunningTests((prev) => new Set([...prev, testId]));

        // Simulate test run
        setTimeout(() => {
            setRunningTests((prev) => {
                const newSet = new Set(prev);
                newSet.delete(testId);
                return newSet;
            });
        }, 3000);
    };

    const runAllTests = () => {
        const pendingTests = testCases
            .filter((test) => test.status === "pending")
            .map((test) => test.id);
        setRunningTests(new Set(pendingTests));

        setTimeout(() => {
            setRunningTests(new Set());
        }, 5000);
    };

    const getStatusIcon = (status: string, testId: string) => {
        if (runningTests.has(testId)) {
            return <Clock className="w-4 h-4 text-yellow-600 animate-spin" />;
        }

        switch (status) {
            case "passed":
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case "failed":
                return <XCircle className="w-4 h-4 text-red-600" />;
            case "running":
                return (
                    <Clock className="w-4 h-4 text-yellow-600 animate-spin" />
                );
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string, testId: string) => {
        if (runningTests.has(testId)) {
            return (
                <Badge className="bg-yellow-100 text-yellow-800">Running</Badge>
            );
        }

        const colors = {
            passed: "bg-green-100 text-green-800",
            failed: "bg-red-100 text-red-800",
            running: "bg-yellow-100 text-yellow-800",
            pending: "bg-gray-100 text-gray-800",
        };
        return (
            <Badge className={colors[status as keyof typeof colors]}>
                {status}
            </Badge>
        );
    };

    const getCoverageColor = (coverage: number) => {
        if (coverage >= 80) return "bg-green-500";
        if (coverage >= 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="space-y-6">
            {/* Overall Coverage */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Test Coverage Overview</CardTitle>
                        <Button
                            onClick={runAllTests}
                            className="cursor-pointer  bg-blue-600 hover:bg-blue-700"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Run All Tests
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">
                                    Overall Coverage
                                </span>
                                <span className="text-sm text-gray-600">
                                    {overallCoverage}%
                                </span>
                            </div>
                            <Progress value={overallCoverage} className="h-3" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {
                                        testCases.filter(
                                            (t) => t.status === "passed"
                                        ).length
                                    }
                                </div>
                                <div className="text-sm text-green-600">
                                    Passed
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                    {
                                        testCases.filter(
                                            (t) => t.status === "failed"
                                        ).length
                                    }
                                </div>
                                <div className="text-sm text-red-600">
                                    Failed
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {
                                        testCases.filter(
                                            (t) =>
                                                t.status === "running" ||
                                                runningTests.has(t.id)
                                        ).length
                                    }
                                </div>
                                <div className="text-sm text-yellow-600">
                                    Running
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-gray-600">
                                    {
                                        testCases.filter(
                                            (t) =>
                                                t.status === "pending" &&
                                                !runningTests.has(t.id)
                                        ).length
                                    }
                                </div>
                                <div className="text-sm text-gray-600">
                                    Pending
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Cases */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Cases ({testCases.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {testCases.map((test) => (
                            <div
                                key={test.id}
                                className="border rounded-lg p-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(test.status, test.id)}
                                        <div>
                                            <h4 className="font-medium">
                                                {test.name}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {test.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {test.coverage}%
                                            </div>
                                            <Progress
                                                value={test.coverage}
                                                className="w-20 h-2"
                                            />
                                        </div>
                                        {getStatusBadge(test.status, test.id)}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => runTest(test.id)}
                                            disabled={runningTests.has(test.id)}
                                        >
                                            <Play className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Last run: {test.lastRun}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

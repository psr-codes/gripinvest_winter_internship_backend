import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Eye, User } from "lucide-react";
import Link from "next/link";
export function QuickActions() {
    const actions = [
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Explore Products",
            description: "Discover new investment opportunities",
            action: "Browse",
            page: "/products",
        },
        {
            icon: <Eye className="w-6 h-6" />,
            title: "View Portfolio",
            description: "Check your complete investment portfolio",
            action: "View",
            page: "/dashboard",
        },
        {
            icon: <User className="w-6 h-6" />,
            title: "Update Profile",
            description: "Manage your account settings",
            action: "Update",
            page: "/profile",
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <p className="text-sm text-gray-600">
                    Common tasks to manage your investments
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {actions.map((action, index) => (
                        <div
                            key={index}
                            className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex justify-center mb-3 text-green-600">
                                {action.icon}
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">
                                {action.title}
                            </h3>
                            <p className="text-xs text-gray-600 mb-3">
                                {action.description}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className=" cursor-pointer  w-full bg-transparent"
                            >
                                <Link href={action.page}>{action.action}</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}


"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, Percent, Clock } from "lucide-react";

interface KPIProps {
    totalEmployees: number;
    compliantCount: number;
    nonCompliantCount: number;
    complianceRate: number;
    totalHours: number;
}

export function KPISection({
    totalEmployees,
    compliantCount,
    nonCompliantCount,
    complianceRate,
    totalHours,
}: KPIProps) {
    const kpis = [
        {
            title: "Total Employees",
            value: totalEmployees,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Compliant",
            value: compliantCount,
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            title: "Non-Compliant",
            value: nonCompliantCount,
            icon: XCircle,
            color: "text-rose-600",
            bg: "bg-rose-50",
        },
        {
            title: "Compliance Rate",
            value: `${complianceRate.toFixed(2)}%`,
            icon: Percent,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            title: "Total Hours",
            value: totalHours.toFixed(1),
            icon: Clock,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {kpis.map((kpi) => (
                <Card key={kpi.title} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            {kpi.title}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${kpi.bg}`}>
                            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


"use client";

import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell,
    LineChart,
    Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeSummary } from "@/lib/data-utils";

interface ChartProps {
    data: EmployeeSummary[];
    type: "office" | "shift" | "trend";
}

export function AttendanceCharts({ data, type }: ChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const processData = () => {
        if (type === "office") {
            const officeMap: Record<string, { name: string; compliant: number; total: number }> = {};
            data.forEach((s) => {
                if (!officeMap[s.office]) officeMap[s.office] = { name: s.office, compliant: 0, total: 0 };
                officeMap[s.office].total++;
                if (s.isCompliant) officeMap[s.office].compliant++;
            });
            return Object.values(officeMap).map((o) => ({
                name: o.name,
                complianceRate: (o.compliant / o.total) * 100,
                employees: o.total,
            }));
        }

        if (type === "shift") {
            const shiftMap: Record<string, { name: string; compliant: number; total: number }> = {};
            data.forEach((s) => {
                if (!shiftMap[s.shift]) shiftMap[s.shift] = { name: s.shift, compliant: 0, total: 0 };
                shiftMap[s.shift].total++;
                if (s.isCompliant) shiftMap[s.shift].compliant++;
            });
            return Object.values(shiftMap).map((s) => ({
                name: s.name,
                complianceRate: (s.compliant / s.total) * 100,
                employees: s.total,
            }));
        }

        return [];
    };

    const chartData = processData();
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

    if (type === "trend") {
        // Trend for daily qualifying count needs the raw records or an aggregation
        // For now, let's keep it simple or implement if data is passed
        return (
            <Card className="h-[350px]">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Compliance Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px] flex items-center justify-center text-slate-400">
                    Select Office or Shift to see distribution
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[350px] border-none shadow-sm">
            <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Compliance by {type === "office" ? "Office" : "Shift"} (%)
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] min-w-0 min-h-[280px] relative">
                {mounted ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                unit="%"
                            />
                            <Tooltip
                                cursor={{ fill: "#f8fafc" }}
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                                formatter={(value, name) => {
                                    const val = Array.isArray(value) ? value[0] : value;
                                    const numericValue =
                                        typeof val === "number" ? val : parseFloat(val?.toString() || "0");

                                    return [`${numericValue.toFixed(2)}%`, name ?? "Compliance %"];
                                }}
                            />

                            <Bar dataKey="complianceRate" name="Compliance %" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        Loading charts...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

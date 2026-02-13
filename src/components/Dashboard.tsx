
"use client";
// Triggering fresh deployment with latest type fixes


import { useState, useMemo, useEffect } from "react";
import { parseCSVData, aggregateEmployeeData, filterData, EmployeeSummary, AttendanceRecord, DashboardFilters } from "@/lib/data-utils";
import { KPISection } from "./KPISection";
import { FilterSection } from "./FilterSection";
import { AttendanceCharts } from "./AttendanceCharts";
import { AttendanceTable } from "./AttendanceTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface DashboardProps {
    initialRecords: AttendanceRecord[];
}

export default function Dashboard({ initialRecords }: DashboardProps) {
    const [data, setData] = useState<AttendanceRecord[]>(initialRecords);

    // Extract metadata for filters
    const supervisors = useMemo(() => Array.from(new Set(data.map(r => r.supervisor))).filter(Boolean).sort(), [data]);
    const coes = useMemo(() => Array.from(new Set(data.map(r => r.coe))).filter(Boolean).sort(), [data]);
    const offices = useMemo(() => Array.from(new Set(data.map(r => r.office))).filter(Boolean).sort(), [data]);
    const shifts = useMemo(() => Array.from(new Set(data.map(r => r.shift))).filter(Boolean).sort(), [data]);
    const categories = useMemo(() => Array.from(new Set(data.map(r => r.category))).filter(Boolean).sort(), [data]);

    const [filters, setFilters] = useState<DashboardFilters>({
        epf: "",
        supervisor: "",
        coe: "",
        office: "",
        shift: "",
        category: "",
    });

    const summaries = useMemo(() => aggregateEmployeeData(data), [data]);

    const filteredSummaries = useMemo(() => {
        return filterData(summaries, filters);
    }, [summaries, filters]);

    const kpis = useMemo(() => {
        const total = filteredSummaries.length;
        const compliant = filteredSummaries.filter(s => s.isCompliant).length;
        const nonCompliant = total - compliant;
        const rate = total > 0 ? (compliant / total) * 100 : 0;
        const totalHours = filteredSummaries.reduce((sum, s) => sum + s.totalHours, 0);

        return {
            totalEmployees: total,
            compliantCount: compliant,
            nonCompliantCount: nonCompliant,
            complianceRate: rate,
            totalHours
        };
    }, [filteredSummaries]);

    const handleRefresh = async () => {
        // In a real app, this would re-fetch from the API
        window.location.reload();
    };

    const [showAllNonCompliant, setShowAllNonCompliant] = useState(false);

    const showNonCompliantSection = showAllNonCompliant || !!(filters.supervisor || filters.coe);

    const dashboardMonth = useMemo(() => {
        const firstWithDate = data.find(r => r.date && r.date.includes('/'));
        if (!firstWithDate) return "October 2025";

        try {
            const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            // CSV date format is mm/dd/yyyy
            const [m, d, y] = firstWithDate.date.split('/');
            const monthIndex = parseInt(m) - 1;
            const year = y;

            if (monthIndex >= 0 && monthIndex < 12) {
                return `${months[monthIndex]} ${year}`;
            }
            return "October 2025";
        } catch (e) {
            return "October 2025";
        }
    }, [data]);

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50" suppressHydrationWarning>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Back to Base - Attendance Dashboard</h1>
                    <p className="text-slate-500 font-medium">{dashboardMonth}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={showAllNonCompliant ? "destructive" : "outline"}
                        onClick={() => setShowAllNonCompliant(!showAllNonCompliant)}
                    >
                        {showAllNonCompliant ? "Hide Non-Compliant List" : "Show All Non-Compliant"}
                    </Button>
                </div>
            </header>

            <FilterSection
                supervisors={supervisors}
                coes={coes}
                offices={offices}
                shifts={shifts}
                categories={categories}
                filters={filters}
                setFilters={setFilters}
                onRefresh={handleRefresh}
            />

            <KPISection {...kpis} />

            <div className="grid gap-8 lg:grid-cols-2">
                <AttendanceCharts data={filteredSummaries} type="office" />
                <AttendanceCharts data={filteredSummaries} type="shift" />
            </div>

            <div className="space-y-8">
                {showNonCompliantSection && (
                    <section className="bg-rose-50/30 p-6 rounded-2xl border border-rose-100 transition-all">
                        <AttendanceTable
                            data={filteredSummaries}
                            allRecords={data}
                            title="⚠️ Non-Compliant Employees"
                            showNonCompliantOnly={true}
                        />
                    </section>
                )}

                <section>
                    <AttendanceTable
                        data={filteredSummaries}
                        allRecords={data}
                        title="Overall Employee Summary"
                    />
                </section>
            </div>
        </div>
    );
}

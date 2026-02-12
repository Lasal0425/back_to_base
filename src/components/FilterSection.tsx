
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search, Filter, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardFilters } from "@/lib/data-utils";

interface FilterProps {
    supervisors: string[];
    coes: string[];
    offices: string[];
    shifts: string[];
    filters: DashboardFilters;
    setFilters: (filters: DashboardFilters) => void;
    onRefresh: () => void;
}

export function FilterSection({
    supervisors,
    coes,
    offices,
    shifts,
    filters,
    setFilters,
    onRefresh,
}: FilterProps) {
    const updateFilter = (key: string, value: string | null) => {
        setFilters({ ...filters, [key]: value });
    };

    const resetFilters = () => {
        setFilters({
            epf: "",
            supervisor: null,
            coe: null,
            office: null,
            shift: null,
        });
    };

    return (
        <Card className="p-4 border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col gap-4">
                {/* Top Controls */}
                <div className="flex flex-wrap items-center gap-4">


                    <div className="flex-1 min-w-[200px]">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Search EPF / Name</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by EPF or Name..."
                                className="pl-9"
                                value={filters.epf}
                                onChange={(e) => updateFilter("epf", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Supervisor</label>
                        <Select
                            value={filters.supervisor || "all"}
                            onValueChange={(v) => updateFilter("supervisor", v === "all" ? null : v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Supervisors" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Supervisors</SelectItem>
                                {supervisors.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">CoE</label>
                        <Select
                            value={filters.coe || "all"}
                            onValueChange={(v) => updateFilter("coe", v === "all" ? null : v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All CoEs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All CoEs</SelectItem>
                                {coes.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button variant="outline" size="icon" onClick={resetFilters} title="Reset Filters">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={onRefresh}>
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Chip Gadgets */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">Offices:</span>
                        {offices.map((o) => (
                            <Badge
                                key={o}
                                variant={filters.office === o ? "default" : "outline"}
                                className={`cursor-pointer px-3 py-1 transition-all ${filters.office === o
                                    ? "bg-slate-900 text-white"
                                    : "hover:bg-slate-100 bg-white"
                                    }`}
                                onClick={() => updateFilter("office", filters.office === o ? null : o)}
                            >
                                {o}
                                {filters.office === o && <X className="ml-1 h-3 w-3" />}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">Shifts:</span>
                        {shifts.map((s) => (
                            <Badge
                                key={s}
                                variant={filters.shift === s ? "default" : "outline"}
                                className={`cursor-pointer px-3 py-1 transition-all ${filters.shift === s
                                    ? "bg-slate-900 text-white"
                                    : "hover:bg-slate-100 bg-white"
                                    }`}
                                onClick={() => updateFilter("shift", filters.shift === s ? null : s)}
                            >
                                {s}
                                {filters.shift === s && <X className="ml-1 h-3 w-3" />}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}



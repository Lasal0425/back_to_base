
"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getExpandedRowModel,
    SortingState,
    ExpandedState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, Fragment, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { AttendanceRecord, EmployeeSummary } from "@/lib/data-utils";
import { ArrowUpDown, CheckCircle2, XCircle, ChevronDown, ChevronRight, Calendar, MapPin, Clock3, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TableProps {
    data: EmployeeSummary[];
    allRecords: AttendanceRecord[];
    title?: string;
    showNonCompliantOnly?: boolean;
}

export function AttendanceTable({ data, allRecords, title, showNonCompliantOnly }: TableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = useMemo<ColumnDef<EmployeeSummary>[]>(() => [
        {
            accessorKey: "epf",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    EPF <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        row.toggleExpanded();
                    }}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors font-medium text-left outline-none"
                    aria-label={`Toggle details for ${row.getValue("name")}`}
                >
                    {row.getIsExpanded() ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <span className="truncate">{row.getValue("name")}</span>
                </button>
            ),
        },

        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => (
                <Badge variant="secondary" className="font-normal">
                    {row.getValue("category")}
                </Badge>
            ),
        },
        {
            accessorKey: "supervisor",
            header: "Supervisor",
        },
        {
            accessorKey: "office",
            header: "Office",
        },
        {
            accessorKey: "qualifyingScore",
            header: "Score",
            cell: ({ row }) => {
                const score = row.original.qualifyingScore;
                const required = row.original.requiredScore;
                return (
                    <div className="flex items-center gap-2">
                        <span className={score >= required ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                            {score.toFixed(2)}
                        </span>
                        <span className="text-slate-400">/ {required}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "totalHours",
            header: "Hours",
            cell: ({ row }) => (row.getValue("totalHours") as number).toFixed(2),
        },
        {
            accessorKey: "isCompliant",
            header: "Status",
            cell: ({ row }) => (
                row.original.isCompliant ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none flex w-fit gap-1 items-center">
                        <CheckCircle2 className="h-3 w-3" /> Compliant
                    </Badge>
                ) : (
                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none flex w-fit gap-1 items-center">
                        <XCircle className="h-3 w-3" /> Non-Compliant
                    </Badge>
                )
            ),
        },
    ], []);

    const filteredData = useMemo(() => {
        return showNonCompliantOnly
            ? data.filter(d => !d.isCompliant)
            : data;
    }, [data, showNonCompliantOnly]);

    const [expanded, setExpanded] = useState<ExpandedState>({});

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        onExpandedChange: setExpanded,
        getRowCanExpand: () => true,
        autoResetPageIndex: true,
        state: {
            sorting,
            expanded,
        },
        initialState: {
            pagination: {
                pageSize: 15,
            },
        },
    });

    const getEmployeeRecords = (epf: string) => {
        return allRecords.filter(r => r.epf === epf).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    return (
        <div className="space-y-4">
            {title && <h3 className="text-lg font-bold text-slate-700">{title}</h3>}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <Fragment key={row.id}>
                                    <TableRow className={row.getIsExpanded() ? "bg-slate-50/50" : ""}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && (
                                        <TableRow className="bg-slate-50/30 border-t-0">
                                            <TableCell colSpan={columns.length} className="p-0">
                                                <div className="p-6 pb-8 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg"><MapPin className="h-4 w-4 text-blue-500" /></div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 font-medium">Primary Office</p>
                                                                <p className="text-sm font-semibold">{row.original.office}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center gap-3">
                                                            <div className="p-2 bg-emerald-50 rounded-lg"><Star className="h-4 w-4 text-emerald-500" /></div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 font-medium">Current Score</p>
                                                                <p className="text-sm font-semibold">{row.original.qualifyingScore} / {row.original.requiredScore}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-center gap-3">
                                                            <div className="p-2 bg-purple-50 rounded-lg"><Clock3 className="h-4 w-4 text-purple-500" /></div>
                                                            <div>
                                                                <p className="text-xs text-slate-500 font-medium">Total Hours</p>
                                                                <p className="text-sm font-semibold">{row.original.totalHours.toFixed(2)} hrs</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                        Attendance History
                                                    </h4>
                                                    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50">
                                                                <TableRow>
                                                                    <TableHead className="text-xs font-bold py-2">Date</TableHead>
                                                                    <TableHead className="text-xs font-bold py-2">Office</TableHead>
                                                                    <TableHead className="text-xs font-bold py-2">Punch In/Out</TableHead>
                                                                    <TableHead className="text-xs font-bold py-2 text-right">Hours</TableHead>
                                                                    <TableHead className="text-xs font-bold py-2 text-right">Score</TableHead>
                                                                    <TableHead className="text-xs font-bold py-2 text-center">Status</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {getEmployeeRecords(row.original.epf).map((rec, idx) => (
                                                                    <TableRow key={`${rec.epf}-${rec.date}-${idx}`} className="hover:bg-slate-50/50">
                                                                        <TableCell className="text-xs py-2">{rec.date}</TableCell>
                                                                        <TableCell className="text-xs py-2">{rec.office}</TableCell>
                                                                        <TableCell className="text-xs py-2 text-slate-500">
                                                                            {rec.firstPunchIn || '--'} - {rec.lastPunchOut || '--'}
                                                                        </TableCell>
                                                                        <TableCell className="text-xs py-2 text-right font-medium">{rec.duration.toFixed(2)}h</TableCell>
                                                                        <TableCell className="text-xs py-2 text-right font-bold text-slate-700">{rec.backToBaseScore}</TableCell>
                                                                        <TableCell className="text-xs py-2 text-center">
                                                                            {rec.backToBaseScore >= 1 ? (
                                                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 px-1.5 py-0 text-[10px]">Qualifying</Badge>
                                                                            ) : (
                                                                                <Badge className="bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100 px-1.5 py-0 text-[10px]">P</Badge>
                                                                            )}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400 font-medium">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-slate-500">
                    Showing {table.getFilteredRowModel().rows.length} records
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

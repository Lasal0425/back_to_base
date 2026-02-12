
"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
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
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmployeeSummary } from "@/lib/data-utils";
import { ArrowUpDown, CheckCircle2, XCircle } from "lucide-react";

interface TableProps {
    data: EmployeeSummary[];
    title?: string;
    showNonCompliantOnly?: boolean;
}

export function AttendanceTable({ data, title, showNonCompliantOnly }: TableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<EmployeeSummary>[] = [
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
                            {score.toFixed(1)}
                        </span>
                        <span className="text-slate-400">/ {required}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "totalHours",
            header: "Hours",
            cell: ({ row }) => (row.getValue("totalHours") as number).toFixed(1),
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
    ];

    const filteredData = showNonCompliantOnly
        ? data.filter(d => !d.isCompliant)
        : data;

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

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
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
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

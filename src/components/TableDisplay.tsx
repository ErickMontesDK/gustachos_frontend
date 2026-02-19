import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    OnChangeFn,
} from '@tanstack/react-table';
import { ArrowDownUp, ChevronDown, ChevronUp } from 'lucide-react';
import './../styles/table.css';
import { useState } from 'react';

interface TableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    pageCount?: number;
    pagination?: {
        pageIndex: number;
        pageSize: number;
    };
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    onPaginationChange?: (updater: any) => void;
}

export default function TableDisplay<TData>({
    columns,
    data,
    pageCount,
    pagination,
    sorting,
    onSortingChange,
    onPaginationChange
}: TableProps<TData>) {
    const table = useReactTable({
        data,
        columns,
        pageCount: pageCount,
        state: {
            pagination,
            sorting,
        },
        onSortingChange: onSortingChange,
        onPaginationChange: onPaginationChange,
        manualPagination: true,
        manualSorting: true,
        getCoreRowModel: getCoreRowModel(),
    });



    return (
        <>
            <div className="table-responsive rounded-3">
                <table className="table table-bordered table-hover mb-0">
                    <thead className="table-dark">
                        {table.getHeaderGroups().map(headerGroup => {
                            return (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => {
                                        return (
                                            <th
                                                key={header.id}
                                                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                style={{
                                                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                                    width: header.column.getSize(),
                                                }}
                                                className="text-center"
                                            >
                                                <div className="header-cell">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}

                                                    {header.column.getCanSort() && (
                                                        <span className="ms-2">
                                                            {{
                                                                asc: <ChevronUp size={16} className="text-secondary" />,
                                                                desc: <ChevronDown size={16} className="text-secondary" />,
                                                            }[header.column.getIsSorted() as string] ?? <ArrowDownUp size={16} className="text-secondary" />}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => {
                            const rowData: any = row.original;
                            const rowClassName = rowData.rowClassName || '';
                            const cellClassName = rowData.cellClassName || {};

                            return (
                                <tr key={row.id} className={rowClassName}>
                                    {row.getVisibleCells().map(cell => {
                                        let variantClassName = ""
                                        if (cell.column.id in cellClassName) {
                                            variantClassName = cellClassName[cell.column.id];
                                        }

                                        return (
                                            <td
                                                key={cell.id}
                                                className={`text-dark text-center ${variantClassName}`}
                                                style={{ width: cell.column.getSize() }}
                                            >
                                                <div className="table-cell-content">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {data.length === 0 && (
                    <div className="text-center p-5 text-muted bg-white border-top">
                        <p>There is no data to display</p>
                    </div>
                )}
            </div>

            {pageCount !== undefined && pageCount > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3 bg-white p-3 border rounded shadow-sm">
                    <div className="text-muted small">
                        Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of <strong>{table.getPageCount()}</strong>
                    </div>
                    <div className="btn-group shadow-sm">
                        <button
                            className="btn btn-outline-primary btn-sm px-3"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </button>
                        <button
                            className="btn btn-outline-primary btn-sm px-3"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

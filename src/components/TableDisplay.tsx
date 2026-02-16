import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
} from '@tanstack/react-table';
import { ArrowDownUp, ChevronDown, ChevronUp } from 'lucide-react';
import './../styles/table.css';
import { useState } from 'react';

interface TableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
}

export default function TableDisplay<TData>({ columns, data }: TableProps<TData>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div className="table-responsive rounded-3">
                <table className="table table-bordered table-hover">
                    <thead className="table-dark">
                        {table.getHeaderGroups().map(headerGroup => {
                            return (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => {
                                        return (
                                            <th
                                                key={header.id}
                                                onClick={header.column.getToggleSortingHandler()}
                                                style={{
                                                    cursor: 'pointer',
                                                    width: header.column.getSize(),
                                                }}
                                                className="text-center"
                                            >
                                                <div className="header-cell">
                                                    {flexRender(header.column.columnDef.header, header.getContext())}

                                                    <span className="ms-2">
                                                        {{
                                                            asc: <ChevronUp size={16} className="text-secondary" />,
                                                            desc: <ChevronDown size={16} className="text-secondary" />,
                                                        }[header.column.getIsSorted() as string] ?? <ArrowDownUp size={16} className="text-secondary" />}
                                                    </span>
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
                    <div className="text-center p-5 text-muted bg-white">
                        <p>There is no data to display</p>
                    </div>
                )}
            </div>
        </>
    );
}

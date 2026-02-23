import { ColumnDef } from '@tanstack/react-table';
import { Client } from "../hooks/useClients";

export const columns: ColumnDef<Client>[] = [
    { header: 'ID', accessorKey: 'id', size: 50 },
    { header: 'Client', accessorKey: 'name', size: 150 },
    { header: 'Code', accessorKey: 'code', size: 95 },
    { header: 'Client Type', accessorKey: 'client_type', size: 110 },
    { header: 'Sector', accessorKey: 'sector', size: 120 },
    { header: 'Market', accessorKey: 'market', size: 120 },
    { header: 'Address', accessorKey: 'full_address', size: 250, enableSorting: false },
    { id: 'is_active', header: 'Is Active', accessorKey: 'is_active_label', size: 80, enableSorting: false },
];

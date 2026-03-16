import { ColumnDef } from "@tanstack/react-table";
import { User } from "../hooks/useUsers";

export const columns: ColumnDef<User>[] = [
    { header: 'ID', accessorKey: 'id', size: 50 },
    { id: 'last_name', header: 'Name', accessorKey: 'full_name', size: 150 },
    { header: 'Username', accessorKey: 'username', size: 100 },
    { header: 'Role', accessorKey: 'role', size: 100 },
    { header: 'Email', accessorKey: 'email', size: 150 },

];
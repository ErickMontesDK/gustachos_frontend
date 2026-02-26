import { SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { userMapper } from "../utils/userMappers";
import { getUsers, updateUser as updateUserService, deleteUser as deleteUserService, createUser as createUserService } from "../api/usersService";

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    role: string;
}

interface filters {
    search_term: string;
    role: string;
    page: number;
    page_size: number;
    sorting: string;
}

const DEFAULT_FILTERS: filters = {
    search_term: "",
    role: "",
    page: 1,
    page_size: 10,
    sorting: "",
};

export const useUsers = () => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_FILTERS.page_size });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [users, setUsers] = useState<User[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = () => setRefreshKey(prev => prev + 1);

    const updateFilters = <K extends keyof filters>(key: K, value: filters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
    const sortingString = sorting.map(sort => `${sort.desc ? '-' : ''}${sort.id}`).join(',');

    useEffect(() => {
        const controller = new AbortController();

        getUsers({
            search_term: filters.search_term || undefined,
            role: filters.role || undefined,
            page: pagination.pageIndex + 1,
            page_size: pagination.pageSize,
            sorting: sortingString || undefined,
            signal: controller.signal
        })
            .then(data => {
                setUsers(data.results.map(userMapper));
                setTotalPages(data.total_pages);
            })
            .catch(error => {
                if (error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                console.error("Error fetching users:", error);
            });

        return () => controller.abort();

    }, [
        sortingString,
        filters.search_term,
        filters.role,
        pagination.pageIndex,
        pagination.pageSize,
        refreshKey
    ])

    return {
        users,
        totalPages,
        pagination,
        setPagination,
        filters,
        updateFilters,
        sorting,
        setSorting,
        refresh
    }
}

export const useUpdateUser = (user: User | null, setUser: (user: User | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");

    useEffect(() => {
        if (!user) return;

        setRole(user.role || "");
        setEmail(user.email || "");
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
    }, [user])

    const updateUser = () => {
        updateUserService(user!.id, {
            role,
            email,
            first_name,
            last_name
        })
            .then(() => {
                setUser(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error updating user:", error);
                if (onError) onError(error.message || "Error updating user");
            });
    }

    return {
        user,
        role, setRole,
        email, setEmail,
        first_name, setFirstName,
        last_name, setLastName,
        updateUser
    }

}


export const useDeleteUser = (user: User | null, setUser: (user: User | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const deleteUser = () => {
        deleteUserService(user!.id)
            .then(() => {
                setUser(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error deleting user:", error);
                if (onError) onError(error.message || "Error deleting user");
            });
    }

    return {
        deleteUser
    }
}

export const useCreateUser = (onSuccess?: () => void, onError?: (msg: string) => void) => {
    const [new_role, setNewRole] = useState("");
    const [new_email, setNewEmail] = useState("");
    const [new_first_name, setNewFirstName] = useState("");
    const [new_last_name, setNewLastName] = useState("");
    const [new_username, setNewUsername] = useState("");
    const [new_password, setNewPassword] = useState("");
    const [new_password_confirmation, setNewPasswordConfirmation] = useState("");

    const createUser = () => {

        if (new_password !== new_password_confirmation) {
            if (onError) onError("Passwords do not match");
            return;
        }

        createUserService({
            role: new_role,
            email: new_email,
            first_name: new_first_name,
            last_name: new_last_name,
            password: new_password,
            username: new_username,
        })
            .then(() => {
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error creating user:", error);
                if (onError) onError(error.message || "Error creating user");
            });
    }

    return {
        new_role, setNewRole,
        new_email, setNewEmail,
        new_first_name, setNewFirstName,
        new_last_name, setNewLastName,
        new_username, setNewUsername,
        new_password, setNewPassword,
        new_password_confirmation, setNewPasswordConfirmation,
        createUser
    }
}


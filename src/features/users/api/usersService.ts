import { api } from "../../../api/axiosInstance";

interface UserParams {
    search_term?: string;
    role?: string;
    page?: number;
    page_size?: number;
    sorting?: string;
    is_deleted?: boolean;
    signal?: AbortSignal;
}

const getUsers = async (params: UserParams) => {
    try {
        const { signal, ...restParams } = params;
        const response = await api.get("/users/", { params: restParams, signal });
        return response.data as {
            count: number;
            results: any[];
            total_pages: number;
        }

    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
}

const updateUser = async (id: number, data: any) => {
    try {
        const response = await api.patch(`/users/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

const restoreUser = async (id: number) => {
    try {
        const response = await api.patch(`/users/${id}/restore/`);
        return response.data

    } catch (error) {
        console.error("Error restoring user:", error);
        throw error;
    }
}

const deleteUser = async (id: number) => {
    try {
        const response = await api.delete(`/users/${id}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}

const createUser = async (data: any) => {
    try {
        const response = await api.post("/users/", data);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

const getUserProfile = async () => {
    try {
        const response = await api.get(`/users/me/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}

const changeOwnPassword = async (data: any) => {
    try {
        const response = await api.post(`/users/me/change-password/`, data);
        return response.data;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
}

const changeUserPassword = async (id: number, data: any) => {
    try {
        const response = await api.post(`/users/${id}/change-password/`, data);
        return response.data;
    } catch (error) {
        console.error("Error changing user password:", error);
        throw error;
    }
}

const getDashboardStats = async () => {
    try {
        const response = await api.get(`/users/dashboard/stats/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
}

export { getUsers, updateUser, deleteUser, createUser, getUserProfile, changeOwnPassword, changeUserPassword, restoreUser, getDashboardStats };

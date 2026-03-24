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

export const getUsers = async (params: UserParams) => {
    const { signal, ...restParams } = params;
    const response = await api.get("/users/", { params: restParams, signal });
    return response.data as {
        count: number;
        results: any[];
        total_pages: number;
    };
};

export const updateUser = async (id: number, data: any) => {
    const response = await api.patch(`/users/${id}/`, data);
    return response.data;
};

export const restoreUser = async (id: number) => {
    const response = await api.patch(`/users/${id}/restore/`);
    return response.data;
};

export const deleteUser = async (id: number) => {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
};

export const createUser = async (data: any) => {
    const response = await api.post("/users/", data);
    return response.data;
};

export const getUserProfile = async () => {
    const response = await api.get(`/users/me/`);
    return response.data;
};

export const changeOwnPassword = async (data: any) => {
    const response = await api.post(`/users/me/change-password/`, data);
    return response.data;
};

export const changeUserPassword = async (id: number, data: any) => {
    const response = await api.post(`/users/${id}/change-password/`, data);
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await api.get(`/users/dashboard/stats/`);
    return response.data;
};

export const getDeliveryStats = async () => {
    const response = await api.get(`/users/me/dashboard/`);
    return response.data;
};

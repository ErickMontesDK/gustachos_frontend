import { api } from "../../../api/axiosInstance";

interface UserParams {
    search_term?: string;
    role?: string;
    page?: number;
    page_size?: number;
    sorting?: string;
    signal?: AbortSignal;
}

const getUsers = async (params: UserParams) => {
    try {
        const { signal, ...restParams } = params;
        const response = await api.get("/users/", { params: restParams, signal });
        console.log("response", response.data);
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
        console.log("response", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

const deleteUser = async (id: number) => {
    try {
        const response = await api.delete(`/users/${id}/`);
        console.log("response", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}

const createUser = async (data: any) => {
    try {
        const response = await api.post("/users/", data);
        console.log("response", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

const getUserProfile = async () => {
    try {
        const response = await api.get(`/users/me/`);
        console.log("response", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}

const changePassword = async (data: any) => {
    try {
        const response = await api.post(`/users/password/`, data);
        console.log("response", response.data);
        return response.data;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
}

export { getUsers, updateUser, deleteUser, createUser, getUserProfile, changePassword };

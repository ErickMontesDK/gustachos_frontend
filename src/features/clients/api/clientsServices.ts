import { api } from "../../../api/axiosInstance";

export interface ClientsParams {
    client_type?: string;
    municipality?: string;
    state?: string;
    sector?: string;
    market?: string;
    address?: string;
    name?: string;
    code?: string;
    page?: number;
    page_size?: number;
    sorting?: string;
    signal?: AbortSignal;
}

const getClients = async (params: ClientsParams) => {
    console.log("SI LLEGÓ")
    console.log("params", params);
    try {
        const { signal, ...restParams } = params;
        const response = await api.get("/clients/", {
            params: restParams,
            signal
        });
        console.log("response", response.data);
        return response.data as {
            count: number;
            results: any[];
            total_pages: number;
        };
    } catch (error) {
        console.error("Error fetching clients:", error);
        throw error;
    }
}

const getClientById = async (id: number) => {
    try {
        const response = await api.get(`/clients/${id}/`);
        console.log("response", response.data);
        return response.data

    } catch (error) {
        console.error("Error fetching client:", error);
        throw error;
    }
}

const updateClient = async (id: number, data: {
    code: string,
    name: string,
    address: string,
    neighborhood: string,
    municipality: string,
    state: string,
    sector: string,
    market: string,
    client_type: string,
    latitude: number,
    longitude: number,
    is_active: boolean
}) => {
    try {
        const response = await api.patch(`/clients/${id}/`, data);
        console.log("response", response.data);
        return response.data

    } catch (error) {
        console.error("Error updating client:", error);
        throw error;
    }
}

const deleteClient = async (id: number) => {
    try {
        const response = await api.delete(`/clients/${id}/`);
        console.log("response", response.data);
        return response.data

    } catch (error) {
        console.error("Error deleting client:", error);
        throw error;
    }
}

export { getClients, getClientById, updateClient, deleteClient };
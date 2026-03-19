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
    is_deleted?: boolean;
    is_active?: boolean;
    signal?: AbortSignal;
}

const getClients = async (params: ClientsParams) => {
    try {
        const { signal, ...restParams } = params;
        const response = await api.get("/clients/", {
            params: restParams,
            signal
        });
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

const getClientsMap = async (params: ClientsParams) => {
    try {
        const { signal, ...restParams } = params;
        const response = await api.get("/clients/map/", {
            params: restParams,
            signal
        });
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
        return response.data

    } catch (error) {
        console.error("Error fetching client:", error);
        throw error;
    }
}

const updateClient = async (id: number, data: {
    code?: string,
    name?: string,
    address?: string,
    neighborhood?: string,
    municipality?: string,
    state?: string,
    sector?: string,
    market?: string,
    client_type?: string,
    latitude?: number,
    longitude?: number,
    is_active?: boolean,
}) => {
    try {
        const response = await api.patch(`/clients/${id}/`, data);
        return response.data

    } catch (error) {
        console.error("Error updating client:", error);
        throw error;
    }
}

const restoreClient = async (id: number) => {
    try {
        const response = await api.patch(`/clients/${id}/restore/`);
        return response.data

    } catch (error) {
        console.error("Error restoring client:", error);
        throw error;
    }
}

const deleteClient = async (id: number) => {
    try {
        const response = await api.delete(`/clients/${id}/`);
        return response.data

    } catch (error) {
        console.error("Error deleting client:", error);
        throw error;
    }
}

const getClientExcel = async (params: ClientsParams) => {
    try {
        const { signal, ...restParams } = params;
        const response = await api.get("/clients/export/", { params: restParams, signal, responseType: "blob" });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `clients_report_${new Date().toISOString().split("T")[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error fetching clients:", error);
        throw error;
    }
}

export { getClients, getClientById, updateClient, deleteClient, getClientExcel, getClientsMap, restoreClient };
import { api } from "../../../api/axiosInstance";

export interface ClientType {
    id?: number;
    name: string;
    abbreviation: string;
}

export const getClientTypes = async (): Promise<ClientType[]> => {
    try {
        const response = await api.get("/client-types/");
        return response.data;
    } catch (error) {
        console.error("Error fetching client types:", error);
        throw error;
    }
};

export const createClientType = async (clientType: ClientType): Promise<ClientType> => {
    try {
        const response = await api.post("/client-types/", clientType);
        return response.data;
    } catch (error) {
        console.error("Error creating client type:", error);
        throw error;
    }
};

export const updateClientType = async (clientType: ClientType): Promise<ClientType> => {
    try {
        console.log("Updating client type:", clientType);
        const response = await api.patch(`/client-types/${clientType.id}/`, clientType);
        return response.data;
    } catch (error) {
        console.error("Error updating client type:", error);
        throw error;
    }
};

export const deleteClientType = async (clientType: ClientType): Promise<void> => {
    try {
        await api.delete(`/client-types/${clientType.id}/`);
    } catch (error) {
        console.error("Error deleting client type:", error);
        throw error;
    }
};



import { api } from "./axiosInstance";

const getVisits = async () => {
    try {
        const response = await api.get("/visits");
        return response.data;
    } catch (error) {
        console.error("Error fetching visits:", error);
        throw error;
    }
}

export { getVisits };
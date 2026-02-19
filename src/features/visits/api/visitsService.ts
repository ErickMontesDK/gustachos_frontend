import { api } from "../../../api/axiosInstance";

interface VisitParams {
    client_type?: string;
    municipality?: string;
    state?: string;
    sector?: string;
    search_term?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
    sorting?: string;
}

const getVisits = async (params: VisitParams) => {
    try {
        const response = await api.get("/visits", { params });
        console.log("response", response.data);
        return response.data as {
            count: number;
            results: any[];
            total_pages: number;
        }

    } catch (error) {
        console.error("Error fetching visits:", error);
        throw error;
    }
}

export { getVisits };

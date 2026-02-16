import { api } from "./axiosInstance";

const getVisits = async (
    client_type?: string,
    municipality?: string,
    state?: string,
    sector?: string,
    search_term?: string,
    date_from?: string,
    date_to?: string
) => {
    try {
        const response = await api.get("/visits", {
            params: {
                client_type: client_type || undefined,
                municipality: municipality || undefined,
                state: state || undefined,
                sector: sector || undefined,
                search_term: search_term || undefined,
                date_from: date_from || undefined,
                date_to: date_to || undefined
            }
        });
        console.log(response.data);
        const { count, next, previous, results } = response.data;
        return { count, next, previous, results };

    } catch (error) {
        console.error("Error fetching visits:", error);
        throw error;
    }
}



export { getVisits };
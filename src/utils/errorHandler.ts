export const parseApiError = (error: any): string => {
    const data = error?.response?.data;

    if (!data) return error?.message || "Unknown error";

    if (data.message && typeof data.message === 'object') {
        return Object.values(data.message)
            .flat()
            .join(', ');
    }

    if (typeof data.message === 'string') return data.message;

    return data.error || error?.message || "Unknown error";
};
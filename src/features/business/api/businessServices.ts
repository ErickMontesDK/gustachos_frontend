import { api } from "../../../api/axiosInstance";

const getBusinessInfo = async () => {
    try {
        const response = await api.get(`/business-config/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching business info:", error);
        throw error;
    }
};

const updateBusinessInfo = async (businessInfo: any) => {
    try {
        const response = await api.patch(`/business-config/`, businessInfo);
        localStorage.setItem("business_data", JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error("Error updating business info:", error);
        throw error;
    }
};

export {
    getBusinessInfo,
    updateBusinessInfo
};
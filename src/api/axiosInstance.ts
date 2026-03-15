import axios from "axios";
const baseURL = "/api";

const api = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

api.interceptors.response.use((response) => {
    return response;

}, async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.data) {
        const serverMessage = error.response.data.message || error.response.data.error;
        if (serverMessage) {
            error.message = serverMessage;
        }
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            await api.post("/auth/refresh/");

            return api(originalRequest);
        } catch (refreshError) {
            window.location.href = "/login";
            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
});

export { api };
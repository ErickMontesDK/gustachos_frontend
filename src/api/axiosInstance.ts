import axios from "axios";
const baseURL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

const publicApi = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use((response) => {
    return response;

}, (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.data) {
        const serverMessage = error.response.data.message || error.response.data.error;
        if (serverMessage) {
            error.message = serverMessage;
        }
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (originalRequest.url?.includes("auth/refresh/")) {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        return publicApi.post("auth/refresh/", { refresh: refreshToken })
            .then((response) => {
                localStorage.setItem('access', response.data.access);
                localStorage.setItem('refresh', response.data.refresh);
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return api(originalRequest);
            })
            .catch((error) => {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
                return Promise.reject(error);
            });
    }
    return Promise.reject(error);
});

export { api, publicApi };
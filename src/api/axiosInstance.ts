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
    console.log("access token: ", token);
    console.log("Se esta ejecutando el interceptor")

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use((response) => {
    console.log("Se esta ejecutando el interceptor de respuesta")
    return response;

}, (error) => {
    console.log("Se esta ejecutando el interceptor de respuesta con error")
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem('refresh');
        console.log("refresh token: ", refreshToken);
        console.log("Se esta ejecutando el interceptor de respuesta con error 401")
        if (!refreshToken) {
            console.log("No hay refresh token")
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Si la petición que falló ya era un refresco, no intentar refrescar de nuevo
        if (originalRequest.url?.includes("token/refresh/")) {
            console.log("La peticion que fallo ya era un refresco")
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        return publicApi.post("token/refresh/", { refresh: refreshToken })
            .then((response) => {
                localStorage.setItem('access', response.data.access);
                localStorage.setItem('refresh', response.data.refresh);
                console.log("Token refrescado exitosamente")
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return api(originalRequest);
            })
            .catch((error) => {
                console.error("Token refresh failed:", error);
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
                return Promise.reject(error);
            });
    }
    return Promise.reject(error);
});

export { api, publicApi };
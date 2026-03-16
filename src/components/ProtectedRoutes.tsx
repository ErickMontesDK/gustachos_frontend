import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../api/axiosInstance";

export default function ProtectedRoutes({ allowedRoles }: { allowedRoles: string[] }) {

    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    // localStorage.removeItem("role");

    useEffect(() => {
        api.get("/users/me/")
            .then((res) => {
                console.log(res.data);
                setRole(res.data.role.toLowerCase());
                // localStorage.setItem("role", res.data.role.toLowerCase());
            })
            .catch(() => {
                setRole(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!role || role === "") {
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("user_id");
        localStorage.removeItem("username");
        localStorage.removeItem("business_name");
        localStorage.removeItem("logo_url");
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/home" />;
    }
    return <Outlet />;
}
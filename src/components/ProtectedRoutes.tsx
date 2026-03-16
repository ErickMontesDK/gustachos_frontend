import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../api/axiosInstance";
import { getBusinessInfo } from "../features/business/api/businessServices";

export default function ProtectedRoutes({ allowedRoles }: { allowedRoles: string[] }) {

    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/users/me/")
            .then((res) => {
                setRole(res.data.role.toLowerCase());

                const businessData = localStorage.getItem("business_data");
                if (!businessData || businessData === "") {
                    getBusinessInfo()
                        .then((res) => {
                            localStorage.setItem("business_data", JSON.stringify(res.data));
                        })
                        .catch(() => {
                            console.error("Error fetching business data");
                        });
                }
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
        localStorage.removeItem("business_data");
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/home" />;
    }
    return <Outlet />;
}
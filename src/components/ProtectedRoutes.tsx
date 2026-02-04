import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoutes({ allowedRoles }: { allowedRoles: string[] }) {
    const role = localStorage.getItem("role") as string;
    const token = localStorage.getItem("access") as string;

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/home" />;
    }
    return <Outlet />;
}
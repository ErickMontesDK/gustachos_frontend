import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoutes({ allowedRoles }: { allowedRoles: string[] }) {
    const role = localStorage.getItem("role") as string;
    console.log("Role: ", role);

    if (!role) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/home" />;
    }
    return <Outlet />;
}
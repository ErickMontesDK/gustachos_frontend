import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import DeliveryHome from "../components/DeliveryHome";
import AdminDashboard from "../components/AdminDashboard";

export default function Home() {
    const access = localStorage.getItem("access");

    if (access === null) {
        return <Navigate to="/login" />
    }

    const role = localStorage.getItem("role") || "";
    const name = localStorage.getItem("name") || "";

    const renderContent = () => {
        switch (role.toLowerCase()) {
            case 'delivery':
                return <DeliveryHome />;
            case 'admin':
            case 'operator':
                return <AdminDashboard />;
            default:
                return (
                    <div className="alert alert-warning m-4">
                        Access not configured for role: {role}
                    </div>
                );
        }
    }

    return (
        <Layout role={role} name={name}>
            {renderContent()}
        </Layout>
    );
}

import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import DeliveryHome from "../components/DeliveryHome";
import AdminDashboard from "../components/AdminDashboard";

export default function Home() {
    const role = localStorage.getItem("role");

    if (role === null) {
        return <Navigate to="/login" />
    }

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
        <Layout>
            {renderContent()}
        </Layout>
    );
}

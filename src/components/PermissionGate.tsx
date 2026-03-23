import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Layout from "./Layout";
import Modal from "./modal";
import { usePermissions } from "../hooks/usePermissions";

interface PermissionGateProps {
    children: ReactNode;
}

export default function PermissionGate({ children }: PermissionGateProps) {
    const navigate = useNavigate();
    const { permissionsGranted, permissionError, retryPermissions } = usePermissions();

    if (permissionsGranted === false) {
        return (
            <Layout>
                <Modal
                    title="Necessary permissions"
                    message={permissionError}
                    buttonText1={<><RefreshCw size={20} className="me-2" />Try Again</>}
                    buttonText2={<><Home size={20} className="me-2" />Back to Home</>}
                    buttonAction1={retryPermissions}
                    buttonAction2={() => navigate("/home")}
                    icon={<AlertCircle size={48} />}
                    isVertical={true}
                />
            </Layout>
        );
    }

    if (permissionsGranted === null) {
        return (
            <Layout>
                <div className="p-5 text-center">Verifying hardware (GPS/Camera)...</div>
            </Layout>
        );
    }

    return <>{children}</>;
}

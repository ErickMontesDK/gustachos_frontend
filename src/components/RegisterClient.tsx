import Layout from "./Layout";
import { usePermissions } from "../hooks/usePermissions";
import { useGeolocation } from "../hooks/useGeolocation";
import { useState } from "react";

export default function RegisterClient() {
    const { permissionsGranted, permissionError, retryPermissions } = usePermissions();
    const { latitude, longitude, datetime, gettingGeolocation, gettingDatetime, resetLocation } = useGeolocation();

    const [clientData, setClientData] = useState({
        code: "",
        name: "",
        address: "",
        municipality: "",
        state: "",
        neighborhood: "",
        client_type: "",
        latitude: latitude,
        longitude: longitude,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isScannerPaused, setIsScannerPaused] = useState(true);
    const [isScannerUsed, setIsScannerUsed] = useState(false);

    const scannerPressed = () => {
        setIsScannerPaused(false);
        setIsScannerUsed(false);
    }

    return (
        <Layout>
            <h1>Register Client</h1>
        </Layout>
    );

}
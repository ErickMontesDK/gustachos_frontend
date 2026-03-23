import { useState } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { QrCode, ClipboardList, MapPin, User, CheckCircle2, AlertCircle, Store, Home, RefreshCw } from "lucide-react";
import '../styles/register-visit.css';
import CodeScannerComponent from "./CodeScanner";
import Modal from "./modal";
import PermissionGate from "./PermissionGate";
import { useGeolocation } from "../hooks/useGeolocation";
import { useScanner } from "../hooks/useScanner";
import { getClientByCode } from "../features/clients/api/clientsServices";
import { registerVisit } from "../features/visits/api/visitsService";

interface DetectedCode {
    format: string;
    rawValue: string;

}

export default function RegisterVisit() {
    const navigate = useNavigate();

    const { latitude, longitude, datetime, gettingGeolocation, gettingDatetime, resetLocation } = useGeolocation();
    const {
        isScannerPaused, setIsScannerPaused,
        isScannerLoading, setIsScannerLoading,
        isScannerUsed, setIsScannerUsed,
        startScanner, resetScanner
    } = useScanner();

    const [clientData, setClientData] = useState({
        name: "",
        code: "",
        address: "",
        client_type_name: "",
        neighborhood: "",
        municipality: "",
        state: "",
    });


    const [delivererName] = useState(localStorage.getItem("name") || "Deliverer Name");
    const [clientId, setClientId] = useState<number | null>(null);

    const [isProductive, setIsProductive] = useState(false);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isClientFound, setIsClientFound] = useState(false);
    const [scanError, setScanError] = useState("");

    const scannerPressed = () => {
        setIsClientFound(false);
        setScanError("");
        startScanner();
    }

    const handleScan = (detectedCodes: DetectedCode[]) => {
        gettingGeolocation();
        setIsScannerUsed(true);
        setIsScannerLoading(true);
        const detectedCode = detectedCodes[0].rawValue;
        setIsScannerPaused(true);

        getClientByCode(detectedCode)
            .then(data => {
                setClientData(data);
                setClientId(parseInt(data.id));
                gettingDatetime();

                setIsClientFound(true);
            })
            .catch(error => {
                setScanError(error.response?.data?.detail || "Client not found or network error.");
            })
            .finally(() => {
                setIsScannerLoading(false);
            });

    }

    const resetForm = () => {
        setClientData({
            name: "",
            code: "",
            address: "",
            client_type_name: "",
            neighborhood: "",
            municipality: "",
            state: "",
        });
        setClientId(null);
        setIsProductive(false);
        setNotes("");
        setIsClientFound(false);
        setIsSuccess(false);
        resetLocation();
        resetScanner();
        setErrorMessage("");
        setScanError("");
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (!isClientFound || !clientId) {
            setErrorMessage("Please scan a client code before registering.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        registerVisit({
            client: clientId,
            visited_at: datetime,
            latitude_recorded: latitude,
            longitude_recorded: longitude,
            is_productive: isProductive,
            notes: notes,
        })
            .then(() => {
                setIsSuccess(true);
            })
            .catch(error => {
                setErrorMessage(error.response?.data?.detail || "An error occurred while registering the visit. Please try again.");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    const isFormValid = isClientFound && clientId && latitude && longitude && delivererName && datetime;

    return (
        <PermissionGate>
            <Layout>
                <div className="register-visit-container">
                    <header className="page-header">
                        <h1><MapPin size={30} className="flex-shrink-0 me-2 text-primary mb-1" />Register Visit</h1>
                        <p>Client check-in</p>
                    </header>

                    <section className="scanner-card">
                        {isScannerPaused && (
                            <button className={`btn btn-outline-primary fw-bold scanner-box ${!isScannerLoading && isScannerUsed ? isClientFound ? "scanner-box-success" : "scanner-box-error" : ""}`} type="button" onClick={scannerPressed}>

                                {isScannerLoading ? (<span className="spinner-border spinner-border-sm me-2"></span>) : (
                                    !isScannerUsed ? (
                                        <QrCode size={48} strokeWidth={1.5} />
                                    ) : isClientFound ? (
                                        <CheckCircle2 size={48} strokeWidth={1.5} className="text-success" />
                                    ) : (
                                        <AlertCircle size={48} strokeWidth={1.5} className="text-danger" />
                                    )
                                )}
                                {!isScannerLoading && isScannerUsed ? isClientFound ? "Client Found" : "Client Not Found. Retry?" : isScannerLoading ? "Scanning..." : "Press to Scan Code"}
                            </button>
                        )}
                        {!isScannerPaused &&
                            <CodeScannerComponent isPaused={isScannerPaused} setIsPaused={setIsScannerPaused} handleScan={handleScan} />
                        }
                        {scanError && isScannerPaused && !isScannerLoading && (
                            <div className="alert alert-danger mt-3 py-2 text-center d-flex align-items-center justify-content-center" role="alert">
                                <AlertCircle size={18} className="me-2" />
                                <span>{scanError}</span>
                            </div>
                        )}
                    </section>

                    <form onSubmit={handleSubmit} className="form-section">
                        {errorMessage && (
                            <div className="alert alert-danger form-error-alert" role="alert">
                                <AlertCircle size={18} className="me-2 flex-shrink-0" />
                                <div>{errorMessage}</div>
                            </div>
                        )}
                        <div className="info-card">
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">
                                        <User size={14} className="me-1" />
                                        Client
                                    </span>
                                    <input type="text" readOnly className="info-value" value={isClientFound ? clientData.name : "Scan to load client..."} />
                                </div>

                                {isClientFound && (
                                    <>
                                        <div className="info-item">
                                            <span className="info-label">
                                                <QrCode size={14} className="me-1" />
                                                Client Code
                                            </span>
                                            <input type="text" className="info-value" value={clientData.code} readOnly />
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">
                                                <Store size={14} className="me-1" />
                                                Client Type
                                            </span>
                                            <input type="text" className="info-value" value={clientData.client_type_name} readOnly />
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">
                                                <MapPin size={14} className="me-1" />
                                                Address
                                            </span>
                                            <textarea className="info-value info-value-textarea" value={
                                                [clientData.address, clientData.neighborhood, clientData.municipality, clientData.state]
                                                    .filter(part => part && part.trim() !== "")
                                                    .join(", ")
                                            } readOnly />
                                        </div>
                                    </>
                                )}
                                <div className="info-item">
                                    <span className="info-label">
                                        <MapPin size={14} className="me-1" />
                                        Deliverer
                                    </span>
                                    <div className="info-value">{delivererName}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="notes" className="form-label fw-bold d-flex align-items-center">
                                <ClipboardList size={18} className="me-2 text-primary" />
                                Visit Notes
                            </label>
                            <textarea
                                id="notes"
                                className="form-control visit-notes-textarea"
                                rows={4}
                                placeholder="Describe any relevant details about the visit..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="card border-0 bg-light p-3 mb-4 productive-switch-card">
                            <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                                <label className="form-check-label h6 mb-0 d-flex align-items-center" htmlFor="productiveSwitch">
                                    <CheckCircle2 size={18} className="me-2 text-success" />
                                    Productive Visit?
                                </label>
                                <input
                                    className="form-check-input ms-0 productive-switch-input"
                                    type="checkbox"
                                    role="switch"
                                    id="productiveSwitch"
                                    checked={isProductive}
                                    onChange={(e) => setIsProductive(e.target.checked)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isSubmitting || !isFormValid}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Registering...
                                </>
                            ) : "Complete Registration"}
                        </button>
                    </form>

                    {isSuccess && (
                        <Modal
                            title="Visit Registered!"
                            message={`The visit to ${clientData.name} has been successfully recorded.`}
                            buttonText1={<><RefreshCw size={20} className="me-2" />Register Another Visit</>}
                            buttonText2={<><Home size={20} className="me-2" />Back to Home</>}
                            buttonAction1={resetForm}
                            buttonAction2={() => navigate("/home")}
                            icon={<CheckCircle2 size={48} />}
                            isVertical={true}
                        />
                    )}

                    {errorMessage && (
                        <Modal
                            title="Oops! Something went wrong"
                            message={errorMessage}
                            buttonText1={<><RefreshCw size={20} className="me-2" />Try Again</>}
                            buttonText2={<><Home size={20} className="me-2" />Back to Home</>}
                            buttonAction1={() => setErrorMessage("")}
                            buttonAction2={() => navigate("/home")}
                            icon={<AlertCircle size={48} />}
                        />
                    )}
                </div>
            </Layout>
        </PermissionGate>
    );
}
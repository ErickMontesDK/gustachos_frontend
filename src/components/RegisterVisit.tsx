import { useState } from "react";
import { api } from "../api/axiosInstance";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { QrCode, ClipboardList, MapPin, User, CheckCircle2, AlertCircle, Store, Home, RefreshCw } from "lucide-react";
import '../styles/register-visit.css';
import CodeScannerComponent from "./CodeScanner";

interface DetectedCode {
    format: string;
    rawValue: string;

}

export default function RegisterVisit() {
    const [clientData, setClientData] = useState({
        name: "",
        code: "",
        address: "",
        client_type: "",
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
    const [isScannerPaused, setIsScannerPaused] = useState(true);

    const [isScannerLoading, setIsScannerLoading] = useState(false);
    const [isScannerUsed, setIsScannerUsed] = useState(false);
    const [isClientFound, setIsClientFound] = useState(false);

    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [datetime, setDatetime] = useState("");

    const navigate = useNavigate();
    const role = localStorage.getItem("role") || "deliverer";
    const name = localStorage.getItem("name") || "User";

    const scannerPressed = () => {
        setIsScannerPaused(false);
        setIsScannerUsed(false);
        setIsClientFound(false);
    }

    const gettingGeolocation = () => {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };
        navigator.geolocation.getCurrentPosition((position) => {
            console.log("Geolocation: ", position);
            const latitude = parseFloat(position.coords.latitude.toFixed(6));
            const longitude = parseFloat(position.coords.longitude.toFixed(6));
            setLatitude(latitude);
            setLongitude(longitude);

        }, (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    console.log("User denied the request for Geolocation.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.log("Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    console.log("The request to get user location timed out.");
                    break;
                default:
                    console.log("An unknown error occurred.");
                    break;
            }
        }, options);
    }

    const gettingDatetime = () => {
        const date = new Date();
        const datetime = date.toISOString();
        console.log("Datetime: ", datetime);
        setDatetime(datetime);
    }

    const handleScan = (detectedCodes: DetectedCode[]) => {
        gettingGeolocation();
        setIsScannerUsed(true);
        setIsScannerLoading(true);
        const detectedCode = detectedCodes[0].rawValue;
        setIsScannerPaused(true);
        console.log("Detected code: ", detectedCode);

        api.get(`/clients/${detectedCode}`)
            .then(response => {
                console.log("Client data: ", response.data);
                setClientData(response.data);
                setClientId(parseInt(response.data.id));
                gettingDatetime();

                setIsClientFound(true);
            })
            .catch(error => {
                console.error("Error fetching client data: ", error);
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
            client_type: "",
            neighborhood: "",
            municipality: "",
            state: "",
        });
        setClientId(null);
        setIsProductive(false);
        setNotes("");
        setIsScannerUsed(false);
        setIsClientFound(false);
        setIsSuccess(false);
        setLatitude(0);
        setLongitude(0);
        setDatetime("");
        setErrorMessage("");
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) return;

        setIsSubmitting(true);
        api.post("/visits/", {
            client: clientId,
            visited_at: datetime,
            latitude_recorded: latitude,
            longitude_recorded: longitude,
            is_productive: isProductive,
            notes: notes,
        })
            .then(response => {
                console.log("Visit registered successfully: ", response.data);
                setIsSuccess(true);
            })
            .catch(error => {
                console.error("Error registering visit: ", error.response?.data || error.message);
                setErrorMessage(error.response?.data?.detail || "An error occurred while registering the visit. Please try again.");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    return (
        <Layout role={role} name={name}>
            <div className="register-visit-container">
                <header className="page-header">
                    <h1>Register Visit</h1>
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
                            {!isScannerLoading && isScannerUsed ? isClientFound ? "Client Found" : "Client Not Found. Retry?" : isScannerLoading ? "Scanning..." : "Scan Client Code"}
                        </button>
                    )}
                    {!isScannerPaused && <CodeScannerComponent isPaused={isScannerPaused} setIsPaused={setIsScannerPaused} handleScan={handleScan} />}
                </section>

                <form onSubmit={handleSubmit} className="form-section">
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
                                        <input type="text" className="info-value" value={clientData.client_type} readOnly />
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
                                    <input type="hidden" name="client" value={clientId || 0} readOnly />
                                    <input type="hidden" name="datetime" value={datetime} readOnly />
                                    <input type="hidden" name="latitude" value={latitude} readOnly />
                                    <input type="hidden" name="longitude" value={longitude} readOnly />
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
                            className="form-control"
                            rows={4}
                            placeholder="Describe any relevant details about the visit..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{ borderRadius: '12px' }}
                        />
                    </div>

                    <div className="card border-0 bg-light p-3 mb-4" style={{ borderRadius: '16px' }}>
                        <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0">
                            <label className="form-check-label h6 mb-0 d-flex align-items-center" htmlFor="productiveSwitch">
                                <CheckCircle2 size={18} className="me-2 text-success" />
                                Productive Visit?
                            </label>
                            <input
                                className="form-check-input ms-0"
                                type="checkbox"
                                role="switch"
                                id="productiveSwitch"
                                style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                                checked={isProductive}
                                onChange={(e) => setIsProductive(e.target.checked)}
                            />
                        </div>
                    </div>


                    <button type="submit" className="submit-btn" disabled={isSubmitting || !isClientFound}>
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Registering...
                            </>
                        ) : "Complete Registration"}
                    </button>
                </form>

                {isSuccess && (
                    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                                <div className="modal-body p-5 text-center">
                                    <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', backgroundColor: 'var(--success-subtle)', borderRadius: '50%', color: 'var(--success-color)' }}>
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <h2 className="fw-bold mb-3" style={{ letterSpacing: '-0.025em' }}>Visit Registered!</h2>
                                    <p className="text-muted mb-4">
                                        The visit to <strong>{clientData.name}</strong> has been successfully recorded.
                                    </p>
                                    <div className="d-grid gap-2">
                                        <button className="btn btn-primary btn-lg fw-bold d-flex align-items-center justify-content-center py-3" style={{ borderRadius: '12px' }} onClick={resetForm}>
                                            <RefreshCw size={20} className="me-2" />
                                            Register Another Visit
                                        </button>
                                        <button className="btn btn-outline-secondary btn-lg fw-bold d-flex align-items-center justify-content-center py-3" style={{ borderRadius: '12px' }} onClick={() => navigate("/home")}>
                                            <Home size={20} className="me-2" />
                                            Back to Home
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                                <div className="modal-body p-5 text-center">
                                    <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', backgroundColor: 'var(--danger-subtle)', borderRadius: '50%', color: 'var(--danger-color)' }}>
                                        <AlertCircle size={48} />
                                    </div>
                                    <h2 className="fw-bold mb-3" style={{ letterSpacing: '-0.025em' }}>Oops! Something went wrong</h2>
                                    <p className="text-muted mb-4">
                                        {errorMessage}
                                    </p>
                                    <div className="d-grid gap-2">
                                        <button className="btn btn-danger btn-lg fw-bold d-flex align-items-center justify-content-center py-3" style={{ borderRadius: '12px' }} onClick={() => setErrorMessage("")}>
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
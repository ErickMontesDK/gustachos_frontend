import { useState } from "react";
import { api } from "../api/axiosInstance";
import Layout from "./Layout";
import { QrCode, ClipboardList, MapPin, User, CheckCircle2, AlertCircle, Store } from "lucide-react";
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
    const [isLoading] = useState(false);
    const [isScannerPaused, setIsScannerPaused] = useState(true);

    const [isScannerLoading, setIsScannerLoading] = useState(false);
    const [isScannerUsed, setIsScannerUsed] = useState(false);
    const [isClientFound, setIsClientFound] = useState(false);

    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [datetime, setDatetime] = useState("");

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
        setIsScannerUsed(true);
        setIsScannerLoading(true);
        const detectedCode = detectedCodes[0].rawValue;
        setIsScannerPaused(true);
        console.log("Detected code: ", detectedCode);

        setTimeout(() => {
            console.log("Scanner loading...");

            api.get(`/clients/${detectedCode}`)
                .then(response => {
                    console.log("Client data: ", response.data);
                    setClientData(response.data);
                    setClientId(parseInt(response.data.id));
                    gettingDatetime();
                    gettingGeolocation();

                    setIsClientFound(true);
                })
                .catch(error => {
                    console.error("Error fetching client data: ", error);
                })
                .finally(() => {
                    setIsScannerLoading(false);
                });
        }, 2000);

    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
            })
            .catch(error => {
                console.error("Error registering visit: ", error.response.data);
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


                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? "Registering..." : "Complete Registration"}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
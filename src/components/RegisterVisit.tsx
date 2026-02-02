import { useState } from "react";
import { api } from "../api/axiosInstance";
import Layout from "./Layout";
import { QrCode, ClipboardList, MapPin, User, CheckCircle2, AlertCircle } from "lucide-react";
import '../styles/register-visit.css';

export default function RegisterVisit() {
    const [clientName] = useState("Scan to load client...");
    const [delivererName] = useState(localStorage.getItem("name") || "Deliverer Name");
    const [isProductive, setIsProductive] = useState(false);
    const [notes, setNotes] = useState("");
    const [isLoading] = useState(false);

    // Mock role for Layout
    const role = localStorage.getItem("role") || "deliverer";
    const name = localStorage.getItem("name") || "User";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submit visit registration");
    }

    return (
        <Layout role={role} name={name}>
            <div className="register-visit-container">
                <header className="page-header">
                    <h1>Register Visit</h1>
                    <p>New client check-in</p>
                </header>

                {/* Simulated Scanner Section */}
                <section className="scanner-card">
                    <div className="scanner-box">
                        <QrCode size={48} strokeWidth={1.5} />
                    </div>
                    <button className="btn btn-outline-primary w-100 rounded-pill fw-bold" type="button">
                        Scan QR Code
                    </button>
                    <p className="mt-3 mb-0 text-muted small">
                        <AlertCircle size={14} className="me-1" />
                        Align barcode within the frame
                    </p>
                </section>

                <form onSubmit={handleSubmit} className="form-section">
                    {/* Information Cards (Read-only) */}
                    <div className="info-card">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">
                                    <User size={12} className="me-1" />
                                    Client
                                </span>
                                <div className="info-value">{clientName}</div>
                            </div>
                            <div className="info-item">
                                <span className="info-label">
                                    <MapPin size={12} className="me-1" />
                                    Deliverer
                                </span>
                                <div className="info-value">{delivererName}</div>
                            </div>
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="input-group-custom">
                        <label htmlFor="notes">
                            <ClipboardList size={16} className="me-1" />
                            Visit Notes
                        </label>
                        <textarea
                            id="notes"
                            className="textarea-custom"
                            placeholder="Add details about the visit..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="checkbox-wrapper">
                        <span className="checkbox-label d-flex align-items-center">
                            <CheckCircle2 size={18} className="me-2 text-success" />
                            Productive Visit?
                        </span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={isProductive}
                                onChange={(e) => setIsProductive(e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? "Registering..." : "Complete Registration"}
                    </button>
                </form>
            </div>
        </Layout>
    );
}
import Layout from "../../../components/Layout";
import { useState, useEffect } from "react";
import { Briefcase, Globe, Languages, Ruler, Navigation, Clock, Calendar, Edit3, CircleCheck, Link } from "lucide-react";
import Modal from "../../../components/modal";
import { useBusiness, useUpdateBusiness } from "../hooks/useBusiness";


const InfoCard = ({ title, icon: Icon, children, bgColor = "primary" }: any) => (
    <div className="col-lg-6">
        <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white bg-opacity-75" style={{ backdropFilter: 'blur(8px)' }}>
            <h5 className="mb-4 fw-bold d-flex align-items-center text-dark">
                <Icon size={20} className={`text-${bgColor} me-2`} />
                {title}
            </h5>
            <div className="row g-3">{children}</div>
        </div>
    </div>
);

const InfoItem = ({ label, value, icon: Icon, fullWidth = false }: any) => (
    <div className={fullWidth ? "col-12" : "col-md-6"}>
        <div className="p-3 bg-light rounded-3 border border-light shadow-xs">
            <label className="text-muted small fw-bold text-uppercase d-block mb-1">{label}</label>
            <div className="fw-semibold d-flex align-items-center text-truncate">
                {Icon && <Icon size={16} className="me-2 text-secondary flex-shrink-0" />}
                {value || '--'}
            </div>
        </div>
    </div>
);

export default function BusinessData() {
    const { business: businessInfo, loading, error, refresh } = useBusiness();
    const [showEditModal, setShowEditModal] = useState(false);
    const [urlError, setUrlError] = useState("");
    const [imgError, setImgError] = useState(false);

    const {
        business: formData,
        setBusiness: setFormData,
        updateBusiness,
        isUpdating
    } = useUpdateBusiness(() => {
        setShowEditModal(false);
        refresh();
    }, (msg) => alert(msg));

    useEffect(() => { setImgError(false); }, [businessInfo.logo_url]);

    const validateUrl = (url: string) => {
        if (!url) return true;
        try { return !!new URL(url); } catch { return false; }
    };

    const isFormValid = !!(
        formData.business_name && formData.time_zone && formData.locale &&
        formData.distance_unit && formData.max_valid_distance >= 0 &&
        formData.min_time_between_visits >= 0 && !urlError
    );

    const handleUrlChange = (url: string) => {
        setFormData({ ...formData, logo_url: url });
        setImgError(false);
        setUrlError(url && !validateUrl(url) ? "Please enter a valid URL" : "");
    };

    if (loading && !businessInfo.business_name) {
        return <Layout><div className="p-5 text-center"><div className="spinner-border text-primary"></div></div></Layout>;
    }

    return (
        <Layout>
            {error && <div className="alert alert-danger mb-4">{error}</div>}

            {/* Header Section */}
            <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden bg-white">
                <div className="card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-4 me-4 text-primary d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '80px', height: '80px' }}>
                            {businessInfo.logo_url && !imgError ? (
                                <img src={businessInfo.logo_url} alt="Logo" className="w-100 h-100 object-fit-cover" onError={() => setImgError(true)} />
                            ) : (
                                <Briefcase size={40} />
                            )}
                        </div>
                        <div>
                            <h1 className="h2 mb-1 fw-bold text-dark">{businessInfo.business_name}</h1>
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 border-0 d-inline-flex align-items-center gap-1">
                                <CircleCheck size={14} /> Active Account
                            </span>
                        </div>
                    </div>
                    <button className="btn btn-primary rounded-3 px-4 py-2 d-flex align-items-center gap-2 border-0 shadow-sm"
                        onClick={() => { setFormData({ ...businessInfo }); setUrlError(""); setShowEditModal(true); }}>
                        <Edit3 size={18} /> Edit Configuration
                    </button>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="row g-4">
                <InfoCard title="Localization & Regional" icon={Globe} bgColor="primary">
                    <InfoItem label="Time Zone" value={businessInfo.time_zone} icon={Clock} />
                    <InfoItem label="Language / Locale" value={businessInfo.locale} icon={Languages} />
                    <InfoItem label="Distance Unit" value={businessInfo.distance_unit === 'm' ? 'International (m)' : 'English (ft)'} icon={Ruler} fullWidth />
                </InfoCard>

                <InfoCard title="Operational Thresholds" icon={Navigation} bgColor="success">
                    <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border border-light shadow-xs">
                            <label className="text-muted small fw-bold text-uppercase d-block mb-1">Max Valid Distance</label>
                            <div className="fw-semibold h4 mb-0 text-primary">
                                {businessInfo.max_valid_distance} <small className="text-muted fs-6">{businessInfo.distance_unit}</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border border-light shadow-xs">
                            <label className="text-muted small fw-bold text-uppercase d-block mb-1">Min Time Between Visits</label>
                            <div className="fw-semibold h4 mb-0 text-success">
                                {businessInfo.min_time_between_visits} <small className="text-muted fs-6">min</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mt-2">
                        <div className="p-3 rounded-3 d-flex align-items-center text-muted small">
                            <Calendar size={14} className="me-2" />
                            Last sync: {businessInfo.updated_at ? new Date(businessInfo.updated_at).toLocaleString() : '--'}
                        </div>
                    </div>
                </InfoCard>
            </div>

            {/* Unified Edit Modal */}
            {showEditModal && (
                <Modal
                    title="Edit Business Configuration"
                    message="Adjust system-wide settings for distance, time, and localization."
                    buttonText1={isUpdating ? "Saving..." : "Save Configuration"}
                    buttonText2="Cancel"
                    isForm={true}
                    isSubmitDisabled={!isFormValid || isUpdating}
                    buttonAction1={updateBusiness}
                    buttonAction2={() => setShowEditModal(false)}
                >
                    <div className="row g-3 text-start">
                        <div className="col-12">
                            <label className="form-label fw-bold">Business Name</label>
                            <input type="text" className="form-control" value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} required />
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-bold d-flex align-items-center gap-2"><Link size={16} /> Logo URL</label>
                            <input type="url" className={`form-control ${urlError ? 'is-invalid' : ''}`} value={formData.logo_url} onChange={(e) => handleUrlChange(e.target.value)} />
                            <div className={urlError ? "invalid-feedback" : "form-text small"}>{urlError || "Provide a link to your business logo image."}</div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Time Zone</label>
                            <select className="form-select" value={formData.time_zone} onChange={(e) => setFormData({ ...formData, time_zone: e.target.value })} required>
                                <option value="UTC">UTC (Universal)</option>
                                <option value="America/Mexico_City">Mexico City</option>
                                <option value="America/New_York">Eastern Time</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Distance Unit</label>
                            <select className="form-select" value={formData.distance_unit} onChange={(e) => setFormData({ ...formData, distance_unit: e.target.value })} required>
                                <option value="m">International (m)</option>
                                <option value="km">English (ft)</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Max Distance ({formData.distance_unit})</label>
                            <input type="number" className="form-control" value={formData.max_valid_distance} onChange={(e) => setFormData({ ...formData, max_valid_distance: Number(e.target.value) })} min="0" required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Min Time (min)</label>
                            <input type="number" className="form-control" value={formData.min_time_between_visits} onChange={(e) => setFormData({ ...formData, min_time_between_visits: Number(e.target.value) })} min="0" required />
                        </div>
                    </div>
                </Modal>
            )}
        </Layout>
    );
}
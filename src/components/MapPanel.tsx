import { MapPin, X, Settings, Activity, Briefcase, Globe, Clock, Calendar, User, LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDatetime } from '../utils/formatDatetime';
import { getVisits } from '../features/visits/api/visitsService';
import { getClientById } from '../features/clients/api/clientsServices';
import { MarkerProps } from './MapDisplay';
import './MapDisplay.css';

interface MapPanelProps {
    marker: MarkerProps;
    config?: Record<string, { color: string; icon: string }>;
    onClose: () => void;
}

const DEFAULT_VISIBLE_FIELDS = {
    type: true,
    status: true,
    address: true,
    sector: true,
    market: true,
    coordinates: true,
    recentVisits: true,
    visitDetails: true,
};


const PanelHeader = ({ marker, fullDetail, showSettings, setShowSettings, onClose, color }: any) => (
    <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light">
        <div className="d-flex flex-column gap-1 overflow-hidden" style={{ minWidth: 0 }}>
            <span className="fw-bolder text-truncate" style={{ fontSize: '16px', color: 'var(--text-main)' }}>
                {marker.popup}
            </span>
            <div className="d-flex gap-1 flex-wrap">
                <span className="badge bg-secondary badge-tiny">
                    CODE: {fullDetail?.code}
                </span>
                {marker.type && (
                    <span className="badge badge-tiny" style={{ backgroundColor: color }}>
                        {fullDetail?.client_type_name}
                    </span>
                )}
            </div>
        </div>

        <div className="d-flex gap-1 ms-2">
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn btn-sm btn-light p-1 rounded-2"
                style={{ color: showSettings ? color : 'var(--text-muted)' }}
            >
                <Settings size={18} />
            </button>
            <button
                onClick={onClose}
                className="btn btn-sm btn-light p-1 rounded-2 text-muted"
            >
                <X size={18} />
            </button>
        </div>
    </div>
);

const SettingsView = ({ marker, visibleFields, toggleField, onDone }: any) => (
    <div className="p-3 bg-light overflow-auto flex-grow-1">
        <h6 className="mb-3 text-muted fw-bold" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>DISPLAY SETTINGS</h6>
        <div className="d-flex flex-column gap-2">
            {Object.keys(DEFAULT_VISIBLE_FIELDS).map((field) => {
                if (field === 'recentVisits' && marker.visit_id) return null;
                if (field === 'visitDetails' && !marker.visit_id) return null;

                return (
                    <div key={field} className="form-check">
                        <input
                            className="form-check-input"
                            style={{ cursor: 'pointer' }}
                            type="checkbox"
                            id={`field-${field}`}
                            checked={visibleFields[field]}
                            onChange={() => toggleField(field)}
                        />
                        <label className="form-check-label text-capitalize" style={{ fontSize: '13px', cursor: 'pointer', color: 'var(--text-main)' }} htmlFor={`field-${field}`}>
                            {field === 'recentVisits' ? 'Recent Visits' : field === 'visitDetails' ? 'Visit Details' : field}
                        </label>
                    </div>
                );
            })}
        </div>
        <button onClick={onDone} className="btn btn-primary w-100 mt-4 shadow-sm fw-bold rounded-3">
            Done
        </button>
    </div>
);

interface InfoRowProps {
    icon: LucideIcon;
    label: string;
    loading?: boolean;
    content?: React.ReactNode;
    className?: string;
}

const InfoRow = ({ icon: Icon, label, loading, content, className }: InfoRowProps) => (
    <div className="d-flex gap-2">
        <Icon size={16} color="var(--text-muted)" className="mt-1 flex-shrink-0" />
        <div className="flex-grow-1">
            <div className="text-label-small">{label}</div>
            {loading ? (
                <div className="text-muted fst-italic" style={{ fontSize: '13px' }}>Loading...</div>
            ) : (
                <div className={className || "text-content-small"}>{content}</div>
            )}
        </div>
    </div>
);

const VisitDetailsSection = ({ marker }: any) => (
    <div className="border-top border-dashed pt-3 mt-1">

        <div className="d-flex align-items-center gap-2 mb-3">
            <Activity size={16} color="var(--text-main)" />
            <span className="fw-bold" style={{ fontSize: '12px', color: 'var(--text-main)' }}>VISIT DETAILS</span>
            <a href={`/clients-data?code=${marker.code}`} className="btn btn-sm btn-outline-primary ms-auto badge-tiny rounded-2 px-2 py-1">
                View Profile
            </a>
        </div>

        <div className="d-flex flex-column gap-2">

            <div className={`d-flex justify-content-between align-items-center p-2 rounded-2 border ${marker.is_productive ? 'visit-card-productive' : 'visit-card-nosale'}`}>
                <div className="d-flex align-items-center gap-2">
                    <Calendar size={12} color="var(--text-muted)" />
                    <span className="text-date-small">
                        {marker.visit_date ? (marker.visit_date.includes('T') ? formatDatetime(marker.visit_date).formattedDate : marker.visit_date) : 'N/A'} {marker.visit_time && `- ${marker.visit_time}`}
                    </span>
                </div>

                <div className={`text-uppercase badge-tiny ${marker.is_productive ? 'text-success' : 'text-danger'}`}>
                    {marker.is_productive ? 'Productive' : 'No Sale'}
                </div>
            </div>

            {marker.notes && (
                <div className="p-2 rounded-2 border bg-light">
                    <div className="text-label-small">NOTES</div>
                    <div className="fst-italic text-content-small">"{marker.notes}"</div>
                </div>
            )}

            {marker.deliverer_name && (
                <div className="d-flex align-items-center gap-2 py-1">
                    <User size={14} color="var(--text-muted)" />
                    <span className="text-muted" style={{ fontSize: '11px' }}>Visited by: <small className="fw-bold">{marker.deliverer_name}</small></span>
                </div>
            )}
        </div>
    </div>
);

const RecentVisitsSection = ({ fullDetail, visits, loadingVisits }: any) => (
    <div className="border-top border-dashed pt-3 mt-1">

        <div className="d-flex align-items-center gap-2 mb-3">
            <Clock size={16} color="var(--text-main)" />
            <span className="fw-bold" style={{ fontSize: '12px', color: 'var(--text-main)' }}>RECENT VISITS</span>
            <a href={`/visits-data?search_term=${fullDetail?.code}`} className="btn btn-sm btn-outline-primary ms-auto badge-tiny rounded-2 px-2 py-1">
                View All
            </a>
        </div>

        {loadingVisits ? (
            <div className="text-center text-muted fst-italic py-2" style={{ fontSize: '13px' }}>
                Loading visits...
            </div>
        ) : visits.length > 0 ? (
            <div className="d-flex flex-column gap-2">
                {visits.map((visit: any) => (
                    <div key={visit.id} className="d-flex justify-content-between align-items-center p-2 rounded-2 border bg-light">
                        <div className="d-flex align-items-center gap-2">
                            <Calendar size={12} color="var(--text-muted)" />
                            <span className="text-date-small">
                                {formatDatetime(visit.visited_at).formattedDate}
                            </span>
                        </div>
                        <div className={`text-uppercase badge-tiny ${visit.is_productive ? 'text-success' : 'text-danger'}`}>
                            {visit.is_productive ? 'Productive' : 'No Sale'}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center text-muted fst-italic py-2" style={{ fontSize: '13px' }}>
                No visits recorded yet
            </div>
        )}
    </div>
);



export default function MapPanel({ marker, config, onClose }: MapPanelProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [visibleFields, setVisibleFields] = useState(() => {
        const saved = localStorage.getItem('mapPopupPreferences');
        const parsed = saved ? JSON.parse(saved) : {};
        return { ...DEFAULT_VISIBLE_FIELDS, ...parsed };
    });

    const [visits, setVisits] = useState<any[]>([]);
    const [loadingVisits, setLoadingVisits] = useState(false);
    const [fullDetail, setFullDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        setVisits([]);
        setLoadingVisits(false);
        setFullDetail(null);
        setLoadingDetail(false);

        if (marker.id) {
            setLoadingDetail(true);
            getClientById(marker.id)
                .then((data: any) => {
                    setFullDetail(data);
                    setLoadingDetail(false);
                })
                .catch((err: any) => {
                    console.error("Error fetching client details for map popup:", err);
                    setLoadingDetail(false);
                });
        }
    }, [marker]);

    useEffect(() => {
        if (fullDetail?.code) {
            setLoadingVisits(true);
            setVisits([]);
            getVisits({
                search_term: fullDetail.code,
                page_size: 3,
                sorting: "-visited_at",
            })
                .then(data => {
                    setVisits(data.results || []);
                    setLoadingVisits(false);
                })
                .catch(err => {
                    console.error("Error fetching visits for map popup:", err);
                    setLoadingVisits(false);
                });
        }
    }, [fullDetail?.code]);

    useEffect(() => {
        localStorage.setItem('mapPopupPreferences', JSON.stringify(visibleFields));
    }, [visibleFields]);

    const getSelectedColor = () => {
        if (!marker.type || !config) return 'var(--primary-color)';
        return config[marker.type]?.color || 'var(--primary-color)';
    };

    const toggleField = (field: keyof typeof DEFAULT_VISIBLE_FIELDS) => {
        setVisibleFields((prev: any) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="map-panel-wrapper">
            <div style={{ height: 6, backgroundColor: getSelectedColor(), width: '100%' }} />

            <PanelHeader
                marker={marker}
                fullDetail={fullDetail}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                onClose={onClose}
                color={getSelectedColor()}
            />

            {showSettings ? (
                <SettingsView
                    marker={marker}
                    visibleFields={visibleFields}
                    toggleField={toggleField}
                    onDone={() => setShowSettings(false)}
                />
            ) : (
                <div className="p-3 d-flex flex-column gap-3 overflow-auto flex-grow-1">
                    {visibleFields.status && (
                        <div className="d-flex gap-2 flex-wrap">
                            <span className={`badge ${fullDetail?.status === "active" ? 'bg-success' : fullDetail?.status === "paused" ? 'bg-warning' : 'bg-danger'} rounded-pill px-2 py-1`} style={{ fontSize: '11px' }}>
                                {fullDetail?.status}
                            </span>
                        </div>
                    )}

                    {visibleFields.address && (
                        <InfoRow
                            icon={MapPin}
                            label="ADDRESS"
                            loading={loadingDetail}
                            content={fullDetail?.full_address || 'No address provided'}
                        />
                    )}

                    {(visibleFields.sector || visibleFields.market) && (
                        <div className="d-flex gap-2">
                            <Briefcase size={16} color="var(--text-muted)" className="mt-1 flex-shrink-0" />
                            <div className="d-flex flex-column gap-2 flex-grow-1">
                                {visibleFields.sector && (
                                    <div>
                                        <div className="text-label-small">SECTOR</div>
                                        {loadingDetail ? (
                                            <div className="text-muted fst-italic" style={{ fontSize: '13px' }}>...</div>
                                        ) : (
                                            <div className="text-content-small">{(fullDetail || marker).sector || 'No sector'}</div>
                                        )}
                                    </div>
                                )}
                                {visibleFields.market && (
                                    <div>
                                        <div className="text-label-small">MARKET</div>
                                        {loadingDetail ? (
                                            <div className="text-muted fst-italic" style={{ fontSize: '13px' }}>...</div>
                                        ) : (
                                            <div className="text-content-small">{(fullDetail || marker).market || 'No market'}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {visibleFields.coordinates && (
                        <InfoRow
                            icon={Globe}
                            label="COORDINATES"
                            loading={false}
                            className="text-mono-small"
                            content={`${Number(marker.lat).toFixed(6)}, ${Number(marker.lng).toFixed(6)}`}
                        />
                    )}

                    {marker.visit_id ? (
                        visibleFields.visitDetails && <VisitDetailsSection marker={marker} />
                    ) : (
                        visibleFields.recentVisits && <RecentVisitsSection fullDetail={fullDetail} visits={visits} loadingVisits={loadingVisits} />
                    )}
                </div>
            )}
        </div>
    );
}

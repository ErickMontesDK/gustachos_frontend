import { Home, MapPin, Package, Store, User, X, Navigation, Settings, Check, Activity, Briefcase, Layers, Globe, Clock, Calendar } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getVisits } from '../features/visits/api/visitsService';
import { getClientById } from '../features/clients/api/clientsServices';

declare const L: any;

export interface MarkerProps {
    lat: number;
    lng: number;
    popup: string;
    icon?: string;
    type?: string;
    code?: string;
    address?: string;
    sector?: string;
    market?: string;
    is_active?: boolean;
    id?: number; // <-- Added
}

export interface MapDisplayProps {
    markers?: MarkerProps[];
    config?: Record<string, { color: string; icon: string }>;
}

const DEFAULT_VISIBLE_FIELDS = {
    type: true,
    status: true,
    address: true,
    sector: true,
    market: true,
    coordinates: true,
    recentVisits: true,
};

export default function MapDisplay({ markers, config }: MapDisplayProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);

    const [selectedMarker, setSelectedMarker] = useState<MarkerProps | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [visibleFields, setVisibleFields] = useState(() => {
        const saved = localStorage.getItem('mapPopupPreferences');
        return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_FIELDS;
    });

    const [visits, setVisits] = useState<any[]>([]);
    const [loadingVisits, setLoadingVisits] = useState(false);
    const [fullDetail, setFullDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const selectedMarkerRef = useRef<MarkerProps | null>(null);

    useEffect(() => {
        selectedMarkerRef.current = selectedMarker;

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

        if (selectedMarker?.id) {
            setLoadingDetail(true);
            setFullDetail(null);
            getClientById(selectedMarker.id)
                .then((data: any) => {
                    setFullDetail(data);
                    setLoadingDetail(false);
                })
                .catch((err: any) => {
                    console.error("Error fetching client details for map popup:", err);
                    setLoadingDetail(false);
                });
        }
    }, [selectedMarker]);

    useEffect(() => {
        localStorage.setItem('mapPopupPreferences', JSON.stringify(visibleFields));
    }, [visibleFields]);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([0, 0], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current);

            markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const defaultIconHTML = useMemo(() => renderToStaticMarkup(
        <div style={{
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            border: '3px solid white',
            boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Store size={18} />
        </div>
    ), []);

    useEffect(() => {
        if (mapInstanceRef.current && markersLayerRef.current) {
            markersLayerRef.current.clearLayers();
            setSelectedMarker(null);

            if (markers && markers.length > 0) {
                const bounds = L.latLngBounds([]);

                markers.forEach((marker) => {
                    const latLng: [number, number] = [Number(marker.lat), Number(marker.lng)];
                    let iconHTML = defaultIconHTML;
                    if (marker.type !== undefined && config && config[marker.type]) {
                        const IconComponent = () => {
                            switch (config[marker.type!].icon) {
                                case "Store": return <Store size={18} />;
                                case "Home": return <Home size={18} />;
                                case "Package": return <Package size={18} />;
                                case "User": return <User size={18} />;
                                case "MapPin": return <MapPin size={18} />;
                                default: return <Store size={18} />;
                            }
                        };

                        iconHTML = renderToStaticMarkup(
                            <div style={{
                                backgroundColor: config[marker.type].color || '#007bff',
                                color: 'white',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                border: '3px solid white',
                                boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <IconComponent />
                            </div>
                        );
                    }

                    const leafletMarker = L.marker(latLng, {
                        icon: L.divIcon({
                            html: iconHTML,
                            className: 'custom-map-marker',
                            iconSize: [38, 38],
                            iconAnchor: [19, 19],
                            popupAnchor: [0, -19],
                        })
                    }).addTo(markersLayerRef.current);

                    leafletMarker.on('click', () => {
                        setSelectedMarker(marker);
                        setShowSettings(false);
                    });

                    bounds.extend(latLng);
                });

                mapInstanceRef.current.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 15
                });
            } else {
                mapInstanceRef.current.setView([0, 0], 13);
            }
        }
    }, [markers, config, defaultIconHTML]);

    const getSelectedColor = () => {
        if (!selectedMarker || selectedMarker.type === undefined || !config) return '#007bff';
        return config[selectedMarker.type]?.color || '#007bff';
    };

    const toggleField = (field: keyof typeof DEFAULT_VISIBLE_FIELDS) => {
        setVisibleFields((prev: any) => ({ ...prev, [field]: !prev[field] }));
    };


    return (
        <div style={{ position: 'relative', width: '100%', marginBottom: '1.5rem' }}>
            <div
                ref={mapContainerRef}
                className="rounded shadow-sm border"
                style={{ height: "450px", width: "100%", zIndex: 1 }}
            />

            {selectedMarker && (
                <div
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 1000,
                        width: 320,
                        background: 'white',
                        borderRadius: 16,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        animation: 'fadeSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'calc(450px - 24px)',
                    }}
                >
                    <div style={{ height: 6, background: getSelectedColor(), width: '100%' }} />

                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 16px 14px',
                        borderBottom: '1px solid #eee',
                        backgroundColor: '#fafafa'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
                            <span style={{ fontWeight: 800, fontSize: 16, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {selectedMarker.popup}
                            </span>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <span className="badge bg-secondary" style={{ fontSize: 10, fontWeight: 700 }}>
                                    CODE: {fullDetail?.code}
                                </span>
                                {selectedMarker.type && (
                                    <span className="badge" style={{ backgroundColor: getSelectedColor(), fontSize: 10, fontWeight: 700 }}>
                                        {fullDetail?.client_type_name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 4 }}>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="btn btn-sm btn-light p-1"
                                style={{ borderRadius: 8, color: showSettings ? getSelectedColor() : '#888' }}
                            >
                                <Settings size={18} />
                            </button>
                            <button
                                onClick={() => setSelectedMarker(null)}
                                className="btn btn-sm btn-light p-1"
                                style={{ borderRadius: 8, color: '#888' }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content or Settings */}
                    {showSettings ? (
                        <div style={{ padding: '16px', background: '#fafafa', overflowY: 'auto', flex: 1 }}>
                            <h6 style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: '#666', letterSpacing: '0.5px' }}>DISPLAY SETTINGS</h6>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {Object.keys(DEFAULT_VISIBLE_FIELDS).map((field) => (
                                    <div key={field} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`field-${field}`}
                                            checked={visibleFields[field]}
                                            onChange={() => toggleField(field as any)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <label
                                            className="form-check-label text-capitalize"
                                            htmlFor={`field-${field}`}
                                            style={{ fontSize: 13, cursor: 'pointer', color: '#444' }}
                                        >
                                            {field === 'recentVisits' ? 'Recent Visits' : field}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="btn btn-primary w-100 mt-3 shadow-sm"
                                style={{ borderRadius: 10, fontWeight: 700 }}
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' }}>
                            {/* Status and Type row */}
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {visibleFields.status && (
                                    <span className={`badge ${fullDetail?.status === "active" ? 'bg-success' : fullDetail?.status === "paused" ? 'bg-warning' : 'bg-danger'} rounded-pill`} style={{ fontSize: 11, padding: '4px 10px' }}>
                                        {fullDetail?.status}
                                    </span>
                                )}
                            </div>

                            {/* Address */}
                            {visibleFields.address && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <MapPin size={16} color="#888" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 2 }}>ADDRESS</div>
                                        {loadingDetail ? (
                                            <div style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>Loading address...</div>
                                        ) : (
                                            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.4 }}>
                                                {fullDetail?.full_address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Sector & Market */}
                            {(visibleFields.sector || visibleFields.market) && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <Briefcase size={16} color="#888" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                                        {visibleFields.sector && (
                                            <div>
                                                <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 2 }}>SECTOR</div>
                                                {loadingDetail ? (
                                                    <div style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>...</div>
                                                ) : (
                                                    <div style={{ fontSize: 13, color: '#333' }}>
                                                        {(fullDetail || selectedMarker).sector || 'No sector'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {visibleFields.market && (
                                            <div>
                                                <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 2 }}>MARKET</div>
                                                {loadingDetail ? (
                                                    <div style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>...</div>
                                                ) : (
                                                    <div style={{ fontSize: 13, color: '#333' }}>
                                                        {(fullDetail || selectedMarker).market || 'No market'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Coordinates */}
                            {visibleFields.coordinates && (
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <Globe size={16} color="#888" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 2 }}>COORDINATES</div>
                                        <div style={{ fontSize: 13, color: '#333', fontFamily: 'monospace' }}>
                                            {Number(selectedMarker.lat).toFixed(6)}, {Number(selectedMarker.lng).toFixed(6)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Visits Section */}
                            {visibleFields.recentVisits && (
                                <div style={{ borderTop: '1px dashed #f0f0f0', paddingTop: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <Clock size={16} color="#444" />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#444' }}>RECENT VISITS</span>
                                        <div style={{ marginLeft: 'auto' }}>
                                            <a
                                                href={`/visits-data?search_term=${fullDetail?.code}`}
                                                className="btn btn-sm btn-outline-primary"
                                                style={{ fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px' }}
                                            >
                                                View All
                                            </a>
                                        </div>
                                    </div>

                                    {loadingVisits ? (
                                        <div style={{ fontSize: 12, color: '#888', padding: '8px 0', textAlign: 'center' }}>
                                            Loading visits...
                                        </div>
                                    ) : visits.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {visits.map((visit) => (
                                                <div key={visit.id} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '8px 12px',
                                                    background: '#f8f9fa',
                                                    borderRadius: 8,
                                                    border: '1px solid #f0f0f0'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Calendar size={12} color="#888" />
                                                        <span style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>
                                                            {new Date(visit.visited_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: visit.is_productive ? '#099268' : '#fa5252',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {visit.is_productive ? 'Productive' : 'No Sale'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>
                                            No visits recorded yet
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-12px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)   scale(1);    }
                }
            `}</style>
        </div>
    );
}

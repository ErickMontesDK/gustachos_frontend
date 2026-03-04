import { Home, MapPin, Package, Store, User } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

declare const L: any;

export interface MarkerProps {
    lat: number;
    lng: number;
    popup: string;
    icon?: string;
    type?: string | number;
}

export interface MapDisplayProps {
    markers?: MarkerProps[];
    config?: Record<string, { color: string; icon: string }>;
}

export default function MapDisplay({ markers, config }: MapDisplayProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);

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

            if (markers && markers.length > 0) {
                const bounds = L.latLngBounds([]);

                markers.forEach((marker) => {
                    const latLng: [number, number] = [Number(marker.lat), Number(marker.lng)];
                    let iconHTML = defaultIconHTML;
                    if (marker.type !== undefined && config && config[marker.type]) {
                        const IconComponent = () => {
                            switch (config[marker.type!].icon) {
                                case "Store":
                                    return <Store size={18} />;
                                case "Home":
                                    return <Home size={18} />;
                                case "Package":
                                    return <Package size={18} />;
                                case "User":
                                    return <User size={18} />;
                                case "MapPin":
                                    return <MapPin size={18} />;
                                default:
                                    return <Store size={18} />;
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

                    L.marker(latLng, {
                        icon: L.divIcon({
                            html: iconHTML,
                            className: 'custom-map-marker',
                            iconSize: [38, 38],
                            iconAnchor: [19, 19],
                            popupAnchor: [0, -19],
                        })
                    })
                        .addTo(markersLayerRef.current)
                        .bindPopup(marker.popup);

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

    return (
        <div
            ref={mapContainerRef}
            className="rounded shadow-sm border mb-4"
            style={{ height: "400px", width: "100%", zIndex: 1 }}
        >
        </div>
    );
}
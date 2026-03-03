import { useEffect, useRef } from 'react';

declare const L: any;

export interface MarkerProps {
    lat: number;
    lng: number;
    popup: string;
    icon?: string;
}

export interface MapDisplayProps {
    markers?: MarkerProps[];
}

export default function MapDisplay({ markers }: MapDisplayProps) {
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

    useEffect(() => {
        if (mapInstanceRef.current && markersLayerRef.current) {
            markersLayerRef.current.clearLayers();

            if (markers && markers.length > 0) {
                const bounds = L.latLngBounds([]);

                markers.forEach((marker) => {
                    const latLng: [number, number] = [Number(marker.lat), Number(marker.lng)];

                    L.marker(latLng)
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
    }, [markers]);

    return (
        <div
            ref={mapContainerRef}
            className="rounded shadow-sm border mb-4"
            style={{ height: "400px", width: "100%", zIndex: 1 }}
        >
        </div>
    );
}
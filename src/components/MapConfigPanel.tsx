import { useState } from 'react';
import { Settings } from 'lucide-react';

interface ClientTypeOption {
    id: string | number;
    name: string;
}

interface MapConfigPanelProps {
    clientTypes: ClientTypeOption[];
    clientTypeConfig: Record<string, { color: string; icon: string }>;
    setClientTypeConfig: (config: Record<string, { color: string; icon: string }>) => void;
}

export function useMapConfig() {
    const [clientTypeConfig, setClientTypeConfig] = useState<Record<string, { color: string; icon: string }>>(() => {
        const saved = localStorage.getItem("clientTypeConfig");
        return saved ? JSON.parse(saved) : {};
    });

    return { clientTypeConfig, setClientTypeConfig };
}

export default function MapConfigPanel({ clientTypes, clientTypeConfig, setClientTypeConfig }: MapConfigPanelProps) {

    const updateConfig = (typeId: string | number, field: 'color' | 'icon', value: string) => {
        const newConfig = {
            ...clientTypeConfig,
            [typeId]: {
                ...clientTypeConfig[typeId],
                [field]: value
            }
        };
        setClientTypeConfig(newConfig);
        localStorage.setItem("clientTypeConfig", JSON.stringify(newConfig));
    };

    return (
        <div className="card shadow-sm mb-4 border-0 bg-light animate-fade-in">
            <div className="card-body">
                <h5 className="card-title d-flex align-items-center gap-2 mb-3 text-secondary">
                    <Settings size={20} /> Map Configuration by Client Type
                </h5>
                <div className="row g-3">
                    {clientTypes.map((type) => (
                        <div key={type.id} className="col-md-6 col-lg-4">
                            <div className="p-3 border rounded bg-white shadow-sm">
                                <div className="fw-bold mb-2 text-dark">{type.name}</div>
                                <div className="d-flex gap-3 align-items-center">
                                    <div className="flex-grow-1">
                                        <label className="small text-muted d-block mb-1">Color</label>
                                        <input
                                            type="color"
                                            className="form-control form-control-sm border-0 p-0"
                                            style={{ height: '31px', width: '100%', cursor: 'pointer' }}
                                            value={clientTypeConfig[type.id]?.color || "#007bff"}
                                            onChange={(e) => updateConfig(type.id, 'color', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-grow-1">
                                        <label className="small text-muted d-block mb-1">Icon</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={clientTypeConfig[type.id]?.icon || "Store"}
                                            onChange={(e) => updateConfig(type.id, 'icon', e.target.value)}
                                        >
                                            <option value="Store">Store</option>
                                            <option value="Home">Home</option>
                                            <option value="MapPin">MapPin</option>
                                            <option value="Package">Package</option>
                                            <option value="User">User</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

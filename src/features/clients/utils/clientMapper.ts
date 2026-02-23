import { Client } from "../hooks/useClients"

export const clientMapper = (client: any): Client => {
    return {
        id: client.id,
        code: client.code ?? "Unknown",
        name: client.name ?? "Unknown",
        address: client.address ?? "Unknown",
        full_address: client.full_address ?? "Unknown",
        client_type: client.client_type ?? "Unknown",
        latitude: Number(client.latitude) || 0,
        longitude: Number(client.longitude) || 0,
        market: client.market ?? "Unknown",
        sector: client.sector ?? "Unknown",
        neighborhood: client.neighborhood ?? "Unknown",
        municipality: client.municipality ?? "Unknown",
        state: client.state ?? "Unknown",
        is_active: client.is_active ?? false,
        is_active_label: client.is_active ? "✅" : "❌",
        cellClassName: {
            is_active: "boolean " + (client.is_active ? "cell-green" : "cell-red"),
        }
    }
}
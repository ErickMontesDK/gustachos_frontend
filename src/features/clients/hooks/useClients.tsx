import { SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { usePaginatedData } from "../../../hooks/usePaginatedData";
import { getClients, updateClient as updateClientService, deleteClient as deleteClientService, getClientsMap, restoreClient as restoreClientService } from "../api/clientsServices";
import { clientMapper } from "./../utils/clientMapper";

export interface Client {
    id: number;
    code: string;
    name: string;
    address: string;
    full_address: string;
    neighborhood: string;
    municipality: string;
    state: string;
    sector: string;
    market: string;
    client_type: string;
    client_type_id: number;
    latitude: number;
    longitude: number;
    is_active: boolean;
    is_active_label: string;
    isDeleted: boolean;
    cellClassName?: {
        is_active?: string;
    }
}

interface ClientsForMap {
    id: number;
    code: string;
    latitude: number;
    longitude: number;
    name: string;
    client_type: string;
    address: string;
    sector: string;
    market: string;
    is_active: boolean;
}

interface filters {
    code: string;
    client_type: string;
    municipality: string;
    state: string;
    sector: string;
    market: string;
    address: string;
    name: string;
    page: number;
    page_size: number;
    sorting: string;
    is_deleted: boolean;
    is_active: string;
}

const DEFAULT_FILTERS: filters = {
    client_type: "",
    municipality: "",
    state: "",
    sector: "",
    market: "",
    address: "",
    name: "",
    page: 1,
    page_size: 15,
    sorting: "",
    code: "",
    is_deleted: false,
    is_active: "",
}

export const useClients = () => {
    const { data: clients, ...rest } = usePaginatedData({
        defaultFilters: DEFAULT_FILTERS,
        fetchData: getClients,
        mapData: clientMapper,
        formatFilters: (filters) => ({
            client_type: filters.client_type || undefined,
            municipality: filters.municipality || undefined,
            state: filters.state || undefined,
            sector: filters.sector || undefined,
            market: filters.market || undefined,
            address: filters.address || undefined,
            name: filters.name || undefined,
            code: filters.code || undefined,
            is_deleted: filters.is_deleted || undefined,
            is_active: filters.is_active === "true" ? true : filters.is_active === "false" ? false : undefined,
        })
    });

    return {
        clients,
        ...rest
    };
}

export const useClientsMap = (filters: filters, refreshKey?: any) => {
    const [clientsMap, setClientsMap] = useState<ClientsForMap[]>([]);

    useEffect(() => {
        const controller = new AbortController();

        getClientsMap({
            client_type: filters.client_type || undefined,
            municipality: filters.municipality || undefined,
            state: filters.state || undefined,
            sector: filters.sector || undefined,
            market: filters.market || undefined,
            address: filters.address || undefined,
            name: filters.name || undefined,
            code: filters.code || undefined,
            is_active: filters.is_active === "true" ? true : filters.is_active === "false" ? false : undefined,
            signal: controller.signal
        })
            .then(data => {
                const results = Array.isArray(data) ? data : data.results || [];
                setClientsMap(results.map((client: any) => ({
                    id: client.id || 0,
                    code: client.code || "not defined",
                    latitude: client.latitude || 0,
                    longitude: client.longitude || 0,
                    name: client.name || "not defined",
                    client_type: client.client_type || "not defined",
                    address: client.address || "not defined",
                    sector: client.sector || "not defined",
                    market: client.market || "not defined",
                    is_active: client.is_active ?? true,
                })));
            })
            .catch(error => {
                if (error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                console.error("Error fetching clients:", error);
            });

        return () => controller.abort();

    }, [
        filters.client_type,
        filters.municipality,
        filters.state,
        filters.sector,
        filters.market,
        filters.address,
        filters.name,
        filters.code,
        filters.is_active,
        refreshKey
    ])

    return {
        clientsMap,
    }
}

export const useUpdateClients = (client: Client | null, setClient: (client: Client | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [municipality, setMunicipality] = useState("");
    const [state, setState] = useState("");
    const [sector, setSector] = useState("");
    const [market, setMarket] = useState("");
    const [client_type_id, setClient_type_id] = useState<number | string>("");
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [is_active, setIsActive] = useState(true);

    useEffect(() => {
        if (!client) return;

        setCode(client.code);
        setName(client.name);
        setAddress(client.address);
        setNeighborhood(client.neighborhood);
        setMunicipality(client.municipality);
        setState(client.state);
        setSector(client.sector);
        setMarket(client.market);
        setClient_type_id(client.client_type_id);
        setLatitude(client.latitude);
        setLongitude(client.longitude);
        setIsActive(client.is_active);
    }, [client])

    const updateClient = () => {
        updateClientService(client!.id, {
            code,
            name,
            address,
            neighborhood,
            municipality,
            state,
            sector,
            market,
            client_type: String(client_type_id),
            latitude,
            longitude,
            is_active
        })
            .then(() => {
                setClient(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error updating client:", error);
                if (onError) onError(error.message || "Error updating client");
            });
    }

    return {
        code,
        setCode,
        name,
        setName,
        address,
        setAddress,
        neighborhood,
        setNeighborhood,
        municipality,
        setMunicipality,
        state,
        setState,
        sector,
        setSector,
        market,
        setMarket,
        client_type: client_type_id,
        setClient_type: setClient_type_id,
        latitude,
        setLatitude,
        longitude,
        setLongitude,
        is_active,
        setIsActive,
        updateClient
    };
}

export const useDeleteClient = (client: Client | null, setClient: (client: Client | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const deleteClient = () => {
        if (!client) return;

        deleteClientService(client.id)
            .then(() => {
                setClient(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error deleting client:", error);
                if (onError) onError(error.message || "Error deleting client");
            });
    }

    return {
        deleteClient
    };
}

export const useRestoreClient = (clientState: Client | null, setClient: (client: Client | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const restoreClient = (clientToRestore?: Client) => {
        const targetClient = clientToRestore || clientState;
        if (!targetClient) return;

        restoreClientService(targetClient.id)
            .then(() => {
                setClient(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error restoring client:", error);
                if (onError) onError(error.message || "Error restoring client");
            });
    }

    return {
        restoreClient
    };
}

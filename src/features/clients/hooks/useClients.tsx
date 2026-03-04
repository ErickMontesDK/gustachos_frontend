import { SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
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
    latitude: number;
    longitude: number;
    name: string;
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
    page_size: 10,
    sorting: "",
    code: "",
    is_deleted: false,
}

export const useClients = () => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_FILTERS.page_size });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [clients, setClients] = useState<Client[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = () => setRefreshKey(prev => prev + 1);

    const updateFilters = <K extends keyof filters>(key: K, value: filters[K]) => {
        console.log("key", key);
        console.log("value", value);
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
    const sortingString = sorting.map(sort => `${sort.desc ? '-' : ''}${sort.id}`).join(',');

    useEffect(() => {
        const controller = new AbortController();

        getClients({
            client_type: filters.client_type || undefined,
            municipality: filters.municipality || undefined,
            state: filters.state || undefined,
            sector: filters.sector || undefined,
            market: filters.market || undefined,
            address: filters.address || undefined,
            name: filters.name || undefined,
            code: filters.code || undefined,
            page: pagination.pageIndex + 1,
            page_size: pagination.pageSize,
            sorting: sortingString || undefined,
            is_deleted: filters.is_deleted || undefined,
            signal: controller.signal
        })
            .then(data => {

                setClients(data.results.map(clientMapper));
                data.results.map(clientMapper);
                console.log("data in useClients", data);
                setTotalPages(data.total_pages);
            })
            .catch(error => {
                if (error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                console.error("Error fetching clients:", error);
            });

        return () => controller.abort();

    }, [
        sortingString,
        filters.client_type,
        filters.municipality,
        filters.state,
        filters.sector,
        filters.market,
        filters.address,
        filters.name,
        filters.code,
        filters.is_deleted,
        pagination.pageIndex,
        pagination.pageSize,
        refreshKey
    ])

    return {
        clients,
        totalPages,
        pagination,
        setPagination,
        filters,
        updateFilters,
        sorting,
        setSorting,
        refresh
    }
}

export const useClientsMap = (filters: filters) => {
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
            signal: controller.signal
        })
            .then(data => {
                setClientsMap(data.results.map((client) => ({
                    id: client.id || 0,
                    latitude: client.latitude || 0,
                    longitude: client.longitude || 0,
                    name: client.name || ""
                })));
                console.log("data in useClientsMap", data);
            })
            .catch(error => {
                if (error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                console.error("Error fetching clients:", error);
            });

        return () => controller.abort();

    }, [filters])

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
    const [client_type, setClient_type] = useState("");
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
        setClient_type(client.client_type);
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
            client_type,
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
        client_type,
        setClient_type,
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

import Layout from "../../../components/Layout";
import { useEffect, useState } from "react";
import { useClients, useClientsMap, useRestoreClient } from "../hooks/useClients";
import { Client } from "../hooks/useClients";
import Searchbar from "../../../components/common/inputs/Searchbar";
import Select, { Option } from "../../../components/common/inputs/Select";
import TableDisplay from "../../../components/TableDisplay";
import { columns } from "./columns";
import { Download, Settings, Store } from "lucide-react";
import { getClientTypes } from "../../client_types/api/clientTypesService";
import { getClientExcel } from "../api/clientsServices";
import MapDisplay, { MarkerProps } from "../../../components/MapDisplay";

import EditClientModal from "./modals/EditClientModal";
import DeleteClientModal from "./modals/DeleteClientModal";


const activeOptions: Option[] = [
    { id: "true", name: "Active" },
    { id: "false", name: "Inactive" },
];



export default function ClientsData() {
    const [client_types, setClient_types] = useState<Option[] | []>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [markers, setMarkers] = useState<MarkerProps[] | []>([]);
    const role = localStorage.getItem("role") || "";
    const isAdmin = role.toLowerCase() === "admin";


    const {
        clients,
        totalPages,
        pagination, setPagination,
        filters, updateFilters,
        sorting, setSorting,
        refresh,
        refreshKey
    } = useClients();



    const { restoreClient } = useRestoreClient(selectedClient, setSelectedClient, refresh, (msg) => setErrorMessage(msg));


    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const client_type = params.get("client_type");
        const municipality = params.get("municipality");
        const state = params.get("state");
        const sector = params.get("sector");
        const market = params.get("market");
        const address = params.get("address");
        const name = params.get("name");
        const is_deleted = params.get("is_deleted") === "true";
        const is_active = params.get("is_active");

        if (code) updateFilters("code", code);
        if (client_type) updateFilters("client_type", client_type);
        if (municipality) updateFilters("municipality", municipality);
        if (state) updateFilters("state", state);
        if (sector) updateFilters("sector", sector);
        if (market) updateFilters("market", market);
        if (address) updateFilters("address", address);
        if (name) updateFilters("name", name);
        if (is_deleted) updateFilters("is_deleted", is_deleted);
        if (is_active) updateFilters("is_active", is_active);
    }, [updateFilters]);


    useEffect(() => {
        getClientTypes().then((data) => {
            const formattedClientTypes = data.map((client_type) => ({
                id: client_type.id,
                name: client_type.name,
            }));
            setClient_types(formattedClientTypes);
        });
    }, []);

    const { clientsMap } = useClientsMap(filters, refreshKey);

    useEffect(() => {
        setMarkers(clientsMap.map((client) => ({
            lat: client.latitude,
            lng: client.longitude,
            popup: client.name,
            type: client.client_type,
            code: client.code,
            id: client.id,
            address: client.address,
            sector: client.sector,
            market: client.market,
            is_active: client.is_active,
        })));
    }, [clientsMap]);



    const [clientTypeConfig, setClientTypeConfig] = useState<Record<string, { color: string; icon: string }>>(
        JSON.parse(localStorage.getItem("clientTypeConfig") || "{}")
    );


    useEffect(() => {
        localStorage.setItem("clientTypeConfig", JSON.stringify(clientTypeConfig));
    }, [clientTypeConfig]);

    return (
        <Layout>
            <div className="animate-fade-in">
                <h1><Store size={34} className="flex-shrink-0 me-2 text-primary mb-1" />Clients Data</h1>
                <div className="filters-card p-4 mb-4 shadow-sm border rounded bg-white">

                    {errorMessage && (
                        <div className="alert alert-danger py-2 mb-3" role="alert">
                            {errorMessage}
                        </div>
                    )}


                    <h5 className="mb-3 text-secondary">Filters</h5>

                    <div className="row g-3 mb-4">
                        <div className="col-md-4 col-lg-3">
                            <Select
                                name="client_type"
                                id="client_type"
                                value={filters.client_type}
                                onChange={(e) => updateFilters("client_type", e.target.value)}
                                options={client_types}
                                placeholder="All"
                                label="Client Type"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_municipality"
                                id="client_municipality"
                                value={filters.municipality}
                                onChange={(e) => updateFilters("municipality", e.target.value)}
                                placeholder="All municipalities"
                                label="Municipality"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_state"
                                id="client_state"
                                value={filters.state}
                                onChange={(e) => updateFilters("state", e.target.value)}
                                placeholder="All states"
                                label="State"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_sector"
                                id="client_sector"
                                value={filters.sector}
                                onChange={(e) => updateFilters("sector", e.target.value)}
                                placeholder="All sectors"
                                label="Sector"
                            />
                        </div>

                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_market"
                                id="client_market"
                                value={filters.market}
                                onChange={(e) => updateFilters("market", e.target.value)}
                                placeholder="All markets"
                                label="Market"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="address"
                                id="address"
                                value={filters.address}
                                onChange={(e) => updateFilters("address", e.target.value)}
                                placeholder="Search by address..."
                                label="Address"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_name"
                                id="client_name"
                                value={filters.name}
                                onChange={(e) => updateFilters("name", e.target.value)}
                                placeholder="All names"
                                label="Name"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Searchbar
                                name="client_code"
                                id="client_code"
                                value={filters.code}
                                onChange={(e) => updateFilters("code", e.target.value)}
                                placeholder="All codes"
                                label="Code"
                            />
                        </div>

                        <div className="col-md-4 col-lg-3">
                            <Select
                                name="is_active"
                                id="is_active"
                                value={filters.is_active}
                                onChange={(e) => updateFilters("is_active", e.target.value)}
                                options={activeOptions}
                                placeholder="All Status"
                                label="Active Status"
                            />
                        </div>
                        {isAdmin && (
                            <div className="col-md-4 col-lg-3 d-flex align-items-end">
                                <div className="form-check form-switch p-2 border rounded w-100 bg-light d-flex align-items-center" style={{ height: '48px' }}>
                                    <input
                                        className="form-check-input ms-2 me-2"
                                        type="checkbox"
                                        role="switch"
                                        id="show_deleted"
                                        checked={filters.is_deleted}
                                        onChange={(e) => updateFilters("is_deleted", e.target.checked)}
                                    />
                                    <label className="form-check-label mb-0" htmlFor="show_deleted">Show Deleted</label>
                                </div>
                            </div>
                        )}
                        <div className={`col-md-4 col-lg-3 d-flex align-items-end`}>
                            <button
                                className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                                style={{ height: '48px', fontWeight: '500' }}
                                onClick={() => {
                                    setErrorMessage(null);
                                    getClientExcel({
                                        ...filters,
                                        is_active: filters.is_active === "true" ? true : filters.is_active === "false" ? false : undefined,
                                    }).catch((err) => {
                                        setErrorMessage("Error exporting clients: " + (err.message || "Unknown error"));
                                    });
                                }}
                            >
                                <Download size={20} />
                                Export to Excel
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card shadow-sm mb-4 border-0 bg-light animate-fade-in">
                    <div className="card-body">
                        <h5 className="card-title d-flex align-items-center gap-2 mb-3 text-secondary">
                            <Settings size={20} /> Map Configuration by Client Type
                        </h5>
                        <div className="row g-3">
                            {client_types.map((type) => (
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
                                                    defaultValue={clientTypeConfig[type.id]?.color || "#007bff"}
                                                    onBlur={(e) => {
                                                        const target = e.target as HTMLInputElement;
                                                        setClientTypeConfig({ ...clientTypeConfig, [type.id]: { ...clientTypeConfig[type.id], color: target.value } });
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-grow-1">
                                                <label className="small text-muted d-block mb-1">Icon</label>
                                                <select className="form-select form-select-sm"
                                                    defaultValue={clientTypeConfig[type.id]?.icon || "Store"}
                                                    onChange={(e) => setClientTypeConfig({ ...clientTypeConfig, [type.id]: { ...clientTypeConfig[type.id], icon: e.target.value } })}>
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

                <MapDisplay markers={markers} config={clientTypeConfig} />

                <TableDisplay
                    columns={columns}
                    data={clients}
                    pageCount={totalPages}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    editEnabled={true}
                    onEdit={(client) => {
                        setErrorMessage(null);
                        setSelectedClient(client);
                        setShowEditModal(true);
                    }}
                    onDelete={(client) => {
                        setErrorMessage(null);
                        setSelectedClient(client);
                        setShowDeleteModal(true);
                    }}
                    onRestore={(client) => {
                        setErrorMessage(null);
                        setSelectedClient(client);
                        restoreClient(client);
                    }}
                />

            </div>

            <EditClientModal 
                isOpen={showEditModal} 
                onClose={() => setShowEditModal(false)}
                onSuccess={refresh}
                client={selectedClient}
                client_types={client_types}
            />

            <DeleteClientModal 
                isOpen={showDeleteModal} 
                onClose={() => setShowDeleteModal(false)}
                onSuccess={refresh}
                client={selectedClient}
            />
        </Layout >
    );
}
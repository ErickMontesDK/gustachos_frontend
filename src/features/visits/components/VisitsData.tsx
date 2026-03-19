import Layout from "../../../components/Layout";
import TableDisplay from '../../../components/TableDisplay';
import { useEffect, useState } from "react";
import Select from "../../../components/common/inputs/Select";
import Searchbar from "../../../components/common/inputs/Searchbar";
import DatePicker from "../../../components/common/inputs/DatePicker";
import { useDeleteVisit, useUpdateVisitNotes, useVisits, Visit, useRestoreVisit } from "../hooks/useVisits";
import { columns } from "./columns";
import Modal from "../../../components/modal";
import { Trash, Download, Settings, MapPin } from "lucide-react";
import { getClientTypes } from "../../client_types/api/clientTypesService";
import { Option } from "../../../components/common/inputs/Select";
import { getVisitExcel } from "../api/visitsService";
import MapDisplay from "../../../components/MapDisplay";
import { MarkerProps } from "../../../components/MapDisplay";


const productivityOptions: Option[] = [
    { id: "true", name: "Productive" },
    { id: "false", name: "Non-Productive" },
];

const validationOptions: Option[] = [
    { id: "true", name: "Valid" },
    { id: "false", name: "Invalid" },
];


export default function VisitsData() {
    const [client_types, setClient_types] = useState<Option[] | []>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [markers, setMarkers] = useState<MarkerProps[] | []>([]);
    const role = localStorage.getItem("role") || "";
    const isAdmin = role.toLowerCase() === "admin";
    const [clientTypeConfig, setClientTypeConfig] = useState<Record<string, { color: string; icon: string }>>(
        JSON.parse(localStorage.getItem("clientTypeConfig") || "{}")
    );

    const {
        visits,
        totalPages,
        pagination,
        setPagination,
        filters,
        updateFilters,
        sorting,
        setSorting,
        refresh
    } = useVisits();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const client_type = params.get("client_type");
        const municipality = params.get("municipality");
        const state = params.get("state");
        const sector = params.get("sector");
        const search_term = params.get("search_term");
        const date_from = params.get("date_from");
        const date_to = params.get("date_to");
        const is_deleted = params.get("is_deleted") === "true" ? true : false;
        const is_productive = params.get("is_productive");
        const is_valid = params.get("is_valid");
        if (client_type) {
            updateFilters("client_type", client_type);
        }
        if (municipality) {
            updateFilters("municipality", municipality);
        }
        if (state) {
            updateFilters("state", state);
        }
        if (sector) {
            updateFilters("sector", sector);
        }
        if (search_term) {
            updateFilters("search_term", search_term);
        }
        if (date_from) {
            updateFilters("date_from", date_from);
        }
        if (date_to) {
            updateFilters("date_to", date_to);
        }
        if (is_deleted) {
            updateFilters("is_deleted", is_deleted);
        }
        if (is_productive) {
            updateFilters("is_productive", is_productive);
        }
        if (is_valid) {
            updateFilters("is_valid", is_valid);
        }
    }, [updateFilters]);


    useEffect(() => {
        const markers = visits.map((visit) => ({
            lat: visit.client_coordinates[0],
            lng: visit.client_coordinates[1],
            popup: visit.client__name,
            type: (visit as any).client_type_id,
        }));
        setMarkers(markers);
    }, [visits]);




    const {
        notes,
        setNotes,
        is_productive,
        setProductive,
        is_valid,
        setValidated,
        updateVisit
    } = useUpdateVisitNotes(selectedVisit, setSelectedVisit, refresh, (msg) => setErrorMessage(msg));

    const { deleteVisit } = useDeleteVisit(selectedVisit, setSelectedVisit, refresh, (msg) => setErrorMessage(msg));


    const { restoreVisit } = useRestoreVisit(selectedVisit, setSelectedVisit, refresh, (msg) => setErrorMessage(msg));

    const cleaningData = () => {
        setNotes("");
        setProductive(false);
        setValidated(false);
        setSelectedVisit(null);
        setErrorMessage(null);
        setShowEditModal(false);
        setShowDeleteModal(false);
    }

    useEffect(() => {
        getClientTypes().then((data) => {
            const formattedClientTypes = data.map((client_type) => ({
                id: client_type.id,
                name: client_type.name,
            }));
            setClient_types(formattedClientTypes);
        });
    }, []);



    return (
        <Layout>
            <div className="animate-fade-in">
                <h1><MapPin size={34} className="flex-shrink-0 me-2 text-primary mb-1" />Visits Data</h1>
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
                            <Select
                                name="is_productive"
                                id="is_productive"
                                value={filters.is_productive}
                                onChange={(e) => updateFilters("is_productive", e.target.value)}
                                options={productivityOptions}
                                placeholder="All Status"
                                label="Productivity"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <Select
                                name="is_valid"
                                id="is_valid"
                                value={filters.is_valid}
                                onChange={(e) => updateFilters("is_valid", e.target.value)}
                                options={validationOptions}
                                placeholder="All Status"
                                label="Validation"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <DatePicker
                                name="date_from"
                                id="date_from"
                                value={filters.date_from}
                                onChange={(iso) => updateFilters("date_from", iso)}
                                label="Date From"
                                mode="start"
                            />
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <DatePicker
                                name="date_to"
                                id="date_to"
                                value={filters.date_to}
                                onChange={(iso) => updateFilters("date_to", iso)}
                                label="Date To"
                                mode="end"
                            />
                        </div>

                        <div className="col-md-8 col-lg-6">
                            <Searchbar
                                name="search"
                                id="search"
                                value={filters.search_term}
                                onChange={(e) => updateFilters("search_term", e.target.value)}
                                placeholder="Search by name, code, address..."
                                label="Search Term"
                            />
                        </div>
                        {isAdmin && (
                            <div className="col-md-4 col-lg-3 d-flex align-items-end">
                                <div className="form-check form-switch p-2 border rounded w-100 bg-light d-flex align-items-center" style={{ height: '48px' }}>
                                    <input
                                        className="form-check-input ms-2 me-2"
                                        type="checkbox"
                                        role="switch"
                                        id="show_deleted_visits"
                                        checked={filters.is_deleted}
                                        onChange={(e) => updateFilters("is_deleted", e.target.checked)}
                                    />
                                    <label className="form-check-label mb-0" htmlFor="show_deleted_visits">Show Deleted</label>
                                </div>
                            </div>
                        )}
                        <div className={`col-md-4 col-lg-3 d-flex align-items-end`}>
                            <button
                                className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                                style={{ height: '48px', fontWeight: '500' }}
                                onClick={() => {
                                    setErrorMessage(null);
                                    getVisitExcel({
                                        ...filters,
                                        is_productive: filters.is_productive === "true" ? true : filters.is_productive === "false" ? false : undefined,
                                        is_valid: filters.is_valid === "true" ? true : filters.is_valid === "false" ? false : undefined,
                                    }).catch((err) => {
                                        setErrorMessage("Error exporting visits: " + (err.message || "Unknown error"));
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
                                                    value={clientTypeConfig[type.id]?.color || "#007bff"}
                                                    onChange={(e) => {
                                                        const newConfig = { ...clientTypeConfig, [type.id]: { ...clientTypeConfig[type.id], color: e.target.value } };
                                                        setClientTypeConfig(newConfig);
                                                        localStorage.setItem("clientTypeConfig", JSON.stringify(newConfig));
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-grow-1">
                                                <label className="small text-muted d-block mb-1">Icon</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={clientTypeConfig[type.id]?.icon || "Store"}
                                                    onChange={(e) => {
                                                        const newConfig = { ...clientTypeConfig, [type.id]: { ...clientTypeConfig[type.id], icon: e.target.value } };
                                                        setClientTypeConfig(newConfig);
                                                        localStorage.setItem("clientTypeConfig", JSON.stringify(newConfig));
                                                    }}
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

                <MapDisplay markers={markers} config={clientTypeConfig} />

                <TableDisplay
                    columns={columns}
                    data={visits}
                    pageCount={totalPages}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    editEnabled={true}
                    onEdit={(visit) => {
                        setErrorMessage(null);
                        setSelectedVisit(visit);
                        setShowEditModal(true);
                    }}
                    onDelete={(visit) => {
                        setErrorMessage(null);
                        setSelectedVisit(visit);
                        setShowDeleteModal(true);
                    }}
                    onRestore={(visit) => {
                        setErrorMessage(null);
                        setSelectedVisit(visit);
                        restoreVisit(visit);
                    }}
                />
            </div>

            {showEditModal && (
                <Modal
                    title="Edit Visit"
                    message={`Editing visit for client: ${selectedVisit?.client__name || '...'}`}
                    buttonText1="Save Changes"
                    buttonText2="Cancel"
                    isForm={true}
                    buttonAction1={() => {
                        updateVisit();
                        cleaningData();
                    }}
                    buttonAction2={() => {
                        cleaningData();
                    }}
                >
                    <div className="mb-3">
                        <label htmlFor="notes" className="form-label font-bold">Notes</label>
                        <textarea
                            className="form-control"
                            id="notes"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-6">
                            <div className="form-check form-switch p-3 border rounded">
                                <input
                                    className="form-check-input ms-0 me-2"
                                    type="checkbox"
                                    role="switch"
                                    id="productive"
                                    checked={is_productive}
                                    onChange={(e) => setProductive(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="productive">Productive</label>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="form-check form-switch p-3 border rounded">
                                <input
                                    className="form-check-input ms-0 me-2"
                                    type="checkbox"
                                    role="switch"
                                    id="validated"
                                    checked={is_valid}
                                    onChange={(e) => setValidated(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="validated">Validated</label>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {showDeleteModal && (
                <Modal
                    title="Delete Visit"
                    icon={<Trash size={24} />}
                    message={`Are you sure you want to delete this visit?`}
                    buttonText1="Delete"
                    buttonText2="Cancel"
                    buttonAction1={() => {
                        deleteVisit();
                        cleaningData();
                    }}
                    buttonAction2={() => {
                        cleaningData();
                    }}
                />
            )}
        </Layout>

    );
}

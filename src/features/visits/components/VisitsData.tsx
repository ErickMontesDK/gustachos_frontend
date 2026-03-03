import Layout from "../../../components/Layout";
import TableDisplay from '../../../components/TableDisplay';
import { useEffect, useState } from "react";
import Select from "../../../components/common/inputs/Select";
import Searchbar from "../../../components/common/inputs/Searchbar";
import DatePicker from "../../../components/common/inputs/DatePicker";
import { useDeleteVisit, useUpdateVisitNotes, useVisits, Visit } from "../hooks/useVisits";
import { columns } from "./columns";
import Modal from "../../../components/modal";
import { Trash, Download } from "lucide-react";
import { getClientTypes } from "../../client_types/api/clientTypesService";
import { Option } from "../../../components/common/inputs/Select";
import { getVisitExcel } from "../api/visitsService";
import MapDisplay from "../../../components/MapDisplay";
import { MarkerProps } from "../../../components/MapDisplay";


export default function VisitsData() {
    const [client_types, setClient_types] = useState<Option[] | []>([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [markers, setMarkers] = useState<MarkerProps[] | []>([]);
    const role = localStorage.getItem("role") || "";
    const isAdmin = role.toLowerCase() === "admin";

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
        const markers = visits.map((visit) => ({
            lat: visit.client_coordinates[0],
            lng: visit.client_coordinates[1],
            popup: visit.client__name,
        }));
        setMarkers(markers);
    }, [visits]);



    console.log(markers);

    const {
        notes,
        setNotes,
        is_productive,
        setProductive,
        is_valid,
        setValidated,
        visit: editingVisit,
        updateVisit
    } = useUpdateVisitNotes(selectedVisit, setSelectedVisit, refresh, (msg) => setErrorMessage(msg));

    const { deleteVisit } = useDeleteVisit(selectedVisit, setSelectedVisit, refresh, (msg) => setErrorMessage(msg));


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
            console.log(data);
            const formattedClientTypes = data.map((client_type) => ({
                id: client_type.name,
                name: client_type.name,
            }));
            setClient_types(formattedClientTypes);
        });
    }, []);



    return (
        <Layout>
            <div className="animate-fade-in">
                <h1>Visits Data</h1>
                <div className="filters-card p-4 mb-4 shadow-sm border rounded bg-white">

                    {errorMessage && (
                        <div className="alert alert-danger py-2 mb-3" role="alert">
                            {errorMessage}
                        </div>
                    )}


                    <h5 className="mb-3 text-secondary">Filters</h5>

                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
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
                        <div className="col-md-3">
                            <Searchbar
                                name="client_municipality"
                                id="client_municipality"
                                value={filters.municipality}
                                onChange={(e) => updateFilters("municipality", e.target.value)}
                                placeholder="All municipalities"
                                label="Municipality"
                            />
                        </div>
                        <div className="col-md-3">
                            <Searchbar
                                name="client_state"
                                id="client_state"
                                value={filters.state}
                                onChange={(e) => updateFilters("state", e.target.value)}
                                placeholder="All states"
                                label="State"
                            />
                        </div>
                        <div className="col-md-3">
                            <Searchbar
                                name="client_sector"
                                id="client_sector"
                                value={filters.sector}
                                onChange={(e) => updateFilters("sector", e.target.value)}
                                placeholder="All sectors"
                                label="Sector"
                            />
                        </div>
                    </div>

                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <Searchbar
                                name="search"
                                id="search"
                                value={filters.search_term}
                                onChange={(e) => updateFilters("search_term", e.target.value)}
                                placeholder="Search by name, code, address..."
                                label="Search Term"
                            />
                        </div>
                        <div className="col-md-2">
                            <DatePicker
                                name="date_from"
                                id="date_from"
                                value={filters.date_from}
                                onChange={(iso) => updateFilters("date_from", iso)}
                                label="Date From"
                                mode="start"
                            />
                        </div>
                        <div className="col-md-2">
                            <DatePicker
                                name="date_to"
                                id="date_to"
                                value={filters.date_to}
                                onChange={(iso) => updateFilters("date_to", iso)}
                                label="Date To"
                                mode="end"
                            />
                        </div>
                        {isAdmin && (
                            <div className="col-md-2 d-flex align-items-end">
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
                        <div className={`${isAdmin ? 'col-md-2' : 'col-md-4'}`}>
                            <button
                                className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                                style={{ height: '48px', fontWeight: '500' }}
                                onClick={() => {
                                    setErrorMessage(null);
                                    getVisitExcel(filters).catch((err) => {
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

                <MapDisplay markers={markers} />

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
                        console.log("raw data", visit)
                        setSelectedVisit(visit);
                        setShowEditModal(true);
                    }}
                    onDelete={(visit) => {
                        setErrorMessage(null);
                        console.log("raw data", visit)
                        setSelectedVisit(visit);
                        setShowDeleteModal(true);
                    }}
                />
            </div>

            {showEditModal && (
                <Modal
                    title="Edit Visit"
                    message={`Editing visit for client: ${editingVisit?.client__name || '...'}`}
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

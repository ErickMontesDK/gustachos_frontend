import Layout from "../../../components/Layout";
import TableDisplay from '../../../components/TableDisplay';
import { useEffect, useState } from "react";
import { api } from "../../../api/axiosInstance";
import Select from "../../../components/common/inputs/Select";
import Searchbar from "../../../components/common/inputs/Searchbar";
import DatePicker from "../../../components/common/inputs/DatePicker";
import { useDeleteVisit, useUpdateVisitNotes, useVisits, Visit } from "../hooks/useVisits";
import { columns } from "./columns";
import Modal from "../../../components/modal";
import { Trash } from "lucide-react";



export default function VisitsData() {
    const role = localStorage.getItem("role") || "deliverer";
    const name = localStorage.getItem("name") || "User";

    const [client_types, setClient_types] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        api.get("client-types/")
            .then((response) => {
                setClient_types(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);



    return (
        <Layout role={role} name={name}>
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
                        <div className="col-md-6">
                            <Searchbar
                                name="search"
                                id="search"
                                value={filters.search_term}
                                onChange={(e) => updateFilters("search_term", e.target.value)}
                                placeholder="Search by name, code, address..."
                                label="Search Term"
                            />
                        </div>
                        <div className="col-md-3">
                            <DatePicker
                                name="date_from"
                                id="date_from"
                                value={filters.date_from}
                                onChange={(iso) => updateFilters("date_from", iso)}
                                label="Date From"
                                mode="start"
                            />
                        </div>
                        <div className="col-md-3">
                            <DatePicker
                                name="date_to"
                                id="date_to"
                                value={filters.date_to}
                                onChange={(iso) => updateFilters("date_to", iso)}
                                label="Date To"
                                mode="end"
                            />
                        </div>
                    </div>
                </div>

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

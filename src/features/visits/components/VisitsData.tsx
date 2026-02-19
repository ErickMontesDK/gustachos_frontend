import Layout from "../../../components/Layout";
import { ColumnDef } from '@tanstack/react-table';
import TableDisplay from '../../../components/TableDisplay';
import { useEffect, useState } from "react";
import { api } from "../../../api/axiosInstance";
import Select from "../../../components/common/inputs/Select";
import Searchbar from "../../../components/common/inputs/Searchbar";
import DatePicker from "../../../components/common/inputs/DatePicker";
import { useVisits } from "../hooks/useVisits";
import { Visit } from "../hooks/useVisits";
import { columns } from "./columns";


export default function VisitsData() {
    const role = localStorage.getItem("role") || "deliverer";
    const name = localStorage.getItem("name") || "User";

    const [client_types, setClient_types] = useState([]);
    const {
        visits,
        totalPages,
        pagination,
        setPagination,
        filters,
        updateFilters,
        sorting,
        setSorting
    } = useVisits();


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
                />
            </div>
        </Layout>
    );
}

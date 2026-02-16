import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from '@tanstack/react-table';
import TableDisplay from './TableDisplay';
import { useEffect, useState } from "react";
import { getVisits } from "../api/visitsService";
import { api } from "../api/axiosInstance";
import Select from "./common/inputs/Select";
import Searchbar from "./common/inputs/Searchbar";
import DatePicker from "./common/inputs/DatePicker";
import { hour12, TIMEZONE } from "../config";

export default function VisitsData() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role") || "deliverer";
    const name = localStorage.getItem("name") || "User";

    const [client_types, setClient_types] = useState([]);
    const [visits, setVisits] = useState<Visit[]>([]);

    const [selectedClientType, setSelectedClientType] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDateFrom, setSelectedDateFrom] = useState("");
    const [selectedDateTo, setSelectedDateTo] = useState("");
    const [selectedClientMunicipality, setSelectedClientMunicipality] = useState("");
    const [selectedClientState, setSelectedClientState] = useState("");
    const [selectedClientSector, setSelectedClientSector] = useState("");

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

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const { count, next, previous, results } = await getVisits(
                    selectedClientType,
                    selectedClientMunicipality,
                    selectedClientState,
                    selectedClientSector,
                    searchTerm,
                    selectedDateFrom || undefined,
                    selectedDateTo || undefined
                );
                console.log(results);

                const visitsData = results.map((visit: any) => {
                    const datetime = visit.visited_at;
                    const dateObj = new Date(datetime);

                    const formattedDate = dateObj.toLocaleDateString('en-US', {
                        timeZone: TIMEZONE,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });
                    const formattedTime = dateObj.toLocaleTimeString('en-US', {
                        timeZone: TIMEZONE,
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: hour12,
                    });
                    return {

                        id: visit.id,
                        Client_name: visit.client_details.name || "Unknown",
                        client_code: visit.client_details.code || "Unknown",
                        client_type: visit.client_details.client_type || "Unknown",
                        client_id: visit.client_details.id || "Unknown",
                        deliverer_name: visit.deliverer_details.full_name || "Unknown",
                        deliverer_id: visit.deliverer_details.id || "Unknown",
                        is_productive: visit.is_productive ? "✅" : "❌",
                        is_validated: visit.is_valid ? "✔️" : "⚠️",
                        notes: visit.notes || "",
                        date: formattedDate,
                        time: formattedTime,
                        address: visit.client_details.full_address || "Unknown",
                        // rowClassName: visit.is_valid ? "" : "row-danger",
                        cellClassName: {
                            is_productive: "boolean " + (visit.is_productive ? "cell-green" : "cell-red"),
                            is_validated: "boolean " + (visit.is_valid ? "cell-green" : "cell-red"),
                        }

                    }
                });


                setVisits(visitsData);
            } catch (error) {
                console.error("Error fetching visits:", error);
            }
        };
        fetchVisits();
    }, [selectedClientType,
        selectedClientMunicipality,
        selectedClientState,
        selectedClientSector,
        searchTerm,
        selectedDateFrom,
        selectedDateTo]);


    interface Visit {
        id: number;
        Client_name: string;
        client_code: string;
        client_type: string;
        client_id: number;
        deliverer_name: string;
        deliverer_id: number;
        is_productive: string;
        is_validated: string;
        notes: string;
        date: string;
        time: string;
        address: string;
        cellClassName: {
            is_productive: string;
            is_validated: string;
        }
    }

    const columns: ColumnDef<Visit>[] = [
        { header: 'ID', accessorKey: 'id', size: 50 },
        { header: 'Client', accessorKey: 'Client_name', size: 200 },
        { header: 'Code', accessorKey: 'client_code', size: 100 },
        { header: 'Type', accessorKey: 'client_type', size: 120 },
        { header: 'Deliverer', accessorKey: 'deliverer_name', size: 150 },
        { header: 'Date', accessorKey: 'date', size: 122 },
        { header: 'Time', accessorKey: 'time', size: 108 },
        { header: 'Address', accessorKey: 'address', size: 300 },
        { header: 'Prod.', accessorKey: 'is_productive', size: 80 },
        { header: 'Valid.', accessorKey: 'is_validated', size: 80 },
        { header: 'Notes', accessorKey: 'notes', size: 300, enableGlobalFilter: false },
    ];




    return (
        <Layout role={role} name={name}>
            <div className="animate-fade-in">
                <h1>Visits Data</h1>
                <div className="filters-card p-4 mb-4 shadow-sm border rounded bg-white">
                    <h5 className="mb-3 text-secondary">Filters</h5>

                    {/* Primary Filters: Client & Location */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <Select
                                name="client_type"
                                id="client_type"
                                value={selectedClientType}
                                onChange={(e) => setSelectedClientType(e.target.value)}
                                options={client_types}
                                placeholder="All"
                                label="Client Type"
                            />
                        </div>
                        <div className="col-md-3">
                            <Searchbar
                                name="client_municipality"
                                id="client_municipality"
                                value={selectedClientMunicipality}
                                onChange={(e) => setSelectedClientMunicipality(e.target.value)}
                                placeholder="All municipalities"
                                label="Municipality"
                            />
                        </div>
                        <div className="col-md-3">
                            <Searchbar
                                name="client_state"
                                id="client_state"
                                value={selectedClientState}
                                onChange={(e) => setSelectedClientState(e.target.value)}
                                placeholder="All states"
                                label="State"
                            />
                        </div>
                        <div className="col-md-3">
                            <Searchbar
                                name="client_sector"
                                id="client_sector"
                                value={selectedClientSector}
                                onChange={(e) => setSelectedClientSector(e.target.value)}
                                placeholder="All sectors"
                                label="Sector"
                            />
                        </div>
                    </div>

                    {/* Secondary Filters: Search & Date Range */}
                    <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <Searchbar
                                name="search"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, code, address..."
                                label="Search Term"
                            />
                        </div>
                        <div className="col-md-3">
                            <DatePicker
                                name="date_from"
                                id="date_from"
                                value={selectedDateFrom}
                                onChange={(iso) => setSelectedDateFrom(iso)}
                                label="Date From"
                                mode="start"
                            />
                        </div>
                        <div className="col-md-3">
                            <DatePicker
                                name="date_to"
                                id="date_to"
                                value={selectedDateTo}
                                onChange={(iso) => setSelectedDateTo(iso)}
                                label="Date To"
                                mode="end"
                            />
                        </div>
                    </div>
                </div>

                <TableDisplay columns={columns} data={visits} />
            </div>
        </Layout>
    );
}
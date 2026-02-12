import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from '@tanstack/react-table';
import TableDisplay from './TableDisplay';
import { useEffect, useState } from "react";
import { getVisits } from "../api/visitsService";

export default function VisitsData() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role") || "deliverer";
    const name = localStorage.getItem("name") || "User";

    const [visits, setVisits] = useState<Visit[]>([]);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const response = await getVisits();
                console.log(response);

                const visitsData = response.map((visit: any) => {
                    const datetime = visit.visited_at;
                    const dateObj = new Date(datetime);

                    const formattedDate = dateObj.toLocaleDateString('en-US', {
                        timeZone: 'America/Mexico_City',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });
                    const formattedTime = dateObj.toLocaleTimeString('en-US', {
                        timeZone: 'America/Mexico_City',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
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
    }, []);


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
        { header: 'ID', accessorKey: 'id' },
        { header: 'Client', accessorKey: 'Client_name' },
        { header: 'Client Code', accessorKey: 'client_code' },
        { header: 'Client Type', accessorKey: 'client_type' },
        { header: 'Deliverer', accessorKey: 'deliverer_name' },
        { header: 'Date', accessorKey: 'date' },
        { header: 'Time', accessorKey: 'time' },
        { header: 'Address', accessorKey: 'address' },
        { header: 'Is Productive', accessorKey: 'is_productive' },
        { header: 'Is Validated', accessorKey: 'is_validated' },
        { header: 'Notes', accessorKey: 'notes' },
    ];




    return (
        <Layout role={role} name={name}>
            <div className="animate-fade-in">
                <h1>Visits Data</h1>
                <TableDisplay columns={columns} data={visits} />
            </div>
        </Layout>
    );
}
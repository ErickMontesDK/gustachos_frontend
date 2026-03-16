import { SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { deleteVisit as deleteVisitService, getVisits, updateVisit as updateVisitService, restoreVisit as restoreVisitService } from "../api/visitsService";
import { visitMapper } from "../utils/visitMapper";

export interface Visit {
    id: number;
    client__name: string;
    client__code: string;
    client__sector: string;
    client__client_type__name: string;
    client_type_id: number;
    client_id: number;
    deliverer__last_name: string;
    deliverer_id: number;
    is_productive_label: string;
    is_validated_label: string;
    is_productive: boolean;
    is_validated: boolean;
    notes: string;
    visited_at: string;
    time: string;
    address: string;
    cellClassName: {
        is_productive: string;
        is_validated: string;
    };
    client_coordinates: [number, number];
    visit_coordinates: [number, number];
    isDeleted: boolean;
}

interface filters {
    client_type: string;
    municipality: string;
    state: string;
    sector: string;
    search_term: string;
    date_from: string;
    date_to: string;
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
    search_term: "",
    date_from: "",
    date_to: "",
    page: 1,
    page_size: 10,
    sorting: "",
    is_deleted: false,
}
const business = localStorage.getItem("business_data");
const timezone = business ? JSON.parse(business).time_zone : "America/Mexico_City";
const locale = business ? JSON.parse(business).locale : "es-ES";

export const useVisits = () => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_FILTERS.page_size });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);


    const refresh = () => setRefreshKey(prev => prev + 1);

    const updateFilters = <K extends keyof filters>(key: K, value: filters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
    const sortingString = sorting.map(sort => `${sort.desc ? '-' : ''}${sort.id}`).join(',');

    useEffect(() => {
        const controller = new AbortController();

        getVisits({
            client_type: filters.client_type || undefined,
            municipality: filters.municipality || undefined,
            state: filters.state || undefined,
            sector: filters.sector || undefined,
            search_term: filters.search_term || undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
            page: pagination.pageIndex + 1,
            page_size: pagination.pageSize,
            sorting: sortingString || undefined,
            is_deleted: filters.is_deleted || undefined,
            signal: controller.signal
        })
            .then(data => {
                setVisits(data.results.map((visit: any) => visitMapper(visit, timezone, locale)));
                setTotalPages(data.total_pages);
            })
            .catch(error => {
                if (error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                console.error("Error fetching visits:", error);
            });

        return () => controller.abort();

    }, [
        sortingString,
        filters.client_type,
        filters.municipality,
        filters.state,
        filters.sector,
        filters.search_term,
        filters.date_from,
        filters.date_to,
        filters.is_deleted,
        pagination.pageIndex,
        pagination.pageSize,
        refreshKey
    ])

    return {
        visits,
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



export const useUpdateVisitNotes = (visit: Visit | null, setVisit: (visit: Visit | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const [notes, setNotes] = useState("");
    const [is_productive, setProductive] = useState(false);
    const [is_valid, setValidated] = useState(false);

    useEffect(() => {
        if (!visit) return;

        setNotes(visit.notes || "");
        setProductive(visit.is_productive || false);
        setValidated(visit.is_validated || false);

    }, [visit])

    const updateVisit = () => {
        updateVisitService(visit!.id, {
            notes,
            is_productive,
            is_valid
        })
            .then(() => {
                setNotes("");
                setProductive(false);
                setValidated(false);
                setVisit(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error updating visit:", error);
                if (onError) onError(error.message || "Error updating visit");
            });
    }


    return {
        visit,
        notes,
        setNotes,
        is_productive,
        setProductive,
        is_valid,
        setValidated,
        updateVisit
    };
}

export const useDeleteVisit = (visit: Visit | null, setVisit: (visit: Visit | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const deleteVisit = () => {
        if (!visit) return;

        deleteVisitService(visit.id)
            .then(() => {
                setVisit(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error deleting visit:", error);
                if (onError) onError(error.message || "Error deleting visit");
            });
    }


    return {
        deleteVisit
    };
}

export const useRestoreVisit = (visitState: Visit | null, setVisit: (visit: Visit | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const restoreVisit = (visitToRestore?: Visit) => {
        const targetVisit = visitToRestore || visitState;
        if (!targetVisit) return;

        restoreVisitService(targetVisit.id)
            .then(() => {
                setVisit(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error restoring visit:", error);
                if (onError) onError(error.message || "Error restoring visit");
            });
    }

    return {
        restoreVisit
    };
}

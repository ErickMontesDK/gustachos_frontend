import { SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { getVisits } from "../api/visitsService";
import { visitMapper } from "../utils/visitMapper";

export interface Visit {
    id: number;
    client__name: string;
    client__code: string;
    client__sector: string;
    client__client_type__name: string;
    client_id: number;
    deliverer__last_name: string;
    deliverer_id: number;
    is_productive: string;
    is_validated: string;
    notes: string;
    visited_at: string;
    time: string;
    address: string;
    cellClassName: {
        is_productive: string;
        is_validated: string;
    };
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
}

export const useVisits = () => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: DEFAULT_FILTERS.page_size });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [visits, setVisits] = useState<Visit[]>([]);

    const updateFilters = <K extends keyof filters>(key: K, value: filters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
    useEffect(() => {
        const sortingString = sorting.map(sort => `${sort.desc ? '-' : ''}${sort.id}`).join(',');

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
            sorting: sortingString || undefined
        })
            .then(data => {
                setVisits(data.results.map(visitMapper));
                setTotalPages(data.total_pages);
            })
            .catch(error => {
                console.error("Error fetching visits:", error);
            });

    }, [sorting, filters, pagination.pageIndex, pagination.pageSize])

    return {
        visits,
        totalPages,
        pagination,
        setPagination,
        filters,
        updateFilters,
        sorting,
        setSorting
    }
}

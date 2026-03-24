import { useState, useEffect, useCallback } from 'react';
import { SortingState } from '@tanstack/react-table';

interface FetchParams {
    page: number;
    page_size: number;
    sorting?: string;
    signal: AbortSignal;
    [key: string]: any;
}

interface UsePaginatedDataProps<TData, TFilters> {
    defaultFilters: TFilters;
    fetchData: (params: FetchParams) => Promise<{ results: any[]; total_pages: number }>;
    mapData: (item: any) => TData;
    formatFilters?: (filters: TFilters) => Record<string, any>;
}

export function usePaginatedData<TData, TFilters>({
    defaultFilters,
    fetchData,
    mapData,
    formatFilters
}: UsePaginatedDataProps<TData, TFilters>) {
    const [pagination, setPagination] = useState({ 
        pageIndex: 0, 
        pageSize: (defaultFilters as any).page_size || 15 
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState<TFilters>(defaultFilters);
    const [dataList, setDataList] = useState<TData[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(() => setRefreshKey(prev => prev + 1), []);

    const updateFilters = useCallback(<K extends keyof TFilters>(key: K, value: TFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, []);

    const sortingString = sorting.map(sort => `${sort.desc ? '-' : ''}${sort.id}`).join(',');

    useEffect(() => {
        const controller = new AbortController();

        const processedFilters = formatFilters ? formatFilters(filters) : filters;

        fetchData({
            ...processedFilters,
            page: pagination.pageIndex + 1,
            page_size: pagination.pageSize,
            sorting: sortingString || undefined,
            signal: controller.signal
        })
            .then(data => {
                setDataList(data.results.map(mapData));
                setTotalPages(data.total_pages);
            })
            .catch(error => {
                if (error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                console.error("Error fetching data:", error);
            });

        return () => controller.abort();

    }, [
        sortingString,
        pagination.pageIndex,
        pagination.pageSize,
        refreshKey,
        JSON.stringify(filters) 
    ]);

    return {
        data: dataList,
        totalPages,
        pagination,
        setPagination,
        filters,
        updateFilters,
        sorting,
        setSorting,
        refresh,
        refreshKey
    };
}

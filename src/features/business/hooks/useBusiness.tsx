import { useState, useEffect } from "react";
import { getBusinessInfo, updateBusinessInfo } from "../api/businessServices";
import { businessMapper } from "../utils/businessMapper";

export interface Business {
    business_name: string;
    time_zone: string;
    locale: string;
    distance_unit: string;
    max_valid_distance: number;
    min_time_between_visits: number;
    updated_at: string;
    logo_url: string;
}

export const useBusiness = () => {
    const [business, setBusiness] = useState<Business>({
        business_name: "",
        time_zone: "",
        locale: "",
        distance_unit: "",
        max_valid_distance: 0,
        min_time_between_visits: 0,
        updated_at: "",
        logo_url: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshBusiness = () => {
        setLoading(true);
        getBusinessInfo()
            .then(data => {
                setBusiness(businessMapper(data));
                setError(null);
            })
            .catch(err => {
                setError(err.message || "Error fetching business info");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        refreshBusiness();
    }, []);

    return {
        business,
        setBusiness,
        loading,
        error,
        refresh: refreshBusiness
    };
};

export const useUpdateBusiness = (onSuccess?: () => void, onError?: (msg: string) => void) => {
    const [business, setBusiness] = useState<Business>({
        business_name: "",
        time_zone: "",
        locale: "",
        distance_unit: "",
        max_valid_distance: 0,
        min_time_between_visits: 0,
        updated_at: "",
        logo_url: ""
    });

    const [isUpdating, setIsUpdating] = useState(false);

    const updateBusiness = () => {
        setIsUpdating(true);
        updateBusinessInfo(business)
            .then(() => {
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error updating business config:", error);
                if (onError) onError(error.message || "Error updating business config");
            })
            .finally(() => {
                setIsUpdating(false);
            });
    };

    return {
        business,
        setBusiness,
        updateBusiness,
        isUpdating
    };
};
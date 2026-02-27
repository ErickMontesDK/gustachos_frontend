export const businessMapper = (business: any) => {
    return {
        id: business.id,
        business_name: business.business_name,
        time_zone: business.time_zone,
        locale: business.locale,
        distance_unit: business.distance_unit,
        max_valid_distance: business.max_valid_distance,
        min_time_between_visits: business.min_time_between_visits,
        updated_at: business.updated_at,
        logo_url: business.logo_url
    };
};
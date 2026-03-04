import { TIMEZONE, hour12, locale } from "../../../config";

export const visitMapper = (visit: any) => {
    const datetime = visit.visited_at;
    const dateObj = new Date(datetime);

    const formattedDate = dateObj.toLocaleDateString(locale, {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const formattedTime = dateObj.toLocaleTimeString(locale, {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: hour12,
    });
    const client_details = visit.client_details || {};
    const deliverer_details = visit.deliverer_details || {};

    return {
        id: visit.id,
        client__name: client_details.name ?? "Unknown",
        client__code: client_details.code ?? "Unknown",
        client__sector: client_details.sector ?? "Unknown",
        client__client_type__name: client_details.client_type_name ?? "Unknown",
        client_id: client_details.id ?? "Unknown",
        deliverer__last_name: deliverer_details.full_name ?? "Unknown",
        deliverer_id: deliverer_details.id ?? "Unknown",
        is_productive_label: visit.is_productive ? "✅" : "❌",
        is_validated_label: visit.is_valid ? "✅" : "❌",
        is_productive: visit.is_productive,
        is_validated: visit.is_valid,
        notes: visit.notes ?? "",
        visited_at: formattedDate,
        time: formattedTime,
        address: client_details.full_address ?? "Unknown",
        isDeleted: visit.is_deleted ?? false,
        cellClassName: {
            is_productive: "boolean " + (visit.is_productive ? "cell-green" : "cell-red"),
            is_validated: "boolean " + (visit.is_valid ? "cell-green" : "cell-red"),
        },
        client_coordinates: [client_details.latitude, client_details.longitude] as [number, number],
        visit_coordinates: [visit.latitude_recorded, visit.longitude_recorded] as [number, number],
        client_type_id: client_details.client_type
    }
}

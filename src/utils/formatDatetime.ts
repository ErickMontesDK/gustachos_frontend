const TIMEZONE = "America/Mexico_City";
const LOCALE = "es-ES";
const HOUR12 = true;

export function formatDatetime(datetime: string, timezone: string = TIMEZONE, locale: string = LOCALE) {
    const dateObj = new Date(datetime);
    const formattedDate = dateObj.toLocaleDateString(locale, {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const formattedTime = dateObj.toLocaleTimeString(locale, {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: HOUR12,
    });

    return ({ formattedDate, formattedTime });
}
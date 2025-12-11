import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';

export const TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Formats a date string or Date object to the specific timezone (Buenos Aires).
 * @param date - The date to format (string or Date)
 * @param formatStr - The format string (e.g., 'dd/MM/yyyy HH:mm')
 * @returns The formatted date string
 */
export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy HH:mm'): string => {
    if (!date) return '-';
    let d: Date;
    if (typeof date === 'string') {
        // Fix: If ISO string is missing 'Z' (and no offset), append it to force UTC interpretation.
        // This solves the issue where backend returns "2025-12-10T02:59:10.913" (UTC) but browser treats it as Local.
        let dateStr = date;
        if (dateStr.includes('T') && !dateStr.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(dateStr)) {
            dateStr += 'Z';
        }
        d = new Date(dateStr);
    } else {
        d = date;
    }

    if (isNaN(d.getTime())) return 'Invalid date';
    try {
        return formatInTimeZone(d, TIMEZONE, formatStr, { locale: es });
    } catch (err) {
        console.error('Error formateando fecha:', err);
        return 'N/A';
    }
};

export const parseBuenosAiresToISO = (dateString: string): string => {
    if (!dateString) return '';
    // dateString assumed to be "yyyy-MM-ddTHH:mm" in BA time
    try {
        const zonedDate = toZonedTime(dateString, TIMEZONE);
        return zonedDate.toISOString();
    } catch (err) {
        console.error('Error parseando fecha BA:', err);
        return '';
    }
};

/**
 * Get current time in Buenos Aires
 */
export const now = (): Date => {
    // This creates a Date object that effectively represents the current instant.
    // However, JS Dates are always UTC internally.
    // To get the "time string" in BA:
    return new Date();
}

export const formatISOToBuenosAiresInput = (isoString: string): string => {
    if (!isoString) return '';
    try {
        const d = new Date(isoString);
        return formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd'T'HH:mm", { locale: es });
    } catch (err) {
        console.error('Error formateando ISO a BA:', err);
        return '';
    }
};

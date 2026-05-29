const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function normalizeDateOnly(value?: string | Date | null): string | null {
    if (!value) return null;

    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) return null;

    const match = trimmedValue.match(DATE_ONLY_PATTERN);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }

    const parsedValue = new Date(trimmedValue);
    if (Number.isNaN(parsedValue.getTime())) {
        return null;
    }

    return parsedValue.toISOString().slice(0, 10);
}

export function toDateOnlyInputValue(value?: string | Date | null): string {
    return normalizeDateOnly(value) ?? "";
}

export function toDateOnlyApiValue(value?: string | Date | null): string | undefined {
    const normalizedValue = normalizeDateOnly(value);
    return normalizedValue ? `${normalizedValue}T12:00:00.000Z` : undefined;
}

export function toDateOnlyRangeStart(value?: string | Date | null): string | undefined {
    const normalizedValue = normalizeDateOnly(value);
    return normalizedValue ? `${normalizedValue}T00:00:00.000Z` : undefined;
}

export function toDateOnlyRangeEnd(value?: string | Date | null): string | undefined {
    const normalizedValue = normalizeDateOnly(value);
    return normalizedValue ? `${normalizedValue}T23:59:59.999Z` : undefined;
}

export function formatDateOnly(value?: string | Date | null, locale: string = "es-PE"): string {
    const normalizedValue = normalizeDateOnly(value);
    if (!normalizedValue) return "-";

    const [year, month, day] = normalizedValue.split("-").map(Number);

    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)));
}

export const toLocaleDateString = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return formatDateOnly(dateString, "es-PE");
}
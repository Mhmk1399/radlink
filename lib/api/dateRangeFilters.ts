type DateRangeCondition = {
    $gte?: Date;
    $lt?: Date;
};

function parseDateParam(value: string | null) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function addOneUtcDay(date: Date) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
}

export function getDateRangeCondition(
    searchParams: URLSearchParams,
    field: string,
): DateRangeCondition | null {
    const from = parseDateParam(searchParams.get(`dateFrom_${field}`));
    const to = parseDateParam(searchParams.get(`dateTo_${field}`));
    const condition: DateRangeCondition = {};

    if (from) condition.$gte = from;
    if (to) condition.$lt = addOneUtcDay(to);

    return Object.keys(condition).length ? condition : null;
}

export function applyDateRangeFilters(
    query: Record<string, unknown>,
    searchParams: URLSearchParams,
    allowedFields: string[],
) {
    for (const field of allowedFields) {
        const condition = getDateRangeCondition(searchParams, field);
        if (condition) query[field] = condition;
    }
}

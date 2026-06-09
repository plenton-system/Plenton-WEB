import type { ApplyFilterProps } from "./types";

// ----------------------------------------------------------------------

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
    return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

// ----------------------------------------------------------------------

export function getComparator<T>(
    order: 'asc' | 'desc',
    orderBy: keyof T
): (a: T, b: T) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------

export function applyFilter<T>({
    inputData,
    comparator,
    filterValue,
    filterBy,
}: ApplyFilterProps<T>) {
    const stabilizedThis = inputData.map((el, index) => [el, index] as const);

    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    let filtered = stabilizedThis.map((el) => el[0]);

    if (filterValue && filterBy) {
        filtered = filtered.filter(item => filterBy(item, filterValue));
    }

    return filtered;
}
import type { TableRowProps } from '@mui/material/TableRow';

// ----------------------------------------------------------------------

export interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    withHeader?: boolean;
    rowHeight?: number;
};

// ----------------------------------------------------------------------

export interface TableToolbarHandlers {
    filterValue?: string;
    onFilterValue?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    toolbarPlaceholder?: string;
    onDeleteSelected?: () => void;
}

// ----------------------------------------------------------------------

// Props genéricas da tabela
export interface TableProps<T extends { id: string | number }> {
    data: T[];
    total: number;
    loading: boolean;
    maxHeight?: number | string;
    table: {
        order: 'asc' | 'desc';
        orderBy: string;
        selected: Array<string | number>;
        initialized?: boolean;
        page: number;
        rowsPerPage: number;
        onSort: (id: string) => void;
        onSelectAllRows: (checked: boolean, ids: (string | number)[]) => void;
        onSelectRow: (id: string | number) => void;
        onChangePage: (event: unknown, newPage: number) => void;
        onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
    };
    filterValue: string;
    setFilterValue: (value: string) => void;
    headLabel: HeadLabelItem[];
    renderRow: (row: T, selected: boolean, onSelectRow: () => void) => React.ReactNode;
    onDeleteSelected?: () => void;
    renderToolbar?: React.ReactNode;
    emptyRowsComponent?: React.ReactNode;
    notFoundComponent?: React.ReactNode;
}

// ----------------------------------------------------------------------

export interface HeadLabelItem {
    id: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    width?: number | string;
    minWidth?: number | string;
    sortable?: boolean;
};

// ----------------------------------------------------------------------

export interface TableHeadProps {
    order: 'asc' | 'desc';
    orderBy: string;
    onSort: (id: string) => void;

    // substitui rowCount/numSelected por dados que importam de verdade
    visibleIds: string[];    // ids renderizados nesta página/visão
    selected: string[];      // seleção global (sempre string!)

    onSelectAllRows: (checked: boolean, ids: string[]) => void;
    headLabel: Array<HeadLabelItem>;
    selectable?: boolean;
}

// ----------------------------------------------------------------------

export interface TableToolbarProps {
    numSelected: number;
    filterValue: string;
    onFilterValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    onDeleteSelected?: () => void;
}

// ----------------------------------------------------------------------

export type TableNoDataProps = TableRowProps & {
    searchQuery: string;
};

// ----------------------------------------------------------------------

export type TableEmptyRowsProps = TableRowProps & {
    emptyRows: number;
    height?: number;
    colSpan?: number;
};

// ----------------------------------------------------------------------

export type ApplyFilterProps<T> = {
    inputData: T[];
    filterValue: string;
    comparator: (a: T, b: T) => number;
    filterBy?: (item: T, filterValue: string) => boolean;
};

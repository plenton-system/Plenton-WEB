
// ----------------------------------------------------------------------

/**
 * Propriedades de eventos do Calendário.
 */
export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end?: string;
    color?: string;
    extendedProps?: CalendarEventExtended;
}

// ----------------------------------------------------------------------

/**
 * Propriedades adicionais dos eventos do Calendário.
 */
export interface CalendarEventExtended {
    description?: string;
    categoryColor?: string;
    responsibleName?: string;
    responsibleAvatar?: string;
}

// ----------------------------------------------------------------------

/**
 * Propriedades do Calendário.
 */
export interface CalendarProps {
    events: CalendarEvent[];
    onAddEvent?: (date: string) => void;
    onEditEvent?: (id: string) => void;
    onMonthChange?: (start: Date, end: Date) => void;
    onDragDropEvent?: (id: string, start: Date, end?: Date) => void;
    loading?: boolean;
    color?: string;
}

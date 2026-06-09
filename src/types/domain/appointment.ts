
// ----------------------------------------------------------------------

/**
 * Propriedades dos eventos do calendário.
 */
export interface AppointmentEventsProps {
    id: string;
    title: string;
    start: string;
    end?: string;
    color?: string;
    description?: string;
    responsible?: string;
}

// ----------------------------------------------------------------------

/**
 * Propriedades detalhadas da Consulta (usadas em formulário, edição/criação)
 */
export interface AppointmentDetailProps {
    id?: string;
    patientId?: string;
    patientName?: string;
    nutritionistId?: string;
    nutritionistName?: string;
    color?: string;
    observation?: string;
    status?: number;
    tenantId?: string;
    start: string;
    isDragDrop?: boolean;
}


import type { Patient } from "src/enums";

import type { PagedRequest } from "..";

// ----------------------------------------------------------------------

/**
 * Propriedades de filtros.
 */
export type PatientListQuery = PatientFilters & PagedRequest;

// ----------------------------------------------------------------------

/**
 * Propriedades de filtros.
 */
export type PatientFilters = {
    value: string;
    orderByField: string;
    order: 'asc' | 'desc';
};

export type DietPlanDto = {
    id?: string;
    title: string;
    objective?: string;
    calories?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    status: Patient.DietStatus;
};

// Valores do form (extendendo seus tipos atuais)
export type PatientFormValues = PatientDetailProps & {
    dietPlans: DietPlanDto[];
    notes?: string | null;
};

// ----------------------------------------------------------------------

/**
 * Propriedades da Lista de pacientes
 */
export interface PatientListProps {
    id: string;
    name: string;
    status?: Patient.Status | string | null;
    birthDate?: string | null;
    profilePhoto?: string | File;
};

// ----------------------------------------------------------------------

/**
 * Criação e Edição de um paciente
 */
export interface PatientDetailProps extends PatientListProps {
    phone: string;
    email: string;
    document: string;
    gender?: Patient.Gender | string | null;
    addressDto?: {
        street: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
}

// ----------------------------------------------------------------------

/**
 * Retorno de um paciente após uma edição
 */
export interface PatientViewProps {

    /**
     * Identificador do paciente
     * @example "00000000-0000-0000-0000-000000000000"
     */
    id: string;

    /**
     * Nome do paciente
     * @example "Maria da Silva"
     */
    name: string;

    /**
     * Telefone do paciente
     * @example "(11) 99999-9999"
     */
    phone: string;

    /**
     * Email do paciente
     * @example "maria.silva@plenton.com.br"
     */
    email: string;

    /**
     * Documento do paciente
     * @example "123.456.789-00"
     */
    document: string;

    /**
     * Status do paciente
     * @example "Active"
     */
    status?: Patient.Status | string | null;

    /**
     * Data de nascimento do paciente
     * @example "2004-01-01"
     */
    birthDate?: string | null;

    /**
     * Gênero do paciente
     * @example "Male"
     */
    gender?: Patient.Gender | string | null;

    /**
     * Foto de perfil do paciente
     * @example "Base64 string ou URL da imagem"
     */
    profilePhoto: string;

    /**
     * Rua do paciente
     * @example "Rua dos Bobos"
     */
    street: string;

    /**
     * Cidade do paciente
     * @example "São Paulo"
     */
    city: string;

    /**
     * Estado do paciente
     * @example "SP"
     */
    state: string;

    /**
     * CEP do paciente
     * @example "00000-000"
     */
    zipCode: string;

    /**
     * Bairro do paciente
     * @example "Centro"
     */
    neighborhood: string;

}



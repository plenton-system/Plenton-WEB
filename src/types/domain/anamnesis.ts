import type { QuestionType } from "src/enums/anamnesis";

import type { PagedRequest } from "..";

// ----------------------------------------------------------------------

/**
 * Propriedades necessárias no formulário base.
 */
export type Basics = {
    title: string;
    description?: string | null;
};

// ----------------------------------------------------------------------

/**
 * Propriedades de filtros.
 */
export type AnamnesisListQuery = AnamnesisFilters & PagedRequest;

// ----------------------------------------------------------------------

/**
 * Propriedades de filtros.
 */
export type AnamnesisFilters = {
    value: string;
    orderByField: string;
    order: 'asc' | 'desc';
};

// ----------------------------------------------------------------------

/**
 * Propriedades da Lista de Anamnese
 */
export interface AnamnesisListProps {
    id: string;
    title: string;
    description?: string;
};

// ----------------------------------------------------------------------

/**
 * DTO (Data Transfer Object) para representar uma questão de anamnese
 */
export type AnamnesisQuestionDto = {
    id?: string | null;
    type: QuestionType;
    label: string;
    required: boolean;
    order?: number | null;
    helpText?: string | null;
    min?: number | null;
    max?: number | null;
    options?: string[] | null;
};

// ----------------------------------------------------------------------

/**
 * DTO para criação de um novo formulário de anamnese
 */
export type AnamnesisCreateDto = {
    title: string;
    description?: string | null;
    questions: AnamnesisQuestionDto[];
};

// ----------------------------------------------------------------------

/**
 * Representação completa de uma anamnese para visualização
 */
export type AnamnesisFormViewProps = {
    id: string;
    title: string;
    description?: string | null;
    nutritionistId: string;
    tenantId: string;
    questions: Array<{
        id: string;
        type: QuestionType;
        label: string;
        required: boolean;
        order: number;
        helpText?: string | null;
        min?: number | null;
        max?: number | null;
        options?: string[] | null;
    }>;
};

// ----------------------------------------------------------------------

/**
 * Request para gerar link público de uma anamnese.
 * POST /api/anamnesis/{anamnesisId}/send-public
 */
export type AnamnesisSendPublicLinkRequestDto = {
    /** Nome do paciente (apenas referência, opcional) */
    patientName?: string | null;
    /** Telefone do paciente (apenas referência, opcional) */
    patientPhone?: string | null;
    /** E-mail do paciente (apenas referência, opcional) */
    patientEmail?: string | null;
    /** Id do paciente da plataforma (associa a AnamnesisResponse ao paciente) */
    patientId?: string | null;
    /** Data/hora UTC em que o link deve expirar (opcional) */
    expiresAtUtc?: string | null;
    /** Idioma do paciente; quando omitido, usa o idioma ativo do nutricionista */
    language?: string | null;
};

/**
 * Resposta do endpoint de geração de link público.
 */
export type AnamnesisSendPublicLinkResponseDto = {
    /** ID da resposta criada (instância da anamnese para o preenchimento) */
    responseId: string;
    /** Token público em texto puro (mostrado apenas uma vez) */
    token: string;
    /** URL completa para enviar ao paciente */
    url: string;
    /** Data/hora UTC de expiração */
    expiresAtUtc?: string | null;
};

/**
 * Request para gerar link público e enviar por e-mail ao paciente.
 * POST /api/anamnesis/{anamnesisId}/send-public-email
 */
export type AnamnesisSendPublicEmailRequestDto = {
    /** E-mail do paciente (obrigatório) */
    email: string;
    /** Nome do paciente (usado no corpo do e-mail; opcional) */
    patientName?: string | null;
    /** Telefone do paciente (apenas referência; não é enviado no e-mail) */
    patientPhone?: string | null;
    /** Id do paciente da plataforma (associa a AnamnesisResponse ao paciente) */
    patientId?: string | null;
    /** Data/hora UTC de expiração (opcional) */
    expiresAtUtc?: string | null;
    /** Idioma do paciente; quando omitido, usa o idioma ativo do nutricionista */
    language?: string | null;
};

/**
 * Resposta do endpoint de envio por e-mail.
 */
export type AnamnesisSendPublicEmailResponseDto = {
    responseId: string;
    url: string;
    emailSent: boolean;
    expiresAtUtc?: string | null;
};

// ----------------------------------------------------------------------
// Listagem de anamneses do paciente (Workspace > aba Anamnese)
// ----------------------------------------------------------------------

export type PatientAnamnesisStatus = 'Sent' | 'Submitted' | 'Expired';

/**
 * Item da listagem de anamneses enviadas a um paciente.
 * Corresponde ao PatientAnamnesisItemView do backend.
 */
export type PatientAnamnesisItem = {
    /** Id da AnamnesisResponse */
    id: string;
    /** Id do template da anamnese */
    anamnesisId: string;
    /** Título do questionário */
    title: string;
    /** Status do envio */
    status: PatientAnamnesisStatus;
    createdAtUtc: string;
    submittedAtUtc?: string | null;
    expiresAtUtc?: string | null;
};

/**
 * Pergunta com a resposta preenchida (visão do nutricionista).
 */
export type AnamnesisResponseQuestion = {
    id: string;
    type: QuestionType;
    label: string;
    helpText?: string | null;
    order: number;
    required: boolean;
    options: string[];
    /** JSON normalizado do valor (string, number, bool ou string[]). Null se não respondeu. */
    answerJson?: string | null;
};

/**
 * Detalhe completo de uma AnamnesisResponse para visualização pelo nutricionista.
 * Corresponde ao AnamnesisResponseDetailView do backend.
 */
export type AnamnesisResponseDetail = {
    id: string;
    anamnesisId: string;
    title: string;
    description?: string | null;
    createdAtUtc: string;
    submittedAtUtc?: string | null;
    consentAcceptedAtUtc?: string | null;
    consentVersion?: string | null;
    consentIp?: string | null;
    questions: AnamnesisResponseQuestion[];
};

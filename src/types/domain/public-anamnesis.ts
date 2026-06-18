import type { QuestionType } from "src/enums/anamnesis";

// ----------------------------------------------------------------------
// DTOs de Anamnese Pública
// ----------------------------------------------------------------------

/**
 * Resposta completa de uma anamnese pública aberta.
 * Corresponde ao PublicAnamnesisOpenResponseDto do backend.
 */
export type PublicOpenResponse = {
    /** ID único da resposta */
    responseId: string;
    /** ID do template da anamnese */
    anamnesisId: string;
    /** Título da anamnese */
    title: string;
    /** Descrição opcional da anamnese */
    description?: string | null;
    /** Status da resposta: "Sent", "Submitted", etc. */
    status: string;
    /** Data de expiração em UTC (opcional) */
    expiresAtUtc?: string | null;
    /** Data de submissão em UTC (opcional) */
    submittedAtUtc?: string | null;
    /** Idioma definido quando o link foi criado */
    language: string;
    /** Versão atual do termo LGPD que o paciente deve aceitar */
    consentTermVersion: string;
    /** Texto completo do termo LGPD a ser exibido */
    consentTermText: string;
    /** Quando o paciente aceitou o termo. Null = ainda não aceitou */
    consentAcceptedAtUtc?: string | null;
    /** Versão do termo aceita pelo paciente */
    consentVersionAccepted?: string | null;
    /** Lista de perguntas da anamnese */
    questions: PublicAnamnesisQuestionDto[];
    /** Lista de respostas fornecidas */
    answers: PublicAnamnesisAnswerDto[];
};

// ----------------------------------------------------------------------
// DTOs de Perguntas
// ----------------------------------------------------------------------

/**
 * Pergunta individual da anamnese.
 * Corresponde ao PublicAnamnesisQuestionDto do backend.
 */
export type PublicAnamnesisQuestionDto = {
    /** ID único da pergunta */
    id: string;
    /** Tipo da pergunta (Text, Number, Date, Boolean, Select, MultiSelect) */
    type: QuestionType;
    /** Texto/rótulo da pergunta */
    label: string;
    /** Indica se a pergunta é obrigatória */
    required: boolean;
    /** Texto de ajuda opcional */
    helpText?: string | null;
    /** Ordem de exibição da pergunta */
    order: number;
    /** Valor mínimo (para perguntas do tipo Number) */
    min?: number | null;
    /** Valor máximo (para perguntas do tipo Number) */
    max?: number | null;
    /** Opções disponíveis (para perguntas dos tipos Select/MultiSelect) */
    options: PublicAnamnesisOptionDto[];
};

/**
 * Opção de pergunta para os tipos Select/MultiSelect.
 * Corresponde ao PublicAnamnesisOptionDto do backend.
 */
export type PublicAnamnesisOptionDto = {
    /** ID único da opção */
    id: string;
    /** Texto exibido da opção */
    text: string;
    /** Ordem de exibição da opção */
    order: number;
};

// ----------------------------------------------------------------------
// DTOs de Respostas
// ----------------------------------------------------------------------

/**
 * Resposta fornecida para uma pergunta.
 * Corresponde ao PublicAnamnesisAnswerDto do backend.
 */
export type PublicAnamnesisAnswerDto = {
    /** ID da pergunta respondida */
    questionId: string;
    /** Tipo da pergunta (deve corresponder ao tipo da pergunta) */
    type: QuestionType;
    /**
     * Valor normalizado em JSON. Para Select/MultiSelect usa-se o **texto**
     * da opção (o backend valida por `AnamnesisOption.Text`, não por Id):
     * - Number: 42
     * - Boolean: true
     * - Text: "texto"
     * - Select: "Texto da opção"
     * - MultiSelect: ["Texto opção 1", "Texto opção 2"]
     */
    valueJson: string;
};

// ----------------------------------------------------------------------
// DTOs de Requests (Public)
// ----------------------------------------------------------------------

/**
 * DTO para upsert de uma única resposta.
 * Usado nos requests de save draft e submit.
 */
export type PublicAnamnesisAnswerUpsertDto = {
    /** ID da pergunta sendo respondida */
    questionId: string;
    /**
     * Valor da resposta em formato JSON string (Select/MultiSelect = texto da opção):
     * - Para Text: "valor"
     * - Para Number: "42"
     * - Para Boolean: "true"
     * - Para Select: "\"Texto da opção\""
     * - Para MultiSelect: "[\"Texto opção 1\",\"Texto opção 2\"]"
     */
    valueJson: string; // string JSON (JSON.stringify(valor))
};

/**
 * Request para salvar rascunho de uma anamnese pública.
 * PUT /api/public/{tenantId}/anamnesis/{token}/answers
 */
export type PublicAnamnesisSaveDraftRequestDto = {
    /** Lista de respostas para salvar no rascunho */
    answers: PublicAnamnesisAnswerUpsertDto[];
};

/**
 * Request para submeter uma anamnese pública.
 * POST /api/public/{tenantId}/anamnesis/{token}/submit
 */
export type PublicAnamnesisSubmitRequestDto = {
    /** Lista de respostas para submeter */
    answers: PublicAnamnesisAnswerUpsertDto[];
};

// ----------------------------------------------------------------------
// DTOs de Responses (Public)
// ----------------------------------------------------------------------

/**
 * Resposta do endpoint de salvar rascunho.
 */
export type PublicAnamnesisSaveDraftResponseDto = {
    /** ID da resposta que foi salva */
    responseId: string;
    /** Indicador de sucesso da operação */
    saved: boolean;
    /** Data/hora do salvamento em UTC (formato ISO) */
    savedAtUtc: string; // ISO
};

/**
 * Resposta do endpoint de submeter anamnese.
 */
export type PublicAnamnesisSubmitResponseDto = {
    /** ID da resposta que foi submetida */
    responseId: string;
    /** Indicador de sucesso da submissão */
    submitted: boolean;
    /** Data/hora da submissão em UTC (formato ISO) */
    submittedAtUtc: string; // ISO
};

// ----------------------------------------------------------------------
// DTOs de Consentimento (LGPD)
// ----------------------------------------------------------------------

/**
 * Request para registrar o aceite do termo LGPD.
 * POST /api/public/{tenantId}/anamnesis/{token}/consent
 */
export type PublicAnamnesisAcceptConsentRequestDto = {
    /** Versão do termo que está sendo aceita (deve bater com a versão atual) */
    version: string;
};

/**
 * Resposta do endpoint de aceite do termo LGPD.
 */
export type PublicAnamnesisAcceptConsentResponseDto = {
    /** ID da resposta cujo consentimento foi registrado */
    responseId: string;
    /** Data/hora do aceite em UTC (formato ISO) */
    acceptedAtUtc: string;
    /** Versão do termo aceita */
    version: string;
};

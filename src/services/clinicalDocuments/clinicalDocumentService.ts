import type {
  ClinicalDocument,
  ClinicalDocumentType,
  ClinicalDocumentListQuery,
  ClinicalDocumentListResponse,
  SavePatientClinicalDocumentRequest,
} from 'src/types';

import { get, put, post } from 'src/utils/http-client';

type ApiEnvelope<T> = T | { data?: T };

const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = 50;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const unwrapResponse = <T>(response: ApiEnvelope<T>): T => {
  if (isRecord(response) && 'data' in response && response.data !== undefined) {
    return response.data as T;
  }

  return response as T;
};

const toText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true';

  return false;
};

const normalizeClinicalDocumentType = (value: unknown): ClinicalDocumentType => {
  if (value === 'ExamRequest' || value === 'Medication' || value === 'Compounded') return value;
  if (value === 0 || value === '0') return 'ExamRequest';
  if (value === 1 || value === '1') return 'Medication';
  if (value === 2 || value === '2') return 'Compounded';

  return 'ExamRequest';
};

const normalizeDocument = (value: unknown): ClinicalDocument => {
  const document = isRecord(value) ? value : {};

  return {
    id: toText(document.id) ?? '',
    title: toText(document.title) ?? '',
    content: toText(document.content) ?? '',
    type: normalizeClinicalDocumentType(document.type),
    isTemplate: toBoolean(document.isTemplate),
    patientId: toText(document.patientId) ?? null,
    patientName: toText(document.patientName) ?? null,
    canceledAt: toText(document.canceledAt ?? document.cancelledAt) ?? null,
    createdAt: toText(document.createdAt) ?? null,
    updatedAt: toText(document.updatedAt) ?? null,
  };
};

const normalizeListResponse = (response: unknown): ClinicalDocumentListResponse => {
  const page = unwrapResponse(response as ApiEnvelope<unknown>);

  if (Array.isArray(page)) {
    const items = page.map(normalizeDocument);

    return {
      currentPage: DEFAULT_PAGE_INDEX,
      totalPages: 1,
      totalCount: items.length,
      pageSize: items.length,
      items,
    };
  }

  const record = isRecord(page) ? page : {};
  const rawItems = Array.isArray(record.items) ? record.items : [];
  const items = rawItems.map(normalizeDocument);

  return {
    currentPage: typeof record.currentPage === 'number' ? record.currentPage : DEFAULT_PAGE_INDEX,
    totalPages: typeof record.totalPages === 'number' ? record.totalPages : 1,
    totalCount: typeof record.totalCount === 'number' ? record.totalCount : items.length,
    pageSize: typeof record.pageSize === 'number' ? record.pageSize : items.length,
    items,
  };
};

const buildListParams = (query: ClinicalDocumentListQuery) => {
  const params: Record<string, string | number | boolean | string[]> = {
    PatientId: query.patientId,
    IsTemplate: false,
    PageIndex: query.pageIndex ?? DEFAULT_PAGE_INDEX,
    PageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
  };

  const search = query.search?.trim();
  if (search) {
    params.Search = search;
    params.Value = search;
  }

  if (query.type) {
    params.Type = query.type;
  } else if (query.types?.length === 1) {
    params.Type = query.types[0];
  } else if (query.types?.length) {
    params.Types = query.types;
  }

  return params;
};

const toPatientPayload = (
  payload: Omit<SavePatientClinicalDocumentRequest, 'isTemplate'>
): SavePatientClinicalDocumentRequest => ({
  ...payload,
  isTemplate: false,
});

export const clinicalDocumentService = {
  list: async (query: ClinicalDocumentListQuery): Promise<ClinicalDocumentListResponse> => {
    const response = await get<ApiEnvelope<ClinicalDocumentListResponse | ClinicalDocument[]>>(
      '/api/ClinicalDocuments',
      { params: buildListParams(query) }
    );

    return normalizeListResponse(response);
  },

  getById: async (id: string): Promise<ClinicalDocument> => {
    const response = await get<ApiEnvelope<ClinicalDocument>>(`/api/ClinicalDocuments/${id}`);
    return normalizeDocument(unwrapResponse(response));
  },

  createPatientDocument: async (
    payload: Omit<SavePatientClinicalDocumentRequest, 'isTemplate'>
  ): Promise<ClinicalDocument> => {
    const response = await post<ApiEnvelope<ClinicalDocument>>(
      '/api/ClinicalDocuments',
      toPatientPayload(payload)
    );

    return normalizeDocument(unwrapResponse(response));
  },

  updatePatientDocument: async (
    id: string,
    payload: Omit<SavePatientClinicalDocumentRequest, 'isTemplate'>
  ): Promise<ClinicalDocument> => {
    const response = await put<ApiEnvelope<ClinicalDocument>>(
      `/api/ClinicalDocuments/${id}`,
      toPatientPayload(payload)
    );

    return normalizeDocument(unwrapResponse(response));
  },
};

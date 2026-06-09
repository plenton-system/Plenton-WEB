import type {
  WorkspaceStatus,
  WorkspaceListItem,
  WorkspaceListQuery,
  WorkspaceListApiItem,
  WorkspaceSectionItem,
  WorkspaceSectionKind,
  WorkspaceListResponse,
  WorkspaceListApiResponse,
} from 'src/types';

import { get } from 'src/utils/http-client';
import { fDateTimePtBr } from 'src/utils/format-time';

// Mock data for workspace sections

const MOCK_DATA: Record<WorkspaceSectionKind, WorkspaceSectionItem[]> = {
  anthropometry: [
    { id: 'a1', primary: 'Peso: 72 kg', secondary: 'Atualizado há 2 dias' },
    { id: 'a2', primary: 'Altura: 1,70 m', secondary: 'Atualizado há 2 dias' },
  ],
  anamnesis: [
    { id: 'an1', primary: 'Questionário inicial', secondary: 'Preenchido' },
    { id: 'an2', primary: 'Histórico alimentar', secondary: 'Pendente' },
  ],
  evolution: [
    { id: 'e1', primary: 'Retorno 01', secondary: 'Agendado para 15/02' },
    { id: 'e2', primary: 'Retorno 02', secondary: 'Agendar' },
  ],
  documents: [
    { id: 'd1', primary: 'Plano enviado (PDF)', secondary: '01/02' },
    { id: 'd2', primary: 'WhatsApp', secondary: 'Enviado ontem' },
  ],
};

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_ORDER_BY_FIELD = 'patientId';

const toNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const normalizeStatus = (status: number | string | null | undefined): WorkspaceStatus | null => {
  if (status == null) return null;

  if (typeof status === 'number') {
    if (status === 0) return 'ACTIVE';
    if (status === 1) return 'INACTIVE';
    if (status === 2) return 'SUSPENDED';
    return null;
  }

  const normalized = status.trim().toUpperCase();
  if (normalized === 'ACTIVE') return 'ACTIVE';
  if (normalized === 'INACTIVE') return 'INACTIVE';
  if (normalized === 'SUSPENDED') return 'SUSPENDED';

  const numericValue = Number(normalized);
  if (!Number.isNaN(numericValue)) {
    return normalizeStatus(numericValue);
  }

  return null;
};

const normalizeOrderByField = (field?: WorkspaceListQuery['orderByField']) =>
  field ?? DEFAULT_ORDER_BY_FIELD;

const formatDateTime = (value?: string | null) => {
  if (!value) return undefined;

  return fDateTimePtBr(value) || value;
};

const mapApiItem = (item: WorkspaceListApiItem): WorkspaceListItem => ({
  id: String(item?.patientId ?? ''),
  patientId: String(item?.patientId ?? ''),
  patientName: item?.patientName ?? '',
  nextAppointment: formatDateTime(item?.nextAppointment),
  lastAnthropometry: formatDateTime(item?.lastAnthropometry),
  lastAnamnesis: formatDateTime(item?.lastAnamnesis ?? item?.lastAnamnese),
  lastSend: formatDateTime(item?.lastSend),
  planStatus: normalizeStatus(item?.planStatus),
  anthropometryStatus: normalizeStatus(item?.anthropometryStatus),
  anamnesisStatus: normalizeStatus(item?.anamnesisStatus),
});

export const workspaceService = {
  getList: async (query: WorkspaceListQuery): Promise<WorkspaceListResponse> => {
    const qs = {
      Value: query.value ?? '',
      PageIndex: query.pageIndex ?? 0,
      PageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
      OrderByField: normalizeOrderByField(query.orderByField),
      Order: (query.order ?? 'asc').toLowerCase(),
    };

    const response = await get<WorkspaceListApiResponse | { data: WorkspaceListApiResponse }>(
      '/api/Workspace/patients',
      { params: qs }
    );

    const page = (
      Array.isArray((response as WorkspaceListApiResponse)?.items)
        ? response
        : (response as { data?: WorkspaceListApiResponse })?.data
    ) as WorkspaceListApiResponse | undefined;

    const rawItems = Array.isArray(page?.items) ? page.items : [];
    const items = rawItems.map(mapApiItem);

    const pageIndex = toNumber(page?.currentPage, query.pageIndex ?? 0);
    const pageSize = Math.max(1, toNumber(page?.pageSize, query.pageSize ?? DEFAULT_PAGE_SIZE));
    const totalCount = Math.max(0, toNumber(page?.totalCount, items.length));
    const totalPages = Math.max(
      1,
      toNumber(page?.totalPages, Math.ceil(totalCount / pageSize))
    );

    return {
      currentPage: pageIndex,
      totalPages,
      totalCount,
      items,
      pageSize,
    };
  },

  getSectionItems: async (
    kind: WorkspaceSectionKind,
    _patientId?: string
  ): Promise<WorkspaceSectionItem[]> => {
    // Simula latência
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_DATA[kind] ?? [];
  },
};

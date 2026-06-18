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

import i18n from 'src/i18n';

// Mock data for workspace sections

const getMockData = (): Record<WorkspaceSectionKind, WorkspaceSectionItem[]> => ({
  anthropometry: [
    { id: 'a1', primary: i18n.t('workspace.mock.weight'), secondary: i18n.t('workspace.mock.updated') },
    { id: 'a2', primary: i18n.t('workspace.mock.height'), secondary: i18n.t('workspace.mock.updated') },
  ],
  anamnesis: [
    { id: 'an1', primary: i18n.t('workspace.mock.initialQuestionnaire'), secondary: i18n.t('workspace.mock.completed') },
    { id: 'an2', primary: i18n.t('workspace.mock.foodHistory'), secondary: i18n.t('workspace.mock.pending') },
  ],
  evolution: [
    { id: 'e1', primary: i18n.t('workspace.mock.followUpOne'), secondary: i18n.t('workspace.mock.scheduled') },
    { id: 'e2', primary: i18n.t('workspace.mock.followUpTwo'), secondary: i18n.t('workspace.mock.schedule') },
  ],
  documents: [
    { id: 'd1', primary: i18n.t('workspace.documents.planSent'), secondary: '01/02' },
    { id: 'd2', primary: 'WhatsApp', secondary: i18n.t('workspace.documents.sentYesterday') },
  ],
});

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
    return getMockData()[kind] ?? [];
  },
};

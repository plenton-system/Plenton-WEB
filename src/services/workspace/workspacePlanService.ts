import type {
  WorkspaceStatus,
  WorkspacePlanItem,
  WorkspacePlanQuery,
  MealPlanListApiItem,
  WorkspacePlanResponse,
  WorkspaceMealPlanDayOfWeek,
} from 'src/types';

import { authStorage } from 'src/utils/auth-storage';

import { mealPlanService } from 'src/services/mealPlan/mealPlanService';

const DEFAULT_DAY_OF_WEEK: WorkspaceMealPlanDayOfWeek = -1;
const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 10;

const toNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const toOptionalNumber = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const parseListSummary = (value: string | null | undefined) => {
  if (!value) return { mealsCount: undefined, itemsCount: undefined };

  const mealRegex = /(\d+)\s*refei[cç][a-z]*\s*-\s*(\d+)\s*(?:item|itens)/i;
  const matches = value.match(mealRegex);
  if (!matches) return { mealsCount: undefined, itemsCount: undefined };

  return {
    mealsCount: Number(matches[1]),
    itemsCount: Number(matches[2]),
  };
};

const toText = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
};

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

const hasPlanData = (item: MealPlanListApiItem | null | undefined): item is MealPlanListApiItem => {
  if (!item) return false;

  const hasIdentifier = Boolean(toText(item.id, item.mealPlanId));
  const hasName = Boolean(toText(item.name));
  const hasMetadata = [
    item.status,
    item.updatedAt,
    item.lastUpdate,
    item.days,
    item.daysDescription,
    item.mealsCount,
    item.itemsCount,
    item.listSummary,
    item.lastUpdatedAt,
    item.deliveryAt,
    item.lastDelivery,
  ].some((value) => value != null && String(value).trim() !== '');

  return hasIdentifier || hasName || hasMetadata;
};

const mapApiItem = (item: MealPlanListApiItem, index: number): WorkspacePlanItem => {
  const parsedSummary = parseListSummary(item.listSummary);

  return {
    id: toText(item.id, item.mealPlanId) ?? `meal-plan-${index}`,
    name: toText(item.name) ?? '',
    status: normalizeStatus(item.status),
    updatedAt: toText(item.updatedAt, item.lastUpdate, item.lastUpdatedAt),
    days: toText(item.days, item.daysDescription),
    mealsCount: toOptionalNumber(item.mealsCount) ?? parsedSummary.mealsCount,
    itemsCount: toOptionalNumber(item.itemsCount) ?? parsedSummary.itemsCount,
    lastDelivery: toText(item.lastDelivery, item.deliveryAt),
  };
};

export const workspacePlanService = {
  getAll: async (query?: WorkspacePlanQuery): Promise<WorkspacePlanResponse> => {
    if (!query?.patientId) {
      return {
        currentPage: 0,
        totalPages: 0,
        totalCount: 0,
        pageSize: 0,
        items: [],
      };
    }

    const payload = {
      patientId: query.patientId,
      nutritionistId: query.nutritionistId ?? authStorage.getUser()?.profile?.id ?? '',
      status: query.status,
      dayOfWeek: query.dayOfWeek ?? DEFAULT_DAY_OF_WEEK,
      onlyToday: query.onlyToday ?? false,
      pageIndex: query.pageIndex ?? DEFAULT_PAGE_INDEX,
      pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
    };

    const page = await mealPlanService.getByPatient(payload);

    const rawItems = Array.isArray(page?.items) ? page.items.filter(hasPlanData) : [];
    const items = rawItems.map(mapApiItem);

    const pageSize = Math.max(1, toNumber(page?.pageSize, items.length || 1));
    const totalCount = Math.max(0, toNumber(page?.totalCount, items.length));
    const totalPages = Math.max(1, toNumber(page?.totalPages, Math.ceil(totalCount / pageSize)));
    const currentPage = Math.max(0, toNumber(page?.currentPage, 0));

    return {
      currentPage,
      totalPages,
      totalCount,
      pageSize,
      items,
    };
  },
};

import type { WorkspacePlanItem } from 'src/types';
import type { MealPlanListItemVM, MealPlanDrawerModel } from 'src/sections/mealPlan/types/meal-plan-list';

import { fDateTimePtBr } from 'src/utils/format-time';

const formatDateTime = (value?: string) => {
  if (!value) return undefined;

  return fDateTimePtBr(value) || value;
};

const toTimestamp = (value?: string) => {
  if (!value) return undefined;

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
};

export const toMealPlanListItemVM = (item: WorkspacePlanItem): MealPlanListItemVM => ({
  id: item.id,
  name: item.name,
  status: item.status,
  updatedAt: formatDateTime(item.updatedAt),
  updatedAtSortValue: toTimestamp(item.updatedAt),
  days: item.days,
  mealsCount: item.mealsCount,
  itemsCount: item.itemsCount,
  lastDelivery: formatDateTime(item.lastDelivery),
  lastDeliverySortValue: toTimestamp(item.lastDelivery),
});

export const toMealPlanDrawerModel = (item: WorkspacePlanItem): MealPlanDrawerModel => ({
  id: item.id,
  name: item.name,
  status: item.status,
  updatedAt: formatDateTime(item.updatedAt),
  days: item.days,
  mealsCount: item.mealsCount,
  itemsCount: item.itemsCount,
  lastDelivery: formatDateTime(item.lastDelivery),
});

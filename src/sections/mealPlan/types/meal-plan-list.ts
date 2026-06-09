import type { MealPlanDetailResponse } from 'src/types';

export type MealPlanUiStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | null;

export type MealPlanSortKey =
  | 'name'
  | 'status'
  | 'days'
  | 'resume'
  | 'updatedAt'
  | 'lastDelivery';

export type MealPlanSortState = {
  orderBy: MealPlanSortKey;
  order: 'asc' | 'desc';
};

export type MealPlanListItemVM = {
  id: string;
  name: string;
  status: MealPlanUiStatus;
  updatedAt?: string;
  updatedAtSortValue?: number;
  days?: string;
  mealsCount?: number;
  itemsCount?: number;
  lastDelivery?: string;
  lastDeliverySortValue?: number;
};

export type MealPlanDrawerModel = {
  id: string;
  name: string;
  status: MealPlanUiStatus;
  initial?: Partial<MealPlanDetailResponse>;
  updatedAt?: string;
  days?: string;
  mealsCount?: number;
  itemsCount?: number;
  lastDelivery?: string;
};

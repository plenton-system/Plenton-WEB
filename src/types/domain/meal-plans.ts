
import type { PagedResult } from '../api';

// ----------------------------------------------------------------------

export enum MealPlanStatus {
    ACTIVE = 0,
    INACTIVE = 1,
    SUSPENDED = 2,
}

// ----------------------------------------------------------------------

export type Id = string;

// ----------------------------------------------------------------------

export type FoodDto = { id: Id; description: string };

// ----------------------------------------------------------------------

export type HomemadeMeasureDto = {
    id: Id;
    foodId: Id;
    name: string;
    quantityInGrams: number;
    isGlobal: boolean;
};

// ----------------------------------------------------------------------

export type MealItemsDto = {
    id?: Id;
    foodDto: FoodDto;
    quantity: number | null;
    quantityInGrams: number | null;
    homemadeMeasureDto?: HomemadeMeasureDto | null;
    notes: string;
    order: number | null;
    isOptional: boolean;
    portionLabel: string;
    isEquivalentes: boolean;
    parentMealItemId?: Id | null;
    equivalents?: MealItemsDto[] | null;
};

// ----------------------------------------------------------------------

export type MealDto = {
    id?: Id;
    name: string;
    description: string;
    time: string; // "HH:mm"
    isSubstitute: boolean;
    idPrincipalMeal?: Id | null;
    items: MealItemsDto[];
    substitute: MealDto[];
};

// ----------------------------------------------------------------------

export type MealPlanDto = {
    name: string;
    status: MealPlanStatus;
    daysOfWeek: number[]; // 0..6
    nutritionistId: Id;
    patientId: Id;
    meals: MealDto[];
    targets?: MealPlanTargetsDto | null;
};

// ----------------------------------------------------------------------

export type StatusOption = { value: number; label: string };

// ----------------------------------------------------------------------

export type MealPlanTargetsDto = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
};

export type MealPlanMacrosSummaryDto = {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
};

export type MealPlanMicrosSummaryDto = {
    vitaminA: number;
    vitaminC: number;
    vitaminD: number;
    calcium: number;
    iron: number;
    zinc: number;
    potassium: number;
    sodium: number;
};

export type MealPlanSummaryDto = {
    macros: MealPlanMacrosSummaryDto;
    micros: MealPlanMicrosSummaryDto;
};

export type MealPlanDayOfWeek = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type MealPlanPagedFilterRequest = {
    patientId: string;
    nutritionistId?: string | null;
    status?: number | null;
    dayOfWeek?: MealPlanDayOfWeek;
    onlyToday?: boolean;
    pageIndex?: number;
    pageSize?: number;
};

export type MealPlanListApiItem = {
    id?: string | null;
    mealPlanId?: string | null;
    name?: string | null;
    status?: number | string | null;
    patientId?: string | null;
    nutritionistId?: string | null;
    daysOfWeek?: number[] | null;
    meals?: MealDto[] | null;
    summary?: string | null;
    listSummary?: string | null;
    updatedAt?: string | null;
    lastUpdate?: string | null;
    lastUpdatedAt?: string | null;
    days?: string | null;
    daysDescription?: string | null;
    mealsCount?: number | null;
    itemsCount?: number | null;
    lastDelivery?: string | null;
    deliveryAt?: string | null;
};

export type MealPlanListByPatientResponse = PagedResult<MealPlanListApiItem>;

export type MealPlanCreateRequest = MealPlanDto;
export type MealPlanEditRequest = MealPlanDto & { id: string };
export type MealPlanDetailResponse = MealPlanDto & {
    id: string;
    summary?: MealPlanSummaryDto | null;
};

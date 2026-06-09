import type { MealDto, MealPlanDto, MealItemsDto } from '../../types';

// ----------------------------------------------------------------------

export function normalizePayload(values: MealPlanDto): MealPlanDto {
    const copy: MealPlanDto = JSON.parse(JSON.stringify(values));

    copy.meals = (copy.meals || []).map((meal: MealDto) => normalizeMeal(meal, false));

    return copy;
}

// ----------------------------------------------------------------------

function normalizeMeal(meal: MealDto, isSubstitute: boolean, principalId?: string | null): MealDto {
    const normalized: MealDto = {
        ...meal,
        isSubstitute,
        idPrincipalMeal: isSubstitute ? principalId ?? null : null,
        items: (meal.items || []).map((item, index) => normalizeItem(item, index)),
    };

    normalized.substitute = isSubstitute
        ? []
        : (meal.substitute || []).map((sub) => normalizeMeal(sub, true, meal.id ?? null));

    return normalized;
}

function normalizeItem(item: MealItemsDto, index: number): MealItemsDto {
    return {
        ...item,
        order: toSafeInt(item.order, index),
        quantity: toSafeNumber(item.quantity),
        quantityInGrams: toSafeNumber(item.quantityInGrams),
        notes: item.notes ?? '',
        portionLabel: item.portionLabel ?? '',
        isOptional: Boolean(item.isOptional),
        isEquivalentes: Boolean(item.isEquivalentes),
        equivalents: (item.equivalents ?? []).map((eq, eqIndex) => ({
            ...normalizeItem(eq, eqIndex),
            isEquivalentes: true,
            parentMealItemId: item.id ?? eq.parentMealItemId ?? null,
        })),
    };
}

function toSafeInt(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
    return fallback;
}

function toSafeNumber(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return 0;
}

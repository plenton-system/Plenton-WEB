import * as Yup from 'yup';

import i18n from 'src/i18n';

import type { MealDto, MealPlanDto, MealItemsDto } from '../../types';

// ----------------------------------------------------------------------

export const itemSchema = Yup.object({
    foodDto: Yup.object({
        id: Yup.string().required(() => i18n.t('mealplan.validation.foodRequired')),
        description: Yup.string().required(),
    }).required(() => i18n.t('mealplan.validation.foodRequired')) as any,
    quantity: Yup.number().nullable().default(null),
    quantityInGrams: Yup.number()
        .nullable()
        .min(0, () => i18n.t('validation.valueInvalid')),
    homemadeMeasureDto: Yup.object().nullable(),
    notes: Yup.string().nullable().default(''),
    order: Yup.number()
        .nullable()
        .min(0, () => i18n.t('validation.valueInvalid')),
    isOptional: Yup.boolean().default(false),
    portionLabel: Yup.string().nullable().default(''),
    isEquivalentes: Yup.boolean().default(false),
    parentMealItemId: Yup.string().nullable(),
    equivalents: Yup.array().of(Yup.lazy(() => itemSchema)).nullable(),
}) as any as Yup.Schema<MealItemsDto>;

// ----------------------------------------------------------------------

export const mealSchema = Yup.object({
    name: Yup.string().required(() => i18n.t('mealplan.validation.mealNameRequired')),
    description: Yup.string().nullable().default(''),
    time: Yup.string().required(() => i18n.t('mealplan.validation.timeRequired')),
    isSubstitute: Yup.boolean().default(false),
    idPrincipalMeal: Yup.string().nullable(),
    items: Yup.array().of(itemSchema).default([]),
    substitute: Yup.array().of(
        Yup.object({
            name: Yup.string().required(() => i18n.t('validation.nameRequired')),
            description: Yup.string().nullable().default(''),
            time: Yup.string().required(() => i18n.t('mealplan.validation.timeRequired')),
            isSubstitute: Yup.boolean().default(true),
            idPrincipalMeal: Yup.string().nullable(),
            items: Yup.array().of(itemSchema).default([]),
            substitute: Yup.array().default([]),
        }) as any
    ),
}) as any as Yup.Schema<MealDto>;

// ----------------------------------------------------------------------

export const planSchema = Yup.object({
    name: Yup.string().required(() => i18n.t('mealplan.validation.planNameRequired')),
    status: Yup.number().required(() => i18n.t('validation.statusRequired')),
    daysOfWeek: Yup.array()
        .of(Yup.number().min(0).max(6))
        .min(1, () => i18n.t('mealplan.validation.dayRequired'))
        .required(),
    nutritionistId: Yup.string().required(),
    patientId: Yup.string().required(),
    meals: Yup.array().of(mealSchema).default([]),
}) as any as Yup.Schema<MealPlanDto>;

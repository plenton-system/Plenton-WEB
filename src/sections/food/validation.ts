import type { FoodFormValues } from 'src/types';

import * as Yup from 'yup';

import i18n from 'src/i18n';

// ----------------------------------------------------------------------

const nonNegativeNumber = Yup.number()
  .typeError(() => i18n.t('validation.numberInvalid'))
  .min(0, () => i18n.t('validation.nonNegative'))
  .required(() => i18n.t('validation.required'));

// ----------------------------------------------------------------------

export const validationSchema: Yup.Schema<FoodFormValues> = Yup.object({
  id: Yup.string().default(''),
  description: Yup.string().trim().required(() => i18n.t('food.validation.descriptionRequired')),
  group: Yup.string().nullable().default(''),
  source: Yup.mixed<'custom' | 'taco'>()
    .oneOf(['custom', 'taco'], () => i18n.t('food.validation.sourceInvalid'))
    .required(() => i18n.t('food.validation.sourceRequired')),
  energyKcal: nonNegativeNumber,
  carbs: nonNegativeNumber,
  protein: nonNegativeNumber,
  fat: nonNegativeNumber,
  portionSize: nonNegativeNumber,
  foodGroupId: Yup.string().trim().default(''),
  tableType: Yup.number()
    .typeError(() => i18n.t('food.validation.tableTypeInvalid'))
    .integer(() => i18n.t('food.validation.tableTypeInvalid'))
    .min(0, () => i18n.t('food.validation.tableTypeInvalid'))
    .required(() => i18n.t('food.validation.tableTypeRequired')),
  externalCode: Yup.string().default(''),
  macronutrients: Yup.object({
    carbohydrates: nonNegativeNumber,
    proteins: nonNegativeNumber,
    fats: nonNegativeNumber,
  }).required(),
  micronutrients: Yup.object({
    sugar: nonNegativeNumber,
    vitaminA: nonNegativeNumber,
    vitaminC: nonNegativeNumber,
    vitaminD: nonNegativeNumber,
    vitaminE: nonNegativeNumber,
    vitaminK: nonNegativeNumber,
    vitaminB1: nonNegativeNumber,
    vitaminB2: nonNegativeNumber,
    vitaminB3: nonNegativeNumber,
    vitaminB5: nonNegativeNumber,
    vitaminB6: nonNegativeNumber,
    vitaminB7: nonNegativeNumber,
    vitaminB9: nonNegativeNumber,
    vitaminB12: nonNegativeNumber,
    calcium: nonNegativeNumber,
    phosphorus: nonNegativeNumber,
    magnesium: nonNegativeNumber,
    sodium: nonNegativeNumber,
    potassium: nonNegativeNumber,
    iron: nonNegativeNumber,
    zinc: nonNegativeNumber,
    copper: nonNegativeNumber,
    manganese: nonNegativeNumber,
    selenium: nonNegativeNumber,
    cholesterol: nonNegativeNumber,
  }).required(),
  homemadeMeasures: Yup.array()
    .of(
      Yup.object({
        description: Yup.string()
          .trim()
          .required(() => i18n.t('food.validation.measureDescriptionRequired')),
        quantityInGrams: nonNegativeNumber,
      }).required()
    )
    .default([]),
}) as any;

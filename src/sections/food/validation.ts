import type { FoodFormValues } from 'src/types';

import * as Yup from 'yup';

// ----------------------------------------------------------------------

const nonNegativeNumber = Yup.number()
  .typeError('Informe um número válido')
  .min(0, 'O valor deve ser maior ou igual a 0')
  .required('Campo obrigatório');

// ----------------------------------------------------------------------

export const validationSchema: Yup.Schema<FoodFormValues> = Yup.object({
  id: Yup.string().default(''),
  description: Yup.string().trim().required('Descrição é obrigatória'),
  group: Yup.string().nullable().default(''),
  source: Yup.mixed<'custom' | 'taco'>()
    .oneOf(['custom', 'taco'], 'Origem inválida')
    .required('Origem é obrigatória'),
  energyKcal: nonNegativeNumber,
  carbs: nonNegativeNumber,
  protein: nonNegativeNumber,
  fat: nonNegativeNumber,
  portionSize: nonNegativeNumber,
  foodGroupId: Yup.string().trim().default(''),
  tableType: Yup.number()
    .typeError('Tipo da tabela inválido')
    .integer('Tipo da tabela inválido')
    .min(0, 'Tipo da tabela inválido')
    .required('Tipo da tabela é obrigatório'),
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
        description: Yup.string().trim().required('Descrição da medida caseira é obrigatória'),
        quantityInGrams: nonNegativeNumber,
      }).required()
    )
    .default([]),
}) as any;

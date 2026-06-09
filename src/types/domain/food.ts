import type { PagedRequest } from '..';
import type { FoodGroup } from './FoodGroup';

export type FoodSource = 'custom' | 'taco';

/**
 * Propriedades de filtros
 */
export type FoodListQuery = FoodListFilters & PagedRequest;

/**
 * Propriedades de filtros
 */
export type FoodListFilters = {
  value?: string;
  source?: FoodSource;
  orderBy?: 'description' | 'group' | 'calories' | 'protein' | 'carbs' | 'fat';
  order?: 'asc' | 'desc';
  pageIndex?: number;
  pageSize?: number;
};

export type FoodListProps = {
  id: string;
  description: string;
  group?: string | null;
  energyKcal?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  source: FoodSource;
};

export type FoodItem = {
  id: string;
  description: string;
  group?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  source: FoodSource;
};

//valores do form (extendendo seus tipos atuais)
export type FoodFormValues = FoodDetailProps & {};

export interface FoodDetailProps extends FoodListProps {
  description: string;
  energyKcal: number;
  foodGroup?: FoodGroup | null;
  portionSize: number;
  foodGroupId: string;
  tableType: number;
  externalCode: string;
  macronutrients: {
    carbohydrates: number;
    proteins: number;
    fats: number;
  };
  micronutrients: {
    sugar: number;
    vitaminA: number;
    vitaminC: number;
    vitaminD: number;
    vitaminE: number;
    vitaminK: number;
    vitaminB1: number;
    vitaminB2: number;
    vitaminB3: number;
    vitaminB5: number;
    vitaminB6: number;
    vitaminB7: number;
    vitaminB9: number;
    vitaminB12: number;
    calcium: number;
    phosphorus: number;
    magnesium: number;
    sodium: number;
    potassium: number;
    iron: number;
    zinc: number;
    copper: number;
    manganese: number;
    selenium: number;
    cholesterol: number;
  };
  homemadeMeasures: Array<{
    description: string;
    quantityInGrams: number;
  }>;
}

/**
 * Retorno de um alimento após uma edição
 */
export interface FoodViewProps {
  /**
   * Identificador do alimento
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * Descrição do alimento
   * @example "Arroz branco cozido"
   */
  description: string;

  /**
   * Energia do alimento em kcal
   * @example 130
   */
  energyKcal: number;

  /**
   * Tamanho da porção em gramas
   * @example 100
   */
  portionSize: number;

  /**
   * Grupo alimentar do alimento
   * @example { id: "123e4567-e89b-12d3-a456-426614174000", name: "Verduras, hortaliças e derivados" }
   */
  foodGroup?: FoodGroup | null;

  /**
   * Compatibilidade com formato legado
   */
  foodGroupId?: string;

  /**
   * Compatibilidade com formato legado
   */
  foodGroupName?: string;

  /**
   * Origem do alimento
   * @example "taco"
   */
  tableType: number;

  /**
   * Código externo do alimento (pode ser usado para integrar com outras bases de dados)
   * @example "1234567890123"
   */
  externalCode: string;

  /**
   * Macronutrientes do alimento
   * @example { carbohydrates: 28, proteins: 2.7, fats: 0.3 }
   */
  macronutrients: {
    /**
     * Quantidade de carboidratos em gramas
     * * @example 28
     */
    carbohydrates: number;

    /**
     * Quantidade de proteínas em gramas
     * @example 2.7
     */
    proteins: number;

    /**
     * Quantidade de gorduras em gramas
     * @example 0.3
     */
    fats: number;
  };

  /**
   * Micronutrientes do alimento
   * @example { sugar: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0.1, vitaminK: 0, vitaminB1: 0.07, vitaminB2: 0.02, vitaminB3: 1.2, vitaminB5: 0.4, vitaminB6: 0.1, vitaminB7: 0, vitaminB9: 10, vitaminB12: 0, calcium: 10, phosphorus: 35, magnesium: 12, sodium: 1, potassium: 35, iron: 0.2, zinc: 0.4, copper: 0.1, manganese: 0.2, selenium: 1.5, cholesterol: 0 }
   */
  micronutrients: {
    /**
     * Quantidade de açucar por 100g do alimento em gramas
     * @example 0.1
     */
    sugar: number;

    /**
     * Quantidade de vitamina A por 100g do alimento em microgramas
     * @example 0.1
     */
    vitaminA: number;

    /**
     * Quantidade de vitamina C por 100g do alimento em miligramas
     * @example 0.1
     */
    vitaminC: number;
    /**
     * Quantidade de vitamina D por 100g do alimento em microgramas
     * @example 0.1
     */
    vitaminD: number;

    /**
     * Quantidade de vitamina E por 100g do alimento em miligramas
     * @example 0.1
     */
    vitaminE: number;

    /**
     * Quantidade de vitamina K por 100g do alimento em microgramas
     * @example 0.1
     */
    vitaminK: number;

    /**
     * Quantidade de vitamina B1 (tiamina) por 100g do alimento em miligramas
     * @example 0.07
     */
    vitaminB1: number;

    /**
     * Quantidade de vitamina B2 (riboflavina) por 100g do alimento em miligramas
     * @example 0.02
     */
    vitaminB2: number;

    /**
     * Quantidade de vitamina B3 (niacina) por 100g do alimento em miligramas
     * @example 1.2
     */
    vitaminB3: number;

    /**
     * Quantidade de vitamina B5 (ácido pantotênico) por 100g do alimento em miligramas
     * @example 0.4
     */
    vitaminB5: number;

    /**
     * Quantidade de vitamina B6 (piridoxina) por 100g do alimento em miligramas
     * @example 0.1
     */
    vitaminB6: number;

    /**
     * Quantidade de vitamina B7 (biotina) por 100g do alimento em microgramas
     * @example 0
     */
    vitaminB7: number;

    /**
     * Quantidade de vitamina B9 (ácido fólico) por 100g do alimento em microgramas
     * @example 10
     */
    vitaminB9: number;

    /**
     * Quantidade de vitamina B12 (cobalamina) por 100g do alimento em microgramas
     * @example 0
     */
    vitaminB12: number;

    /**
     * Quantidade de cálcio por 100g do alimento em miligramas
     * @example 10
     */
    calcium: number;

    /**
     * Quantidade de fósforo por 100g do alimento em miligramas
     * @example 35
     */
    phosphorus: number;

    /**
     * Quantidade de magnésio por 100g do alimento em miligramas
     * @example 12
     */
    magnesium: number;

    /**
     * Quantidade de sódio por 100g do alimento em miligramas
     * @example 1
     */
    sodium: number;

    /**
     * Quantidade de potássio por 100g do alimento em miligramas
     * @example 35
     */
    potassium: number;

    /**
     * Quantidade de ferro por 100g do alimento em miligramas
     * @example 0.2
     */
    iron: number;

    /**
     * Quantidade de zinco por 100g do alimento em miligramas
     * @example 0.4
     */
    zinc: number;

    /**
     * Quantidade de cobre por 100g do alimento em miligramas
     * @example 0.1
     */
    copper: number;

    /**
     * Quantidade de manganês por 100g do alimento em miligramas
     * @example 0.2
     */
    manganese: number;

    /**
     * Quantidade de selênio por 100g do alimento em microgramas
     * @example 1.5
     */
    selenium: number;

    /**
     * Quantidade de colesterol por 100g do alimento em miligramas
     * @example 0
     */
    cholesterol: number;
  };

  /**
   * Medidas caseiras do alimento
   * @example [{ description: "1 xícara", quantityInGrams: 200 }, { description: "1 colher de sopa", quantityInGrams: 15 }]
   */
  homemadeMeasures: Array<{
    /**
     * Descrição da medida caseira
     * @example "1 xícara"
     */
    description: string;

    /**
     * Quantidade em gramas correspondente à medida caseira
     * @example 200
     */
    quantityInGrams: number;
  }>;
}

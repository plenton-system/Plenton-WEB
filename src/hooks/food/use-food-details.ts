import type { FoodViewProps, FoodDetailProps } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { FoodGroup } from 'src/types';
import { foodService } from 'src/services/food/foodService';

//--------------------------------------------------------------------
type UseFoodDetailOptions = {
  id: string | null;
  autoLoad?: boolean;
};

type UseFoodDetailReturn = {
  data: FoodDetailProps | null;
  loading: boolean;
  error: string | null;
  createOrUpdate: (values: FoodDetailProps) => Promise<string | boolean>;
  setData: React.Dispatch<React.SetStateAction<FoodDetailProps | null>>;
};

/**
 * Mapeia um FoodViewProps para FoodDetailProps
 */
function mapApiToFoodDetail({ apiData }: { apiData: FoodViewProps }): FoodDetailProps {
  const tableType = typeof apiData.tableType === 'number' ? apiData.tableType : 0;
  const source = tableType === 1 ? 'taco' : 'custom';
  const foodGroup = apiData.foodGroup ? FoodGroup.fromApi(apiData.foodGroup) : null;

  return {
    id: apiData.id,
    description: apiData.description,
    group: foodGroup?.name ?? apiData.foodGroupName ?? '',
    energyKcal: apiData.energyKcal,
    foodGroup,
    protein: 0,
    carbs: 0,
    fat: 0,
    source,
    portionSize: apiData.portionSize,
    foodGroupId: foodGroup?.id ?? apiData.foodGroupId ?? '',
    tableType,
    externalCode: apiData.externalCode,
    macronutrients: {
      carbohydrates: apiData.macronutrients?.carbohydrates ?? 0,
      proteins: apiData.macronutrients?.proteins ?? 0,
      fats: apiData.macronutrients?.fats ?? 0,
    },
    micronutrients: apiData.micronutrients,
    homemadeMeasures: apiData.homemadeMeasures,
  };
}

//--------------------------------------------------------------------
export function useFoodDetail({ id, autoLoad = true }: UseFoodDetailOptions): UseFoodDetailReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FoodDetailProps | null>(null);

  const setStates = (isLoading: boolean = true) => {
    setError(null);
    setLoading(isLoading);
  };

  const fetchDetail = useCallback(async () => {
    if (!autoLoad) return;

    setStates();

    try {
      const result = await foodService.getById(id!);
      const mappedFood = mapApiToFoodDetail({ apiData: result });

      setData(mappedFood);
    } catch (erro: any) {
      setError(erro?.response?.data?.message || erro.message || 'Erro ao buscar alimento');
    } finally {
      setLoading(false);
    }
  }, [autoLoad, id]);

  const createOrUpdate = useCallback(
    async (values: FoodDetailProps): Promise<boolean> => {
      setStates();

      try {
        if (autoLoad) {
          await foodService.update(id!, values);
        } else {
          await foodService.create(values);
        }

        setData(null);
        return true;
      } catch (erro: any) {
        const message = erro?.response?.data?.message || erro.message || 'Erro ao salvar alimento';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [autoLoad, id]
  );

  useEffect(() => {
    fetchDetail();
  }, [id, fetchDetail]);

  return {
    data,
    loading,
    error,
    createOrUpdate,
    setData,
  };
}

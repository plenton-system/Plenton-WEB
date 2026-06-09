import type * as types from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { fDateInput } from 'src/utils/format-time';

import { userDataService } from 'src/services/userData/userDataService';

// ----------------------------------------------------------------------

type UseUserDataDetailOptions = {
  userId?: string | null;
  autoLoad?: boolean;
};

type UseUserDataDetailReturn = {
  loading: boolean;
  error: string | null;
  update: (dto: types.ProfileFormValues) => Promise<boolean>;
  refetch: () => Promise<types.ProfileFormValues | null>;
};

// ----------------------------------------------------------------------

/**
 * Mapeia um ProfileDetailsProps para ProfileFormValues
 */
function mapApiToProfileData(apiData: types.ProfileDetailsProps): types.ProfileFormValues {
  return {
    id: apiData.id,
    name: apiData.name,
    phone: apiData.phone,
    email: apiData.email,
    document: apiData.document,
    photo: apiData.photoPhoto,
    crn: apiData.crn,
    gender: apiData.gender,
    birthDate: apiData.birthDate ? fDateInput(apiData.birthDate) : '',
    addressDto: {
      street: apiData.addressDto?.street || '',
      neighborhood: apiData.addressDto?.neighborhood || '',
      city: apiData.addressDto?.city || '',
      state: apiData.addressDto?.state || '',
      zipCode: apiData.addressDto?.zipCode || '',
    },
  };
}

// ----------------------------------------------------------------------

export function useUserDataDetails({ userId, autoLoad = false }: UseUserDataDetailOptions): UseUserDataDetailReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStates = (isLoading: boolean = true) => {
    setError(null);
    setLoading(isLoading);
  };

  const fetchDetail = useCallback(async (): Promise<types.ProfileFormValues | null> => {
    if (!userId) {
      setLoading(false);
      return null;
    }

    setStates();

    try {
      const result = await userDataService.getDataByUserId(userId!);
      return mapApiToProfileData(result);
    } catch (erro: any) {
      setError(erro?.response?.data?.message || erro.message || 'Erro ao buscar dados do usuário');
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const update = useCallback(
    async (values: types.ProfileFormValues): Promise<boolean> => {
      setStates();

      try {
        const { photo, ...rest } = values;
        const payload: types.ProfileDetailsProps = {
          ...(rest as Omit<types.ProfileDetailsProps, 'photoPhoto'>),
          photoPhoto: photo,
        };

        const updated = await userDataService.update(payload);
        return updated;
      } catch (erro: any) {
        const message = erro?.response?.data || erro.message || 'Erro ao salvar os dados do perfil';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
     if (autoLoad) { // Agora a busca é opcional
      fetchDetail();
    }
  }, [userId, fetchDetail, autoLoad]);

  return {
    loading,
    error,
    update,
    refetch: fetchDetail,
  };
}

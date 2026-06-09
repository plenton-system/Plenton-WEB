import type { AxiosRequestConfig } from 'axios';
import type { ProfileDetailsProps } from 'src/types';

import { get, put } from 'src/utils/http-client';

export const userDataService = {
  //por enquanto retorna somente nutri.
  getDataByUserId: async (userId: string): Promise<ProfileDetailsProps> => {
    const response = await get(`/api/nutritionist/get-by-userId/${userId}`);
    return response.data;
  },

  update: async (dto: ProfileDetailsProps): Promise<boolean> => {
    const config: AxiosRequestConfig = {
      headers: {
        'id': dto.id,
      },
    };
    const response = await put(`/api/Nutritionist/edit`, dto, config);
    return response.data;
  },
};

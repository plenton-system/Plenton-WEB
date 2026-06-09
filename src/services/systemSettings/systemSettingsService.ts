import type { SystemSettingsProps, EditSystemSettingsDto } from 'src/types/domain/system-settings';

import { get, put } from 'src/utils/http-client';

export const systemSettingsService = {
  getByUserId: async (userId: string): Promise<SystemSettingsProps> => {
    const response = await get(`/api/system-settings?userId=${userId}`);
    return response.data;
  },

  update: async (payload: EditSystemSettingsDto): Promise<boolean> => {
    try {
      await put(`/api/system-settings`, payload);
      return true;
    } catch {
      return false;
    }
  },
};

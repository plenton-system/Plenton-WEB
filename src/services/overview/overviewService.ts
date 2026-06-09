import { get } from 'src/utils/http-client';

// ----------------------------------------------------------------------

export const overviewService = {

    getOverview: async (): Promise<any> => {
        const response = await get('/api/overview');
        return response.data;
    },

}
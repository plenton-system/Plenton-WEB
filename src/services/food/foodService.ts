import type { PagedResult, RequestOpts, FoodListProps, FoodListQuery, FoodViewProps, FoodDetailProps } from 'src/types';

import { del, get, put, post } from 'src/utils/http-client';

import { FoodGroup } from 'src/types/domain/FoodGroup';

// ----------------------------------------------------------------------

const DEFAULT_SEARCH_PARAMS = {
    pageIndex: 1,
    pageSize: 10,
    tableType: 'TACO',
};

export const foodService = {
    getAllByTable: async (
        params: FoodListQuery,
        opts?: RequestOpts): Promise<PagedResult<FoodListProps>> => {
        const qs = {
            pageIndex: params.pageIndex ?? DEFAULT_SEARCH_PARAMS.pageIndex,
            pageSize: params.pageSize ?? DEFAULT_SEARCH_PARAMS.pageSize,
            tableType: params.source ?? DEFAULT_SEARCH_PARAMS.tableType
        }

        const response = await get<{ data: PagedResult<FoodListProps> }>('/api/Food/by-table', {
            ...(opts ?? {}),
            params: qs,
        });

        return response.data;
    },

    search: async (
        params: FoodListQuery,
        opts?: RequestOpts): Promise<PagedResult<FoodListProps>> => {
        const qs = {
            term: params.value,
            pageIndex: params.pageIndex ?? DEFAULT_SEARCH_PARAMS.pageIndex,
            pageSize: params.pageSize ?? DEFAULT_SEARCH_PARAMS.pageSize,
            tableType: params.source ?? DEFAULT_SEARCH_PARAMS.tableType
        }

        const response = await get<{ data: PagedResult<FoodListProps> }>('/api/Food/search', {
            ...(opts ?? {}),
            params: qs,
        });

        return response.data;
    },

    getById: async (id: string): Promise<FoodViewProps> => {
        const response = await get(`/api/Food/${id}`);
        return response.data;
    },

    getFoodGroups: async (opts?: RequestOpts): Promise<FoodGroup[]> => {
        const response = await get<unknown>('/api/food-groups', opts);
        const items = Array.isArray(response)
            ? response
            : Array.isArray((response as any)?.data)
                ? (response as any).data
                : [];

        return items.map((item: unknown) => FoodGroup.fromApi(item));
    },

    update: async (id: string, data: FoodDetailProps): Promise<void> => {
        await put(`/api/Food/${id}`, data);
    },

    create: async (data: FoodDetailProps): Promise<void> => {
        await post('/api/Food', data);
    },

    delete: async (id: string): Promise<void> => {
        await del(`/api/Food/${id}`);
    },
};

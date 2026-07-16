import type { PlannerTask, PlannerTaskFilters, UpdatePlannerTaskRequest, CreatePlannerTaskRequest } from 'src/types';

import api from 'src/services/api';

const BASE_URL = '/api/planner-tasks';
const unwrap = <T,>(value: T | { data?: T }): T => value && typeof value === 'object' && 'data' in value && value.data !== undefined ? value.data : value as T;
const unwrapList = (value: unknown): PlannerTask[] => {
  const result = unwrap(value as PlannerTask[] | { data?: PlannerTask[] | { items?: PlannerTask[] } });
  if (Array.isArray(result)) return result;
  if (result && typeof result === 'object' && 'items' in result) return (result.items as PlannerTask[] | undefined) ?? [];
  return [];
};

export const plannerService = {
  listTasks: async (filters: PlannerTaskFilters = {}): Promise<PlannerTask[]> => unwrapList((await api.get(BASE_URL, { params: filters })).data),
  getTask: async (id: string): Promise<PlannerTask> => unwrap((await api.get(`${BASE_URL}/${id}`)).data),
  createTask: async (payload: CreatePlannerTaskRequest): Promise<PlannerTask> => unwrap((await api.post(BASE_URL, payload)).data),
  updateTask: async (id: string, payload: UpdatePlannerTaskRequest): Promise<PlannerTask> => unwrap((await api.put(`${BASE_URL}/${id}`, payload)).data),
  completeTask: async (id: string): Promise<PlannerTask> =>
    unwrap((await api.patch(`${BASE_URL}/${id}/complete`)).data),
  startTask: async (id: string): Promise<PlannerTask> =>
    unwrap((await api.patch(`${BASE_URL}/${id}/in-progress`)).data),
  deleteTask: async (id: string): Promise<void> => { await api.delete(`${BASE_URL}/${id}`); },
};

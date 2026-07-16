import type { PlannerTask, PlannerTaskFilters, UpdatePlannerTaskRequest, CreatePlannerTaskRequest } from 'src/types';

import { useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { plannerService } from 'src/services/planner/plannerService';

export function usePlanner(initialFilters: PlannerTaskFilters = {}) {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [filters, setFilters] = useState<PlannerTaskFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { setTasks(await plannerService.listTasks(filters)); }
    catch (err) { setError(extractApiErrorMessage(err, i18n.t('planner.messages.loadError'))); }
    finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { refetch(); }, [refetch]);
  const mutate = useCallback(async <T,>(operation: () => Promise<T>) => {
    setMutating(true); setError(null);
    try { const result = await operation(); await refetch(); return result; }
    catch (err) { const message = extractApiErrorMessage(err, i18n.t('planner.messages.saveError')); setError(message); throw new Error(message); }
    finally { setMutating(false); }
  }, [refetch]);
  return {
    tasks, filters, loading, mutating, error, refetch, setFilters,
    createTask: (payload: CreatePlannerTaskRequest) => mutate(() => plannerService.createTask(payload)),
    updateTask: (id: string, payload: UpdatePlannerTaskRequest) => mutate(() => plannerService.updateTask(id, payload)),
    toggleTask: (task: PlannerTask) => mutate(() => (
      task.status === 'Completed'
        ? plannerService.startTask(task.id)
        : plannerService.completeTask(task.id)
    )),
    deleteTask: (id: string) => mutate(() => plannerService.deleteTask(id)),
  };
}

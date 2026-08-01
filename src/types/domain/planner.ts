export type PlannerTaskStatus = 'Pending' | 'InProgress' | 'Completed' | 'Canceled';
export type PlannerTaskPriority = 'Low' | 'Medium' | 'High';

export type PlannerTask = {
  id: string;
  title: string;
  description?: string | null;
  status: PlannerTaskStatus;
  priority: PlannerTaskPriority;
  dueDate?: string | null;
  patientId?: string | null;
  patientName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreatePlannerTaskRequest = {
  title: string;
  description?: string;
  priority: PlannerTaskPriority;
  dueDate?: string | null;
  patientId?: string | null;
};

export type UpdatePlannerTaskRequest = CreatePlannerTaskRequest;
export type PlannerTaskFilters = {
  patientId?: string;
  status?: PlannerTaskStatus;
  priority?: PlannerTaskPriority;
  search?: string;
};

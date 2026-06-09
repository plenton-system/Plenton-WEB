import { MealPlanStatus } from '../types';

import type { StatusOption } from '../types';

// ----------------------------------------------------------------------

export const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
    { value: MealPlanStatus.ACTIVE, label: 'Ativo' },
    { value: MealPlanStatus.INACTIVE, label: 'Inativo' },
    { value: MealPlanStatus.SUSPENDED, label: 'Suspenso' },
];

// ----------------------------------------------------------------------

export const DAYS = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' },
];

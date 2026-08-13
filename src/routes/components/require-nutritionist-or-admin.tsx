import type { ReactNode } from 'react';

import { RequireRole } from './require-role';

export function RequireNutritionistOrAdmin({ children }: { children: ReactNode }) {
  return <RequireRole allowed={['Admin', 'Nutritionist']}>{children}</RequireRole>;
}

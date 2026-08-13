import type { ReactNode } from 'react';

import { RequireRole } from './require-role';

export function RequirePatient({ children }: { children: ReactNode }) {
  return <RequireRole allowed={['Patient']}>{children}</RequireRole>;
}

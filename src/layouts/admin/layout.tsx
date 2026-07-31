import type { ReactNode } from 'react';

import { DashboardLayout } from 'src/layouts/dashboard';
import { adminNavData } from 'src/layouts/nav-config-admin';

export function AdminLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout navigation={adminNavData}>{children}</DashboardLayout>;
}

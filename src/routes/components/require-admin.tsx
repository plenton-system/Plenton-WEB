import type { ReactNode } from 'react';

import { useAuth } from 'src/hooks/common/use-auth';

import { hasRole } from 'src/utils/app-roles';

import { ForbiddenView } from 'src/sections/admin/view/forbidden-view';

import { RequireAuth } from './require-auth';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  return (
    <RequireAuth>
      {!loading && user && !hasRole(user.role, 'Admin') ? <ForbiddenView /> : children}
    </RequireAuth>
  );
}

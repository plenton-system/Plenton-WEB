import type { ReactNode } from 'react';
import type { AppRole } from 'src/utils/app-roles';

import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from 'src/hooks/common/use-auth';

import { hasRole, resolveHomePath } from 'src/utils/app-roles';

import { RequireAuth } from './require-auth';

type Props = {
  children: ReactNode;
  allowed: AppRole[];
};

export function RequireRole({ children, allowed }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const compatible = user && allowed.some((role) => hasRole(user.role, role));

  return (
    <RequireAuth>
      {!loading && user && !compatible ? (
        <Navigate to={resolveHomePath(user.role)} state={{ deniedFrom: location }} replace />
      ) : (
        children
      )}
    </RequireAuth>
  );
}

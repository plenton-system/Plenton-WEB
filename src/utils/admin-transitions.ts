import type {
  AdminUserDetail,
  AdminTenantDetail,
  AdminUserTransition,
  AdminTenantTransition,
} from 'src/types/admin';

export const applyTenantTransition = (
  current: AdminTenantDetail,
  transition: AdminTenantTransition
): AdminTenantDetail => ({ ...current, ...transition });

export const applyUserTransition = (
  current: AdminUserDetail,
  transition: AdminUserTransition
): AdminUserDetail => ({ ...current, ...transition });

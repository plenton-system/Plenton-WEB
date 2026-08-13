import { hasRole, normalizeRoles } from './app-roles';

export const ADMIN_ROLE = 'Admin';

export { normalizeRoles };

export const hasAdminRole = (role: string | string[] | null | undefined) => hasRole(role, ADMIN_ROLE);

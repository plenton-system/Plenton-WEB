export const ADMIN_ROLE = 'Admin';

export function normalizeRoles(role: string | string[] | null | undefined): string[] {
  if (Array.isArray(role)) return role.map((value) => value.trim()).filter(Boolean);
  return typeof role === 'string'
    ? role
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
}

export const hasAdminRole = (role: string | string[] | null | undefined) => {
  const isAdmin = normalizeRoles(role).includes(ADMIN_ROLE);
  return isAdmin;
};

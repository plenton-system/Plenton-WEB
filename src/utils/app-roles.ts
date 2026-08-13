export const APP_ROLES = ['Admin', 'Nutritionist', 'Patient'] as const;

export type AppRole = (typeof APP_ROLES)[number];

const ROLE_LOOKUP = new Map(APP_ROLES.map((role) => [role.toLowerCase(), role]));

export function normalizeRoles(value: string | string[] | null | undefined): AppRole[] {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return Array.from(
    new Set(
      rawValues
        .map((item) => ROLE_LOOKUP.get(item.trim().toLowerCase()))
        .filter((role): role is AppRole => Boolean(role))
    )
  );
}

export const hasRole = (value: string | string[] | null | undefined, role: AppRole) =>
  normalizeRoles(value).includes(role);

export function resolvePrimaryRole(value: string | string[] | null | undefined): AppRole | null {
  const roles = normalizeRoles(value);
  return APP_ROLES.find((role) => roles.includes(role)) ?? null;
}

export function resolveHomePath(value: string | string[] | null | undefined): string {
  const role = resolvePrimaryRole(value);
  if (role === 'Admin') return '/admin';
  if (role === 'Nutritionist') return '/dashboard';
  if (role === 'Patient') return '/portal';
  return '/404';
}

export function isPathCompatibleWithRoles(
  pathname: string,
  value: string | string[] | null | undefined
): boolean {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return hasRole(value, 'Admin');
  if (pathname === '/portal' || pathname.startsWith('/portal/')) return hasRole(value, 'Patient');

  const professionalPaths = [
    '/dashboard',
    '/patient',
    '/appointment',
    '/workspace',
    '/planner',
    '/food',
    '/anamnesis',
    '/subscription',
    '/settings/subscription',
  ];

  if (professionalPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return hasRole(value, 'Admin') || hasRole(value, 'Nutritionist');
  }

  return false;
}

export function resolvePostSignInDestination(
  roles: string | string[] | null | undefined,
  requestedPath?: string | null,
  pendingPlanPriceId?: string | null
): string {
  if (requestedPath && isPathCompatibleWithRoles(requestedPath, roles)) return requestedPath;
  if (pendingPlanPriceId && isPathCompatibleWithRoles('/subscription/checkout', roles)) {
    return `/subscription/checkout?planPriceId=${encodeURIComponent(pendingPlanPriceId)}`;
  }
  return resolveHomePath(roles);
}

export const MAX_ADMIN_PAGE_SIZE = 100;

export type AdminListQuery = Record<string, string | number | boolean | null | undefined>;

export function clampAdminPageSize(value: number) {
  return Math.min(MAX_ADMIN_PAGE_SIZE, Math.max(1, Math.trunc(value) || 10));
}

export function readAdminQuery(params: URLSearchParams) {
  return {
    page: Math.max(1, Number(params.get('page')) || 1),
    pageSize: clampAdminPageSize(Number(params.get('pageSize')) || 10),
    filters: Object.fromEntries(
      [...params.entries()].filter(
        ([key, value]) => key !== 'page' && key !== 'pageSize' && value.trim()
      )
    ),
  };
}

export function updateAdminQuery(
  current: URLSearchParams,
  patch: AdminListQuery,
  options: { resetPage?: boolean } = {}
) {
  const next = new URLSearchParams(current);
  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') next.delete(key);
    else
      next.set(key, key === 'pageSize' ? String(clampAdminPageSize(Number(value))) : String(value));
  });
  if (options.resetPage) next.set('page', '1');
  return next;
}

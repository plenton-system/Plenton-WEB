import { it, expect, describe } from 'vitest';

import {
  readAdminQuery,
  updateAdminQuery,
  clampAdminPageSize,
  MAX_ADMIN_PAGE_SIZE,
} from './admin-query';

describe('administrative URL query', () => {
  it('restores filters and pagination from a deep link', () => {
    const result = readAdminQuery(
      new URLSearchParams('status=Active&search=ana&page=4&pageSize=25&empty=')
    );
    expect(result).toEqual({
      page: 4,
      pageSize: 25,
      filters: { status: 'Active', search: 'ana' },
    });
  });

  it('resets the page when a filter changes without mutating the source URL', () => {
    const current = new URLSearchParams('status=Active&page=8&pageSize=25');
    const next = updateAdminQuery(current, { status: 'Suspended' }, { resetPage: true });
    expect(next.toString()).toBe('status=Suspended&page=1&pageSize=25');
    expect(current.get('page')).toBe('8');
  });

  it('caps requested and restored page sizes at 100', () => {
    expect(clampAdminPageSize(500)).toBe(MAX_ADMIN_PAGE_SIZE);
    expect(readAdminQuery(new URLSearchParams('pageSize=101')).pageSize).toBe(100);
    expect(updateAdminQuery(new URLSearchParams(), { pageSize: 1000 }).get('pageSize')).toBe('100');
  });
});

import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { screen, render, waitFor } from '@testing-library/react';

import { adminTenantService } from 'src/services/admin/adminTenantUserService';

import { AdminTenantsView } from './admin-tenants-view';

vi.mock('src/services/admin/adminTenantUserService', () => ({
  adminTenantService: { search: vi.fn() },
}));
vi.mock('../components/admin-shared', async () => {
  const React = await import('react');
  return {
    AdminPageHeader: ({ title }: { title: string }) => React.createElement('h1', null, title),
    AdminFilterBar: ({ children }: { children: ReactNode }) =>
      React.createElement('div', null, children),
    AdminDebouncedSearchField: () => React.createElement('input'),
    AdminErrorState: () => React.createElement('div', null, 'error'),
    AdminEmptyState: () => React.createElement('div', null, 'empty'),
    AdminLoadingState: () => React.createElement('div', null, 'loading'),
    AdminStatusBadge: ({ label }: { label: string }) => React.createElement('span', null, label),
    AdminServerTable: ({
      children,
      onPageChange,
    }: {
      children: ReactNode;
      onPageChange: (page: number) => void;
    }) =>
      React.createElement(
        'div',
        null,
        children,
        React.createElement('button', { onClick: () => onPageChange(3) }, 'page-three')
      ),
  };
});

const mockedSearch = vi.mocked(adminTenantService.search);

describe('AdminTenantsView URL integration', () => {
  beforeEach(() => {
    mockedSearch.mockResolvedValue({
      items: [
        {
          id: 'id',
          identifier: 'tenant-a',
          status: 'Active',
          nutritionistName: 'Owner',
          nutritionistEmail: 'owner@test.dev',
          patientCount: 2,
          userCount: 3,
          createdAtUtc: '2026-01-01T00:00:00Z',
          updatedAtUtc: '2026-02-01T00:00:00Z',
          suspendedAtUtc: null,
          concurrencyStamp: 'stamp',
        },
      ],
      currentPage: 2,
      pageSize: 25,
      totalPages: 4,
      totalCount: 80,
    });
  });

  it('hydrates filters from a deep URL and writes pagination back to it', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={['/admin/tenants?query=ana&status=Suspended&page=2&pageSize=25']}
      >
        <AdminTenantsView />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(mockedSearch).toHaveBeenCalledWith(
        { query: 'ana', status: 'Suspended', page: 2, pageSize: 25 },
        expect.any(AbortSignal)
      )
    );
    expect(screen.getByRole('link', { name: 'tenant-a' })).toHaveAttribute(
      'href',
      '/admin/tenants/tenant-a'
    );
    await user.click(screen.getByRole('button', { name: 'page-three' }));
    await waitFor(() =>
      expect(mockedSearch).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 3, pageSize: 25 }),
        expect.any(AbortSignal)
      )
    );
  });
});
import type { ReactNode } from 'react';

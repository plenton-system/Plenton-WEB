import type { ReactNode } from 'react';

import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { adminSubscriptionService } from 'src/services/admin/adminSubscriptionService';

import { AdminSubscriptionsView } from './admin-subscriptions-view';

vi.mock('src/hooks/subscription/use-subscription-catalog', () => ({
  useSubscriptionCatalog: () => ({ plans: [], loading: false, error: null }),
}));
vi.mock('src/services/admin/adminSubscriptionService', () => ({
  adminSubscriptionService: { search: vi.fn() },
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
        React.createElement('button', { onClick: () => onPageChange(4) }, 'page-four')
      ),
  };
});

const mockedSearch = vi.mocked(adminSubscriptionService.search);

describe('AdminSubscriptionsView URL integration', () => {
  beforeEach(() => {
    mockedSearch.mockResolvedValue({
      items: [
        {
          id: 'subscription-id',
          tenantId: 'tenant-a',
          planId: 'plan-id',
          planName: 'Professional',
          planCode: 'PRO',
          status: 3,
          providerSubscriptionId: 'remote',
          providerCustomerId: 'customer',
          latestInvoiceStatus: 2,
          nextDueDate: '2026-09-01T00:00:00Z',
          version: '2026-07-30T00:00:00Z',
        },
      ],
      currentPage: 2,
      pageSize: 25,
      totalPages: 4,
      totalCount: 80,
    });
  });

  it('hydrates every filter and paging from URL and preserves tenant in the detail link', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          '/admin/subscriptions?tenantId=tenant-a&planId=plan-id&status=3&invoiceStatus=2&providerCustomerId=customer&page=2&pageSize=25',
        ]}
      >
        <AdminSubscriptionsView />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(mockedSearch).toHaveBeenCalledWith(
        {
          tenantId: 'tenant-a',
          planId: 'plan-id',
          status: 3,
          invoiceStatus: 2,
          providerCustomerId: 'customer',
          page: 2,
          pageSize: 25,
        },
        expect.any(AbortSignal)
      )
    );
    expect(screen.getByRole('link', { name: 'Professional' })).toHaveAttribute(
      'href',
      '/admin/subscriptions/subscription-id?tenantId=tenant-a'
    );
    await user.click(screen.getByRole('button', { name: 'page-four' }));
    await waitFor(() =>
      expect(mockedSearch).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 4, pageSize: 25 }),
        expect.any(AbortSignal)
      )
    );
  });
});

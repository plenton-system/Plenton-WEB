import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { Route, Routes, MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';

import { adminSubscriptionService } from 'src/services/admin/adminSubscriptionService';

import { AdminSubscriptionDetailView } from './admin-subscription-detail-view';

const { catalogPlans } = vi.hoisted(() => ({
  catalogPlans: [] as Array<Record<string, unknown>>,
}));
vi.mock('src/hooks/subscription/use-subscription-catalog', () => ({
  useSubscriptionCatalog: () => ({
    plans: catalogPlans,
    loading: false,
    error: null,
    reload: vi.fn(),
  }),
}));
vi.mock('src/services/admin/adminSubscriptionService', () => ({
  adminSubscriptionService: {
    detail: vi.fn(),
    changePlan: vi.fn(),
    suspend: vi.fn(),
    reactivate: vi.fn(),
  },
}));
vi.mock('../components/admin-shared', async () => {
  const React = await import('react');
  return {
    AdminPageHeader: ({ title }: { title: string }) => React.createElement('h1', null, title),
    AdminErrorState: ({ message }: { message: string }) =>
      React.createElement('div', null, message),
    AdminLoadingState: () => React.createElement('div', null, 'loading'),
    AdminStatusBadge: ({ label }: { label: string }) => React.createElement('span', null, label),
  };
});

const detail = {
  id: 'subscription-id',
  tenantId: 'tenant-a',
  planId: 'plan-id',
  planPriceId: 'price-id',
  planName: 'Professional',
  planCode: 'PRO',
  status: 3 as const,
  provider: 'Asaas',
  providerSubscriptionId: 'remote-subscription',
  providerCustomerId: 'remote-customer',
  latestInvoiceStatus: 2 as const,
  currentPeriodStart: '2026-07-01T00:00:00Z',
  currentPeriodEnd: '2026-08-01T00:00:00Z',
  nextDueDate: '2026-08-01T00:00:00Z',
  version: '2026-07-30T00:00:00Z',
  invoices: [
    {
      id: 'invoice-id',
      providerPaymentId: 'remote-payment',
      status: 2 as const,
      value: 99.9,
      currency: 'BRL',
      dueDate: '2026-07-20T00:00:00Z',
      paidAt: '2026-07-19T00:00:00Z',
    },
  ],
};
const mockedDetail = vi.mocked(adminSubscriptionService.detail);
const mockedChangePlan = vi.mocked(adminSubscriptionService.changePlan);
const mockedSuspend = vi.mocked(adminSubscriptionService.suspend);
const mockedReactivate = vi.mocked(adminSubscriptionService.reactivate);

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/admin/subscriptions/subscription-id?tenantId=tenant-a']}>
      <Routes>
        <Route path="/admin/subscriptions/:id" element={<AdminSubscriptionDetailView />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminSubscriptionDetailView', () => {
  beforeEach(() => {
    catalogPlans.length = 0;
    mockedDetail.mockResolvedValue(detail);
  });

  it('loads detail with mandatory tenant, renders invoice read-only and exposes no overrides', async () => {
    renderDetail();
    await waitFor(() =>
      expect(mockedDetail).toHaveBeenCalledWith(
        'subscription-id',
        'tenant-a',
        expect.any(AbortSignal)
      )
    );
    expect(await screen.findByText('remote-payment')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /change plan|alterar plano|cambiar plan/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /mark.*paid|marcar.*paga|edit.*invoice|delete/i })
    ).not.toBeInTheDocument();
  });

  it('blocks a detail request when tenant context is absent', () => {
    render(
      <MemoryRouter initialEntries={['/admin/subscriptions/subscription-id']}>
        <Routes>
          <Route path="/admin/subscriptions/:id" element={<AdminSubscriptionDetailView />} />
        </Routes>
      </MemoryRouter>
    );
    expect(mockedDetail).not.toHaveBeenCalled();
    expect(screen.getByText(/tenant/i)).toBeInTheDocument();
  });

  it('replaces the visible plan name and code using the confirmed catalog price', async () => {
    const user = userEvent.setup();
    catalogPlans.push({
      planId: 'new-plan',
      code: 'NEW',
      name: 'New Commercial Plan',
      description: '',
      status: 'active',
      displayOrder: 1,
      isFeatured: false,
      trialDays: 0,
      features: [],
      prices: [
        {
          planPriceId: 'new-price',
          code: 'NEW-MONTHLY',
          currency: 'BRL',
          value: 149.9,
          billingCycle: 'monthly',
          status: 'active',
        },
      ],
    });
    mockedChangePlan.mockResolvedValue({
      subscriptionId: 'subscription-id',
      tenantId: 'tenant-a',
      status: 3,
      planId: 'new-plan',
      planPriceId: 'new-price',
      nextDueDate: detail.nextDueDate,
      version: '2026-07-30T01:00:00Z',
    });
    renderDetail();
    await user.click(
      await screen.findByRole('button', { name: /change plan|alterar plano|cambiar plan/i })
    );
    await user.click(
      screen.getByRole('combobox', {
        name: /active plan price|preço ativo|precio activo/i,
      })
    );
    await user.click(await screen.findByRole('option', { name: /New Commercial Plan/i }));
    await user.type(screen.getByRole('textbox', { name: /reason|motivo/i }), 'approved change');
    await user.click(screen.getByRole('button', { name: /confirm|confirmar/i }));
    expect(await screen.findByText(/New Commercial Plan · NEW/)).toBeInTheDocument();
    expect(screen.queryByText(/Professional · PRO/)).not.toBeInTheDocument();
  });

  it.each([7, 8] as const)('does not offer suspension for terminal status %s', async (status) => {
    mockedDetail.mockResolvedValueOnce({ ...detail, status });
    renderDetail();
    expect(
      await screen.findByRole('button', {
        name: /suspend subscription|suspender assinatura|suspender suscripción/i,
      })
    ).toBeDisabled();
  });

  it('wires suspension to the reversible endpoint result and replaces visible status/version', async () => {
    const user = userEvent.setup();
    mockedSuspend.mockResolvedValue({
      subscriptionId: detail.id,
      tenantId: detail.tenantId,
      status: 6,
      planId: detail.planId,
      planPriceId: detail.planPriceId,
      nextDueDate: detail.nextDueDate,
      version: 'suspended-version',
    });
    renderDetail();
    await user.click(
      await screen.findByRole('button', {
        name: /suspend subscription|suspender assinatura|suspender suscripción/i,
      })
    );
    await user.type(screen.getByRole('textbox', { name: /reason|motivo/i }), 'support case');
    await user.click(screen.getByRole('button', { name: /confirm|confirmar/i }));
    await waitFor(() =>
      expect(mockedSuspend).toHaveBeenCalledWith(
        detail.id,
        expect.objectContaining({
          tenantId: detail.tenantId,
          expectedVersion: detail.version,
          reason: 'support case',
          idempotencyKey: expect.any(String),
        })
      )
    );
    expect(await screen.findByText('suspended-version')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /reactivate subscription|reativar assinatura|reactivar suscripción/i,
      })
    ).toBeEnabled();
    expect(
      screen.getByRole('button', {
        name: /suspend subscription|suspender assinatura|suspender suscripción/i,
      })
    ).toBeDisabled();
  });

  it('serializes a future reactivation date as UTC and replaces visible status/version', async () => {
    const user = userEvent.setup();
    mockedDetail.mockResolvedValueOnce({ ...detail, status: 6 });
    mockedReactivate.mockResolvedValue({
      subscriptionId: detail.id,
      tenantId: detail.tenantId,
      status: 3,
      planId: detail.planId,
      planPriceId: detail.planPriceId,
      nextDueDate: '2099-08-01T15:30:00.000Z',
      version: 'reactivated-version',
    });
    renderDetail();
    await user.click(
      await screen.findByRole('button', {
        name: /reactivate subscription|reativar assinatura|reactivar suscripción/i,
      })
    );
    await user.type(
      screen.getByLabelText(/next due date|próximo vencimento|próximo vencimiento/i),
      '2099-08-01T12:30'
    );
    await user.type(screen.getByRole('textbox', { name: /reason|motivo/i }), 'support case');
    await user.click(screen.getByRole('button', { name: /confirm|confirmar/i }));
    await waitFor(() => expect(mockedReactivate).toHaveBeenCalledOnce());
    const command = mockedReactivate.mock.calls[0][1];
    expect(command.nextDueDate).toMatch(/^2099-08-01T\d{2}:30:00\.000Z$/);
    expect(new Date(command.nextDueDate).toISOString()).toBe(command.nextDueDate);
    expect(await screen.findByText('reactivated-version')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /suspend subscription|suspender assinatura|suspender suscripción/i,
      })
    ).toBeEnabled();
    expect(
      screen.getByRole('button', {
        name: /reactivate subscription|reativar assinatura|reactivar suscripción/i,
      })
    ).toBeDisabled();
  });
});

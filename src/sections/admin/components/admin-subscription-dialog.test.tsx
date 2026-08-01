import { AxiosError, AxiosHeaders } from 'axios';
import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { AdminSubscriptionDialog } from './admin-subscription-dialog';

const FIRST_KEY = '00000000-0000-4000-8000-000000000001';
const SECOND_KEY = '00000000-0000-4000-8000-000000000002';
const subscription = {
  id: 'subscription-id',
  tenantId: 'tenant-a',
  planId: 'plan-id',
  planPriceId: 'price-id',
  planName: 'Plan',
  planCode: 'PLAN',
  status: 3 as const,
  provider: 'Asaas',
  providerSubscriptionId: 'remote',
  providerCustomerId: 'customer',
  latestInvoiceStatus: null,
  currentPeriodStart: '2026-07-01T00:00:00Z',
  currentPeriodEnd: '2026-08-01T00:00:00Z',
  nextDueDate: '2026-08-01T00:00:00Z',
  version: '2026-07-30T10:00:00Z',
  invoices: [],
};
const result = {
  subscriptionId: 'subscription-id',
  tenantId: 'tenant-a',
  status: 6 as const,
  planId: 'plan-id',
  planPriceId: 'price-id',
  nextDueDate: '2026-08-01T00:00:00Z',
  version: '2026-07-30T11:00:00Z',
};

function httpError(status: number) {
  const error = new AxiosError(`status-${status}`);
  error.response = {
    status,
    statusText: 'Failure',
    data: { message: `status-${status}` },
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

function renderDialog(
  onSubmit: (
    action: 'plan' | 'suspend' | 'reactivate',
    payload: {
      tenantId: string;
      expectedVersion: string;
      reason: string;
      planPriceId?: string;
      proration?: 1 | 2;
      nextDueDate?: string;
    },
    idempotencyKey: string
  ) => Promise<typeof result>,
  onConflict = vi.fn()
) {
  return {
    onConflict,
    ...render(
      <AdminSubscriptionDialog
        open
        action="suspend"
        subscription={subscription}
        plans={[]}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        onConflict={onConflict}
      />
    ),
  };
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, reason = 'support case') {
  await user.type(screen.getByRole('textbox', { name: /reason|motivo/i }), reason);
  await user.click(screen.getByRole('button', { name: /confirm|confirmar/i }));
}

describe('AdminSubscriptionDialog idempotent intention', () => {
  beforeEach(() => {
    vi.spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce(FIRST_KEY)
      .mockReturnValueOnce(SECOND_KEY);
  });

  it.each([
    ['network', new AxiosError('Network Error')],
    ['502', httpError(502)],
  ])('retries %s with the same key and byte-equivalent payload', async (_, failure) => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce(result);
    renderDialog(onSubmit);
    await fillAndSubmit(user);
    await user.click(
      await screen.findByRole('button', { name: /retry same|tentar a mesma|reintentar/i })
    );
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[0][2]).toBe(FIRST_KEY);
    expect(onSubmit.mock.calls[1][2]).toBe(FIRST_KEY);
    expect(onSubmit.mock.calls[1][1]).toEqual(onSubmit.mock.calls[0][1]);
  });

  it('discards an uncertain intention before payload editing and creates a new key', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new AxiosError('Network Error'))
      .mockResolvedValueOnce(result);
    renderDialog(onSubmit);
    await fillAndSubmit(user);
    await user.click(
      await screen.findByRole('button', { name: /discard|descartar|cambiar intención/i })
    );
    const reason = screen.getByRole('textbox', { name: /reason|motivo/i });
    await user.clear(reason);
    await user.type(reason, 'changed commercial request');
    await user.click(screen.getByRole('button', { name: /confirm|confirmar/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[0][2]).toBe(FIRST_KEY);
    expect(onSubmit.mock.calls[1][2]).toBe(SECOND_KEY);
    expect(onSubmit.mock.calls[1][1]).not.toEqual(onSubmit.mock.calls[0][1]);
  });

  it('invalidates a 409, refreshes through the consumer and offers no retry', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(httpError(409));
    const { onConflict } = renderDialog(onSubmit);
    await fillAndSubmit(user);
    await waitFor(() => expect(onConflict).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole('button', { name: /retry same|tentar a mesma|reintentar/i })
    ).not.toBeInTheDocument();
  });

  it('locks the commercial fields while the submitted snapshot is in flight', async () => {
    const user = userEvent.setup();
    let resolve!: (value: typeof result) => void;
    const pending = new Promise<typeof result>((done) => {
      resolve = done;
    });
    const onSubmit = vi.fn().mockReturnValue(pending);
    renderDialog(onSubmit);
    await fillAndSubmit(user);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(screen.getByRole('textbox', { name: /reason|motivo/i })).toBeDisabled();
    resolve(result);
  });

  it('recovers an unavailable catalog inline and enables active price selection after reload', async () => {
    const user = userEvent.setup();
    const onReloadPlans = vi.fn().mockResolvedValue(undefined);
    const onSubmit = vi.fn().mockResolvedValue(result);
    const props = {
      open: true,
      action: 'plan' as const,
      subscription,
      plans: [],
      plansError: true,
      onClose: vi.fn(),
      onSubmit,
      onConflict: vi.fn(),
      onReloadPlans,
    };
    const { rerender } = render(<AdminSubscriptionDialog {...props} />);
    const priceSelect = screen.getByRole('combobox', {
      name: /active plan price|preço ativo|precio activo/i,
    });
    expect(priceSelect).toHaveAttribute('aria-disabled', 'true');
    await user.click(
      screen.getByRole('button', {
        name: /loading prices again|carregar preços novamente|cargar precios de nuevo/i,
      })
    );
    expect(onReloadPlans).toHaveBeenCalledOnce();
    rerender(
      <AdminSubscriptionDialog
        {...props}
        plansError={false}
        plans={[
          {
            planId: 'plan-id',
            code: 'PRO',
            name: 'Professional',
            description: '',
            status: 'active',
            displayOrder: 1,
            isFeatured: false,
            trialDays: 0,
            features: [],
            prices: [
              {
                planPriceId: 'price-id',
                code: 'MONTHLY',
                currency: 'BRL',
                value: 99,
                billingCycle: 'monthly',
                status: 'active',
              },
            ],
          },
        ]}
      />
    );
    expect(
      screen.getByRole('combobox', {
        name: /active plan price|preço ativo|precio activo/i,
      })
    ).not.toHaveAttribute('aria-disabled', 'true');
  });
});

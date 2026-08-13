import { vi, it, expect, describe, beforeEach } from 'vitest';
import { Route, Routes, MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';

import { ThemeProvider } from 'src/theme';
import { adminOperationsService } from 'src/services/admin/adminOperationsService';

import { AdminOperationsView } from './admin-operations-view';

vi.mock('src/services/admin/adminOperationsService', () => ({
  adminOperationsService: {
    getDashboard: vi.fn(),
    searchEvents: vi.fn(),
    eventDetail: vi.fn(),
    reprocess: vi.fn(),
  },
}));

const dashboard = {
  calculatedAtUtc: '2026-01-02T00:00:00Z',
  failureWindow: { startUtc: '2026-01-01T00:00:00Z', endUtc: '2026-01-02T00:00:00Z' },
  tenantsByStatus: [],
  usersByRole: [],
  patientCount: 1,
  subscriptionsByStatus: [],
  failedWebhookCount: 2,
  failedEmailCount: 3,
};
const item = {
  id: 'event-id',
  source: 'Webhook' as const,
  tenantId: 'tenant-id',
  type: 'Delivery',
  status: 'Failed',
  attemptCount: 2,
  occurredAtUtc: '2026-01-01T00:00:00Z',
  lastAttemptAtUtc: null,
  completedAtUtc: null,
  errorSummary: 'safe',
  correlationId: 'correlation',
};

function conflictError() {
  const error = new AxiosError('conflict');
  error.response = {
    status: 409,
    statusText: 'Conflict',
    data: { message: 'conflict' },
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

function renderView(url: string) {
  return render(
    <ThemeProvider defaultMode="light">
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/admin/operations" element={<AdminOperationsView />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('AdminOperationsView URL state', () => {
  beforeEach(() => {
    vi.mocked(adminOperationsService.getDashboard).mockResolvedValue(dashboard);
    vi.mocked(adminOperationsService.searchEvents).mockResolvedValue({
      items: [item],
      currentPage: 2,
      pageSize: 25,
      totalPages: 2,
      totalCount: 30,
    });
    vi.mocked(adminOperationsService.eventDetail).mockResolvedValue({
      ...item,
      safeMetadata: { url: 'https://example.test' },
    });
  });

  it('restores filters, paging and selected drawer from a shared URL', async () => {
    const user = userEvent.setup();
    renderView(
      '/admin/operations?source=Webhook&tenantId=tenant-id&page=2&pageSize=25&eventId=event-id&eventSource=Webhook'
    );
    await waitFor(() =>
      expect(adminOperationsService.searchEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'Webhook',
          tenantId: 'tenant-id',
          page: 2,
          pageSize: 25,
        }),
        expect.any(AbortSignal)
      )
    );
    expect(
      await screen.findByRole('heading', { name: /event.*detail|detalhe.*evento/i })
    ).toBeInTheDocument();
    expect(adminOperationsService.eventDetail).toHaveBeenCalledWith(
      'Webhook',
      'event-id',
      expect.any(AbortSignal)
    );
    expect(screen.getByRole('button', { name: /reprocess/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /close event|fechar detalhe|cerrar detalle/i })
    ).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: /event.*detail|detalhe.*evento/i })
      ).not.toBeInTheDocument()
    );
  });

  it('blocks invalid ranges before dashboard or event requests', () => {
    renderView(
      '/admin/operations?startUtc=2026-01-01T00%3A00%3A00.000Z&endUtc=2026-05-01T00%3A00%3A00.000Z'
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/90/);
    expect(adminOperationsService.getDashboard).not.toHaveBeenCalled();
    expect(adminOperationsService.searchEvents).not.toHaveBeenCalled();
  });

  it('renders a 409 reprocessing conflict as warning rather than success', async () => {
    const user = userEvent.setup();
    vi.mocked(adminOperationsService.reprocess).mockRejectedValue(conflictError());
    renderView('/admin/operations?eventId=event-id&eventSource=Webhook&page=2&pageSize=25');
    await user.click(await screen.findByRole('button', { name: /reprocess/i }));
    expect(screen.getByRole('dialog', { name: /reprocess/i })).toBeInTheDocument();
    const reason = screen.getByRole('textbox');
    expect(reason).toHaveFocus();
    await user.type(reason, 'Investigate conflict');
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveClass('MuiAlert-colorWarning');
    expect(alert).not.toHaveClass('MuiAlert-colorSuccess');
    expect(adminOperationsService.reprocess).toHaveBeenCalledOnce();
  });
});
import { AxiosError, AxiosHeaders } from 'axios';
import userEvent from '@testing-library/user-event';

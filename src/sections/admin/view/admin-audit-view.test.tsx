import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Route, Routes, useLocation, MemoryRouter } from 'react-router-dom';

import { ThemeProvider } from 'src/theme';
import { adminOperationsService } from 'src/services/admin/adminOperationsService';

import { AdminAuditView } from './admin-audit-view';

vi.mock('src/services/admin/adminOperationsService', () => ({
  adminOperationsService: { searchAudit: vi.fn() },
}));

const event = {
  id: 'audit-id',
  administratorId: '00000000-0000-4000-8000-000000000001',
  action: 'User.Block',
  targetType: 'User',
  targetId: 'user-id',
  tenantId: 'tenant-id',
  reason: 'security review',
  beforeState: { removed: 'old', changed: 'old', same: 'value' },
  afterState: { added: 'new', changed: 'new', same: 'value' },
  occurredAtUtc: '2026-01-02T00:00:00Z',
  ipAddress: '127.0.0.1',
  correlationId: 'correlation-id',
};

function LocationProbe() {
  return <output aria-label="current URL">{useLocation().search}</output>;
}

function renderView(url: string) {
  return render(
    <ThemeProvider defaultMode="light">
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route
            path="/admin/audit"
            element={
              <>
                <AdminAuditView />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('AdminAuditView', () => {
  beforeEach(() => {
    vi.mocked(adminOperationsService.searchAudit).mockResolvedValue({
      items: [event],
      currentPage: 2,
      pageSize: 25,
      totalPages: 3,
      totalCount: 60,
    });
  });

  it('hydrates every filter and paging value from the URL with an exact request', async () => {
    renderView(
      '/admin/audit?administratorId=00000000-0000-4000-8000-000000000001&action=User.Block&targetType=User&targetId=user-id&tenantId=tenant-id&startUtc=2026-01-01T00%3A00%3A00.000Z&endUtc=2026-02-01T00%3A00%3A00.000Z&page=2&pageSize=25'
    );
    await waitFor(() =>
      expect(adminOperationsService.searchAudit).toHaveBeenCalledWith(
        {
          administratorId: '00000000-0000-4000-8000-000000000001',
          action: 'User.Block',
          targetType: 'User',
          targetId: 'user-id',
          tenantId: 'tenant-id',
          startUtc: '2026-01-01T00:00:00.000Z',
          endUtc: '2026-02-01T00:00:00.000Z',
          page: 2,
          pageSize: 25,
        },
        expect.any(AbortSignal)
      )
    );
  });

  it('writes server pagination to the URL and requests the next page', async () => {
    const user = userEvent.setup();
    renderView('/admin/audit?page=2&pageSize=25');
    await screen.findByText('User.Block');
    await user.click(
      screen.getByRole('button', { name: /next page|próxima página|siguiente página/i })
    );
    await waitFor(() =>
      expect(adminOperationsService.searchAudit).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 3, pageSize: 25 }),
        expect.any(AbortSignal)
      )
    );
    expect(screen.getByLabelText('current URL')).toHaveTextContent('page=3');
  });

  it.each([
    [
      '/admin/audit?startUtc=2026-01-01T00%3A00%3A00.000Z&endUtc=2026-05-01T00%3A00%3A00.000Z',
      /90/,
    ],
    [
      '/admin/audit?startUtc=2026-02-01T00%3A00%3A00.000Z&endUtc=2026-01-01T00%3A00%3A00.000Z',
      /end|fim|fin/i,
    ],
  ])('blocks an invalid range before requesting: %s', (url, message) => {
    renderView(url);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(adminOperationsService.searchAudit).not.toHaveBeenCalled();
  });

  it('opens and closes a URL-driven drawer with accessible diff semantics', async () => {
    const user = userEvent.setup();
    renderView('/admin/audit?page=2&pageSize=25');
    await user.click(await screen.findByRole('button', { name: event.administratorId }));
    expect(
      await screen.findByRole('heading', { name: /audit.*detail|detalhe.*auditoria/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('current URL')).toHaveTextContent('auditId=audit-id');
    const labels = {
      added: /added|adicionado|agregado/i,
      removed: /removed|removido|eliminado/i,
      changed: /changed|alterado|modificado/i,
      unchanged: /unchanged|sem alteração|sin cambios/i,
    };
    for (const [kind, label] of Object.entries(labels)) {
      expect(document.querySelector(`[data-diff-kind="${kind}"]`)).toHaveTextContent(label);
    }
    await user.click(
      screen.getByRole('button', { name: /close audit|fechar detalhe|cerrar detalle/i })
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: /audit.*detail|detalhe.*auditoria/i })
      ).not.toBeInTheDocument()
    );
    expect(screen.getByLabelText('current URL')).not.toHaveTextContent('auditId');
  });
});

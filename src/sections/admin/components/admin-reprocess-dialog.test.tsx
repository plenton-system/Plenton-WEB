import { AxiosError, AxiosHeaders } from 'axios';
import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { AdminReprocessDialog } from './admin-reprocess-dialog';

const KEY = '00000000-0000-4000-8000-000000000001';

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
  onSubmit: (payload: { idempotencyKey: string; reason: string }) => Promise<AdminReprocessOutcome>,
  onConflict = vi.fn()
) {
  return render(
    <AdminReprocessDialog
      open
      onClose={vi.fn()}
      onConflict={onConflict}
      onSubmit={onSubmit}
      onSuccess={vi.fn()}
    />
  );
}

describe('AdminReprocessDialog', () => {
  beforeEach(() => vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(KEY));

  it('preserves the exact UUID and reason after a network retry', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new AxiosError('Network Error'))
      .mockResolvedValueOnce({ result: {}, replayed: true });
    renderDialog(onSubmit);
    await user.type(screen.getByRole('textbox'), 'Investigate delivery failure');
    await user.click(screen.getByRole('button', { name: /confirm|confirmar/i }));
    await user.click(await screen.findByRole('button', { name: /retry|repetir/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      idempotencyKey: KEY,
      reason: 'Investigate delivery failure',
    });
    expect(onSubmit.mock.calls[1][0]).toEqual(onSubmit.mock.calls[0][0]);
  });

  it('does not retry a 409 and requests refreshed confirmation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(httpError(409));
    const onConflict = vi.fn();
    renderDialog(onSubmit, onConflict);
    await user.type(screen.getByRole('textbox'), 'Investigate conflict');
    await user.click(screen.getByRole('button', { name: /confirm|confirmar/i }));
    await waitFor(() => expect(onConflict).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
import type { AdminReprocessOutcome } from 'src/types/admin';

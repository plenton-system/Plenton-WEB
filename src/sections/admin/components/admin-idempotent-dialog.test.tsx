import { AxiosError, AxiosHeaders } from 'axios';
import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { AdminIdempotentActionDialog } from './admin-dialogs';

const FIRST_KEY = '00000000-0000-4000-8000-000000000001';
const SECOND_KEY = '00000000-0000-4000-8000-000000000002';

function httpError(status: number) {
  const error = new AxiosError(`Request failed with status code ${status}`);
  error.response = {
    status,
    statusText: 'Failure',
    data: { message: `status-${status}` },
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

function networkError() {
  return new AxiosError('Network Error');
}

function renderDialog(
  onSubmit: (payload: { action: string }, key: string) => Promise<void>,
  onError = vi.fn()
) {
  const props = {
    open: true,
    title: 'Idempotent action',
    payload: { action: 'retry' },
    onClose: vi.fn(),
    onSubmit,
    onError,
  };
  const view = render(
    <AdminIdempotentActionDialog {...props}>
      <div>payload</div>
    </AdminIdempotentActionDialog>
  );
  return { ...view, props };
}

describe('AdminIdempotentActionDialog', () => {
  beforeEach(() => {
    vi.spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce(FIRST_KEY)
      .mockReturnValueOnce(SECOND_KEY);
  });

  it.each([
    ['network failure', networkError()],
    ['502 provider uncertainty', httpError(502)],
  ])('preserves the key when retrying a %s', async (_, failure) => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(failure);
    renderDialog(onSubmit);
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    await user.click(await screen.findByRole('button', { name: /try again|tentar novamente/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[0][1]).toBe(FIRST_KEY);
    expect(onSubmit.mock.calls[1][1]).toBe(FIRST_KEY);
  });

  it('invalidates a 409 intention and requires close/new confirmation before submitting again', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValueOnce(httpError(409)).mockResolvedValueOnce(undefined);
    const onError = vi.fn();
    const { rerender, props } = renderDialog(onSubmit, onError);

    await user.click(screen.getByRole('button', { name: /confirm/i }));
    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ kind: 'conflict' }))
    );
    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    rerender(
      <AdminIdempotentActionDialog {...props} open={false}>
        <div>payload</div>
      </AdminIdempotentActionDialog>
    );
    rerender(
      <AdminIdempotentActionDialog {...props} open>
        <div>payload</div>
      </AdminIdempotentActionDialog>
    );
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[0][1]).toBe(FIRST_KEY);
    expect(onSubmit.mock.calls[1][1]).toBe(SECOND_KEY);
  });
});

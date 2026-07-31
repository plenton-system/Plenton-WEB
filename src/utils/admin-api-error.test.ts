import { it, expect, describe } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

import { mapAdminApiError } from './admin-api-error';

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

describe('administrative API error mapping', () => {
  it.each([
    [400, 'validation', false],
    [401, 'authentication', false],
    [403, 'authorization', false],
    [404, 'notFound', false],
    [409, 'conflict', false],
    [502, 'providerUncertain', true],
  ] as const)('maps HTTP %i to %s', (status, kind, retryable) => {
    expect(mapAdminApiError(httpError(status))).toMatchObject({ status, kind, retryable });
  });

  it('maps a request without response as a retryable network failure', () => {
    const error = new AxiosError('Network Error');
    expect(mapAdminApiError(error)).toMatchObject({ kind: 'network', retryable: true });
  });
});

import type { ApiErrorKind, AdminApiError } from 'src/types/admin';

import axios from 'axios';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';

const kindByStatus: Partial<Record<number, ApiErrorKind>> = {
  400: 'validation',
  401: 'authentication',
  403: 'authorization',
  404: 'notFound',
  409: 'conflict',
  502: 'providerUncertain',
};

export function mapAdminApiError(error: unknown): AdminApiError {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const kind = status
    ? (kindByStatus[status] ?? 'unknown')
    : axios.isAxiosError(error)
      ? 'network'
      : 'unknown';
  const data = axios.isAxiosError(error) ? error.response?.data : undefined;
  const fieldErrors =
    data && typeof data === 'object' && 'errors' in data && !Array.isArray(data.errors)
      ? (data.errors as Record<string, string[]>)
      : undefined;

  return {
    kind,
    status,
    fieldErrors,
    message: extractApiErrorMessage(error, i18n.t(`admin.errors.${kind}`)),
    retryable: kind === 'network' || kind === 'providerUncertain',
  };
}

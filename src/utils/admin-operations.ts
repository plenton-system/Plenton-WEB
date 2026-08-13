const MAX_RANGE_MS = 90 * 24 * 60 * 60 * 1000;

export type UtcRangeValidation = 'missingPair' | 'invalid' | 'reversed' | 'tooLong' | null;

export function localDateTimeToUtc(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function utcToLocalInput(value: string | undefined) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const part = (item: number) => String(item).padStart(2, '0');
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;
}

export function validateUtcRange(
  start: string | undefined,
  end: string | undefined
): UtcRangeValidation {
  if (!!start !== !!end) return 'missingPair';
  if (!start && !end) return null;
  const startTime = new Date(start!).getTime();
  const endTime = new Date(end!).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return 'invalid';
  if (endTime < startTime) return 'reversed';
  if (endTime - startTime > MAX_RANGE_MS) return 'tooLong';
  return null;
}

export function isEventReprocessable(status: string) {
  return status.toLowerCase() === 'failed';
}

const OPERATIONAL_STATUS_TONES: Record<string, AdminStatus> = {
  failed: 'error',
  error: 'error',
  completed: 'success',
  processed: 'success',
  sent: 'success',
  delivered: 'success',
  success: 'success',
  pending: 'warning',
  queued: 'warning',
  processing: 'info',
  inprogress: 'info',
  ignored: 'neutral',
};

export function operationalStatusTone(status: string): AdminStatus {
  return OPERATIONAL_STATUS_TONES[status.replace(/[\s_-]/g, '').toLowerCase()] ?? 'neutral';
}

export type DiffKind = 'added' | 'removed' | 'changed' | 'unchanged';

export function auditDiffKind(
  before: unknown,
  after: unknown,
  hasBefore: boolean,
  hasAfter: boolean
): DiffKind {
  if (!hasBefore) return 'added';
  if (!hasAfter) return 'removed';
  return JSON.stringify(before) === JSON.stringify(after) ? 'unchanged' : 'changed';
}
import type { AdminStatus } from 'src/types/admin';

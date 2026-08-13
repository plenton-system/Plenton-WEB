import { it, expect, describe } from 'vitest';

import {
  auditDiffKind,
  utcToLocalInput,
  validateUtcRange,
  localDateTimeToUtc,
  isEventReprocessable,
  operationalStatusTone,
} from './admin-operations';

describe('admin operations rules', () => {
  it('blocks incomplete, reversed and longer than 90-day UTC ranges before a request', () => {
    expect(validateUtcRange('2026-01-01T00:00:00Z', undefined)).toBe('missingPair');
    expect(validateUtcRange('2026-02-01T00:00:00Z', '2026-01-01T00:00:00Z')).toBe('reversed');
    expect(validateUtcRange('2026-01-01T00:00:00Z', '2026-04-02T00:00:00Z')).toBe('tooLong');
    expect(validateUtcRange('2026-01-01T00:00:00Z', '2026-04-01T00:00:00Z')).toBeNull();
  });

  it('permits reprocessing only for failed events', () => {
    expect(isEventReprocessable('Failed')).toBe(true);
    expect(isEventReprocessable('Completed')).toBe(false);
    expect(isEventReprocessable('Processing')).toBe(false);
  });

  it.each([
    ['Failed', 'error'],
    ['Error', 'error'],
    ['Processed', 'success'],
    ['Sent', 'success'],
    ['Completed', 'success'],
    ['Delivered', 'success'],
    ['Success', 'success'],
    ['Pending', 'warning'],
    ['Queued', 'warning'],
    ['Processing', 'info'],
    ['InProgress', 'info'],
    ['in-progress', 'info'],
    ['Ignored', 'neutral'],
    ['unexpected', 'neutral'],
  ])('maps operational status %s to %s without optimistic fallback', (status, tone) => {
    expect(operationalStatusTone(status)).toBe(tone);
  });

  it('round-trips the administrator local date while sending a UTC instant', () => {
    const local = '2026-02-03T14:25';
    expect(utcToLocalInput(localDateTimeToUtc(local))).toBe(local);
  });

  it('classifies every accessible state-diff semantic', () => {
    expect(auditDiffKind(undefined, 'new', false, true)).toBe('added');
    expect(auditDiffKind('old', undefined, true, false)).toBe('removed');
    expect(auditDiffKind('old', 'new', true, true)).toBe('changed');
    expect(auditDiffKind('same', 'same', true, true)).toBe('unchanged');
  });
});

import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useIdempotentIntention } from './use-idempotent-intention';

const FIRST_KEY = '00000000-0000-4000-8000-000000000001';
const SECOND_KEY = '00000000-0000-4000-8000-000000000002';

describe('useIdempotentIntention', () => {
  beforeEach(() => {
    vi.spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce(FIRST_KEY)
      .mockReturnValueOnce(SECOND_KEY);
  });

  it('reuses a key for the same semantic payload and creates a new key when it changes', () => {
    const { result } = renderHook(() => useIdempotentIntention());
    let first = '';
    let retry = '';
    let changed = '';
    act(() => {
      first = result.current.begin({ reason: 'retry', nested: { b: 2, a: 1 } });
      retry = result.current.begin({ nested: { a: 1, b: 2 }, reason: 'retry' });
      changed = result.current.begin({ reason: 'changed', nested: { a: 1, b: 2 } });
    });
    expect(first).toBe(FIRST_KEY);
    expect(retry).toBe(FIRST_KEY);
    expect(changed).toBe(SECOND_KEY);
  });

  it('creates a new key after an intention is explicitly discarded', () => {
    const { result } = renderHook(() => useIdempotentIntention());
    let first = '';
    let next = '';
    act(() => {
      first = result.current.begin({ action: 'suspend' });
      result.current.discard();
      next = result.current.begin({ action: 'suspend' });
    });
    expect(first).toBe(FIRST_KEY);
    expect(next).toBe(SECOND_KEY);
  });
});

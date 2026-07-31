import { useRef, useCallback } from 'react';

export function createIntentionKey() {
  return crypto.randomUUID();
}

function normalizePayload(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizePayload);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalizePayload(item)])
    );
  }
  return value;
}

export function payloadSignature(payload: unknown) {
  return JSON.stringify(normalizePayload(payload));
}

export function useIdempotentIntention() {
  const intentionRef = useRef<{ key: string; signature: string } | null>(null);
  const begin = useCallback((payload: unknown) => {
    const signature = payloadSignature(payload);
    if (intentionRef.current?.signature !== signature) {
      intentionRef.current = { key: createIntentionKey(), signature };
    }
    return intentionRef.current.key;
  }, []);
  const discard = useCallback(() => {
    intentionRef.current = null;
  }, []);

  return { begin, discard, current: () => intentionRef.current?.key ?? null };
}

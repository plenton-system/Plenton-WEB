import { it, vi, expect, describe, beforeEach } from 'vitest';

import { post } from 'src/utils/http-client';

import { HttpAuthState } from 'src/services/api';

import { authService } from './authService';

vi.mock('src/utils/http-client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('src/services/api', () => ({
  HttpAuthState: {
    setAccessToken: vi.fn(),
    setLoggingOut: vi.fn(),
  },
  abortAllRequests: vi.fn(),
  registerRefreshExecutor: vi.fn(),
}));

vi.mock('src/utils/auth-storage', () => ({
  authStorage: {
    clear: vi.fn(),
  },
}));

const mockedPost = vi.mocked(post);
const mockedSetAccessToken = vi.mocked(HttpAuthState.setAccessToken);

describe('authService refresh single-flight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shares one request between concurrent refresh callers', async () => {
    let resolveRequest!: (value: { accessToken: string }) => void;
    mockedPost.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    const firstRefresh = authService.refresh();
    const secondRefresh = authService.refresh();

    expect(firstRefresh).toBe(secondRefresh);
    expect(mockedPost).toHaveBeenCalledOnce();

    resolveRequest({ accessToken: 'rotated-access-token' });

    await expect(Promise.all([firstRefresh, secondRefresh])).resolves.toEqual([
      'rotated-access-token',
      'rotated-access-token',
    ]);
    expect(mockedSetAccessToken).toHaveBeenCalledOnce();
  });

  it('allows a new request after the active refresh settles', async () => {
    mockedPost
      .mockResolvedValueOnce({ accessToken: 'first-access-token' })
      .mockResolvedValueOnce({ accessToken: 'second-access-token' });

    await expect(authService.refresh()).resolves.toBe('first-access-token');
    await expect(authService.refresh()).resolves.toBe('second-access-token');

    expect(mockedPost).toHaveBeenCalledTimes(2);
  });

  it('clears the single-flight promise after a failure', async () => {
    mockedPost
      .mockRejectedValueOnce(new Error('refresh failed'))
      .mockResolvedValueOnce({ accessToken: 'recovered-access-token' });

    await expect(authService.refresh()).rejects.toThrow('refresh failed');
    await expect(authService.refresh()).resolves.toBe('recovered-access-token');

    expect(mockedPost).toHaveBeenCalledTimes(2);
  });
});

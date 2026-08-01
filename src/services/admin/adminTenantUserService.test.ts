import { vi, it, expect, describe, beforeEach } from 'vitest';

import { get, post } from 'src/utils/http-client';

import { adminUserService, adminTenantService } from 'src/services/admin/adminTenantUserService';

vi.mock('src/utils/http-client', () => ({ get: vi.fn(), post: vi.fn() }));

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(post);
const ok = <T>(data: T) => ({ data, message: '', status: 200, isSuccess: true });
const userTransition = {
  id: 'u1',
  email: 'safe@test.dev',
  tenantId: 'tenant-a',
  roles: ['Patient'],
  emailConfirmed: false,
  lockoutEnabled: true,
  lockoutEndUtc: null,
  isLocked: true,
  concurrencyStamp: 'stamp-new',
  changed: true,
  revokedSessionCount: 0,
};

describe('administrative tenant and user services', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps tenant URL filters to the exact API query names', async () => {
    mockedGet.mockResolvedValue(
      ok({ items: [], currentPage: 2, pageSize: 25, totalPages: 0, totalCount: 0 })
    );
    await adminTenantService.search({
      query: 'ana',
      status: 'Suspended',
      page: 2,
      pageSize: 25,
    });
    expect(mockedGet).toHaveBeenCalledWith(
      '/api/admin/tenants',
      expect.objectContaining({
        params: { Query: 'ana', Status: 'Suspended', Page: 2, PageSize: 25 },
      })
    );
  });

  it('preserves tenant deep-link and boolean user filters', async () => {
    mockedGet.mockResolvedValue(
      ok({ items: [], currentPage: 1, pageSize: 10, totalPages: 0, totalCount: 0 })
    );
    await adminUserService.search({
      tenantId: 'tenant-a',
      role: 'Patient',
      isLocked: false,
      emailConfirmed: true,
      page: 1,
      pageSize: 10,
    });
    expect(mockedGet).toHaveBeenCalledWith(
      '/api/admin/users',
      expect.objectContaining({
        params: expect.objectContaining({
          TenantId: 'tenant-a',
          Role: 'Patient',
          IsLocked: false,
          EmailConfirmed: true,
        }),
      })
    );
  });

  it.each([
    ['block', '/api/admin/users/u1/block'],
    ['unblock', '/api/admin/users/u1/unblock'],
    ['revokeSessions', '/api/admin/users/u1/sessions/revoke'],
  ] as const)('sends the visible stamp and reason for %s', async (method, url) => {
    mockedPost.mockResolvedValue(ok(userTransition));
    await adminUserService[method]('u1', {
      reason: 'support case',
      concurrencyStamp: 'stamp-visible',
    });
    expect(mockedPost).toHaveBeenCalledOnce();
    expect(mockedPost).toHaveBeenCalledWith(url, {
      reason: 'support case',
      concurrencyStamp: 'stamp-visible',
    });
  });

  it.each([1, 2] as const)('exposes only supported resend flow %s', async (flow) => {
    mockedPost.mockResolvedValue(ok(userTransition));
    await adminUserService.resendAccess('u1', {
      flow,
      reason: 'support case',
      concurrencyStamp: 'stamp-visible',
    });
    expect(mockedPost).toHaveBeenCalledWith('/api/admin/users/u1/access/resend', {
      flow,
      reason: 'support case',
      concurrencyStamp: 'stamp-visible',
    });
  });

  it.each([
    ['suspend', '/api/admin/tenants/tenant-a/suspend'],
    ['reactivate', '/api/admin/tenants/tenant-a/reactivate'],
  ] as const)('sends the captured tenant stamp for %s', async (method, url) => {
    mockedPost.mockResolvedValue(
      ok({
        identifier: 'tenant-a',
        status: method === 'suspend' ? 'Suspended' : 'Active',
        concurrencyStamp: 'stamp-new',
        updatedAtUtc: '2026-07-30T12:00:00Z',
        suspensionReason: null,
        suspendedAtUtc: null,
        reactivatedAtUtc: null,
        changed: true,
      })
    );
    await adminTenantService[method]('tenant-a', {
      reason: 'support case',
      concurrencyStamp: 'stamp-visible',
    });
    expect(mockedPost).toHaveBeenCalledWith(url, {
      reason: 'support case',
      concurrencyStamp: 'stamp-visible',
    });
  });

  it('does not retry a stale-stamp conflict', async () => {
    mockedPost.mockRejectedValueOnce(new Error('conflict'));
    await expect(
      adminTenantService.suspend('tenant-a', { reason: 'case', concurrencyStamp: 'stale' })
    ).rejects.toThrow('conflict');
    expect(mockedPost).toHaveBeenCalledOnce();
  });
});

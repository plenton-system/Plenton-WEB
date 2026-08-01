import type { User } from 'src/types';
import type { AdminUserDetail } from 'src/types/admin';

import axios, { AxiosHeaders } from 'axios';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { Route, Routes, MemoryRouter } from 'react-router-dom';

import { useAuth } from 'src/hooks/common/use-auth';
import { useAdminResource } from 'src/hooks/admin/use-admin-resource';

import { adminUserService } from 'src/services/admin/adminTenantUserService';

import { AdminUserDetailView } from './admin-user-detail-view';

vi.mock('src/hooks/common/use-auth', () => ({ useAuth: vi.fn() }));
vi.mock('src/hooks/admin/use-admin-resource', () => ({ useAdminResource: vi.fn() }));
vi.mock('src/services/admin/adminTenantUserService', () => ({
  adminUserService: {
    detail: vi.fn(),
    block: vi.fn(),
    unblock: vi.fn(),
    revokeSessions: vi.fn(),
    resendAccess: vi.fn(),
  },
}));
vi.mock('../components/admin-shared', () => ({
  AdminPageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  AdminErrorState: () => <div>error</div>,
  AdminLoadingState: () => <div>loading</div>,
  AdminStatusBadge: ({ label }: { label: string }) => <span>{label}</span>,
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedResource = vi.mocked(useAdminResource);
const mockedBlock = vi.mocked(adminUserService.block);
const refetch = vi.fn();
const detail: AdminUserDetail = {
  id: 'target',
  name: 'Target',
  email: 'target@test.dev',
  tenantId: 'tenant',
  roles: ['Patient'],
  emailConfirmed: false,
  lockoutEnabled: true,
  lockoutEndUtc: null,
  isLocked: false,
  concurrencyStamp: 'stamp',
};
const admin: User = {
  id: 'admin',
  name: 'Admin',
  email: 'admin@test.dev',
  tenantId: 'tenant',
  role: 'Admin',
};

function renderView() {
  return render(
    <MemoryRouter initialEntries={['/admin/users/target']}>
      <Routes>
        <Route path="/admin/users/:id" element={<AdminUserDetailView />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminUserDetailView action eligibility', () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      user: admin,
      isAuthenticated: true,
      loading: false,
      authenticating: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    mockedResource.mockReturnValue({
      data: detail,
      setData: vi.fn(),
      error: null,
      setError: vi.fn(),
      loading: false,
      refetch,
    });
  });

  it('hides commands against the authenticated user', () => {
    mockedUseAuth.mockReturnValue({
      ...mockedUseAuth(),
      user: { ...admin, id: 'target' },
    });
    renderView();
    expect(screen.getByText(/your own account/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /block user/i })).not.toBeInTheDocument();
  });

  it('hides commands against another administrator', () => {
    mockedResource.mockReturnValue({
      ...mockedResource(() => Promise.resolve(detail), ''),
      data: { ...detail, roles: ['Admin'] },
    });
    renderView();
    expect(screen.getByText(/administrative accounts/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /revoke sessions/i })).not.toBeInTheDocument();
  });

  it('shows only patient activation when an unconfirmed patient is eligible', () => {
    renderView();
    expect(screen.getByRole('button', { name: /resend activation/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /password recovery/i })).not.toBeInTheDocument();
  });

  it('refreshes once on conflict, never retries, and requires a new confirmation', async () => {
    const user = userEvent.setup();
    mockedBlock.mockRejectedValueOnce(
      new axios.AxiosError('conflict', '409', undefined, undefined, {
        status: 409,
        data: {},
        statusText: 'Conflict',
        headers: {},
        config: { headers: new AxiosHeaders() },
      })
    );
    renderView();
    await user.click(screen.getByRole('button', { name: /block user/i }));
    expect(
      screen.getByText(/the user will lose access and their sessions will be revoked/i)
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText(/reason/i), 'support reason');
    await user.click(screen.getByRole('button', { name: /^confirm$/i }));
    expect(mockedBlock).toHaveBeenCalledOnce();
    expect(refetch).toHaveBeenCalledOnce();
    expect(screen.getByText(/review the new data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^confirm$/i })).toBeDisabled();
  });
});

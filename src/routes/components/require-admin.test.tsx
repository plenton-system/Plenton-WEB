import type { User } from 'src/types';
import type { AuthContextType } from 'src/contexts/auth-context';

import { useEffect } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { screen, render } from '@testing-library/react';
import { Route, Routes, useLocation, MemoryRouter } from 'react-router-dom';

import { useAuth } from 'src/hooks/common/use-auth';

import { RequireAdmin } from './require-admin';

vi.mock('src/hooks/common/use-auth', () => ({ useAuth: vi.fn() }));
vi.mock('src/sections/admin/view/forbidden-view', () => ({
  ForbiddenView: () => <div>forbidden-view</div>,
}));

const mockedUseAuth = vi.mocked(useAuth);
const baseUser: User = {
  id: 'user-id',
  email: 'admin@plenton.test',
  name: 'Admin',
  tenantId: 'tenant-id',
  role: 'Admin',
};

function authState(user: User | null): AuthContextType {
  return {
    user,
    isAuthenticated: !!user,
    loading: false,
    authenticating: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
}

function SignInProbe() {
  const location = useLocation();
  const from = location.state?.from;
  return <div>sign-in:{from?.pathname}</div>;
}

function AdminProbe({ onMount }: { onMount: () => void }) {
  useEffect(onMount, [onMount]);
  return <div>admin-content</div>;
}

function renderGuard(onMount = vi.fn()) {
  return {
    onMount,
    ...render(
      <MemoryRouter initialEntries={['/admin/operations']}>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <RequireAdmin>
                <AdminProbe onMount={onMount} />
              </RequireAdmin>
            }
          />
          <Route path="/sign-in" element={<SignInProbe />} />
        </Routes>
      </MemoryRouter>
    ),
  };
}

describe('RequireAdmin', () => {
  it('uses the existing authentication flow and preserves the anonymous destination', () => {
    mockedUseAuth.mockReturnValue(authState(null));
    const { onMount } = renderGuard();
    expect(screen.getByText('sign-in:/admin/operations')).toBeInTheDocument();
    expect(onMount).not.toHaveBeenCalled();
  });

  it('renders forbidden and never mounts administrative children for a non-admin', () => {
    mockedUseAuth.mockReturnValue(authState({ ...baseUser, role: 'Nutritionist' }));
    const { onMount } = renderGuard();
    expect(screen.getByText('forbidden-view')).toBeInTheDocument();
    expect(onMount).not.toHaveBeenCalled();
  });

  it.each<[string, string | string[]]>([
    ['string role', 'Admin'],
    ['array role', ['Nutritionist', 'Admin']],
  ])('allows an administrator with a %s', (_, role) => {
    mockedUseAuth.mockReturnValue(authState({ ...baseUser, role }));
    const { onMount } = renderGuard();
    expect(screen.getByText('admin-content')).toBeInTheDocument();
    expect(onMount).toHaveBeenCalledOnce();
  });
});

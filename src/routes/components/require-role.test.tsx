import type { User } from 'src/types';
import type { AuthContextType } from 'src/contexts/auth-context';

import { useEffect } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route, Routes, useLocation, MemoryRouter } from 'react-router-dom';

import { useAuth } from 'src/hooks/common/use-auth';

import { RequirePatient } from './require-patient';
import { RequireNutritionistOrAdmin } from './require-nutritionist-or-admin';

vi.mock('src/hooks/common/use-auth', () => ({ useAuth: vi.fn() }));

const mockedUseAuth = vi.mocked(useAuth);
const user: User = {
  id: 'id',
  email: 'user@test.dev',
  name: 'User',
  tenantId: 'tenant',
  role: 'Patient',
};

function authState(value: User | null): AuthContextType {
  return {
    user: value,
    isAuthenticated: Boolean(value),
    loading: false,
    authenticating: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
}

function LocationProbe() {
  const location = useLocation();
  return <div>location:{location.pathname}</div>;
}

function ProtectedProbe({ onMount }: { onMount: () => void }) {
  useEffect(onMount, [onMount]);
  return <div>protected</div>;
}

describe('role route guards', () => {
  it('redirects a Patient before professional content mounts', () => {
    mockedUseAuth.mockReturnValue(authState(user));
    const onMount = vi.fn();
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <RequireNutritionistOrAdmin>
                <ProtectedProbe onMount={onMount} />
              </RequireNutritionistOrAdmin>
            }
          />
          <Route path="/portal" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('location:/portal')).toBeInTheDocument();
    expect(onMount).not.toHaveBeenCalled();
  });

  it('redirects a Nutritionist away from the patient portal', () => {
    mockedUseAuth.mockReturnValue(authState({ ...user, role: 'Nutritionist' }));
    render(
      <MemoryRouter initialEntries={['/portal/meal-plan']}>
        <Routes>
          <Route
            path="/portal/*"
            element={
              <RequirePatient>
                <div>patient content</div>
              </RequirePatient>
            }
          />
          <Route path="/dashboard" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('location:/dashboard')).toBeInTheDocument();
    expect(screen.queryByText('patient content')).not.toBeInTheDocument();
  });

  it('preserves an anonymous portal destination for sign-in', () => {
    mockedUseAuth.mockReturnValue(authState(null));
    render(
      <MemoryRouter initialEntries={['/portal/meal-plan']}>
        <Routes>
          <Route
            path="/portal/*"
            element={
              <RequirePatient>
                <div>patient</div>
              </RequirePatient>
            }
          />
          <Route path="/sign-in" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('location:/sign-in')).toBeInTheDocument();
  });

  it('allows a multi-role user with the Patient claim into the portal', () => {
    mockedUseAuth.mockReturnValue(authState({ ...user, role: ['Nutritionist', 'Patient'] }));
    render(
      <MemoryRouter>
        <RequirePatient>
          <div>patient content</div>
        </RequirePatient>
      </MemoryRouter>
    );
    expect(screen.getByText('patient content')).toBeInTheDocument();
  });
});

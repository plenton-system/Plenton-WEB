import type { AuthContextType } from 'src/contexts/auth-context';

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useAuth } from 'src/hooks/common/use-auth';
import { usePatientAccount } from 'src/hooks/patient-portal/use-patient-account';

import i18n from 'src/i18n';

import { PatientAccountView } from './patient-account-view';

vi.mock('src/hooks/common/use-auth', () => ({ useAuth: vi.fn() }));
vi.mock('src/hooks/patient-portal/use-patient-account', () => ({ usePatientAccount: vi.fn() }));
vi.mock('../components/patient-account-settings', () => ({
  PatientAccountSettings: () => <div>settings</div>,
}));

const authState: AuthContextType = {
  user: {
    id: 'patient',
    email: 'patient@test.dev',
    name: 'Paciente',
    tenantId: 'tenant',
    role: 'Patient',
    profile: { id: 'patient', photo: '', status: 'Active', phone: '11999999999' },
  },
  isAuthenticated: true,
  loading: false,
  authenticating: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
};

describe('PatientAccountView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    void i18n.changeLanguage('pt-BR');
    vi.mocked(useAuth).mockReturnValue(authState);
  });

  it('keeps account settings and nutritionist visible when profile loading fails', async () => {
    const retryProfile = vi.fn();
    vi.mocked(usePatientAccount).mockReturnValue({
      profile: { data: null, loading: false, error: true, unavailable: false },
      nutritionist: {
        data: { name: 'Dra. Ana' },
        loading: false,
        error: false,
        unavailable: false,
      },
      retryProfile,
      retryNutritionist: vi.fn(),
    });
    const user = userEvent.setup();
    render(<PatientAccountView />);
    expect(screen.getByText('settings')).toBeInTheDocument();
    expect(screen.getByText('Dra. Ana')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retryProfile).toHaveBeenCalledOnce();
  });

  it('uses the authenticated read-only profile when self-service is unavailable', () => {
    vi.mocked(usePatientAccount).mockReturnValue({
      profile: { data: null, loading: false, error: false, unavailable: true },
      nutritionist: { data: null, loading: false, error: false, unavailable: false },
      retryProfile: vi.fn(),
      retryNutritionist: vi.fn(),
    });
    render(<PatientAccountView />);
    expect(screen.getByText(/patient@test.dev/)).toBeInTheDocument();
    expect(screen.getByText(/11999999999/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument();
  });
});

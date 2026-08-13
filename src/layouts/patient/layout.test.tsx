import type { User } from 'src/types';
import type { AuthContextType } from 'src/contexts/auth-context';

import { MemoryRouter } from 'react-router';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { useAuth } from 'src/hooks/common/use-auth';
import { usePatientAccount } from 'src/hooks/patient-portal/use-patient-account';

import i18n from 'src/i18n';

import { PatientLayout } from './layout';

vi.mock('src/hooks/common/use-auth', () => ({ useAuth: vi.fn() }));
vi.mock('src/hooks/patient-portal/use-patient-account', () => ({ usePatientAccount: vi.fn() }));
vi.mock('src/hooks/patient-portal/use-patient-preferences', () => ({
  PatientPreferencesProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('src/sections/patient-portal/components/patient-account-settings', () => ({
  PatientAccountSettings: () => <div>preferências</div>,
}));
vi.mock('src/layouts/dashboard', () => ({
  DashboardLayout: ({
    children,
    navigation,
    slotProps,
  }: {
    children: React.ReactNode;
    navigation: Array<{ title: string; path: string }>;
    slotProps: { header: { slots: { rightArea: React.ReactNode } } };
  }) => (
    <div>
      <nav>
        {navigation.map((item) => (
          <a key={item.path} href={item.path}>
            {item.title}
          </a>
        ))}
      </nav>
      {slotProps.header.slots.rightArea}
      <main>{children}</main>
    </div>
  ),
}));

const patient: User = {
  id: 'patient',
  email: 'patient@test.dev',
  name: 'Paciente',
  tenantId: 'tenant',
  role: 'Patient',
};

beforeEach(() => i18n.changeLanguage('pt-BR'));

it('renders only Patient navigation and accessible account/session actions', async () => {
  const signOut = vi.fn();
  vi.mocked(useAuth).mockReturnValue({
    user: patient,
    isAuthenticated: true,
    loading: false,
    authenticating: false,
    signIn: vi.fn(),
    signOut,
  } satisfies AuthContextType);
  vi.mocked(usePatientAccount).mockReturnValue({
    profile: { data: null, loading: false, error: false, unavailable: true },
    nutritionist: {
      data: { name: 'Dra. Ana' },
      loading: false,
      error: false,
      unavailable: false,
    },
    saving: false,
    saveError: false,
    retryProfile: vi.fn(),
    retryNutritionist: vi.fn(),
    updateProfile: vi.fn(),
  });
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <PatientLayout>
        <p>portal content</p>
      </PatientLayout>
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: 'patientPortal.nav.home' })).toHaveAttribute(
    'href',
    '/portal'
  );
  expect(screen.queryByRole('link', { name: /minha conta/i })).not.toBeInTheDocument();
  expect(screen.queryByText(/assinatura|cobrança|pacientes|anamnesis/i)).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /perfil/i }));
  expect(screen.queryByRole('menuitem', { name: /meu nutricionista/i })).not.toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: /minha conta/i })).toBeInTheDocument();
  await user.click(screen.getByRole('menuitem', { name: /minha conta/i }));
  expect(screen.getByRole('dialog', { name: /minha conta/i })).toBeInTheDocument();
  expect(screen.getByText('Dra. Ana')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /fechar/i }));

  await user.click(screen.getByRole('button', { name: /perfil/i }));
  await user.click(screen.getByRole('menuitem', { name: /sair/i }));
  expect(signOut).toHaveBeenCalledOnce();
});

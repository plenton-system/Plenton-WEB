import type { AuthContextType } from 'src/contexts/auth-context';

import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { useAuth } from 'src/hooks/common/use-auth';
import { usePatientPreferences } from 'src/hooks/patient-portal/use-patient-preferences';

import i18n from 'src/i18n';
import { authService } from 'src/services';

import { PatientAccountSettings } from './patient-account-settings';

vi.mock('src/hooks/common/use-auth', () => ({ useAuth: vi.fn() }));
vi.mock('src/hooks/patient-portal/use-patient-preferences', () => ({
  usePatientPreferences: vi.fn(),
}));
vi.mock('src/services', () => ({ authService: { changePassword: vi.fn() } }));

describe('PatientAccountSettings', () => {
  const signOut = vi.fn();
  const update = vi.fn().mockResolvedValue(true);

  beforeEach(() => {
    vi.clearAllMocks();
    void i18n.changeLanguage('pt-BR');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: true,
      loading: false,
      authenticating: false,
      signIn: vi.fn(),
      signOut,
    } satisfies AuthContextType);
    vi.mocked(usePatientPreferences).mockReturnValue({
      preferences: { theme: 'system', preferredLanguage: 'pt-BR' },
      loading: false,
      saving: false,
      readFallback: false,
      writeError: false,
      unavailable: false,
      update,
    });
  });

  it('offers only generic Patient preferences and session controls', async () => {
    const user = userEvent.setup();
    render(<PatientAccountSettings />);
    expect(screen.getByRole('combobox', { name: /tema padrão/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /idioma/i })).toBeInTheDocument();
    expect(
      screen.queryByText(/assinatura|cobrança|biometria|sincronização|anamnese/i)
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: /tema padrão/i }));
    await user.click(screen.getByRole('option', { name: 'Escuro' }));
    expect(update).toHaveBeenCalledWith({ theme: 'dark', preferredLanguage: 'pt-BR' });
    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(signOut).toHaveBeenCalledOnce();
  });

  it('reuses password change and clears secret fields after success', async () => {
    vi.mocked(authService.changePassword).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<PatientAccountSettings />);
    await user.click(screen.getByRole('button', { name: 'Alterar senha' }));
    const current = screen.getByLabelText('Senha atual');
    const next = screen.getByLabelText('Nova senha');
    const confirmation = screen.getByLabelText('Confirmar nova senha');
    await user.type(current, 'old-secret');
    await user.type(next, 'new-secret');
    await user.type(confirmation, 'new-secret');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(authService.changePassword).toHaveBeenCalledOnce());
    await waitFor(() => expect(current).toHaveValue(''));
    expect(next).toHaveValue('');
    expect(confirmation).toHaveValue('');
  });
});

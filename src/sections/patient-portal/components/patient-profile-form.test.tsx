import type { PatientSelfProfile } from 'src/types/domain/patient-portal';

import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import i18n from 'src/i18n';

import { PatientProfileForm } from './patient-profile-form';

const profile: PatientSelfProfile = {
  id: 'patient',
  name: 'Paciente Teste',
  email: 'patient@test.dev',
  document: '12345678900',
  status: 'Active',
  phone: '11999999999',
  profilePhoto: '',
  address: {
    street: 'Rua Verde',
    number: '10',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01000-000',
  },
};

beforeEach(() => i18n.changeLanguage('pt-BR'));

it('keeps protected fields read-only and submits only the self-service allowlist', async () => {
  const onSave = vi.fn().mockResolvedValue(true);
  const user = userEvent.setup();
  render(<PatientProfileForm profile={profile} saving={false} saveError={false} onSave={onSave} />);

  expect(screen.getByLabelText('Nome')).toBeDisabled();
  expect(screen.getByLabelText('E-mail')).toBeDisabled();
  expect(screen.queryByLabelText(/documento|status|nascimento|gênero/i)).not.toBeInTheDocument();

  const phone = screen.getByLabelText('Telefone');
  await user.clear(phone);
  await user.type(phone, '11888888888');
  await user.click(screen.getByRole('button', { name: 'Salvar' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce());

  expect(onSave).toHaveBeenCalledWith({
    phone: '11888888888',
    profilePhoto: '',
    addressDto: profile.address,
  });
  expect(JSON.stringify(onSave.mock.calls)).not.toMatch(/document|status|birthDate|gender|tenant/i);
});

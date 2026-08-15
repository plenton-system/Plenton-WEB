import type { PatientSelfProfile } from 'src/types/domain/patient-portal';

import { it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

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
};

beforeEach(() => i18n.changeLanguage('pt-BR'));

it('renders the patient profile as read-only without a save action', () => {
  render(<PatientProfileForm profile={profile} />);

  expect(screen.getByLabelText('Nome')).toBeDisabled();
  expect(screen.getByLabelText('E-mail')).toBeDisabled();
  expect(screen.getByLabelText('Telefone')).toBeDisabled();
  expect(screen.queryByLabelText(/documento|status|nascimento|gênero/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Salvar' })).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Foto do perfil')).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/rua|número|bairro|cidade|estado|cep/i)).not.toBeInTheDocument();
});

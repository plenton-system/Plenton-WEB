import type { PatientSelfProfile } from 'src/types/domain/patient-portal';

import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export function PatientProfileForm({ profile }: { profile: PatientSelfProfile }) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <TextField label={t('patientPortal.account.name')} value={profile.name ?? ''} disabled />
      <TextField label={t('patientPortal.account.email')} value={profile.email ?? ''} disabled />
      <TextField label={t('patientPortal.account.phone')} value={profile.phone} disabled />
    </Stack>
  );
}

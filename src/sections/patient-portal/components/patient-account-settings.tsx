import type { ChangePasswordFormValues } from 'src/layouts/components/change-password-dialog';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useAuth } from 'src/hooks/common/use-auth';
import { usePatientPreferences } from 'src/hooks/patient-portal/use-patient-preferences';

import { authService } from 'src/services';
import { SUPPORTED_LANGUAGES } from 'src/i18n';
import { ChangePasswordDialog } from 'src/layouts/components/change-password-dialog';

import { CapabilityUnavailable } from './remote-state';

export function PatientAccountSettings() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const state = usePatientPreferences();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const changePassword = useCallback(
    async (values: ChangePasswordFormValues) => {
      setPasswordLoading(true);
      setPasswordFeedback(null);
      try {
        await authService.changePassword(values);
        setPasswordFeedback({ type: 'success', message: t('profile.password.success') });
        return true;
      } catch (error) {
        setPasswordFeedback({
          type: 'error',
          message: error instanceof Error ? error.message : t('profile.password.error'),
        });
        return false;
      } finally {
        setPasswordLoading(false);
      }
    },
    [t]
  );

  return (
    <Stack spacing={2}>
      {state.unavailable && <CapabilityUnavailable />}
      {state.readFallback && (
        <Alert severity="warning">{t('patientPortal.account.preferenceFallback')}</Alert>
      )}
      {state.writeError && (
        <Alert severity="error">{t('patientPortal.account.preferenceWriteError')}</Alert>
      )}
      <TextField
        select
        label={t('settings.defaultTheme')}
        value={state.preferences.theme}
        disabled={state.loading || state.saving}
        onChange={(event) =>
          void state.update({
            ...state.preferences,
            theme: event.target.value as 'light' | 'dark' | 'system',
          })
        }
      >
        <MenuItem value="system">{t('settings.theme.system')}</MenuItem>
        <MenuItem value="light">{t('settings.theme.light')}</MenuItem>
        <MenuItem value="dark">{t('settings.theme.dark')}</MenuItem>
      </TextField>
      <TextField
        select
        label={t('patientPortal.account.language')}
        value={state.preferences.preferredLanguage}
        disabled={state.loading || state.saving}
        onChange={(event) =>
          void state.update({
            ...state.preferences,
            preferredLanguage: event.target.value as 'pt-BR' | 'en-US' | 'es',
          })
        }
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <MenuItem key={language} value={language}>
            {t(`patientPortal.languages.${language}`)}
          </MenuItem>
        ))}
      </TextField>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="outlined" onClick={() => setPasswordOpen(true)}>
          {t('profile.password.title')}
        </Button>
        <Button color="error" variant="outlined" onClick={() => void signOut()}>
          {t('profile.menu.signOut')}
        </Button>
      </Stack>
      <ChangePasswordDialog
        open={passwordOpen}
        loading={passwordLoading}
        feedback={passwordFeedback}
        onClose={() => {
          setPasswordOpen(false);
          setPasswordFeedback(null);
        }}
        onSubmit={changePassword}
      />
    </Stack>
  );
}

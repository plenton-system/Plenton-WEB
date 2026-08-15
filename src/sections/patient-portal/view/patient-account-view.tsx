import { useTranslation } from 'react-i18next';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useAuth } from 'src/hooks/common/use-auth';
import { usePatientAccount } from 'src/hooks/patient-portal/use-patient-account';

import { DashboardContent } from 'src/layouts/dashboard';

import { NutritionistCard } from '../components/nutritionist-card';
import { PatientProfileForm } from '../components/patient-profile-form';
import { PatientAccountSettings } from '../components/patient-account-settings';
import { PortalError, PortalLoading, CapabilityUnavailable } from '../components/remote-state';

export function PatientAccountView() {
  const { t } = useTranslation();
  const state = usePatientAccount();

  return (
    <DashboardContent maxWidth="lg">
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        {t('patientPortal.account.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {t('patientPortal.account.subtitle')}
      </Typography>
      <PatientAccountContent state={state} />
    </DashboardContent>
  );
}

type AccountState = ReturnType<typeof usePatientAccount>;

export function PatientAccountContent({ state }: { state: AccountState }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card component="section" aria-labelledby="profile-heading">
              <CardContent>
                <Typography id="profile-heading" variant="h6" sx={{ mb: 2 }}>
                  {t('patientPortal.account.profile')}
                </Typography>
                {state.profile.loading ? (
                  <PortalLoading />
                ) : state.profile.error ? (
                  <PortalError onRetry={() => void state.retryProfile()} />
                ) : state.profile.unavailable || !state.profile.data ? (
                  <>
                    <CapabilityUnavailable />
                    <Typography sx={{ mt: 2 }}>
                      <strong>{t('patientPortal.account.name')}:</strong> {user?.name}
                    </Typography>
                    <Typography>
                      <strong>{t('patientPortal.account.email')}:</strong> {user?.email}
                    </Typography>
                    {user?.profile?.phone && (
                      <Typography>
                        <strong>{t('patientPortal.account.phone')}:</strong> {user.profile.phone}
                      </Typography>
                    )}
                  </>
                ) : (
                  <PatientProfileForm profile={state.profile.data} />
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <NutritionistCard
              {...state.nutritionist}
              onRetry={() => void state.retryNutritionist()}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card component="section" aria-labelledby="settings-heading">
          <CardContent>
            <Typography id="settings-heading" variant="h6" sx={{ mb: 2 }}>
              {t('patientPortal.account.settings')}
            </Typography>
            <PatientAccountSettings />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

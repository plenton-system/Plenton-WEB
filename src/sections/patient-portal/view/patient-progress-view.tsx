import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';

import { RouterLink } from 'src/routes/components';

import { usePatientProgress } from 'src/hooks/patient-portal/use-patient-progress';

import { derivePatientProgress } from 'src/utils/patient-progress';

import { DashboardContent } from 'src/layouts/dashboard';

import { Chart, useChart } from 'src/components/chart';

import { PortalEmpty, PortalError, PortalLoading } from '../components/remote-state';

export function PatientProgressView() {
  const { t, i18n } = useTranslation();
  const { evolution, retryEvolution } = usePatientProgress();
  const number = useMemo(
    () => new Intl.NumberFormat(i18n.resolvedLanguage),
    [i18n.resolvedLanguage]
  );
  const date = useMemo(
    () => new Intl.DateTimeFormat(i18n.resolvedLanguage, { day: '2-digit', month: 'short' }),
    [i18n.resolvedLanguage]
  );

  const { weightPoints, measurements, leanMass, fatMass, hasRenderableData } =
    derivePatientProgress(evolution.data);

  const weightOptions = useChart({
    xaxis: {
      categories: weightPoints.map((point) => date.format(new Date(point.evaluationDateUtc))),
    },
    yaxis: { labels: { formatter: (value) => `${number.format(value)} kg` } },
    tooltip: { y: { formatter: (value) => `${number.format(value)} kg` } },
    markers: { size: 5, shape: 'circle' },
    legend: { show: true, position: 'top' },
  });

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        {t('patientPortal.progress.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {t('patientPortal.progress.subtitle')}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          {evolution.loading ? (
            <PortalLoading />
          ) : evolution.error ? (
            <PortalError onRetry={() => void retryEvolution()} />
          ) : !hasRenderableData ? (
            <PortalEmpty
              title={t('patientPortal.progress.emptyTitle')}
              description={t('patientPortal.progress.emptyDescription')}
              action={
                <Button component={RouterLink} href="/portal/meal-plan" variant="contained">
                  {t('patientPortal.progress.openMealPlan')}
                </Button>
              }
            />
          ) : (
            <Grid container spacing={3}>
              {weightPoints.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Card component="section" aria-labelledby="weight-chart-title">
                    <CardHeader
                      id="weight-chart-title"
                      title={t('patientPortal.progress.weight')}
                    />
                    <CardContent>
                      <Box aria-hidden="true">
                        <Chart
                          type="line"
                          series={[
                            {
                              name: t('patientPortal.progress.weight'),
                              data: weightPoints.map((point) => point.value),
                            },
                          ]}
                          options={weightOptions}
                          sx={{ height: 320 }}
                        />
                      </Box>
                      <TableContainer sx={{ mt: 2 }}>
                        <Table size="small" aria-label={t('patientPortal.progress.weightTable')}>
                          <TableHead>
                            <TableRow>
                              <TableCell>{t('patientPortal.progress.date')}</TableCell>
                              <TableCell align="right">
                                {t('patientPortal.progress.weightValue')}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {weightPoints.map((point) => (
                              <TableRow key={`${point.evaluationId}-${point.evaluationDateUtc}`}>
                                <TableCell>
                                  {date.format(new Date(point.evaluationDateUtc))}
                                </TableCell>
                                <TableCell align="right">{number.format(point.value)} kg</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {measurements.length > 0 && (
                <Grid size={{ xs: 12, md: 7 }}>
                  <Card component="section" sx={{ height: 1 }}>
                    <CardHeader title={t('patientPortal.progress.measurements')} />
                    <CardContent>
                      <TableContainer>
                        <Table
                          size="small"
                          aria-label={t('patientPortal.progress.measurementsTable')}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell>{t('patientPortal.progress.metric')}</TableCell>
                              <TableCell>{t('patientPortal.progress.initial')}</TableCell>
                              <TableCell>{t('patientPortal.progress.current')}</TableCell>
                              <TableCell>{t('patientPortal.progress.change')}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {measurements.map((measurement) => (
                              <TableRow key={measurement.metric}>
                                <TableCell>
                                  {t(`patientPortal.metrics.${measurement.metric}`, {
                                    defaultValue: measurement.metric,
                                  })}
                                </TableCell>
                                <TableCell>{number.format(measurement.initialValue)} cm</TableCell>
                                <TableCell>{number.format(measurement.finalValue)} cm</TableCell>
                                <TableCell>
                                  {measurement.delta == null
                                    ? t('patientPortal.progress.notAvailable')
                                    : `${measurement.delta > 0 ? '+' : ''}${number.format(measurement.delta)} cm`}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {(leanMass != null || fatMass != null) && (
                <Grid size={{ xs: 12, md: 5 }}>
                  <Card component="section" sx={{ height: 1 }}>
                    <CardHeader title={t('patientPortal.progress.composition')} />
                    <CardContent>
                      <Grid container spacing={2}>
                        {leanMass != null && (
                          <Grid size={{ xs: 6 }}>
                            <Typography color="text.secondary">
                              {t('patientPortal.progress.leanMass')}
                            </Typography>
                            <Typography variant="h5">{number.format(leanMass)} kg</Typography>
                          </Grid>
                        )}
                        {fatMass != null && (
                          <Grid size={{ xs: 6 }}>
                            <Typography color="text.secondary">
                              {t('patientPortal.progress.fatMass')}
                            </Typography>
                            <Typography variant="h5">{number.format(fatMass)} kg</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

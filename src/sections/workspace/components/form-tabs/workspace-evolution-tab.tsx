import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';

import { useWorkspaceAnthropometricEvolution } from 'src/hooks/workspace/use-workspace-anthropometric-evolution';

import { fNumber } from 'src/utils/format-number';
import { fDateTimeLocale } from 'src/utils/format-time';

import { Loading } from 'src/components/loading';
import { Iconify } from 'src/components/iconify';

type Props = {
  patientId?: string;
};

const METRIC_LABELS = {
  Weight: 'workspace.evolution.metrics.weight',
  Height: 'workspace.evolution.metrics.height',
  BMI: 'workspace.evolution.metrics.bmi',
  BodyFatPercentage: 'workspace.evolution.metrics.bodyFat',
  LeanMass: 'workspace.evolution.metrics.leanMass',
  FatMass: 'workspace.evolution.metrics.fatMass',
  AbdominalCircumference: 'workspace.evolution.metrics.abdominal',
  HipCircumference: 'workspace.evolution.metrics.hip',
  RightRelaxedArmCircumference: 'workspace.evolution.metrics.rightRelaxedArm',
  LeftRelaxedArmCircumference: 'workspace.evolution.metrics.leftRelaxedArm',
  RightFlexedArmCircumference: 'workspace.evolution.metrics.rightFlexedArm',
  LeftFlexedArmCircumference: 'workspace.evolution.metrics.leftFlexedArm',
  RightForearmCircumference: 'workspace.evolution.metrics.rightForearm',
  LeftForearmCircumference: 'workspace.evolution.metrics.leftForearm',
  RightWristCircumference: 'workspace.evolution.metrics.rightWrist',
  LeftWristCircumference: 'workspace.evolution.metrics.leftWrist',
  NeckCircumference: 'workspace.evolution.metrics.neck',
  ShoulderCircumference: 'workspace.evolution.metrics.shoulder',
  ChestCircumference: 'workspace.evolution.metrics.chest',
  WaistCircumference: 'workspace.evolution.metrics.waist',
  RightCalfCircumference: 'workspace.evolution.metrics.rightCalf',
  LeftCalfCircumference: 'workspace.evolution.metrics.leftCalf',
  RightThighCircumference: 'workspace.evolution.metrics.rightThigh',
  LeftThighCircumference: 'workspace.evolution.metrics.leftThigh',
  RightProximalThighCircumference: 'workspace.evolution.metrics.rightProximalThigh',
  LeftProximalThighCircumference: 'workspace.evolution.metrics.leftProximalThigh',
} as const;

const SUMMARY_FIELDS = [
  { key: 'weightDelta', labelKey: 'workspace.evolution.metrics.weight', unit: 'kg' },
  { key: 'bmiDelta', labelKey: 'workspace.evolution.metrics.bmi', unit: '' },
  { key: 'bodyFatPercentageDelta', labelKey: 'workspace.evolution.metrics.bodyFat', unit: '%' },
  { key: 'leanMassDelta', labelKey: 'workspace.evolution.metrics.leanMass', unit: 'kg' },
  { key: 'fatMassDelta', labelKey: 'workspace.evolution.metrics.fatMass', unit: 'kg' },
  { key: 'waistCircumferenceDelta', labelKey: 'workspace.evolution.metrics.waist', unit: 'cm' },
] as const;

const formatMetricValue = (value?: number | null, unit?: string | null, decimals = 1) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return `${fNumber(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${unit ? ` ${unit}` : ''}`;
};

const formatDelta = (value?: number | null, unit?: string | null) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${fNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}${unit ? ` ${unit}` : ''}`;
};

const getMetricUnit = (metric: string) => {
  if (metric === 'Weight' || metric === 'LeanMass' || metric === 'FatMass') return 'kg';
  if (metric === 'Height') return 'm';
  if (metric === 'BMI') return '';
  if (metric === 'BodyFatPercentage') return '%';
  return 'cm';
};

const getDeltaDirection = (value?: number | null) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value === 0) return 'stable' as const;
  return value > 0 ? ('up' as const) : ('down' as const);
};

export function WorkspaceEvolutionTab({ patientId }: Props) {
  const { t } = useTranslation();
  const {
    options,
    selectedEvaluationIds,
    validationError,
    loadingOptions,
    loadingEvolution,
    optionsError,
    evolutionError,
    result,
    setSelectedEvaluationIds,
    fetchEvolution,
    refetchOptions,
  } = useWorkspaceAnthropometricEvolution(patientId);

  const selectedOptions = options.filter((option) => selectedEvaluationIds.includes(option.evaluationId));
  const getMetricLabel = (metric: string) => {
    const key = METRIC_LABELS[metric as keyof typeof METRIC_LABELS];
    return key ? t(key) : metric;
  };
  const directionChip = (direction?: 'up' | 'down' | 'stable' | null) => {
    if (direction === 'up') return { label: t('workspace.evolution.direction.up'), color: 'warning' as const };
    if (direction === 'down') return { label: t('workspace.evolution.direction.down'), color: 'success' as const };
    return { label: t('workspace.evolution.direction.stable'), color: 'default' as const };
  };

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h6">{t('workspace.evolution.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('workspace.evolution.description')}
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Autocomplete
            multiple
            options={options}
            value={selectedOptions}
            loading={loadingOptions}
            disabled={!patientId || loadingOptions}
            onChange={(_event, value) => setSelectedEvaluationIds(value.map((item) => item.evaluationId))}
            isOptionEqualToValue={(option, value) => option.evaluationId === value.evaluationId}
            getOptionLabel={(option) => option.label}
            noOptionsText={patientId ? t('workspace.evolution.noOptions') : t('workspace.evolution.selectPatient')}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('workspace.evolution.evaluations')}
                placeholder={t('workspace.evolution.placeholder')}
              />
            )}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <Button
              variant="contained"
              onClick={fetchEvolution}
              disabled={!patientId || loadingOptions || loadingEvolution}
              startIcon={loadingEvolution ? undefined : <Iconify icon="solar:restart-bold" />}
            >
              {loadingEvolution ? t('workspace.evolution.searching') : t('workspace.evolution.search')}
            </Button>

            <Typography variant="body2" color="text.secondary">
              {selectedEvaluationIds.length === 0
                ? t('workspace.evolution.noneSelected')
                : t('workspace.evolution.selected', { count: selectedEvaluationIds.length })}
            </Typography>
          </Stack>

          {optionsError ? (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={refetchOptions}>{t('shared.retry')}</Button>}>
              {optionsError}
            </Alert>
          ) : null}

          {validationError ? <Alert severity="warning">{validationError}</Alert> : null}

          {evolutionError ? <Alert severity="error">{evolutionError}</Alert> : null}
        </Stack>

        {loadingEvolution ? <Loading inline message={t('workspace.evolution.loading')} /> : null}

        {!loadingEvolution && result ? (
          <Stack spacing={3}>
            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle1">{t('workspace.evolution.period')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('workspace.evolution.periodDates', {
                  start: fDateTimeLocale(result.periodStartUtc),
                  end: fDateTimeLocale(result.periodEndUtc),
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('workspace.evolution.total', { count: result.totalEvaluations })}
              </Typography>
            </Stack>

            {result.summary ? (
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">{t('workspace.evolution.summary')}</Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                    }}
                  >
                    {SUMMARY_FIELDS.map((field) => (
                      <MetricBlock
                        key={field.key}
                        label={t(field.labelKey)}
                        value={formatDelta(result.summary?.[field.key], field.unit)}
                      />
                    ))}
                  </Box>
                </Stack>
              </Card>
            ) : (
              <Alert severity="info">{t('workspace.evolution.summaryUnavailable')}</Alert>
            )}

            <Stack spacing={2}>
              <Typography variant="subtitle1">{t('workspace.evolution.trends')}</Typography>

              {result.trends.map((trend) => {
                const chip = directionChip(getDeltaDirection(trend.delta));
                const unit = getMetricUnit(trend.metric);
                const metricPoints = result.points.filter((point) => point.metric === trend.metric);

                return (
                  <Card key={`${trend.metric}-${trend.initialValue}-${trend.finalValue}`} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ sm: 'center' }}
                        justifyContent="space-between"
                      >
                        <Typography variant="subtitle2">{getMetricLabel(trend.metric)}</Typography>
                        <Chip size="small" label={chip.label} color={chip.color} variant="outlined" />
                      </Stack>

                      <Box
                        sx={{
                          display: 'grid',
                          gap: 1.5,
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                        }}
                      >
                        <MetricBlock label={t('workspace.evolution.initialValue')} value={formatMetricValue(trend.initialValue, unit)} />
                        <MetricBlock label={t('workspace.evolution.finalValue')} value={formatMetricValue(trend.finalValue, unit)} />
                        <MetricBlock label={t('workspace.evolution.variation')} value={formatDelta(trend.delta, unit)} />
                      </Box>

                      {metricPoints.length ? (
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            {t('workspace.evolution.points')}
                          </Typography>
                          {metricPoints.map((point) => (
                            <Typography
                              key={`${point.metric}-${point.evaluationId}`}
                              variant="caption"
                              color="text.secondary"
                            >
                              {fDateTimeLocale(point.evaluationDateUtc)}: {formatMetricValue(point.value, unit)}
                            </Typography>
                          ))}
                        </Stack>
                      ) : null}
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}

type MetricBlockProps = {
  label: string;
  value: string;
};

function MetricBlock({ label, value }: MetricBlockProps) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

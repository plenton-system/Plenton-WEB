import type {
  EnergyCalculationGender,
  EnergyCalculationResult,
  WorkspaceAnthropometryProtocol,
} from 'src/types';

import { useTranslation } from 'react-i18next';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { EnergyExpenditureResultCard } from './energy-expenditure-result-card';

type EnergyFormValues = {
  protocol: WorkspaceAnthropometryProtocol;
  activityFactor: string;
};

type Props = {
  values: EnergyFormValues;
  onChange: <K extends keyof EnergyFormValues>(field: K, value: EnergyFormValues[K]) => void;
  result: EnergyCalculationResult | null;
  resultCalculatedAtUtc?: string | null;
  resultPersisted?: boolean;
  patientAgeYears?: number | null;
  patientGender?: EnergyCalculationGender | null;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  canCalculate: boolean;
  onCalculate: () => void;
};

const PROTOCOL_OPTIONS: Array<{ value: WorkspaceAnthropometryProtocol; label: string }> = [
  { value: 'MifflinStJeor', label: 'Mifflin St. Jeor' },
  { value: 'HarrisBenedict', label: 'Harris-Benedict' },
  { value: 'FaoOms', label: 'FAO/OMS' },
];

export function EnergyExpenditureSection({
  values,
  onChange,
  result,
  resultCalculatedAtUtc,
  resultPersisted = false,
  patientAgeYears,
  patientGender,
  loading = false,
  disabled = false,
  error,
  canCalculate,
  onCalculate,
}: Props) {
  const { t } = useTranslation();
  const activityOptions = [
    { value: '1.20', label: `1.20 · ${t('workspace.energy.activity.sedentary')}` },
    { value: '1.37', label: `1.37 · ${t('workspace.energy.activity.light')}` },
    { value: '1.55', label: `1.55 · ${t('workspace.energy.activity.moderate')}` },
    { value: '1.72', label: `1.72 · ${t('workspace.energy.activity.intense')}` },
    { value: '1.90', label: `1.90 · ${t('workspace.energy.activity.veryIntense')}` },
  ];

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle1">{t('workspace.energy.title')}</Typography>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label={t('workspace.energy.protocol')}
                value={values.protocol}
                onChange={(event) =>
                  onChange('protocol', event.target.value as WorkspaceAnthropometryProtocol)
                }
                disabled={disabled}
              >
                {PROTOCOL_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label={t('workspace.energy.activityFactor')}
                value={values.activityFactor}
                onChange={(event) => onChange('activityFactor', event.target.value)}
                disabled={disabled}
              >
                {activityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5} sx={{ height: '100%', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('workspace.energy.age', { age: patientAgeYears ?? '-' })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('workspace.energy.gender', {
                    gender:
                      patientGender === 'Male'
                        ? t('workspace.energy.male')
                        : patientGender === 'Female'
                          ? t('workspace.energy.female')
                          : '-',
                  })}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {!canCalculate ? (
            <Alert severity="info" variant="outlined">
              {t('workspace.energy.missingData')}
            </Alert>
          ) : null}

          {error ? (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          ) : null}

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onCalculate}
              disabled={disabled || loading || !canCalculate}
            >
              {loading ? t('workspace.energy.calculating') : t('workspace.energy.calculate')}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {result ? (
        <EnergyExpenditureResultCard
          result={result}
          calculatedAtUtc={resultCalculatedAtUtc}
          persisted={resultPersisted}
        />
      ) : null}
    </Stack>
  );
}

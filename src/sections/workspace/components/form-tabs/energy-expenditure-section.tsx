import type {
  EnergyCalculationGender,
  EnergyCalculationResult,
  WorkspaceAnthropometryProtocol,
} from 'src/types';

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

const ACTIVITY_OPTIONS = [
  { value: '1.20', label: '1.20 · Sedentário' },
  { value: '1.37', label: '1.37 · Leve' },
  { value: '1.55', label: '1.55 · Moderado' },
  { value: '1.72', label: '1.72 · Intenso' },
  { value: '1.90', label: '1.90 · Muito intenso' },
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
  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle1">Gasto energético</Typography>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Protocolo"
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
                label="Fator de atividade"
                value={values.activityFactor}
                onChange={(event) => onChange('activityFactor', event.target.value)}
                disabled={disabled}
              >
                {ACTIVITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5} sx={{ height: '100%', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Idade: {patientAgeYears ?? '-'} anos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sexo: {patientGender === 'Male' ? 'Masculino' : patientGender === 'Female' ? 'Feminino' : '-'}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {!canCalculate ? (
            <Alert severity="info" variant="outlined">
              Preencha peso, altura, data de nascimento e gênero do paciente para calcular.
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
              {loading ? 'Calculando...' : 'Calcular'}
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

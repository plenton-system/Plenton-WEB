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

import { fDateTimePtBr } from 'src/utils/format-time';

import { Loading } from 'src/components/loading';
import { Iconify } from 'src/components/iconify';

type Props = {
  patientId?: string;
};

const METRIC_LABELS: Record<string, string> = {
  Weight: 'Peso',
  Height: 'Altura',
  BMI: 'IMC',
  BodyFatPercentage: 'Gordura corporal',
  LeanMass: 'Massa magra',
  FatMass: 'Massa gorda',
  AbdominalCircumference: 'Circunferência abdominal',
  HipCircumference: 'Circunferência do quadril',
  RightRelaxedArmCircumference: 'Braço direito relaxado',
  LeftRelaxedArmCircumference: 'Braço esquerdo relaxado',
  RightFlexedArmCircumference: 'Braço direito flexionado',
  LeftFlexedArmCircumference: 'Braço esquerdo flexionado',
  RightForearmCircumference: 'Antebraço direito',
  LeftForearmCircumference: 'Antebraço esquerdo',
  RightWristCircumference: 'Punho direito',
  LeftWristCircumference: 'Punho esquerdo',
  NeckCircumference: 'Pescoço',
  ShoulderCircumference: 'Ombro',
  ChestCircumference: 'Peitoral',
  WaistCircumference: 'Cintura',
  RightCalfCircumference: 'Panturrilha direita',
  LeftCalfCircumference: 'Panturrilha esquerda',
  RightThighCircumference: 'Coxa direita',
  LeftThighCircumference: 'Coxa esquerda',
  RightProximalThighCircumference: 'Coxa proximal direita',
  LeftProximalThighCircumference: 'Coxa proximal esquerda',
};

const SUMMARY_FIELDS = [
  { key: 'weightDelta', label: 'Peso', unit: 'kg' },
  { key: 'bmiDelta', label: 'IMC', unit: '' },
  { key: 'bodyFatPercentageDelta', label: 'Gordura corporal', unit: '%' },
  { key: 'leanMassDelta', label: 'Massa magra', unit: 'kg' },
  { key: 'fatMassDelta', label: 'Massa gorda', unit: 'kg' },
  { key: 'waistCircumferenceDelta', label: 'Cintura', unit: 'cm' },
] as const;

const formatMetricValue = (value?: number | null, unit?: string | null, decimals = 1) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return `${value.toFixed(decimals)}${unit ? ` ${unit}` : ''}`;
};

const formatDelta = (value?: number | null, unit?: string | null) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}${unit ? ` ${unit}` : ''}`;
};

const directionChip = (direction?: 'up' | 'down' | 'stable' | null) => {
  if (direction === 'up') return { label: 'Alta', color: 'warning' as const };
  if (direction === 'down') return { label: 'Queda', color: 'success' as const };
  return { label: 'Estável', color: 'default' as const };
};

const getMetricLabel = (metric: string) => METRIC_LABELS[metric] ?? metric;

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

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h6">Evolução</Typography>
          <Typography variant="body2" color="text.secondary">
            Compare duas ou mais avaliações antropométricas para visualizar o período, o resumo e as tendências
            retornadas pela evolução.
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
            noOptionsText={patientId ? 'Nenhuma avaliação disponível.' : 'Selecione um paciente.'}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Avaliações antropométricas"
                placeholder="Selecione duas ou mais avaliações"
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
              {loadingEvolution ? 'Buscando evolução...' : 'Buscar evolução'}
            </Button>

            <Typography variant="body2" color="text.secondary">
              {selectedEvaluationIds.length === 0
                ? 'Nenhuma avaliação selecionada.'
                : `${selectedEvaluationIds.length} avaliação(ões) selecionada(s).`}
            </Typography>
          </Stack>

          {optionsError ? (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={refetchOptions}>Tentar novamente</Button>}>
              {optionsError}
            </Alert>
          ) : null}

          {validationError ? <Alert severity="warning">{validationError}</Alert> : null}

          {evolutionError ? <Alert severity="error">{evolutionError}</Alert> : null}
        </Stack>

        {loadingEvolution ? <Loading inline message="Buscando evolução antropométrica..." /> : null}

        {!loadingEvolution && result ? (
          <Stack spacing={3}>
            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle1">Período comparado</Typography>
              <Typography variant="body2" color="text.secondary">
                {fDateTimePtBr(result.periodStartUtc)} até {fDateTimePtBr(result.periodEndUtc)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de avaliações: {result.totalEvaluations}
              </Typography>
            </Stack>

            {result.summary ? (
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">Resumo</Typography>

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
                        label={field.label}
                        value={formatDelta(result.summary?.[field.key], field.unit)}
                      />
                    ))}
                  </Box>
                </Stack>
              </Card>
            ) : (
              <Alert severity="info">O resumo desta comparação não foi disponibilizado pelo retorno atual.</Alert>
            )}

            <Stack spacing={2}>
              <Typography variant="subtitle1">Tendências das medições</Typography>

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
                        <MetricBlock label="Valor inicial" value={formatMetricValue(trend.initialValue, unit)} />
                        <MetricBlock label="Valor final" value={formatMetricValue(trend.finalValue, unit)} />
                        <MetricBlock label="Variação" value={formatDelta(trend.delta, unit)} />
                      </Box>

                      {metricPoints.length ? (
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            Pontos avaliados
                          </Typography>
                          {metricPoints.map((point) => (
                            <Typography
                              key={`${point.metric}-${point.evaluationId}`}
                              variant="caption"
                              color="text.secondary"
                            >
                              {fDateTimePtBr(point.evaluationDateUtc)}: {formatMetricValue(point.value, unit)}
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

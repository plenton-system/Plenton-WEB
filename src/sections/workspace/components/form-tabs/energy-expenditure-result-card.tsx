import type { EnergyCalculationResult } from 'src/types';

import { useTranslation } from 'react-i18next';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fDateTimeLocale } from 'src/utils/format-time';

type Props = {
  result: EnergyCalculationResult;
  calculatedAtUtc?: string | null;
  persisted?: boolean;
};

const formatKcal = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(0)} kcal` : '-';

export function EnergyExpenditureResultCard({ result, calculatedAtUtc, persisted = false }: Props) {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">{t('workspace.energy.result.title')}</Typography>
          <Chip
            size="small"
            color={persisted ? 'success' : 'warning'}
            label={persisted ? t('workspace.energy.result.persisted') : t('workspace.energy.result.temporary')}
            variant={persisted ? 'filled' : 'outlined'}
          />
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              {t('workspace.energy.result.protocol')}
            </Typography>
            <Typography variant="body1">{result.protocol}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              {t('workspace.energy.result.activityFactor')}
            </Typography>
            <Typography variant="body1">{result.activityFactor.toFixed(2)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              TMB
            </Typography>
            <Typography variant="h6">{formatKcal(result.tmbKcal)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              TDEE
            </Typography>
            <Typography variant="h6">{formatKcal(result.tdeeKcal)}</Typography>
          </Grid>
        </Grid>

        {calculatedAtUtc ? (
          <Typography variant="caption" color="text.secondary">
            {t('workspace.energy.result.calculatedAt', { date: fDateTimeLocale(calculatedAtUtc) })}
          </Typography>
        ) : null}
      </Stack>
    </Card>
  );
}

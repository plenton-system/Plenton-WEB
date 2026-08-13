import type { MacroBreakdown } from 'src/types/domain/patient-portal';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

const nutritionRows = [
  ['calories', 'kcal'],
  ['protein', 'g'],
  ['carbs', 'g'],
  ['fat', 'g'],
  ['fiber', 'g'],
] as const;

const progressValue = (current?: number | null, target?: number | null) => {
  if (current == null) return 0;
  if (target == null || target <= 0) return 100;
  return Math.min((current / target) * 100, 100);
};

type Props = {
  values?: MacroBreakdown | null;
  targets?: MacroBreakdown | null;
};

export function DailyNutritionSummary({ values, targets }: Props) {
  const { t, i18n } = useTranslation();
  const format = useMemo(
    () => new Intl.NumberFormat(i18n.resolvedLanguage, { maximumFractionDigits: 1 }),
    [i18n.resolvedLanguage]
  );
  const availableRows = nutritionRows.filter(
    ([key]) => values?.[key] != null || targets?.[key] != null
  );

  if (!availableRows.length) return null;

  const formatValue = (value: number, unit: string) =>
    `${format.format(value)}${unit === 'kcal' ? ' ' : ''}${unit}`;

  return (
    <Box
      component="section"
      aria-label={t('patientPortal.mealPlan.nutritionSummary')}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 2.5, sm: 3 },
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        {t('patientPortal.mealPlan.nutritionSummary')}
      </Typography>
      <Stack spacing={2.75}>
          {availableRows.map(([key, unit]) => {
            const current = values?.[key];
            const target = targets?.[key];
            const label = t(`patientPortal.macros.${key}`);
            return (
              <Box key={key}>
                <Stack direction="row" justifyContent="space-between" gap={2} sx={{ mb: 0.75 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {current == null ? '—' : formatValue(current, unit)}
                    {target != null && ` / ${formatValue(target, unit)}`}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progressValue(current, target)}
                  aria-label={label}
                  aria-valuenow={current ?? undefined}
                  aria-valuemax={target ?? undefined}
                  sx={{
                    height: 7,
                    borderRadius: 999,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,
                      bgcolor: 'primary.light',
                    },
                  }}
                />
              </Box>
            );
          })}
      </Stack>
    </Box>
  );
}

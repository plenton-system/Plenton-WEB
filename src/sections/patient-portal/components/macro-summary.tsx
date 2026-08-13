import type { MacroBreakdown } from 'src/types/domain/patient-portal';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const macros = [
  ['calories', 'kcal'],
  ['protein', 'g'],
  ['carbs', 'g'],
  ['fat', 'g'],
  ['fiber', 'g'],
] as const;

export function MacroSummary({ values, title }: { values?: MacroBreakdown | null; title: string }) {
  const { t, i18n } = useTranslation();
  const format = useMemo(
    () => new Intl.NumberFormat(i18n.resolvedLanguage),
    [i18n.resolvedLanguage]
  );
  const available = macros.filter(([key]) => values?.[key] != null);
  if (!available.length) return null;

  return (
    <Box component="section" aria-label={title} sx={{ mt: 2.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            md: `repeat(${available.length}, minmax(0, 1fr))`,
          },
          gap: 1,
          minWidth: 0,
          maxWidth: '100%',
        }}
      >
        {available.map(([key, unit]) => (
          <Box key={key} sx={{ p: 1.5, minWidth: 0, borderRadius: 1.5, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {t(`patientPortal.macros.${key}`)}
            </Typography>
            <Typography variant="subtitle1">
              {format.format(values?.[key] ?? 0)} {unit}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

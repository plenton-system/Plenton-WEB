import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { Chart, useChart } from '../../../../components/chart';

// ----------------------------------------------------------------------

type TotalItem = {
  label: string;
  value: number;
  unit?: string;
  target?: number;
};

type MicronutrientItem = {
  label: string;
  value: number;
};

type MealPlanInsightsPanelProps = {
  planName?: string;
  totals?: TotalItem[];
  micronutrients?: MicronutrientItem[];
};

// ----------------------------------------------------------------------

export function MealPlanInsightsPanel({
  planName,
  totals = [],
  micronutrients = [],
}: MealPlanInsightsPanelProps) {
  const theme = useTheme();

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    labels: micronutrients.map((it) => it.label),
    stroke: { width: 3 },
    markers: { size: 4 },
    yaxis: { max: 120 },
    fill: { opacity: 0.2 },
    legend: { show: false },
    tooltip: { y: { formatter: (val) => `${val.toFixed(0)}% da DRI` } },
  }) ?? {};

  const fallbackColors = [
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.error.main,
  ];

  const colors =
    Array.isArray(chartOptions.colors) && (chartOptions.colors as string[]).length
      ? (chartOptions.colors as string[])
      : fallbackColors;

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle1">Resumo nutricional</Typography>

      <Card variant="outlined" sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          {totals.map((item) => {
            const pct = item.target ? Math.min((item.value / item.target) * 100, 150) : undefined;
            return (
              <Stack key={item.label} spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h6">
                  {item.value.toFixed(0)} {item.unit}
                </Typography>
                {pct !== undefined && (
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{ height: 6, borderRadius: 999 }}
                  />
                )}
              </Stack>
            );
          })}
        </Box>
      </Card>

      {micronutrients.length > 0 && (
        <Card variant="outlined" sx={{ p: 2, height: 320 }}>
          <Stack spacing={1} sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Micronutrientes</Typography>
            <Typography variant="body2" color="text.secondary">
              Cobertura percentual estimada da DRI para {planName || 'o plano'}.
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Chart
            type="radar"
            series={[{ name: 'Micros', data: micronutrients.map((it) => it.value) }]}
            options={{ ...chartOptions, colors }}
            sx={{ height: 200 }}
          />

          <Stack
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            {micronutrients.map((it, idx) => (
              <Stack key={it.label} direction="row" spacing={0.75} alignItems="center">
                <Card
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    bgcolor: colors[idx % colors.length] ?? theme.palette.primary.main,
                    boxShadow: 'none',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
                <Typography variant="caption" color="text.primary">
                  {it.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

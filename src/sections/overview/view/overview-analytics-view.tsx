import { useTranslation } from 'react-i18next';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { useOverview } from 'src/hooks/overview/use-overview';

import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsBar } from '../analytics-bar';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsWidget } from '../analytics-widget';
import { AnalyticsBarSkeleton } from '../components/analytics-bar-skeleton';
import { AnalyticsTasksSkeleton } from '../components/analytics-tasks-skeleton';
import { AnalyticsWidgetSkeleton } from '../components/analytics-widget-skeleton';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const { t } = useTranslation();
  const { data, loading } = useOverview();

  const barBmiAverage = data?.bar?.chart;
  const active = data?.widgets?.find(w => w.overviewId === "Active");
  const returnn = data?.widgets?.find(w => w.overviewId === "Return");
  const completed = data?.widgets?.find(w => w.overviewId === "Completed");
  const attendance = data?.widgets?.find(w => w.overviewId === "Attendance");

  return (
    <DashboardContent maxWidth="xl">

      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        {t('overview.welcome')}
      </Typography>

      <Grid container spacing={3}>
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <AnalyticsWidgetSkeleton />
              </Grid>
            ))}

            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <AnalyticsTasksSkeleton />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <AnalyticsBarSkeleton />
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnalyticsWidget
                title={t('overview.widgets.activePatients')}
                percent={active?.percent ?? 0}
                total={active?.total ?? 0}
                icon={<img alt="User Check" src="/assets/icons/glass/ic-glass-users.svg" />}
                chart={{
                  series: active?.chart.series ?? [],
                  categories: active?.chart.categories ?? []
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnalyticsWidget
                title={t('overview.widgets.completedAppointments')}
                percent={completed?.percent ?? 0}
                total={completed?.total ?? 0}
                color="info" // Ou qualquer cor desejada
                icon={<img alt="Messages" src="/assets/icons/glass/ic-glass-calendar.svg" />}
                chart={{
                  series: completed?.chart.series ?? [],
                  categories: completed?.chart.categories ?? []
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnalyticsWidget
                title={t('overview.widgets.returnRate')}
                percent={returnn?.percent ?? 0}
                total={returnn?.total ?? 0}
                color="warning"
                icon={<img alt="Purchase orders" src="/assets/icons/glass/ic-glass-return.svg" />}
                chart={{
                  series: returnn?.chart.series ?? [],
                  categories: returnn?.chart.categories ?? []
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <AnalyticsWidget
                title={t('overview.widgets.attendanceRate')}
                percent={attendance?.percent ?? 0}
                total={attendance?.total ?? 0}
                color="error"
                icon={<img alt="Purchase orders" src="/assets/icons/glass/ic-glass-check.svg" />}
                chart={{
                  series: attendance?.chart.series ?? [],
                  categories: attendance?.chart.categories ?? []
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <AnalyticsTasks
                title={t('overview.tasks.title')}
                subheader={t('calendar.today')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '55vh',
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <AnalyticsBar
                title={t('overview.bmi.title')}
                subheader={t('overview.bmi.subheader')}
                chart={{
                  categories: barBmiAverage?.categories ?? [],
                  series: barBmiAverage?.series ?? []
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '55vh',
                }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </DashboardContent>
  );
}

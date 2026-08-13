import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { usePatientMealPlan } from 'src/hooks/patient-portal/use-patient-meal-plan';

import { DashboardContent } from 'src/layouts/dashboard';

import { MealCard } from '../components/meal-card';
import { MealPlanDatePicker } from '../components/meal-plan-date-picker';
import { DailyNutritionSummary } from '../components/daily-nutrition-summary';
import { PortalEmpty, PortalError, PortalLoading } from '../components/remote-state';

export function PatientMealPlanView() {
  const { t, i18n } = useTranslation();
  const state = usePatientMealPlan();
  const selectedDateLabel = useMemo(() => {
    if (!state.validSelectedDate) return null;
    return new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'full' }).format(
      new Date(`${state.selectedDate}T12:00:00`)
    );
  }, [i18n.resolvedLanguage, state.selectedDate, state.validSelectedDate]);

  const meals = [...(state.detail?.meals ?? [])]
    .filter((meal) => !meal.isSubstitute)
    .sort((first, second) => (first.time ?? '').localeCompare(second.time ?? ''));

  return (
    <DashboardContent maxWidth="lg" sx={{ minWidth: 0, maxWidth: '100%' }}>
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
          mb: 4,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" component="h1">
            {t('patientPortal.mealPlan.title')}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            {t('patientPortal.mealPlan.subtitle')}
          </Typography>
        </Box>
        <MealPlanDatePicker
          value={state.selectedDate}
          valid={state.validSelectedDate}
          onChange={state.setSelectedDate}
        />
      </Box>
      {selectedDateLabel && (
        <Typography
          id="selected-date"
          sx={{
            height: 0,
            overflow: 'hidden',
          }}
          aria-live="polite"
        >
          {selectedDateLabel}
        </Typography>
      )}

      {state.listLoading ? (
        <PortalLoading />
      ) : state.listError ? (
        <PortalError onRetry={() => void state.retryList()} />
      ) : !state.validSelectedDate ? (
        <PortalEmpty
          title={t('patientPortal.mealPlan.invalidDateTitle')}
          description={t('patientPortal.mealPlan.invalidDateDescription')}
        />
      ) : state.plans.length === 0 ? (
        <PortalEmpty
          title={t('patientPortal.mealPlan.noPlansTitle')}
          description={t('patientPortal.mealPlan.noPlansDescription')}
        />
      ) : !state.selectedPlan ? (
        <PortalEmpty
          title={t('patientPortal.mealPlan.noDateTitle')}
          description={t('patientPortal.mealPlan.noDateDescription', {
            date: selectedDateLabel,
          })}
        />
      ) : state.detailLoading ? (
        <PortalLoading />
      ) : state.detailError ? (
        <PortalError onRetry={state.retryDetail} />
      ) : !state.detail ? (
        <PortalEmpty
          title={t('patientPortal.mealPlan.unavailableTitle')}
          description={t('patientPortal.mealPlan.unavailableDescription')}
        />
      ) : (
        <Stack spacing={3} sx={{ minWidth: 0, maxWidth: '100%' }}>
          <DailyNutritionSummary
            values={state.detail.summary?.macros}
            targets={state.detail.targets}
          />
          {meals.length ? (
            meals.map((meal) => <MealCard key={meal.id} meal={meal} />)
          ) : (
            <PortalEmpty
              title={t('patientPortal.mealPlan.noMealsTitle')}
              description={t('patientPortal.mealPlan.noMealsDescription', {
                date: selectedDateLabel,
              })}
            />
          )}
        </Stack>
      )}
    </DashboardContent>
  );
}

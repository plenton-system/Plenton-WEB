import { useTranslation } from 'react-i18next';
import { useMemo, type ReactNode } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { useMealPlanPdf } from 'src/hooks/meal-plan/use-meal-plan-pdf';

import { MealPlanForm } from '../view';
import { MealPlanStatus } from '../../../types';
import { MealPlanInsightsPanel } from './insights/meal-plan-insights-panel';
import { RowActionsMenu, type RowActionItem } from '../../../components/table';

import type { MealPlanDto} from '../../../types';
import type { MealPlanDrawerModel } from '../types/meal-plan-list';

// ----------------------------------------------------------------------

type MealPlanDetailDrawerProps = {
  open: boolean;
  patientId: string;
  plan?: MealPlanDrawerModel | null;
  onClose: () => void;
  onSubmit?: (payload: MealPlanDto) => Promise<void | boolean> | void;
  onSaved?: () => void;
  loading?: boolean;
  error?: string | null;
  headerActionsSlot?: ReactNode;
  rightPanelSlot?: ReactNode;
};

// ----------------------------------------------------------------------

export function MealPlanDetailDrawer({
  open,
  onClose,
  onSubmit,
  onSaved,
  loading,
  error,
  patientId,
  plan,
  headerActionsSlot,
  rightPanelSlot,
}: MealPlanDetailDrawerProps) {
  const { t } = useTranslation();
  const nutrientLabels: NutrientLabels = {
    energy: t('mealplan.detail.nutrients.energy'),
    protein: t('mealplan.detail.nutrients.protein'),
    carbs: t('mealplan.detail.nutrients.carbs'),
    fat: t('mealplan.detail.nutrients.fat'),
    fiber: t('mealplan.detail.nutrients.fiber'),
    sodium: t('mealplan.detail.nutrients.sodium'),
    vitaminA: t('mealplan.detail.nutrients.vitaminA'),
    vitaminC: t('mealplan.detail.nutrients.vitaminC'),
    vitaminD: t('mealplan.detail.nutrients.vitaminD'),
    calcium: t('mealplan.detail.nutrients.calcium'),
    iron: t('mealplan.detail.nutrients.iron'),
    zinc: t('mealplan.detail.nutrients.zinc'),
    potassium: t('mealplan.detail.nutrients.potassium'),
  };
  const totals = buildTotals(plan, nutrientLabels);
  const micronutrients = buildMicros(plan, nutrientLabels);
  const { download: downloadPdf, loading: pdfLoading, error: pdfError } = useMealPlanPdf();

  const planId = plan?.id ?? plan?.initial?.id ?? null;
  const headerActions: RowActionItem[] = [
    {
      label: t('actions.share'),
      icon: 'solar:share-bold',
      disabled: true,
      onClick: () => {},
    },
    {
      label: pdfLoading ? t('actions.generatingPdf') : t('actions.downloadPdf'),
      icon: 'solar:file-download-bold',
      disabled: !planId || pdfLoading,
      onClick: () => {
        if (planId) downloadPdf(planId);
      },
    },
  ];
  const initialValues = useMemo(() => {
    if (!plan) return undefined;
    
    if (plan.initial) return plan.initial;

    return {
      name: plan.name,
      status: toMealPlanStatus(plan.status),
      meals: [],
    };
  }, [plan]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      slotProps={{
        paper: {
          sx: {
            maxHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {plan ? t('mealplan.detail.editTitle') : t('mealplan.detail.newTitle')}
        <Box sx={{ ml: 'auto' }}>
          {headerActionsSlot ?? <RowActionsMenu actions={headerActions} menuWidth={170} />}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {pdfError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {pdfError}
          </Alert>
        )}

        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          spacing={3}
          alignItems="stretch"
          sx={{ minHeight: 480 }}
        >
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <MealPlanForm
              patientId={patientId}
              initial={initialValues}
              loading={loading}
              error={error}
              onSubmit={async (payload) => {
                const result = await onSubmit?.(payload);
                if (result === false) return;

                await onSaved?.();
                onClose();
              }}
              onCancel={onClose}
            />
          </Stack>

          <Stack sx={{ width: { xs: '100%', xl: 360 } }}>
            {rightPanelSlot ?? (
              <MealPlanInsightsPanel planName={plan?.name} totals={totals} micronutrients={micronutrients} />
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

type NutrientLabels = {
  energy: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sodium: string;
  vitaminA: string;
  vitaminC: string;
  vitaminD: string;
  calcium: string;
  iron: string;
  zinc: string;
  potassium: string;
};

const buildTotals = (
  plan: MealPlanDrawerModel | null | undefined,
  labels: NutrientLabels
) => {
  const macros = plan?.initial?.summary?.macros;
  const micros = plan?.initial?.summary?.micros;
  if (!macros || !micros) return [];

  return [
    {
      label: labels.energy,
      value: macros.calories,
      unit: 'kcal',
      target: normalizeTarget(plan?.initial?.targets?.calories),
    },
    {
      label: labels.protein,
      value: macros.protein,
      unit: 'g',
      target: normalizeTarget(plan?.initial?.targets?.protein),
    },
    {
      label: labels.carbs,
      value: macros.carbs,
      unit: 'g',
      target: normalizeTarget(plan?.initial?.targets?.carbs),
    },
    {
      label: labels.fat,
      value: macros.fat,
      unit: 'g',
      target: normalizeTarget(plan?.initial?.targets?.fat),
    },
    {
      label: labels.fiber,
      value: macros.fiber,
      unit: 'g',
      target: normalizeTarget(plan?.initial?.targets?.fiber),
    },
    { label: labels.sodium, value: micros.sodium, unit: 'mg' },
  ];
};

const buildMicros = (
  plan: MealPlanDrawerModel | null | undefined,
  labels: NutrientLabels
) => {
  const micros = plan?.initial?.summary?.micros;
  if (!micros) return [];

  return [
    { label: labels.vitaminA, value: toDriPercent(micros.vitaminA, 900) },
    { label: labels.vitaminC, value: toDriPercent(micros.vitaminC, 90) },
    { label: labels.vitaminD, value: toDriPercent(micros.vitaminD, 15) },
    { label: labels.calcium, value: toDriPercent(micros.calcium, 1000) },
    { label: labels.iron, value: toDriPercent(micros.iron, 18) },
    { label: labels.zinc, value: toDriPercent(micros.zinc, 11) },
    { label: labels.potassium, value: toDriPercent(micros.potassium, 4700) },
  ];
};

const normalizeTarget = (value?: number | null) => {
  if (typeof value !== 'number' || value <= 0) return undefined;

  return value;
};

const toDriPercent = (value: number, reference: number) => {
  if (!Number.isFinite(value) || reference <= 0) return 0;

  return Math.min((value / reference) * 100, 120);
};

const toMealPlanStatus = (status: MealPlanDrawerModel['status']): MealPlanStatus => {
  if (status === 'INACTIVE') return MealPlanStatus.INACTIVE;
  if (status === 'SUSPENDED') return MealPlanStatus.SUSPENDED;

  return MealPlanStatus.ACTIVE;
};

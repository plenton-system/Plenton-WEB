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
  const totals = buildTotals(plan);
  const micronutrients = buildMicros(plan);
  const { download: downloadPdf, loading: pdfLoading, error: pdfError } = useMealPlanPdf();

  const planId = plan?.id ?? plan?.initial?.id ?? null;
  const headerActions: RowActionItem[] = [
    {
      label: 'Compartilhar',
      icon: 'solar:share-bold',
      disabled: true,
      onClick: () => {},
    },
    {
      label: pdfLoading ? 'Gerando PDF...' : 'Baixar PDF',
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
        {plan ? 'Editar plano alimentar' : 'Novo plano alimentar'}
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

const buildTotals = (plan?: MealPlanDrawerModel | null) => {
  const macros = plan?.initial?.summary?.macros;
  const micros = plan?.initial?.summary?.micros;
  if (!macros || !micros) return [];

  return [
    {
      label: 'Energia',
      value: macros.calories,
      unit: 'kcal',
      target: normalizeTarget(plan?.initial?.targets?.calories),
    },
    {
      label: 'Proteína',
      value: macros.protein,
      unit: 'g',
      target: normalizeTarget(plan?.initial?.targets?.protein),
    },
    {
      label: 'Carboidrato',
      value: macros.carbs,
      unit: 'g',
      target: normalizeTarget(plan?.initial?.targets?.carbs),
    },
    {
      label: 'Gorduras',
      value: macros.fat,
      unit: 'g',
      target: normalizeTarget(plan?.initial?.targets?.fat),
    },
    {
      label: 'Fibra',
      value: macros.fiber,
      unit: 'g',
      target: normalizeTarget(plan?.initial?.targets?.fiber),
    },
    { label: 'Sódio', value: micros.sodium, unit: 'mg' },
  ];
};

const buildMicros = (plan?: MealPlanDrawerModel | null) => {
  const micros = plan?.initial?.summary?.micros;
  if (!micros) return [];

  return [
    { label: 'Vitamina A', value: toDriPercent(micros.vitaminA, 900) },
    { label: 'Vitamina C', value: toDriPercent(micros.vitaminC, 90) },
    { label: 'Vitamina D', value: toDriPercent(micros.vitaminD, 15) },
    { label: 'Cálcio', value: toDriPercent(micros.calcium, 1000) },
    { label: 'Ferro', value: toDriPercent(micros.iron, 18) },
    { label: 'Zinco', value: toDriPercent(micros.zinc, 11) },
    { label: 'Potássio', value: toDriPercent(micros.potassium, 4700) },
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

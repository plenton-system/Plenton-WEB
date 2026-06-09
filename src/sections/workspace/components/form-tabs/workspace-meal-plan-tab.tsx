import type { MealPlanDto } from 'src/types';
import type {
  MealPlanSortState,
  MealPlanListItemVM,
  MealPlanDrawerModel,
} from 'src/sections/mealPlan/types/meal-plan-list';

import { useMemo, useState } from 'react';

import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { useWorkspacePlans } from 'src/hooks/workspace/use-workspace-plans';

import { extractApiErrorMessage } from 'src/utils/api-error';

import { mealPlanService } from 'src/services/mealPlan/mealPlanService';

import { MealPlanListCard } from 'src/sections/mealPlan/components/meal-plan-list-card';
import { MealPlanDetailDrawer } from 'src/sections/mealPlan/components/meal-plan-detail-drawer';
import {
  getWorkspaceStatusColor,
  getWorkspaceStatusLabel,
} from 'src/sections/workspace/constants/status';

import {
  toMealPlanListItemVM,
  toMealPlanDrawerModel,
} from '../../adapters/workspace-meal-plan-adapter';

// ----------------------------------------------------------------------

type Props = {
  patientId?: string;
  onDone?: () => void;
};

// ----------------------------------------------------------------------

const DEFAULT_SORT_STATE: MealPlanSortState = {
  orderBy: 'updatedAt',
  order: 'desc',
};

const toDrawerModelFromListItem = (item: MealPlanListItemVM): MealPlanDrawerModel => ({
  id: item.id,
  name: item.name,
  status: item.status,
  updatedAt: item.updatedAt,
  days: item.days,
  mealsCount: item.mealsCount,
  itemsCount: item.itemsCount,
  lastDelivery: item.lastDelivery,
});

export function WorkspaceMealPlanTab({ patientId, onDone }: Props) {
  const { items: workspaceItems, loading, error: listError, refetch } = useWorkspacePlans(patientId);

  const [selected, setSelected] = useState<MealPlanDrawerModel | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortState, setSortState] = useState<MealPlanSortState>(DEFAULT_SORT_STATE);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const listItems = useMemo(
    () => workspaceItems.map(toMealPlanListItemVM),
    [workspaceItems]
  );

  const handleCreate = () => {
    setDetailError(null);
    setSubmitError(null);
    setSelected(null);
    setDrawerOpen(true);
  };

  const handleEdit = async (item: MealPlanListItemVM) => {
    const original = workspaceItems.find((plan) => plan.id === item.id);
    const basePlan = original ? toMealPlanDrawerModel(original) : toDrawerModelFromListItem(item);

    setDetailError(null);
    setSubmitError(null);
    setDetailLoading(true);

    try {
      const detail = await mealPlanService.getById(basePlan.id);
      setSelected({
        ...basePlan,
        initial: detail,
      });
      setDrawerOpen(true);
    } catch (error: unknown) {
      setDetailError(extractApiErrorMessage(error, 'Não foi possível carregar o plano para edição.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (payload: MealPlanDto): Promise<boolean> => {
    setSubmitError(null);
    setSubmitLoading(true);

    try {
      if (selected?.id) {
        await mealPlanService.edit({
          id: selected.id,
          ...payload,
        });
      } else {
        await mealPlanService.create(payload);
      }

      return true;
    } catch (error: unknown) {
      setSubmitError(extractApiErrorMessage(error, 'Não foi possível salvar o plano alimentar.'));
      return false;
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      {(listError || detailError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {detailError ?? listError}
        </Alert>
      )}

      <MealPlanListCard
        title="Planos alimentares"
        items={listItems}
        loading={loading}
        sortState={sortState}
        onSortChange={setSortState}
        onCreate={handleCreate}
        onEdit={handleEdit}
        renderStatus={(item) =>
          item.status ? (
            <Chip
              size="small"
              label={getWorkspaceStatusLabel(item.status)}
              color={getWorkspaceStatusColor(item.status)}
              variant={item.status === 'SUSPENDED' ? 'outlined' : 'filled'}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          )
        }
      />

      <MealPlanDetailDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
          setSubmitError(null);
        }}
        patientId={patientId ?? ''}
        plan={selected}
        loading={submitLoading || detailLoading}
        error={submitError}
        onSubmit={handleSubmit}
        onSaved={async () => {
          await refetch();
          setSelected(null);
          setDrawerOpen(false);
          setSubmitError(null);
          onDone?.();
        }}
      />
    </>
  );
}

import type { MealPlanDto, MealPlanDetailResponse } from 'src/types';
import type {
  MealPlanSortState,
  MealPlanListItemVM,
  MealPlanDrawerModel,
} from 'src/sections/mealPlan/types/meal-plan-list';

import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useRef, useMemo, useState } from 'react';

import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { useConfirm } from 'src/hooks/common/use-confirm';
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

const toUiStatus = (status: MealPlanDetailResponse['status']): MealPlanDrawerModel['status'] => {
  if (status === 1) return 'INACTIVE';
  if (status === 2) return 'SUSPENDED';
  return 'ACTIVE';
};

export function WorkspaceMealPlanTab({ patientId }: Props) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const {
    items: workspaceItems,
    loading,
    error: listError,
    refetch,
  } = useWorkspacePlans(patientId);

  const [selected, setSelected] = useState<MealPlanDrawerModel | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortState, setSortState] = useState<MealPlanSortState>(DEFAULT_SORT_STATE);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteSyncError, setDeleteSyncError] = useState<string | null>(null);
  const deleteFlowLockedRef = useRef(false);

  const listItems = useMemo(() => workspaceItems.map(toMealPlanListItemVM), [workspaceItems]);

  const handleCreate = () => {
    setDetailError(null);
    setSubmitError(null);
    setSubmitSuccess(null);
    setSyncError(null);
    setSelected(null);
    setDrawerOpen(true);
  };

  const handleEdit = async (item: MealPlanListItemVM) => {
    const original = workspaceItems.find((plan) => plan.id === item.id);
    const basePlan = original ? toMealPlanDrawerModel(original) : toDrawerModelFromListItem(item);

    setDetailError(null);
    setSubmitError(null);
    setSubmitSuccess(null);
    setSyncError(null);
    setDetailLoading(true);

    try {
      const detail = await mealPlanService.getById(basePlan.id);
      setSelected({
        ...basePlan,
        initial: detail,
      });
      setDrawerOpen(true);
    } catch (error: unknown) {
      setDetailError(extractApiErrorMessage(error, t('workspace.mealPlan.loadError')));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (payload: MealPlanDto): Promise<boolean | MealPlanDetailResponse> => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setSyncError(null);
    setSubmitLoading(true);

    try {
      if (selected?.id) {
        await mealPlanService.edit({
          id: selected.id,
          ...payload,
        });
        return { ...payload, id: selected.id };
      } else {
        return await mealPlanService.create(payload);
      }
    } catch (error: unknown) {
      setSubmitError(extractApiErrorMessage(error, t('workspace.mealPlan.saveError')));
      return false;
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (item: MealPlanListItemVM) => {
    if (deleteFlowLockedRef.current) return;
    deleteFlowLockedRef.current = true;

    try {
      const confirmed = await confirm({
        title: t('workspace.mealPlan.deleteTitle'),
        description: t('workspace.mealPlan.deleteDescription', { name: item.name }),
        confirmText: t('actions.delete'),
        destructive: true,
      });

      if (!confirmed) return;

      setDeleteError(null);
      setDeleteSuccess(null);
      setDeleteSyncError(null);
      setDeletingPlanId(item.id);

      await mealPlanService.delete(item.id);
      setDeleteSuccess(t('workspace.mealPlan.deleteSuccess'));

      const synchronized = await refetch();
      if (!synchronized) setDeleteSyncError(t('workspace.mealPlan.deleteSyncError'));
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setDeleteError(t('workspace.mealPlan.deleteConflict'));
      } else if (axios.isAxiosError(error) && error.response?.status === 404) {
        setDeleteError(t('workspace.mealPlan.deleteNotFound'));
      } else {
        setDeleteError(extractApiErrorMessage(error, t('workspace.mealPlan.deleteError')));
      }
    } finally {
      setDeletingPlanId(null);
      deleteFlowLockedRef.current = false;
    }
  };

  return (
    <>
      {(listError || detailError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {detailError ?? listError}
        </Alert>
      )}

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deleteError}
        </Alert>
      )}
      {deleteSuccess && (
        <Alert severity="success" role="status" sx={{ mb: 2 }}>
          {deleteSuccess}
        </Alert>
      )}
      {deleteSyncError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {deleteSyncError}
        </Alert>
      )}

      <MealPlanListCard
        title={t('workspace.mealPlan.title')}
        items={listItems}
        loading={loading}
        sortState={sortState}
        onSortChange={setSortState}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingItemId={deletingPlanId}
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
          setSubmitSuccess(null);
          setSyncError(null);
        }}
        patientId={patientId ?? ''}
        plan={selected}
        loading={submitLoading || detailLoading}
        error={submitError}
        success={submitSuccess}
        syncError={syncError}
        closeAfterSave={false}
        onSubmit={handleSubmit}
        onSaved={async (savedPlan) => {
          if (savedPlan) {
            setSelected({
              id: savedPlan.id,
              name: savedPlan.name,
              status: toUiStatus(savedPlan.status),
              initial: savedPlan,
            });
          }
          setSubmitSuccess(t('workspace.mealPlan.saveSuccess'));

          const synchronized = await refetch();
          if (!synchronized) {
            setSyncError(t('workspace.mealPlan.syncError'));
          }
        }}
      />
    </>
  );
}

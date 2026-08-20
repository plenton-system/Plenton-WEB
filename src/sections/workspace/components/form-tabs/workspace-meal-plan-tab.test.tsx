import type * as ReactI18next from 'react-i18next';
import type { MealPlanDto, MealPlanDetailResponse } from 'src/types';

import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { useConfirm } from 'src/hooks/common/use-confirm';
import { useWorkspacePlans } from 'src/hooks/workspace/use-workspace-plans';

import { MealPlanStatus } from 'src/types';
import { mealPlanService } from 'src/services/mealPlan/mealPlanService';

import { WorkspaceMealPlanTab } from './workspace-meal-plan-tab';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof ReactI18next>()),
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) =>
      key === 'workspace.mealPlan.deleteDescription' ? `${key}:${options?.name}` : key,
  }),
}));
vi.mock('src/hooks/workspace/use-workspace-plans', () => ({ useWorkspacePlans: vi.fn() }));
vi.mock('src/hooks/common/use-confirm', () => ({ useConfirm: vi.fn() }));
vi.mock('src/services/mealPlan/mealPlanService', () => ({
  mealPlanService: { create: vi.fn(), edit: vi.fn(), getById: vi.fn(), delete: vi.fn() },
}));
vi.mock('src/sections/mealPlan/components/meal-plan-list-card', () => ({
  MealPlanListCard: ({
    onCreate,
    onEdit,
    onDelete,
    deletingItemId,
    items,
  }: {
    onCreate: () => void;
    onEdit: (item: { id: string; name: string }) => void;
    onDelete: (item: { id: string; name: string }) => void;
    deletingItemId?: string | null;
    items: { id: string; name: string }[];
  }) => (
    <div>
      {items.map((item) => (
        <span key={item.id}>{item.name}</span>
      ))}
      <button onClick={onCreate}>create plan</button>
      <button onClick={() => onEdit({ id: 'existing-1', name: 'Existing' })}>edit plan</button>
      <button
        disabled={Boolean(deletingItemId)}
        onClick={() => onDelete({ id: 'existing-1', name: 'Existing' })}
      >
        delete plan
      </button>
    </div>
  ),
}));
vi.mock('src/sections/mealPlan/components/meal-plan-detail-drawer', () => ({
  MealPlanDetailDrawer: ({
    open,
    plan,
    error,
    success,
    syncError,
    onClose,
    onSubmit,
    onSaved,
  }: {
    open: boolean;
    plan?: { id: string } | null;
    error?: string | null;
    success?: string | null;
    syncError?: string | null;
    onClose: () => void;
    onSubmit: (payload: MealPlanDto) => Promise<boolean | MealPlanDetailResponse>;
    onSaved: (result?: MealPlanDetailResponse) => Promise<void>;
  }) => {
    if (!open) return null;
    const payload: MealPlanDto = {
      name: 'Current values',
      status: MealPlanStatus.ACTIVE,
      daysOfWeek: [1],
      nutritionistId: 'n-1',
      patientId: 'p-1',
      meals: [],
    };
    return (
      <div role="dialog">
        <span data-testid="mode">{plan?.id ?? 'create'}</span>
        {error && <div role="alert">{error}</div>}
        {success && <div role="status">{success}</div>}
        {syncError && <div>{syncError}</div>}
        <button
          onClick={async () => {
            const result = await onSubmit(payload);
            if (result !== false) await onSaved(typeof result === 'object' ? result : undefined);
          }}
        >
          save plan
        </button>
        <button onClick={onClose}>close plan</button>
      </div>
    );
  },
}));

const created: MealPlanDetailResponse = {
  id: 'created-1',
  name: 'Current values',
  status: MealPlanStatus.ACTIVE,
  daysOfWeek: [1],
  nutritionistId: 'n-1',
  patientId: 'p-1',
  meals: [],
};

describe('WorkspaceMealPlanTab', () => {
  const refetch = vi.fn();
  const confirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWorkspacePlans).mockReturnValue({
      items: [],
      loading: false,
      error: null,
      refetch,
    });
    refetch.mockResolvedValue(true);
    confirm.mockResolvedValue(true);
    vi.mocked(useConfirm).mockReturnValue(confirm);
    vi.mocked(mealPlanService.create).mockResolvedValue(created);
    vi.mocked(mealPlanService.edit).mockResolvedValue();
    vi.mocked(mealPlanService.delete).mockResolvedValue(true);
  });

  it('includes the plan name in confirmation and does not delete when cancelled', async () => {
    const user = userEvent.setup();
    confirm.mockResolvedValueOnce(false);
    render(<WorkspaceMealPlanTab patientId="p-1" />);

    await user.click(screen.getByText('delete plan'));

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'workspace.mealPlan.deleteDescription:Existing',
        destructive: true,
      })
    );
    expect(mealPlanService.delete).not.toHaveBeenCalled();
  });

  it('submits once, blocks duplicate deletion, refetches and reports success', async () => {
    const user = userEvent.setup();
    let resolveDelete!: (value: boolean) => void;
    vi.mocked(mealPlanService.delete).mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        resolveDelete = resolve;
      })
    );
    render(<WorkspaceMealPlanTab patientId="p-1" />);

    await user.click(screen.getByText('delete plan'));
    expect(screen.getByText('delete plan')).toBeDisabled();
    await user.click(screen.getByText('delete plan'));
    expect(mealPlanService.delete).toHaveBeenCalledTimes(1);
    resolveDelete(true);

    expect(await screen.findByRole('status')).toHaveTextContent('workspace.mealPlan.deleteSuccess');
    expect(refetch).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText('delete plan')).toBeEnabled());
  });

  it('locks the whole flow while confirmation is pending', async () => {
    let resolveConfirmation!: (value: boolean) => void;
    confirm.mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        resolveConfirmation = resolve;
      })
    );
    render(<WorkspaceMealPlanTab patientId="p-1" />);

    fireEvent.click(screen.getByText('delete plan'));
    fireEvent.click(screen.getByText('delete plan'));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(mealPlanService.delete).not.toHaveBeenCalled();

    await act(async () => resolveConfirmation(true));

    await waitFor(() => expect(mealPlanService.delete).toHaveBeenCalledTimes(1));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('reports synchronization failure separately from successful deletion', async () => {
    const user = userEvent.setup();
    refetch.mockResolvedValueOnce(false);
    render(<WorkspaceMealPlanTab patientId="p-1" />);
    await user.click(screen.getByText('delete plan'));

    expect(await screen.findByRole('status')).toHaveTextContent('workspace.mealPlan.deleteSuccess');
    expect(screen.getByText('workspace.mealPlan.deleteSyncError')).toBeInTheDocument();
  });

  it.each([
    [409, 'workspace.mealPlan.deleteConflict'],
    [404, 'workspace.mealPlan.deleteNotFound'],
    [500, 'workspace.mealPlan.deleteError'],
  ])('preserves the item and releases busy state after HTTP %s', async (status, message) => {
    const user = userEvent.setup();
    const error = Object.assign(new Error('Request failed with status code ' + status), {
      isAxiosError: true,
      response: { status, data: {} },
      toJSON: () => ({}),
    });
    vi.mocked(mealPlanService.delete).mockRejectedValueOnce(error);
    vi.mocked(useWorkspacePlans).mockReturnValue({
      items: [{ id: 'existing-1', name: 'Existing', status: 'ACTIVE' }],
      loading: false,
      error: null,
      refetch,
    });
    render(<WorkspaceMealPlanTab patientId="p-1" />);
    await user.click(screen.getByText('delete plan'));

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.getByText('delete plan')).toBeEnabled();
    expect(screen.getByText('Existing')).toBeInTheDocument();
    expect(refetch).not.toHaveBeenCalled();
  });

  it('keeps a creation open, promotes it to edit, and updates on the second save', async () => {
    const user = userEvent.setup();
    render(<WorkspaceMealPlanTab patientId="p-1" />);
    await user.click(screen.getByText('create plan'));
    await user.click(screen.getByText('save plan'));
    await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('created-1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('workspace.mealPlan.saveSuccess');

    await user.click(screen.getByText('save plan'));
    await waitFor(() =>
      expect(mealPlanService.edit).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'created-1' })
      )
    );
    expect(mealPlanService.create).toHaveBeenCalledTimes(1);
    await user.click(screen.getByText('close plan'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps editing open on failure, allows retry, and distinguishes sync failure', async () => {
    const user = userEvent.setup();
    vi.mocked(mealPlanService.getById).mockResolvedValue(created);
    vi.mocked(mealPlanService.edit)
      .mockRejectedValueOnce(new Error('save failed'))
      .mockResolvedValueOnce();
    refetch.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<WorkspaceMealPlanTab patientId="p-1" />);
    await user.click(screen.getByText('edit plan'));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    await user.click(screen.getByText('save plan'));
    expect(await screen.findByRole('alert')).toHaveTextContent('save failed');
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByText('save plan'));
    expect(await screen.findByRole('status')).toHaveTextContent('workspace.mealPlan.saveSuccess');
    expect(screen.getByText('workspace.mealPlan.syncError')).toBeInTheDocument();
  });
});

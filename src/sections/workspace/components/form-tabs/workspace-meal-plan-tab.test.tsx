import type * as ReactI18next from 'react-i18next';
import type { MealPlanDto, MealPlanDetailResponse } from 'src/types';

import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { useWorkspacePlans } from 'src/hooks/workspace/use-workspace-plans';

import { MealPlanStatus } from 'src/types';
import { mealPlanService } from 'src/services/mealPlan/mealPlanService';

import { WorkspaceMealPlanTab } from './workspace-meal-plan-tab';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof ReactI18next>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('src/hooks/workspace/use-workspace-plans', () => ({ useWorkspacePlans: vi.fn() }));
vi.mock('src/services/mealPlan/mealPlanService', () => ({
  mealPlanService: { create: vi.fn(), edit: vi.fn(), getById: vi.fn() },
}));
vi.mock('src/sections/mealPlan/components/meal-plan-list-card', () => ({
  MealPlanListCard: ({
    onCreate,
    onEdit,
  }: {
    onCreate: () => void;
    onEdit: (item: { id: string; name: string }) => void;
  }) => (
    <div>
      <button onClick={onCreate}>create plan</button>
      <button onClick={() => onEdit({ id: 'existing-1', name: 'Existing' })}>edit plan</button>
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWorkspacePlans).mockReturnValue({
      items: [],
      loading: false,
      error: null,
      refetch,
    });
    refetch.mockResolvedValue(true);
    vi.mocked(mealPlanService.create).mockResolvedValue(created);
    vi.mocked(mealPlanService.edit).mockResolvedValue();
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

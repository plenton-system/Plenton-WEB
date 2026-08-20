import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { MealPlanListCard } from './meal-plan-list-card';

import type { MealPlanListItemVM } from '../types/meal-plan-list';

let compactLayout = false;

vi.mock('@mui/material/useMediaQuery', () => ({ default: () => compactLayout }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) =>
      key === 'mealplan.list.actionsFor' ? `Actions for ${options?.name}` : key,
  }),
}));

const item: MealPlanListItemVM = {
  id: 'plan-1',
  name: 'Weekly plan',
  status: 'ACTIVE',
};

describe.each([
  ['desktop', false],
  ['responsive', true],
])('MealPlanListCard - %s', (_, isCompact) => {
  beforeEach(() => {
    compactLayout = isCompact;
    vi.clearAllMocks();
  });

  it('makes deletion available and gives the actions menu an accessible name', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <MealPlanListCard
        items={[item]}
        loading={false}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Actions for Weekly plan' }));
    await user.click(screen.getByRole('menuitem', { name: 'actions.remove' }));
    expect(onDelete).toHaveBeenCalledWith(item);
  });

  it('disables deletion while any plan is being deleted', async () => {
    const user = userEvent.setup();
    render(
      <MealPlanListCard
        items={[item]}
        loading={false}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        deletingItemId="plan-1"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Actions for Weekly plan' }));
    expect(screen.getByRole('menuitem', { name: 'actions.remove' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});

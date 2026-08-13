import type { PatientMeal } from 'src/types/domain/patient-portal';

import { it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import i18n from 'src/i18n';

import { MealCard, formatMealItemAmount } from './meal-card';

const meal: PatientMeal = {
  id: 'meal',
  name: 'Almoço',
  time: '12:30:00',
  items: [
    {
      id: 'rice',
      food: { description: 'Arroz' },
      quantity: 1,
      quantityInGrams: 120,
      portionLabel: '1 concha média',
      order: 1,
      equivalents: [
        {
          id: 'potato',
          food: { description: 'Batata' },
          quantity: 2,
          detailsHomemadeMeasure: { description: 'colheres', quantityInGrams: 30 },
          notes: 'Cozida',
          isOptional: true,
        },
      ],
    },
  ],
};

beforeEach(() => i18n.changeLanguage('pt-BR'));

it('formats clinical quantities with an unambiguous precedence', () => {
  expect(formatMealItemAmount(meal.items?.[0] ?? { id: 'missing' })).toBe('1 concha média');
  expect(
    formatMealItemAmount({
      id: 'measure',
      quantity: 2,
      detailsHomemadeMeasure: { description: 'colheres' },
      quantityInGrams: 60,
    })
  ).toBe('2 colheres');
  expect(formatMealItemAmount({ id: 'grams', quantityInGrams: 90 })).toBe('90 g');
});

it('shows complete quantities, notes and optional status for equivalents', async () => {
  const user = userEvent.setup();
  render(<MealCard meal={meal} />);
  const mainItem = screen.getByText('1 concha média Arroz');
  expect(mainItem).toBeInTheDocument();
  expect(mainItem.closest('li')?.parentElement?.tagName).toBe('UL');
  expect(screen.queryByText(/1 1 concha/)).not.toBeInTheDocument();
  expect(screen.getByTestId('RestaurantMenuIcon')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /alimentos equivalentes/i }));
  expect(screen.getByText('2 colheres Batata')).toBeInTheDocument();
  expect(screen.getByText('Cozida')).toBeInTheDocument();
  expect(screen.getByText('Opcional')).toBeInTheDocument();
});

it('shows compact substitutes before the borderless meal summary', async () => {
  const user = userEvent.setup();
  render(
    <MealCard
      meal={{
        ...meal,
        summary: { macros: { calories: 420, protein: 24 } },
        substitute: [{ id: 'alternative', name: 'Jantar alternativo', items: [] }],
      }}
    />
  );

  const substitutes = screen.getByRole('button', { name: 'Opções de substituição' });
  const summary = screen.getByRole('region', { name: 'Resumo da refeição' });
  expect(substitutes.compareDocumentPosition(summary)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  expect(substitutes).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByTestId('SwapHorizIcon')).toBeInTheDocument();

  await user.click(substitutes);
  expect(screen.getByText('Jantar alternativo')).toBeInTheDocument();
  expect(screen.getByText('420 kcal').parentElement).not.toHaveClass('MuiPaper-outlined');
});

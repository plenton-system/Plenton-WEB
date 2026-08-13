import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { usePatientMealPlan } from 'src/hooks/patient-portal/use-patient-meal-plan';

import i18n from 'src/i18n';

import { PatientMealPlanView } from './patient-meal-plan-view';

vi.mock('src/hooks/patient-portal/use-patient-meal-plan', () => ({ usePatientMealPlan: vi.fn() }));

const baseState = {
  plans: [],
  detail: null,
  selectedDate: '',
  selectedPlan: null,
  validSelectedDate: false,
  listLoading: false,
  listError: false,
  detailLoading: false,
  detailError: false,
  setSelectedDate: vi.fn(),
  retryList: vi.fn(),
  retryDetail: vi.fn(),
};

describe('PatientMealPlanView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    void i18n.changeLanguage('pt-BR');
  });

  it('renders a safe validation state when the date input is cleared', () => {
    vi.mocked(usePatientMealPlan).mockReturnValue(baseState);
    expect(() => render(<PatientMealPlanView />)).not.toThrow();
    expect(screen.getByText('Escolha uma data')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir calendário' })).toBeInTheDocument();
  });

  it('opens the calendar popover when the patient clicks the date', async () => {
    vi.mocked(usePatientMealPlan).mockReturnValue({
      ...baseState,
      selectedDate: '2026-08-03',
      validSelectedDate: true,
    });
    const user = userEvent.setup();
    render(<PatientMealPlanView />);

    await user.click(screen.getByRole('button', { name: 'Abrir calendário' }));
    const calendar = screen.getByRole('dialog', { name: 'Calendário do plano alimentar' });
    expect(calendar).toBeInTheDocument();
    expect(calendar.parentElement).toHaveStyle({ position: 'fixed' });
    expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeInTheDocument();
  });

  it('changes one calendar day through the compact header controls', async () => {
    const setSelectedDate = vi.fn();
    vi.mocked(usePatientMealPlan).mockReturnValue({
      ...baseState,
      selectedDate: '2026-08-03',
      validSelectedDate: true,
      setSelectedDate,
    });
    const user = userEvent.setup();
    render(<PatientMealPlanView />);

    await user.click(screen.getByRole('button', { name: 'Próximo dia' }));
    expect(setSelectedDate).toHaveBeenCalledWith('2026-08-04');
    await user.click(screen.getByRole('button', { name: 'Dia anterior' }));
    expect(setSelectedDate).toHaveBeenCalledWith('2026-08-02');
  });

  it('shows which selected date has no matching meal plan', () => {
    vi.mocked(usePatientMealPlan).mockReturnValue({
      ...baseState,
      plans: [{ id: 'monday', name: 'Segunda', daysOfWeek: ['Monday'] }],
      selectedDate: '2026-08-04',
      validSelectedDate: true,
    });
    render(<PatientMealPlanView />);

    expect(screen.getByText('Sem plano para esta data')).toBeInTheDocument();
    expect(
      screen.getByText(/Não encontramos refeições para terça-feira, 4 de agosto de 2026/)
    ).toBeInTheDocument();
  });

  it('does not render the redundant plan heading and list summary above nutrition', () => {
    const detail = {
      id: 'plan',
      name: 'Plano',
      daysOfWeek: ['Monday'],
      listSummary: 'Resumo fixo vindo do backend',
      meals: [
        {
          id: 'meal',
          name: 'Almoço',
          time: '12:00:00',
          items: [{ id: 'food', food: { description: 'Arroz' }, quantityInGrams: 100 }],
        },
      ],
    };
    vi.mocked(usePatientMealPlan).mockReturnValue({
      ...baseState,
      plans: [detail],
      detail,
      selectedPlan: detail,
      selectedDate: '2026-08-03',
      validSelectedDate: true,
    });
    render(<PatientMealPlanView />);
    expect(screen.queryByRole('heading', { name: 'Plano' })).not.toBeInTheDocument();
    expect(screen.queryByText('Resumo fixo vindo do backend')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Almoço' })).toBeInTheDocument();
  });

  it('renders daily calorie and macro progress from API summary and targets', () => {
    const detail = {
      id: 'plan',
      name: 'Plano',
      daysOfWeek: ['Monday'],
      meals: [],
      summary: { macros: { calories: 1850, protein: 120, carbs: 180, fat: 45, fiber: 18 } },
      targets: { calories: 2400, protein: 150, carbs: 220, fat: 65, fiber: 25 },
    };
    vi.mocked(usePatientMealPlan).mockReturnValue({
      ...baseState,
      plans: [detail],
      detail,
      selectedPlan: detail,
      selectedDate: '2026-08-03',
      validSelectedDate: true,
    });
    render(<PatientMealPlanView />);

    expect(screen.getByRole('region', { name: 'Resumo nutricional diário' })).toBeInTheDocument();
    expect(screen.getByText('1.850 kcal / 2.400 kcal')).toBeInTheDocument();
    expect(screen.getByText('120g / 150g')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(5);
  });
});
